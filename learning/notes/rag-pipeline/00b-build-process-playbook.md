# RAG Chatbot — Build Process & Use-Case Tradeoffs Playbook

*Built 2026-07-25, three days before Tuesday interviews. Purpose: the repeatable process
to apply live if an interviewer hands you a use case you haven't rehearsed, plus a
side-by-side tradeoffs table across every use case already worked through in
`learning/talk-tracks/rag-pipeline.md`, so you can compare across them instantly instead of
re-deriving each one from scratch. Every technique named below is glossed inline in
parentheses on first use — you shouldn't need to leave this file to follow it, but
`00-quick-reference.md` and `00-decision-tree.md` have the full depth if you want it.*

---

## The 6-step process — say this framework out loud for any novel use case

If handed a use case you've never seen, this is the order to reason through it in, live:

**1. Ask about stakes and latency tolerance before assuming either.** Don't default to
"consumer speed expected" — ask what users actually tolerate. The HR policy program is the
proof: embedded in MS Teams, users were fine waiting a minute-plus as long as the answer was
correct and cited. Stakes (patient safety, federal liability, legal exposure) drive
architecture far more than latency does — a high-stakes/high-latency-tolerance use case
(oil & gas compliance) gets the *full* pipeline; a low-stakes/tight-latency use case
(customer service KB) skips stages.

**2. Characterize the corpus.** Structured or unstructured? Single document type or mixed?
Does it update frequently (financial regs, HR policy vintages) or rarely (NCT protocols)?
Does it contain exact-reference identifiers (codes, IDs, section numbers) where the gap
between right and wrong is smaller than embedding resolution? That last question is the
direct trigger for hybrid BM25+dense.

**3. Decide ingestion + chunking.** Route by file type (scanned vs. digital vs. structured).
Chunk to match typical query scope, not a fixed size — hierarchical chunking off the
document's own heading structure for long structured docs, **small-to-big / parent-document
retrieval** (embed and match at a small precise unit like one clause, but return its
containing parent section — not the whole document — for synthesis) if a query needs one
clause's precision but its section's context.

**4. Decide the retrieval pipeline stages, and justify skipping any of them.**
**Self-query** (an LLM parses the natural-language question into structured metadata
filters — year, jurisdiction, business unit — plus a semantic search string, so both run
together) if metadata dimensions matter more than embeddings can separate on their own.
**Reranking** (a second, slower, more accurate cross-encoder pass over the top-k candidates
from initial retrieval) if the latency budget and stakes justify 300ms+.
**RAPTOR** (recursively cluster and summarize chunks into a multi-level hierarchy, index
every level together) if the corpus has both narrow and broad-synthesis questions.
**GraphRAG** (retrieval over a knowledge graph of entities/relationships instead of, or
alongside, vector similarity) if the real questions are relational/multi-hop across
separate documents. **Agentic RAG / CRAG** (an agent grades its own retrieved context and
re-retrieves with a reformulated query if the grade is poor, capped at a few retries) if the
stakes justify paying 3-10x the tokens to do that grading and retry before answering.

**5. Decide governance requirements.** Compliance (BAA/data residency) picks the embedding
model and vector store before quality benchmarks do, if PHI/PII is in scope. Citations are
mandatory whenever a wrong answer has real consequences — build the 4-layer mechanism
(ingestion metadata → retrieval payload → prompt anchor → structured output), not just a
system-prompt instruction. Decide the fallback explicitly: what does the system say when
it's not confident, and who/what does it route to.

**6. Decide the eval and rollout plan.** RAGAS/LLM-as-judge for faithfulness before
shipping a retrieval-strategy change; shadow vs. blocking evaluation based on whether a bad
answer reaching a user before being caught is acceptable for this use case.

---

## Use-case tradeoffs — side by side

✓ = stated explicitly in the talk-tracks already rehearsed. *(reasoned)* = not explicitly
fixed there — a live extension of the same framework, reason it out the same way if asked
rather than presenting it as something already decided.

| Use case | Latency budget | Exact-match (BM25) | Self-query | Reranker | Compliance driver | Fallback |
|---|---|---|---|---|---|---|
| **NFL media guides** | High tolerance (research tool) ✓ | Yes — stats/records ✓ | Yes — team/season/position ✓ | Skip — low stakes ✓ | None | *(reasoned)* none critical |
| **Clinical/PBM formulary** | Moderate — 300ms+ reranker accepted ✓ | Yes — ICD-10/NDC/CPT ✓ | Yes — year, doc_type ✓ | Yes ✓ | HIPAA/PHI, BAA ✓ | Below-threshold → "insufficient information," citations mandatory ✓ |
| **HR policy** | Loose — minutes fine, corrected from consumer-speed assumption ✓ | Yes — plan/benefit IDs ✓ | Yes — job level, location, BU, plan year ✓ | Yes, recency-ranking > speed ✓ | Liability/trust, not HIPAA-tier | Route to HR for edge cases ✓ |
| **Oil & gas compliance** | Loose — 5-10s accepted ✓ | Yes — CFR sections, permit IDs ✓ | Yes — reg type, jurisdiction, date ✓ | Yes, full pipeline ✓ | Federal/state regulatory + safety | Route to licensed compliance engineer ✓ |
| **Legal/contracts** | *(reasoned)* moderate — review workflow, not real-time | Yes — clause terms, party names ✓ | Yes — contract type, counterparty, date ✓ | *(reasoned)* likely, given citation-mandatory stakes | Legal liability, version-of-record | *(reasoned)* human review always in the loop |
| **Financial services / regulatory** | *(reasoned)* moderate | Yes — regulation numbers ✓ | *(reasoned)* yes, via effective-date filtering | *(reasoned)* likely | SEC/FINRA/Basel currency — incremental re-index is a designed process ✓ | *(reasoned)* flag ambiguous/stale-regulation answers |
| **Manufacturing QMS** | *(reasoned)* moderate | Yes — part/process/revision numbers ✓ | *(reasoned)* yes, via revision status/date | *(reasoned)* possible | Version control — outdated SOP is a non-conformance event ✓ | *(reasoned)* block on superseded docs |
| **Customer service KB** | Tightest — ≤1 second ✓ | *(reasoned)* low — mostly FAQ-semantic | *(reasoned)* low priority | Skip or tiny model ✓ | None significant | Route to human agent on low confidence ✓ |
| **Life sciences (trial protocols)** | *(reasoned)* moderate-high, regulatory stakes | Yes — NCT numbers ✓ | Yes — therapeutic area, phase, indication ✓ | *(reasoned)* likely | Regulatory stakes, citation required ✓ | *(reasoned)* hardest case is multi-document synthesis across trials → agentic RAG territory ✓ |

**Reading the table fast**: latency budget and compliance driver are the two columns that
predict everything else. Loose latency + high compliance stakes → full pipeline, every
stage justified (clinical, oil & gas). Tight latency + low compliance stakes → strip stages
aggressively (customer service). Everything in between is where you have to actually reason
about the specific corpus rather than pattern-match to one extreme.

---

## If asked to architect something not on this table at all

Run the 6-step process above cold. The two questions that unlock the rest of the design
fastest, in order: **"What happens if this system gives a confident wrong answer — who
notices, and what's the cost?"** (sets the stakes, which sets the latency budget, reranking
decision, and whether agentic RAG is worth its cost) and **"Does this corpus have
identifiers where being one character off is a different answer, not an approximate one?"**
(the direct trigger for hybrid BM25+dense — codes, IDs, dates, section numbers).
