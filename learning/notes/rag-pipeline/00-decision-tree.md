# RAG Architecture Decision Tree — IF this signal → THEN this choice

*Built 2026-07-26, two days before Tuesday interviews. Purpose: a numbered IF/THEN
reference so you can go from "what does the interviewer's requirement actually imply" to
"which named technique" in one lookup, without re-deriving it from prose. Every technique
named here is defined in full in `00-quick-reference.md` and the glossary — this file is
the index that routes you to the right one fast. See also
`../ai-engineering-decision-matrix.md` for the broader (non-RAG-specific) version of this
same IF/THEN format — documents, vector DBs, deployment, tools, guardrails, compliance.*

---

## Retrieval technique — which one, when

**1.** 🔎 **IF** the corpus has exact-reference identifiers (codes, IDs, section numbers, drug names, years) where a near-miss is a *wrong* answer, not an approximate one...

✅ **THEN** hybrid BM25 + dense retrieval. Add **SPLADE** on top if there's also heavy synonym/abbreviation variation. 💡 *Example:* NDC 0169-4132-12 vs. 0169-4133-12 — nearly identical strings, different coverage lines; dense retrieval alone can't tell them apart.

**2.** 🔎 **IF** the query has metadata dimensions (date, jurisdiction, business unit, doc type) that embeddings can't reliably separate on their own...

✅ **THEN self-query retrieval** — an LLM parses the question into structured filters + a semantic string, run together. 💡 *Example:* "2024 GLP-1 coverage" → filter `year=2024` + semantic query "GLP-1 coverage."

**3.** 🔎 **IF** a single query phrasing under-retrieves what's actually needed (a recall problem)...

✅ **THEN multi-query retrieval** (rephrase several ways, merge) or **HyDE** (embed a hypothetical generated answer instead of the raw question). 💡 *Example:* "efficient third-down defense" misses a stats table that never uses the word "efficient."

**4.** 🔎 **IF** the answer lives in one small clause but that clause is meaningless without its surrounding section...

✅ **THEN small-to-big / parent-document retrieval** — match small, return the containing section, not the whole document. 💡 *Example:* regulation clause 12.3.5 inside a 20-page document.

**5.** 🔎 **IF** the corpus has both narrow factual questions and broad synthesis questions...

✅ **THEN RAPTOR** — recursive clustering/summarization, index every hierarchy level together. 💡 *Example:* "summarize what changed across all Q3 reports."

**6.** 🔎 **IF** the real questions are relational/multi-hop across separate documents...

✅ **THEN GraphRAG**. 💡 *Example:* federal rule → state rule → local permit, three separate source documents, no single vector match assembles the answer.

**7.** 🔎 **IF** the knowledge base spans genuinely different source types...

✅ **THEN routing** — logical (LLM picks via structured output) or semantic (embed and match against candidate destinations, no LLM call needed). 💡 *Example:* a Python-docs index vs. a JS-docs index vs. a SQL database.

**8.** 🔎 **IF** query complexity varies a lot and you want to spend extra cost only where it's earned...

✅ **THEN Adaptive RAG** — a classifier before retrieval routes simple queries cheap, complex ones deep. 💡 *Example:* "what's our address" (direct answer) vs. "how do our Q1-Q3 policies compare" (multi-step retrieval).

## Precision vs. recall — which failure mode you're protecting against

**9.** 🔎 **IF** the priority is high recall (missing something is worse than some noise)...

✅ **THEN** multi-query/query expansion, a larger k, and *skip* aggressive reranking. 💡 *Example:* legal discovery search — a missed document is worse than ten irrelevant ones.

**10.** 🔎 **IF** the priority is high precision (a handful of results, each must be exactly right)...

✅ **THEN** reranking (cross-encoder) on hybrid retrieval, smaller k. 💡 *Example:* a clinical coverage lookup returning exactly one applicable policy.

**11.** 🔎 **IF** both matter and stakes are high...

✅ **THEN** retrieve wide, then rerank down. 💡 *Example:* oil & gas compliance — cast a wide net across jurisdictions, then rerank to the specific applicable sections.

## Accuracy / stakes — how much scaffolding the answer needs

**12.** 🔎 **IF** a wrong answer is low-consequence...

✅ **THEN** skip the reranker and fallback complexity — more engineering than the stakes justify. 💡 *Example:* an internal NFL-stats research tool.

**13.** 🔎 **IF** a wrong answer has real consequences...

✅ **THEN** confidence threshold + explicit fallback, mandatory citations, consider CRAG/Agentic RAG to grade context before answering. 💡 *Example:* a clinical formulary chatbot returning "insufficient information" below a confidence threshold rather than guessing.

## Citations — mandatory or not

**14.** 🔎 **IF** a wrong or unverifiable answer has any real consequence...

✅ **THEN** citations are mandatory, built as an architecture (ingestion metadata → retrieval payload → prompt anchor → structured-output schema), not a system-prompt instruction alone. 💡 *Example:* "Document: Formulary 2024, Section 3.2" labeled in context, `sources: [{doc_id, section, page}]` enforced in the output schema.

**15.** 🔎 **IF** it's a low-stakes internal tool with no downstream consequence...

✅ **THEN** citations are optional, though cheap source-linking is rarely not worth adding.

## Latency budget

**16.** 🔎 **IF** users tolerate high latency (verify this — don't assume the consumer-speed default)...

✅ **THEN** run the full pipeline; Agentic RAG's 3-10x token cost is affordable. 💡 *Example:* HR policy chatbot in MS Teams — users were fine waiting a minute-plus for a correct, cited answer.

**17.** 🔎 **IF** the latency budget is tight (~1 second, consumer-facing)...

✅ **THEN** skip/shrink the reranker, invest in chunk quality instead, skip agentic retry loops. 💡 *Example:* a customer-service FAQ widget.

## Compliance / governance

**18.** 🔎 **IF** PHI or PII is anywhere in the corpus...

✅ **THEN** data residency/BAA picks the embedding model and vector store before quality benchmarks; scrub at three points (input, context, output); log the PHI-scrubbed query, never the raw one; enforce RBAC at the retrieval/tool layer. 💡 *Example:* a clinical guideline chunk containing a real patient case study — scrubbed before it ever reaches the prompt.

**19.** 🔎 **IF** regulated but not health-specific (financial, legal, manufacturing QMS)...

✅ **THEN** citations mandatory + effective-date/revision-status filtering + incremental per-document re-indexing as a designed process. 💡 *Example:* a superseded SOP marked `status=superseded`, never surfaced by default.

## Evaluation strategy

**20.** 🔎 **IF** deploying a new retrieval strategy...

✅ **THEN** offline RAGAS/LLM-as-judge evaluation against a golden dataset before it reaches a user.

**21.** 🔎 **IF** the stakes justify catching a bad answer before a user sees it...

✅ **THEN** blocking evaluation (faithfulness check before returning), not shadow/async — async catches the failure only after the bad answer already went out.

**22.** 🔎 **IF** volume is very high (millions of queries/day)...

✅ **THEN** NLI as a cheap first-pass filter, escalate only the uncertain cases to full LLM-as-judge.

## Embedding model selection

**23.** 🔎 **IF** a data-residency or PHI constraint exists...

✅ **THEN** compliance picks the model and vector store before quality benchmarks do, full stop.

**24.** 🔎 **IF** picking on quality grounds...

✅ **THEN** benchmark on your own representative data; never trust MTEB rank alone. 💡 *Example:* a model topping MTEB's medical tasks tells you little about ranking pharma coverage-policy chunks specifically.

**25.** 🔎 **IF** the retrieval task is query-vs-document (short question, long chunk)...

✅ **THEN** asymmetric embedding setup — separate query/document encoders.

**26.** 🔎 **IF** the task is document-to-document comparison (dedup, clustering)...

✅ **THEN** symmetric embedding setup.

**27.** 🔎 **IF** you'll need to constantly re-evaluate or swap the embedding model itself (new model versions shipping regularly, or migrating providers)...

✅ **THEN** a dual-index / blue-green cutover strategy as a standing operational pattern, not a one-off migration project — build the new index in parallel, shadow-validate, cut over, decommission. 💡 *Example:* mixing old- and new-model vectors in one index silently degrades retrieval with no error thrown — this is why the cutover has to be all-or-nothing, not gradual.

---

## RAG types — definitions first

There's no single agreed "how many types of RAG" — 8 is the count most 2026 taxonomies
converge on. Definitions first, then the IF/THEN mapping below.

⚠️ **Don't conflate this with chunking strategy.** "RAG type" describes the overall
pipeline's architecture/sophistication — a completely different axis from chunking
strategy (fixed-size/semantic/hierarchical/late), which is one ingestion-stage choice
inside *any* RAG type. Naive RAG typically defaults to fixed-size chunking, and Advanced
RAG typically upgrades to semantic/hierarchical — that's a rough tendency, not the
definition. Naive RAG is defined by doing the bare minimum end-to-end (no query rewriting,
no hybrid search, no reranking), not by which chunking method it happens to use — you could
build a Naive pipeline with semantic chunking and it's still Naive if nothing else changed.

- **Naive RAG** (a.k.a. "Simple RAG"): the baseline two-phase pipeline — chunk documents,
  embed, store in a vector index, retrieve top-k on a query, stuff into the prompt,
  generate. No query rewriting, no reranking, no metadata filtering.
  🗣️ *Real usage: high — genuinely said, almost always comparatively ("we started with
  naive RAG").*
- **Advanced RAG**: Naive RAG plus pre-retrieval and post-retrieval refinements — query
  rewriting/HyDE, hybrid BM25+dense, self-query metadata filtering, reranking, better
  chunking. This is what most of the entries above describe — "Advanced RAG" isn't one
  technique, it's the label for "Naive RAG with the obvious improvements."
  🗣️ *Real usage: low — almost nobody claims "we built Advanced RAG" as a specific system
  description; in practice people name the actual technique instead ("we added a
  reranker"). If you hear it used as a specific claim, ask which parts they mean.*
- **Modular RAG**: not a technique — a framing that treats every pipeline stage (indexing,
  retrieval, generation) as an independently swappable module. Any of the other 7 types is
  really "Modular RAG with a specific module choice."
  🗣️ *Real usage: near-zero — a survey-paper framing term, not something anyone claims to
  have built.*
- **Graph RAG**: retrieval over a knowledge graph of entities/relationships instead of (or
  alongside) vector similarity — built for multi-hop, relational questions.
  🗣️ *Real usage: high — specific and common, largely because Microsoft's actual GraphRAG
  project made it a concrete, recognizable thing.*
- **Adaptive RAG**: a routing classifier sits before retrieval and picks the strategy (or
  skips retrieval entirely) per query, based on complexity.
  🗣️ *Real usage: low — the underlying behavior ("we route simple vs. complex queries
  differently") is common; naming it "Adaptive RAG" specifically is not.*
- **Corrective RAG (CRAG)**: after retrieving, an external evaluator grades the retrieved
  context's quality; a poor grade triggers query reformulation and re-retrieval (capped
  retries), a good grade proceeds to generation.
  🗣️ *Real usage: medium — used among people who've read the paper; more often described
  by mechanism ("we grade retrieval and retry") than by the acronym in casual conversation.*
- **Self-RAG**: the CRAG idea, but trained into the model's own weights via special
  "reflection tokens" rather than bolted on as external orchestration.
  🗣️ *Real usage: low — requires actually fine-tuning a model with reflection tokens, which
  almost no team does; mostly a research-reference point, not a claimed production system.*
- **Agentic RAG** (a.k.a. "Complex RAG"): a full autonomous agent loop — decides whether/
  when to retrieve, can call multiple tools, rewrites queries between hops, checks its own
  faithfulness, re-retrieves on failure. Costs 3-10x the tokens and 2-5x the latency of
  Naive RAG; earns it on multi-hop, ambiguous, or high-stakes questions.
  🗣️ *Real usage: very high — the one term here actively driving real 2025-2026 design
  decisions ("should this be agentic or should we keep it simple"), not just describing
  something after the fact.*

**The calibration that actually matters:** the *techniques* underneath these labels are
the load-bearing interview knowledge — the labels themselves are mostly your own
organizing scaffold, useful for directly answering "how many types of RAG are there" if
asked as a trivia-style question, not vocabulary to reach for yourself in a real design
conversation. Nobody designs a system by picking a label off this list; they pick
techniques based on requirements (see the IF/THEN entries above and in
`../ai-engineering-decision-matrix.md`), and the label is just what you'd call the result
in hindsight, if anyone bothered to.

## RAG type selection — the IF/THEN

**28.** 🔎 **IF** you just need the retrieve-then-generate baseline...

✅ **THEN Naive RAG.**

**29.** 🔎 **IF** you need better precision on an otherwise-standard pipeline (query rewriting, reranking, better indexing)...

✅ **THEN Advanced RAG** — this is most of the entries earlier in this file.

**30.** 🔎 **IF** you want every pipeline stage independently swappable/configurable...

✅ **THEN Modular RAG** — a framing, not a standalone technique.

**31.** 🔎 **IF** the questions are relational/multi-hop across documents...

✅ **THEN Graph RAG.**

**32.** 🔎 **IF** query complexity varies and you want to route accordingly...

✅ **THEN Adaptive RAG.**

**33.** 🔎 **IF** you need retrieval-quality self-correction before answering, as external orchestration...

✅ **THEN Corrective RAG (CRAG).**

**34.** 🔎 **IF** you want that retrieve/critique behavior trained directly into the model's weights instead of orchestrated externally...

✅ **THEN Self-RAG.**

**35.** 🔎 **IF** stakes justify full autonomous multi-step reasoning, tool switching, and retries...

✅ **THEN Agentic RAG.**

---

## If you don't know which of the above applies — the two questions that unlock it

🎯 **"What happens if this system gives a confident wrong answer — who notices, and what's
the cost?"** (sets stakes → latency budget → reranking → whether Agentic RAG's cost is
worth it.)

🎯 **"Does this corpus have identifiers where being one character off is a
different answer, not an approximate one?"** (the direct trigger for hybrid BM25+dense.)

Ask these two live if you're ever handed a use case cold.
