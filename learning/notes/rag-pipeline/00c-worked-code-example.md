# Worked Code Example — PBM Formulary RAG Chatbot, Stage by Stage

*Built 2026-07-26. One complete, concrete walkthrough — real system prompts, real schemas,
real (illustrative) code — for the running example used throughout this prep: a pharmacist
asking a PBM formulary chatbot "is Ozempic covered for a patient with type 2 diabetes under
the 2024 formulary?" Pseudocode below is illustrative, not copy-paste production code — the
point is the shape of each stage, which transfers directly to any other use case in
`00b-build-process-playbook.md`. Every technique named is glossed inline.*

---

## 1. 🔎 Self-query — turning the question into a filter + a search string

**The schema you give the model** (as a tool/function definition — this is what makes it
"structured output" rather than hoping the model writes valid JSON on its own):

```json
{
  "name": "formulary_search",
  "description": "Extract a semantic search query and structured filters from a formulary question.",
  "input_schema": {
    "type": "object",
    "properties": {
      "search_query": {"type": "string", "description": "The semantic part of the question, stripped of filterable metadata."},
      "year": {"type": "integer", "description": "Formulary plan year, if mentioned."},
      "doc_type": {"type": "string", "enum": ["formulary", "prior_auth_policy", "clinical_guideline"]}
    },
    "required": ["search_query"]
  }
}
```

**System prompt** (short — this call's only job is extraction, not answering):
> "You extract structured search parameters from formulary questions. Call
> `formulary_search` with the semantic portion of the question in `search_query`, and any
> year or document-type mentioned as filters. Do not answer the question."

**User query:** `"is Ozempic covered for a patient with type 2 diabetes under the 2024 formulary?"`

**Model's structured output (the tool call):**
```json
{"search_query": "Ozempic coverage type 2 diabetes", "year": 2024, "doc_type": "formulary"}
```

**What your code does with it** — two separate things, run together:
```python
filters = {"year": output["year"], "doc_type": output["doc_type"]}
query_text = output["search_query"]
```

---

## 2. 🔎 Hybrid retrieval — BM25 + dense, with the filter applied

```python
dense_hits = vector_store.query(
    embedding=embed(query_text, input_type="search_query"),  # asymmetric encoder
    filter=filters,          # the self-query metadata filter from stage 1
    top_k=20,
)
sparse_hits = bm25_index.query(query_text, filter=filters, top_k=20)

fused = reciprocal_rank_fusion(dense_hits, sparse_hits)  # RRF — no score normalization needed
```

**Why both run:** "Ozempic"/"semaglutide" match fine on dense alone — that's semantic
similarity working. But NDC 0169-4132-12 vs. 0169-4133-12 (a different package size, a
different coverage line) are near-identical strings that dense retrieval can't separate —
that's what BM25's exact-token match is there to catch.

---

## 3. 🔎 Reranking — worth it here, because the stakes justify 300ms

```python
reranked = cross_encoder.rerank(query_text, [h.chunk_text for h in fused], top_k=5)
```

Clinical stakes justify the added latency (see decision-tree item 10). A low-stakes,
tight-latency use case would skip this stage entirely.

---

## 4. 🔎 Generation — the four mandatory prompt sections + citation enforcement

**System prompt (section 1 — role + citation requirement):**
> "Answer ONLY using the provided context. For every factual claim, cite the document and
> section it came from. If the context is insufficient to answer confidently, say so
> explicitly — do not use general medical knowledge to fill gaps."

**Retrieved context (section 2 — labeled with citation anchors, not just raw text):**
```
[Document: Formulary 2024, Section 3.2 — GLP-1 Coverage Tiers]
Ozempic (semaglutide) — Tier 2 — prior authorization required for T2DM diagnosis...

[Document: Prior Auth Policy 2024, Section 1.4 — GLP-1 Criteria]
Prior authorization approved when ICD-10 E11.9 or E11.65 is documented...
```

**User query (section 3 — structurally separate from the system prompt, never concatenated into it).**

**Output schema (section 4 — this is what makes citation verification and audit logging possible):**
```json
{
  "type": "object",
  "properties": {
    "answer": {"type": "string"},
    "sources": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "doc_id": {"type": "string"},
          "section": {"type": "string"},
          "page": {"type": "integer"}
        }
      }
    },
    "confidence": {"type": "string", "enum": ["high", "medium", "low"]}
  }
}
```

**Model's structured output:**
```json
{
  "answer": "Ozempic is Tier 2 and requires prior authorization for a T2DM diagnosis (ICD-10 E11.9 or E11.65).",
  "sources": [
    {"doc_id": "Formulary-2024", "section": "3.2", "page": 14},
    {"doc_id": "PriorAuth-2024", "section": "1.4", "page": 3}
  ],
  "confidence": "high"
}
```

If `confidence` comes back `"low"` → return the fallback ("insufficient information in our
documentation to answer this accurately") instead of the generated answer — this is the
confidence-threshold pattern from decision-tree item 13.

---

## 5. 🛡️ Guardrails — three-point PHI scrubbing + topic scope

**Input scrubbing** (before the user's query reaches any model call):
```python
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

analyzer, anonymizer = AnalyzerEngine(), AnonymizerEngine()
results = analyzer.analyze(text=user_query, language="en")
scrubbed_query = anonymizer.anonymize(text=user_query, analyzer_results=results).text
# "is Ozempic covered for John Smith, DOB 3/12/1980..." → "is Ozempic covered for <PERSON>, DOB <DATE_TIME>..."
```

**Context scrubbing** (retrieved chunks may contain real patient case studies embedded in a
clinical guideline — scrub before they reach the prompt, same Presidio call on each chunk).

**Output scrubbing** (the model can surface PHI it saw in context even if scrubbing missed
something — same Presidio call on the generated answer before it's returned).

**Topic-scope guardrail** (fast pre-retrieval classifier, cheap model, runs before any
retrieval happens at all):
```python
scope_check = cheap_model.classify(
    prompt=f"Is this question about drug formulary coverage, clinical guidelines, or prior authorization? Question: {scrubbed_query}",
    labels=["in_scope", "out_of_scope"],
)
if scope_check == "out_of_scope":
    return "I can only answer questions about formulary coverage and clinical guidelines."
```

---

## The full request lifecycle, in order

1. Input PHI scrub → 2. Topic-scope check → 3. Self-query (schema call) → 4. Hybrid
retrieval with filter → 5. Context PHI scrub on retrieved chunks → 6. Reranking → 7.
Generation with 4-section prompt + structured output → 8. Output PHI scrub → 9. Confidence
check (return fallback if low) → 10. Audit log (scrubbed query, chunk IDs, response, token
count) → 11. Return to user.

This is the same 11-step shape for any use case — swap the schema fields, the system
prompt's domain language, and which guardrails are actually needed (a low-stakes NFL-stats
tool skips steps 1, 2, 5, 8 entirely; an oil & gas compliance tool keeps all 11 and adds a
jurisdiction filter to step 3).
