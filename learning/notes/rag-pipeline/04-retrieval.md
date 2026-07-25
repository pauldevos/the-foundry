# Layer 4: Retrieval Pipeline — Complete Reference

*Read this repeatedly until you can narrate it without notes.*
*This is the most operationally complex RAG layer — it's a multi-stage pipeline, not a single step.*

---

## The Core Mental Model

Every stage in this pipeline has a **latency cost**. Your total budget is determined by product tolerance:
- Consumer UX: 1–2 seconds total
- Clinical/compliance tool: 3–5 seconds acceptable
- Research/analyst tool: 10+ seconds fine

The director-level skill is knowing which stages to include or skip based on that budget and the use case's accuracy requirements.

---

## The Full Pipeline

```
User query
    ↓
[1] Query Understanding     ← optional, ~200–800ms per LLM call
    ↓
[2] Hybrid Retrieval        ← BM25 + dense, in parallel, ~50–100ms
    ↓
[3] Score Fusion (RRF)      ← no normalization needed, just ranks
    ↓
[4] Metadata Filtering      ← applied pre or post ANN, or smart (Qdrant/Weaviate)
    ↓
[5] Reranking               ← cross-encoder on top-k, ~200–500ms
    ↓
[6] Context Assembly        ← ordering, deduplication, source attribution
    ↓
[7] Fallback Handling       ← confidence check, CRAG, routing
    ↓
LLM synthesis + citation
```

---

## Stage 1: Query Understanding

**What it is:** Transform the raw user query into a better retrieval query before hitting the index.

**Three techniques — each with a cost:**

### Self-Query Retrieval (highest ROI for structured corpora)
LLM parses the query into: (1) structured metadata filters + (2) semantic search string.

*"What does the 2024 formulary say about GLP-1 coverage?"*
→ `{year: 2024, doc_type: "formulary"}` + semantic: `"GLP-1 medication coverage"`

**Important:** You build this — it's not model-built-in. You write a prompt instructing the LLM to output JSON with both parts. LangChain's `SelfQueryRetriever` and LlamaIndex both scaffold this. The LLM is just the parser — any capable model works (Sonnet, GPT-4o, Llama 3 70B, Qwen 2.5 72B). Smaller models (Haiku, Llama 3 8B) can be unreliable on complex multi-filter queries.

### Multi-Query Retrieval
Generate 3–5 rephrasings of the query, run retrieval for each, merge + deduplicate results. Best for: when recall is the bottleneck and the query may be ambiguous or have multiple valid phrasings. Cost: one LLM call per rephrasing + multiple retrieval passes.

### HyDE (Hypothetical Document Embeddings)
Ask LLM to generate a hypothetical answer, embed that instead of the question. Works because hypothetical answers are in similar vector space as real documents. Less useful when queries are already precise. Best for: factual Q&A where question phrasing is very different from document phrasing.

---

## Stage 2–3: Hybrid Retrieval + RRF

**What it is:** Run BM25 (keyword) and dense embedding search IN PARALLEL, fuse with Reciprocal Rank Fusion.

**THIS IS AT QUERY TIME.** When a user submits a question:
- Weaviate / Qdrant: a single API call handles both BM25 and dense search internally, returns one fused ranked list
- pgvector: you run two queries (BM25 via tsvector, dense via pgvector) and fuse manually in SQL
- DIY LangChain: you manage two retriever objects and call RRF yourself

**The batch embedding phase (ingestion time) is separate** — that's when you embedded your chunks and stored both the vectors and raw text. The "single API call" for hybrid search happens at query time.

**RRF formula:** score(doc) = Σ 1/(k + rank), where k=60.
Uses only ranks, not raw scores — so different scales of BM25 and cosine similarity are irrelevant.

**When is BM25 non-negotiable:** Any time your queries or documents contain exact-reference terms:
- Medical codes (ICD-10, CPT, NDC)
- Legal regulation numbers (49 CFR 192.xxx)
- Policy IDs, SKUs, part numbers
- Years, dates, document version numbers
- Proper names of drugs, companies, people

BM25 > SPLADE for exact codes. SPLADE > BM25 for synonym expansion (MI → myocardial infarction). BM42 (Qdrant-native) is a reasonable middle ground.

---

## Stage 4: Metadata Filtering

**Lifecycle clarification — three moments, one process:**
- **Ingestion time (Layer 1):** metadata is extracted from documents and stored alongside vectors in the vector store. Nothing to do at query time here — it's already there.
- **Query time (this stage):** the metadata filter is a PARAMETER you pass with your query. You build the filter from the structured output of self-query (Stage 1) or hardcode it if the query context is always clear.
- **Model-agnostic:** the filtering is done by the vector store, not the LLM. It doesn't matter if you used Sonnet or Llama — once you have the filter values, the vector store applies them.

```python
# Qdrant example — what code actually looks like
results = qdrant_client.search(
    collection_name="clinical_docs",
    query_vector=embed(user_query),      # dense search
    query_filter=Filter(                 # metadata filter
        must=[
            FieldCondition(key="year", match=MatchValue(value=2024)),
            FieldCondition(key="doc_type", match=MatchValue(value="formulary"))
        ]
    ),
    limit=20
)
```

**Pre-filter vs post-filter vs smart-filter:**
- Pre-filter: narrow candidate set first, then ANN search within it. Faster, but if filter is very narrow (< ~1% of corpus), HNSW accuracy drops because it was built on the full graph.
- Post-filter: ANN search first, then filter results. Can return fewer than k if many top hits fail the filter.
- Qdrant's "filtered HNSW" / Weaviate's approach: dynamically choose based on filter selectivity. This is why these vector stores outperform naive pgvector for complex filtered search.

→ This is why a demo project comparing Qdrant vs Chroma vs pgvector on a filtered clinical query is a real portfolio differentiator.

---

## Stage 5: Reranking

**What it is:** A cross-encoder re-scores the top-k candidates from hybrid retrieval with a much more accurate (but slow) model.

**Bi-encoder vs Cross-encoder — the distinction that matters:**

| | Bi-encoder | Cross-encoder |
|---|---|---|
| How it works | Query and document encoded separately → cosine similarity | Query + document encoded together → single relevance score |
| Pre-computation | Document vectors computed at ingestion, reused | Cannot pre-compute — runs at query time for every pair |
| Speed | Fast — one query embedding + vector compare | Slow — inference per (query, doc) pair |
| Accuracy | Good for initial retrieval at scale | Much higher — sees the relationship, not just similarity |
| Where it lives | Initial retrieval (this IS your embedding model + vector store) | Reranking stage only — top-20 shortlist |

**They are not alternatives — they are two stages of the same pipeline.**

Cross-encoder IS almost always the right answer for reranking. The only reason to skip it: sub-100ms total latency requirement where even 200ms is unacceptable (rare in enterprise contexts).

**Reranker tools:**
- Cohere Rerank — managed API, easiest to add, excellent quality
- BGE-reranker (BAAI) — open source, self-hostable, strong on retrieval tasks
- ms-marco-MiniLM — smaller/faster, good for latency-sensitive applications
- Jina Reranker v2 — multilingual, good for global enterprise corpora

---

## Stage 6: Context Assembly

**What goes in the context window and in what order.**

**Lost in the Middle (primacy/recency effect for LLMs):**
LLMs reliably use content at the start and end of the context window and consistently under-use content in the middle — the same primacy/recency effect documented in human memory psychology. For 5 retrieved chunks: put highest-relevance chunk first, second-highest last, fill middle with the rest. More chunks ≠ better answers; past a point it degrades output.

**Deduplication:** If multi-query generated 5 query variants, you likely retrieved the same chunk multiple times. Deduplicate by chunk ID before assembling — don't pass the same paragraph to the LLM three times.

**Source attribution:** Maintain a `chunk_id → source_document` map throughout the pipeline. This powers: (1) citations in the generated answer, (2) hallucination auditing ("does this answer actually come from a retrieved chunk?").

---

## Stage 7: Fallback Handling — Yes, You Build This

This is custom code. Three patterns, each a few dozen lines:

**Pattern 1 — Confidence threshold:**
```python
top_score = results[0].score
if top_score < RELEVANCE_THRESHOLD:
    return "I don't have sufficient information in our documentation to answer this."
```

**Pattern 2 — CRAG (Corrective RAG):**
LLM call evaluates retrieved context quality before generating. If judged poor → fallback (broader search, web search, or "insufficient information"). Adds ~300ms but catches bad retrieval before it becomes a bad answer.

**Pattern 3 — Query routing (upstream, before retrieval):**
Classify the query first. Not every question needs RAG:
- "How many vacation days do I get?" → structured FAQ lookup
- "What does section 4.2 of the pipeline safety regulation say?" → RAG
- "What's 15% of $4,200 for reimbursement?" → calculator, not RAG

In high-stakes domains: a confident wrong answer is worse than "I don't know." Design for failure, not just success.

---

## Latency Budget by Use Case

| Use Case | Total Budget | Skip? | Include? | Notes |
|---|---|---|---|---|
| Clinical/healthcare | 3–5s | Nothing | Self-query, hybrid, reranker, CRAG | Accuracy > speed |
| HR policy | 1–2s | HyDE | Self-query, hybrid, reranker | Employees expect fast |
| Oil & gas compliance | 5–10s | HyDE | Everything | Engineers don't mind waiting |
| NFL stats research | 5–10s | Self-query | Hybrid (BM25 critical), light reranking | Researcher context |
| Customer service KB | 1s | Reranker | Hybrid, confidence threshold | Consumer UX |
| Life sciences/clinical trials | 3–5s | HyDE | Self-query, hybrid, cross-encoder | Citation required |

---

*Reference document — Session 1, 2026-07-22*
*Pair with: retrieval-algorithms.json (BM25/SPLADE/BM42 + bi/cross-encoder cards)*
