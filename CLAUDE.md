# The Foundry — Claude Session Guide

## What This Is

Paul's interview-prep knowledge base for AI Director / Head of AI and Principal/Staff AI
Engineer roles. Built through live, extended (2-4hr) working sessions with Claude — deep
Socratic Q&A over real use cases, trade-off analysis across competing technologies
(LangGraph vs. LlamaIndex, Chroma vs. Qdrant vs. Weaviate), and hands-on POC testing — not
a passive reading pipeline.

This repo has pivoted before: it started as a YouTube video-processing pipeline. That
pipeline now lives in a separate repo (see below) — this repo's job is the knowledge base
itself.

**The three-repo system:**
- `the-foundry/` ← YOU ARE HERE. Paul's interview-prep knowledge base.
- `youtube-research-pipeline/` ← pulls and scores YouTube video transcripts. Its future
  recommender reads this repo's `learning/` corpus to judge whether a candidate video
  reinforces what Paul already knows or teaches something new. Clone as a sibling
  directory (`~/github/youtube-research-pipeline`) — some note-writing workflows read
  saved transcripts from there by relative path.
- `second_brain/` ← Paul's Obsidian vault. Only curated, approved content lands there.
  Never mix any of these three.

---

## Two Coexisting Content Systems

Content is organized by **type first, domain second** — three top-level folders:

- **`learning/decks/`** — flashcard JSON. Broad topic decks live directly in this folder
  (RAG Architecture, Agentic AI, MCP/Governance, LLM Evaluation, Prompt Engineering, Vector
  Databases, Fine-Tuning vs. RAG, Production Deployment, MLOps, LlamaIndex, Claude/OpenAI
  APIs, AI Roadmap & Strategy, etc. — see `learning/README.md` for the full current list
  and card counts). Deep-dive domain decks live in a subfolder, e.g. `decks/rag-pipeline/`.
- **`learning/notes/`** — long-form "read repeatedly until you can narrate it without
  notes" reference docs. Same split: broad topic notes at top level (video-sourced
  material, lecture notes), deep-dive domain notes in a subfolder, e.g.
  `notes/rag-pipeline/01-ingestion-parsing/`, `notes/rag-pipeline/04-retrieval.md`.
- **`learning/talk-tracks/`** — one file per domain (`rag-pipeline.md`, and future
  `agentic-systems.md` etc.), short interview-ready talking points.

**1. Broad topic decks** — one deck per Tier 1-3 skills-map topic, survey-level breadth,
sourced from official docs, papers, YouTube talks/lectures, and general knowledge.

**2. Deep-dive domain pipelines** — one subfolder (under each of `decks/`, `notes/`,
`talk-tracks/`) per major technology domain, going deep through extended working sessions,
personally anchored to Paul's real project background (IBM/RxSense healthcare RAG, Energy
Transfer/FERC/PHMSA regulatory work, NFL data projects). `rag-pipeline` is the first and
current example — five layers (ingestion/parsing, chunking/metadata, indexing, retrieval,
generation+governance), each with tool surveys, benchmarks, and portfolio project plans.
This is the primary mode of ongoing work going forward — RAG is done through Layer 5;
agentic systems, evals-as-its-own-pipeline, and other domains get the same treatment over
time as sessions happen.

These coexist deliberately — broad decks for topics that don't need a multi-hour deep dive
yet or that support the deep dives; deep-dive subfolders for the domains Paul is actively
mastering for interviews and real project work.

---

## The Session Template

This is the core of how this repo grows. A working session with Claude:

1. **Use-case driven** — start from a real scenario (a client vertical, a project type),
   not an abstract topic. `learning/notes/rag-pipeline/portfolio-projects.md` and
   `learning/talk-tracks/rag-pipeline.md`'s per-use-case sections show the pattern:
   healthcare/PHI RAG, HR policy docs, oil & gas regulatory compliance, NFL stats, life
   sciences.
2. **Trade-off and technology comparison** — weigh real options against each other
   (frameworks, vector stores, chunking strategies), not just explain one path.
3. **POC testing where relevant** — actually run the tools being compared, don't just
   discuss them in the abstract.
4. **Deep Q&A drilling** — Paul asks follow-up questions on anything unclear until he can
   explain it cold, at both altitudes described below. This is the actual point of the
   session; the artifacts below are the record of it, not the goal itself.

**Three deliverables at the end of every session:**

1. **Talk tracks** — appended to `learning/talk-tracks/<domain>.md`, split into two
   explicit registers per entry (format below). Polished, quotable, ready to say out loud
   in an interview.
2. **Flashcards** — into `learning/decks/<domain>/`, same JSON schema already in use
   (`type`: Why/Recall/Application/Concept, `starred: true` for top-tier interview
   questions).
3. **Comprehensive reference notes** — into `learning/notes/<domain>/`, a "read repeatedly
   until you can narrate it without notes" document, gym/commute-readable. Matches the tone
   of `learning/notes/rag-pipeline/04-retrieval.md`: a full mental model of the domain, not
   just isolated facts.

### Talk-track format (going forward)

```markdown
### On [topic]
**Director framing:** [strategic/business/team/roadmap-oriented answer — what a Director
or Head of AI would lead with]
**Principal/Staff framing:** [deep technical mechanism/tradeoff-oriented answer — what a
Principal or Staff Engineer would lead with]
```

Existing Session 1 talk tracks (the RAG pipeline's) predate this convention and read as one
unified voice — leave them as-is unless Paul asks for a retrofit. All new talk-track
entries use the two-register split.

---

## Living Trackers — Keep These Current, Don't Let Them Go Stale

- **`learning/QUEUE.md`** — pending work: videos not yet processed, research tasks queued,
  processing-order priorities. Update as items move or complete; don't re-derive state from
  memory each session.
- **`learning/WATCH_GUIDE.md`** — for any video-sourced material, an evidence-based verdict
  (read notes only / has one worth-watching segment / genuinely hands-on) checked against
  real transcript visual-cue density, not guessed. Extend this discipline to any new video
  processed.
- **`learning/glossary.md`** — running term → definition reference, grows as new domains
  get covered.

---

## Content Conventions

- **Video-sourced material**: narrative/case-study/workshop videos get notes + verified
  clip-timestamp links to the highest-value moments (real YouTube `&t=Ns` links, confirmed
  against the actual transcript entry, never estimated) — no forced flashcards. Content
  that's crisply definitional even though video-sourced (a named algorithm, a formula, a
  bias taxonomy) still gets a card deck, since it isn't actually narrative.
- **Doc/reference-sourced material** (framework docs, papers, vendor comparisons): primary
  source for flashcards going forward.
- **Starred cards** (`"starred": true`): the highest-yield, most interview-realistic
  questions — mostly Why/Application-type, not pure recall.
- **Sources are always cited** per deck/notes file, with real URLs — never fabricate a
  source or a timestamp.
- **Personal project anchors** (marked like `*[Personal: ...]*` in talk-track files) tie a
  concept to Paul's actual work history — preserve and extend this pattern, it's what
  makes a talk track sound like real experience instead of a memorized definition.

---

## Environment

Paul uses macOS, Brave browser, VSCode. This repo is pure markdown/JSON — no Python
environment needed here (that lives in `youtube-research-pipeline/`).

---

## What NOT to Do

- Do not write files into `second_brain/` from this repo's sessions — that vault only
  receives Paul's manually curated final selections.
- Do not consolidate or delete the broad topic-deck system in favor of deep-dive folders —
  they coexist by design (confirmed decision, 2026-07).
- Do not retrofit existing talk-track entries into the Director/Staff split automatically —
  only new entries use it unless Paul explicitly asks for a retrofit pass.
- Do not add complexity Paul hasn't asked for. Extend one domain/session at a time.
