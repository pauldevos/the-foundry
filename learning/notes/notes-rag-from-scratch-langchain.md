# RAG From Scratch — Lance Martin (LangChain)

**Speaker:** Lance Martin, software engineer at LangChain
**Source:** https://www.youtube.com/watch?v=sVcwVQRHIc8
**Maps to:** RAG Architecture (Tier 1)

This is a long, multi-part course (143K+ char transcript). The existing 48-card RAG
deck already covers chunking, hybrid retrieval, reranking, HyDE, multi-query, and
GraphRAG in depth — these notes deliberately focus only on the genuinely new material
this course adds: **routing**, **multi-representation (proposition) indexing**, and
**RAPTOR** — rather than re-deriving what's already covered.

## Motivation, framed distinctly

1. Most of the world's valuable data is private, while LLMs are trained on public data — RAG is the mechanism for combining private/external data with an LLM's reasoning at inference time, without retraining.
2. A useful framing: context windows have grown enormously (from ~4-8K tokens a year prior to up to 1M tokens), which changes what's *feasible* to retrieve and pass in, but doesn't remove the need for retrieval — you still need to find the *right* private data before you can hand it to the model.

## Routing — a genuinely distinct pipeline stage from retrieval itself

3. Routing sits between query understanding and retrieval: given a question (possibly already decomposed/rewritten), decide *which* data source or prompt it should actually go to — e.g. a vector store vs. a relational DB vs. a graph DB, or a Python-docs index vs. a JS-docs index.
4. **Logical routing**: give an LLM structured knowledge of the available data sources, and have it choose one via structured output/function calling — effectively classification-by-function-call. The model's output is constrained to a fixed schema (one of N valid data sources), not free text.
5. **Semantic routing**: embed the incoming question, embed a set of candidate prompts/destinations ahead of time, and route to whichever candidate has the highest embedding similarity to the question — no LLM call needed at routing time, just a similarity computation.
6. The general pattern generalizes beyond "which database" — it can route to different prompts, different retriever chains, or arbitrarily different downstream logic based on the nature of the incoming question.

## Multi-representation (proposition) indexing

7. Core idea: decouple the unit you *embed for retrieval* from the unit you actually *feed the LLM at generation time*.
8. Mechanism: take a document, use an LLM to distill it into a "proposition" — essentially an optimized summary containing the document's key terms and ideas — and embed *that* for retrieval matching. Separately, store the full raw document in a plain document store, keyed to the same entry.
9. At query time: search finds the best-matching proposition/summary, but what actually gets returned and fed to the LLM is the *full original document* pulled from the document store — not the summary itself.
10. Why this works well with modern long-context models specifically: the LLM can now comfortably handle an entire retrieved document at generation time, so there's no need to chunk it — the summary's only job is being a good retrieval key, and the full document handles being a good generation input. This separates "what's easy to search over" from "what's needed to actually answer well."

## RAPTOR — recursive hierarchical indexing

11. Motivation: standard top-k retrieval assumes a fixed k (e.g. 3 chunks). Low-level questions (answerable from one chunk/document) are fine with this. High-level questions requiring consolidation across many chunks or documents can exceed whatever k you've set, and there's no single k that serves both cases well.
12. RAPTOR's mechanism: start with raw document chunks as leaves, cluster similar ones, summarize each cluster, then repeat this clustering-and-summarizing process recursively — climbing from raw chunks up through progressively higher-level summaries, until you either hit a limit or converge to one top-level summary of the whole corpus.
13. All levels of this hierarchy — raw chunks and every level of summary — get indexed together in the same vector store, not just the top or bottom layer.
14. Result: a low-level question's embedding will naturally match closely with raw, detailed chunks; a high-level question's embedding will naturally match closely with higher-level summary nodes — giving the retrieval system semantic coverage across the full abstraction hierarchy of possible question types, without needing to manually route between "detail mode" and "overview mode."

## Practical framing for interviews

15. If asked to design RAG for a corpus with both narrow factual questions and broad synthesis questions ("summarize what changed across all Q3 reports"), RAPTOR-style hierarchical indexing is the direct, named technique to reach for — plain flat chunking with a fixed k structurally cannot serve both well.
16. Routing is the answer to "what if my knowledge base spans genuinely different data source types" — it's a distinct architectural decision from chunking/retrieval-within-a-source, and naming it separately (rather than folding it into "retrieval") signals a clearer mental model of the full pipeline.
