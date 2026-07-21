# Building Production-Ready RAG Applications

**Speaker:** Jerry Liu, co-founder & CEO of LlamaIndex
**Source:** https://www.youtube.com/watch?v=TRjq7t2Ms5I
**Maps to:** RAG Architecture (Tier 1) — one of the original videos processed this
session; previously only mined for flashcards (10 cards live in `rag-architecture.json`),
never given standalone notes until now. That gap is now closed.

**Watch verdict: read the notes, skip the video.** Checked the transcript for visual/code-
walkthrough dependency (screen-share cues, "as you can see," diagram references) — found
almost none. This is a verbally self-contained conference talk, not a live coding demo.
Nothing here is lost by reading instead of watching.

## The big takeaway, one paragraph

Naive RAG (chunk it, embed it, top-k retrieve, stuff it in the prompt) breaks down in
production for specific, diagnosable reasons — low precision, low recall, lost-in-the-
middle effects. Liu's framing is a difficulty ladder, not a grab-bag: start with cheap
"table stakes" fixes (chunk size tuning, metadata filtering), only reach for advanced
retrieval techniques (small-to-big, reranking) once table stakes are exhausted, and only
reach for agents/fine-tuning — the most expensive, highest-latency options — last. Do this
against a defined eval benchmark, not by vibes, or you can't tell if a change actually helped.

## Key moments

1. **Two paradigms for getting an LLM to use data it wasn't trained on**: retrieval augmentation (fix the model, build a data pipeline to inject context into the prompt) vs. fine-tuning (update the model's weights to bake in knowledge). The talk is scoped to the first.
2. **Why naive RAG breaks in production**: low precision (irrelevant chunks retrieved → hallucination, "fluff" in the response), low recall (top-k too low, or the needed info just isn't in the retrieved set), and lost-in-the-middle (LLMs remember the start/end of context better than the middle — reranking your retrieved chunks doesn't reliably fix this, and can even increase error rates). — [▶ watch (10:16)](https://www.youtube.com/watch?v=TRjq7t2Ms5I&t=616s)
3. **Evaluate retrieval and synthesis separately.** Retrieval eval needs a dataset of (query → relevant document IDs) — human-labeled, from real user feedback, or synthetically generated — scored with IR metrics (hit rate, MRR, NDCG). Synthesis/end-to-end eval needs (query → reference answer), scored via LLM-based evals. Liu is explicit these retrieval metrics aren't new LLM-era inventions — they're classic information retrieval, "around for a decade or two," now newly relevant.
4. **The difficulty ladder — his actual advice on where to start**:
   - **Table stakes** (cheap, do these first): better chunking, hybrid search, metadata filters. — [▶ watch (8:50)](https://www.youtube.com/watch?v=TRjq7t2Ms5I&t=530s)
   - **Advanced retrieval** (more effort): reranking, recursive retrieval, small-to-big retrieval.
   - **Agents and fine-tuning** (most expressive but highest latency/cost, "more forward-looking"): reserved for last.
5. **Chunk size tuning, with a specific counter-intuitive finding**: more retrieved tokens does not reliably mean better performance, and reranking retrieved chunks doesn't reliably improve final generation quality either — both interact with the lost-in-the-middle effect. There's an empirically-found optimal chunk size *per dataset*, not a universal number. — [▶ watch (9:52)](https://www.youtube.com/watch?v=TRjq7t2Ms5I&t=592s)
6. **Metadata filtering, with a concrete worked example**: asking "what are the risk factors in the 2021 10-Q" against raw semantic search over a multi-year document collection returns low-precision results — it may pull risk factors from the wrong year entirely. Fix: infer a structured filter (`year = 2021`, like a SQL WHERE clause) from the question and combine it with semantic search — precision improves because you're not relying on embeddings alone to distinguish "2021" from "2022." — [▶ watch (10:39)](https://www.youtube.com/watch?v=TRjq7t2Ms5I&t=639s)
7. **Small-to-big retrieval, the reasoning behind why it works**: embedding a large chunk means the embedding can get diluted/biased by irrelevant content within that chunk. Embedding at a smaller, more granular level (sentence-level) makes retrieval itself more precise, then the context window gets *expanded* at synthesis time so the LLM still has enough surrounding information to actually answer well. Concretely allows a smaller k (e.g. k=2) to outperform a naive k=5 over big chunks. — [▶ watch (9:24)](https://www.youtube.com/watch?v=TRjq7t2Ms5I&t=564s)
8. **A related variant**: embedding a *reference* to the parent chunk (or a summary, or a hypothetical question the chunk answers) instead of the raw chunk itself — same underlying principle as small-to-big, applied slightly differently.

## Why this doesn't duplicate the existing RAG decks

`rag-architecture.json` and `rag-from-scratch-cards.json` already cover chunking, hybrid
retrieval, small-to-big, and metadata filtering as atomic facts. What these notes add that
the cards don't: Liu's explicit **prioritization framework** (table stakes → advanced →
agents/fine-tuning, in that order) and the **reasoning/evidence** behind each technique
(the SEC 10-Q example, the reranking-can-hurt finding) — the "why and in what order,"
not just "what."
