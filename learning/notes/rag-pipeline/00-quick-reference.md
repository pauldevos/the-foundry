# RAG Quick Reference — Cram Sheet

*Built 2026-07-25, three days before Tuesday interviews. Purpose: the ranked list of RAG
techniques most likely to come up, each as What / When / When-not, current for 2026 (not
the 2023-2024 framing most tutorials still teach). Read this top to bottom before anything
else in `notes/rag-pipeline/` — this is the index, those are the depth if a topic needs it.*

---

## How the whole thing hangs together (say this if asked "walk me through RAG")

Ingest → chunk → embed → index → retrieve → generate. RAG exists because most valuable
data is private and LLMs are trained on public data — it's how you combine an LLM's
reasoning with private/current data at inference time, without retraining. Context windows
getting huge (up to 1M tokens) changed what you can *hand* the model, not whether you still
need to *find* the right thing first — retrieval doesn't go away just because you could
technically stuff more in.

**The single most important 2026 framing update**: "RAG" no longer means one architecture.
It now covers three: **pipeline RAG** (one retrieval, one generation — fast, cheap, fine for
single-hop questions), **agentic RAG** (an agent decides whether/when to retrieve, rewrites
queries, re-retrieves if the first pass was weak, checks its own answer before returning —
costs 3-10x the tokens and 2-5x the latency, earns it on multi-hop/ambiguous/high-stakes
questions), and **knowledge-graph RAG** (retrieval over entity relationships for
multi-hop/relational questions vector similarity can't assemble). If you only describe
pipeline RAG when asked "how would you architect this," you'll read a year or two behind —
lead with "which of the three fits this use case" instead.

---

## Tier 1 — Bedrock (must be able to say cold, no notes)

**Chunking** — Splitting source docs into retrieval-sized units, because embedding models
cap input at 512-8K tokens (a hard technical limit, not a preference). *Use*: match chunk
size to typical query scope — too large blends unrelated content into one diluted vector,
too small fragments a self-contained answer across multiple incomplete chunks. *Don't*: use
one flat strategy for a mixed corpus — a one-page memo is naturally one chunk, a 40-page
structured doc needs hierarchical chunking off its own heading numbers.

**Hybrid retrieval (BM25 + dense)** — Dense/embedding search finds semantic similarity;
BM25 (sparse, keyword/term-frequency) finds exact matches embeddings blur together. *Use*:
anytime the corpus has identifiers where the difference between right and wrong is smaller
than the embedding model's resolution — codes, IDs, drug names, section numbers, years.
*Don't* assume dense retrieval fails randomly — it fails predictably on near-identical
strings/codes, which is the actual diagnostic for "do I need BM25 here."

**Reranking (cross-encoder)** — A second, more expensive scoring pass on the top-k
candidates from initial retrieval — feeds query+document together for one joint relevance
score, more accurate than a bi-encoder but slower. *Use*: when the stakes justify 300ms+ of
added latency (clinical, legal, compliance). *Don't*: bother in a 1-second-budget consumer
app, or a low-stakes research tool — skip it or use a tiny model (ms-marco-MiniLM) instead.

**Embedding model selection** — Don't pick off the MTEB leaderboard; MTEB is general-domain
and even its "medical" tasks are literature-QA-shaped, not your actual corpus. Benchmark on
your own representative data. Compliance narrows the field before quality does: no PHI to a
third-party API without a BAA. Asymmetric embedding setups (separate query/document
encoders) beat symmetric for retrieval specifically because a query and a document chunk
are structurally different shapes of text.

**Faithfulness vs. correctness** — Faithfulness: every claim is supported by retrieved
context, measurable at runtime with no ground truth needed — your hallucination detection
signal. Correctness: the answer is true in the world, requires ground truth, can't be
checked live. *The example that lands in an interview*: model answers with something true
but not in the retrieved context (pulled from training weights) — that's a faithfulness
failure even though it's a correct fact, because it's unverifiable and potentially
contradicts your org's specific policy.

**Agentic RAG / CRAG (the 2026-current frame)** — An agent grades its own retrieved context
before generating; if the grade is poor, it reformulates the query and re-retrieves, capped
at 2-3 retries before returning an explicit fallback rather than a wrong answer. *This is
the single highest-leverage thing to be fluent on right now* — it's the mechanism that
answers "how do you know when retrieval failed" and "how do you keep an agent from just
guessing," both extremely likely interview questions.

---

## Tier 2 — Differentiators (this is where you separate from other candidates)

**Query transformation** — Multi-query (generate several rephrasings, retrieve for each,
merge — boosts recall), HyDE (embed a hypothetical LLM-generated answer instead of the raw
question, since a plausible answer often sits closer to real answer documents in vector
space than the question does), query decomposition (split a compound question into
sub-questions). *Use*: when a single query phrasing under-retrieves what's actually needed.

**Self-query retrieval** — An LLM parses a natural-language query into structured metadata
filters (year, doc_type, jurisdiction) plus a semantic search string. *Use*: whenever the
corpus has metadata dimensions embeddings can't reliably separate on their own — dates
especially (a 2011 and 2024 policy read almost identically to an embedding model).

**Small-to-big / parent-document retrieval** — Embed and match at a small, precise unit
(a clause, a sentence) but return the containing parent section at synthesis time, not the
whole document. *Use*: long structured documents where the answer lives in one clause but
needs its surrounding section to not be misread. *Don't* confuse with "retrieve small, hand
the model the whole document" — that's not the same move and defeats the point of chunking.

**RAPTOR (hierarchical/recursive indexing)** — Cluster raw chunks, summarize each cluster,
repeat recursively up to a top-level summary; index every level together in one vector
store. *Use*: a corpus with both narrow factual questions and broad synthesis questions
("summarize what changed across all Q3 reports") — no single fixed top-k serves both. Still
current in 2026 — not superseded, other techniques (GraphRAG, SiReRAG) build on top of it
rather than replacing it.

**GraphRAG** — Retrieval over a knowledge graph of entities/relationships instead of (or
alongside) vector similarity. *Use*: genuinely relational, multi-hop questions where the
answer requires traversing connections across multiple separate documents (federal rule →
state rule → local permit; player → team → season → opponent) — no single vector match
assembles that.

**Routing** — Decide which data source, retrieval strategy, or prompt a query should go to
before retrieval happens — logical (LLM picks via structured output/function-calling) or
semantic (embed the query, match against candidate destinations, no LLM call needed). *2026
update*: this now sits as one layer inside a bigger routing decision — a fast classifier
first decides classic-RAG vs. agentic-RAG escalation (classic handles ~70-85% of traffic),
*then* routing-to-source happens underneath whichever path was chosen.

**Governance basics (citations, PHI, guardrails)** — Citations are an architecture, not a
feature: metadata extracted at ingestion, carried through retrieval as payload, labeled in
the prompt, enforced via structured output — skip any one layer and citations either don't
exist or can't be trusted. PHI scrubbing is three independent points (input, context,
output), not one. Prompt injection defense treats retrieved documents as untrusted input,
not just user queries. *This is explicitly your production edge* — most candidates can
speak fluently to generation and almost none can speak to governance at this level.

---

## Tier 3 — Depth, if the conversation goes there

- **Evaluation**: RAGAS metrics (faithfulness, answer relevancy, context precision/recall),
  LLM-as-judge deployment patterns (offline / shadow-async / blocking), NLI as a cheap
  first-pass filter that escalates to LLM-judge only when uncertain.
- **NIST AI RMF**: Govern / Map / Measure / Manage — the four-function frame for describing
  enterprise AI governance maturity if asked to go up to Director-altitude.
- **Embedding drift & dual-index cutover**: upgrading embedding models requires a full
  parallel re-index and shadow-validated cutover — never partial re-embedding, it silently
  degrades retrieval with no error thrown.
- **Multi-agent terminology**: tool (deterministic function) vs. agent (LLM-backed decision
  maker) vs. static topology (LangGraph, edges fixed at design time) vs. dynamic spawning
  (agent creates new agent instances at runtime — loses trace observability and cost
  governance).

---

## 3-day study plan from here to Tuesday morning

**Today (Sat)**: Read this document twice, out loud the second time. Then open
`learning/talk-tracks/rag-pipeline.md` and read only the Tier 1 items' full talk-track
entries (Layer 2 chunking, Layer 3 hybrid search + embedding model selection, Layer 5
faithfulness + agentic/CRAG) — those have the full worked examples this cheat sheet
compresses out. Don't touch Tier 3 today.

**Sunday**: Drill Tier 1 + Tier 2 as spoken answers — say each one out loud from memory,
check against the talk-track, repeat anything you stumbled on. If the foundry-study app has
due cards, clear them. Do NOT start new material Sunday — depth on what's already here beats
breadth.

**Monday**: One full run-through of this cram sheet + a mock pass answering "walk me through
how you'd architect RAG for [pick 2 of: clinical formulary, HR policy, oil & gas
compliance]" out loud, using the Use Case talk-tracks as your check. Light review only in
the evening — no new material within 12 hours of the interview.

**Tuesday morning**: Skim this document one more time, nothing new, and go in.
