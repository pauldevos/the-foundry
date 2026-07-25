# The Foundry — Claude Session Guide

## What This Is

Paul's interview-prep knowledge base for AI Director / Head of AI and Principal/Staff AI
Engineer roles. Built through live, extended (2-4hr) working sessions with Claude — deep
Socratic Q&A over real use cases, trade-off analysis across competing technologies
(LangGraph vs. LlamaIndex, Chroma vs. Qdrant vs. Weaviate), and hands-on POC testing — not
a passive reading pipeline.

This repo has pivoted twice. It started as a YouTube video-processing pipeline (now a
separate repo, see below). It then grew a knowledge base under `learning/`. It now *also*
contains the Next.js app that Paul actually reads/reviews that knowledge base through —
folded in here specifically so there is no second repo to clone or sync (see "The Study
App" below for why).

**The three-repo system:**
- `the-foundry/` ← YOU ARE HERE. Paul's interview-prep knowledge base, *and* the app he
  consumes it through.
- `youtube-research-pipeline/` ← pulls and scores YouTube video transcripts. Its future
  recommender reads this repo's `learning/` corpus to judge whether a candidate video
  reinforces what Paul already knows or teaches something new. Clone as a sibling
  directory (`~/github/youtube-research-pipeline`) — some note-writing workflows read
  saved transcripts from there by relative path.
- `second_brain/` ← Paul's Obsidian vault. Only curated, approved content lands there.
  Never mix any of these three.

---

## The Study App

`src/`, `proxy.ts`, `supabase/` — a private, passcode-gated Next.js app for reviewing this
repo's content: spaced-repetition flashcards (real SM-2 scheduling, persisted, works on
iPhone + desktop), plus a proper reading/search experience for notes and talk tracks. Built
because plain markdown/JSON, viewed via VSCode or GitHub mobile, wasn't usable: `.json`
card decks aren't human-readable, and wide markdown tables render as crushed, unreadable
columns on an iPhone.

**Content flow — the core design decision, don't violate it**: there is no sync step and
no second copy of content anywhere. `src/lib/content.ts` reads `learning/{decks,notes,
talk-tracks}/` live from the filesystem on every request — the moment new content is
pushed and Vercel redeploys, it's live in the app, with zero manual action from Paul. (This
replaced an earlier two-repo design with a `npm run sync` step; Paul rejected that
explicitly — "I'm not going to manage anything like that" — so don't reintroduce a sync
script or a second content repo.)

Postgres (`supabase/schema.sql`) holds only what has no file equivalent: SM-2 review state
(`card_state`), and in-app edit/delete overrides (`*_state.local_override`,
`*_state.is_deleted`) layered on top of live file content. Every state row is keyed by a
stable string derived from the content's file path (`sourcePath` for notes,
`sourcePath#index` for cards and talk-track sections — see `keyFor*`-style logic in
`src/lib/content.ts`), not a DB-generated id, so a card with no Postgres row yet is still
fully reviewable with default state — nothing has to "create" it first. Mutations never
touch file content directly; they always write to `local_override`/`is_deleted` in
Postgres, read back via `override ?? live_file_value` everywhere (`src/lib/state.ts`).

**Review/SRS state** (`ease_factor`, `interval_days`, `next_due_at`, `repetitions` in
`card_state`, plus `review_log`) is the one thing that's DB-only, no file equivalent,
standard SM-2 (`src/lib/srs.ts`). Grading maps from the 3-option UI: Recalled → quality 4,
Missed → quality 1. "Not useful" bypasses SRS entirely and just sets `is_deleted = true` —
it's a removal, not a grade.

**Auth**: single shared passcode (`APP_PASSCODE` env var), no user accounts. `proxy.ts`
(Next 16 renamed Middleware → Proxy — don't call it `middleware.ts`, that file naming no
longer works) does an *optimistic* cookie check and redirects to `/login`. It is NOT the
real security boundary — every route handler that touches state also calls
`requireAuthOr401()` (`src/lib/require-auth.ts`) directly, per Next's own auth guidance.

**Cross-linking**: every deck/note/talk-track carries a `topicSlug`, derived from its file
path relative to its content-type root. `decks/rag-pipeline/04-retrieval.json` and
`notes/rag-pipeline/04-retrieval.md` both slug to `rag-pipeline-04-retrieval` and show up as
"related" on each other's pages (`src/lib/related-content.ts`). Known limitation:
`talk-tracks/rag-pipeline.md` is one file covering all five layers, so it only slugs to the
coarser `rag-pipeline` — talk-track cross-linking is domain-level, not layer-level, until
that file gets split to match.

**Search**: `src/app/api/search/route.ts` does a plain in-memory substring scan over live
file content on every request — no search index, no Postgres FTS. Content volume (a few
hundred cards, a few dozen docs) doesn't need one; don't add one preemptively.

**Responsive tables**: `src/components/markdown-content.tsx`'s custom table renderer walks
the mdast node directly (not the rendered React children — inline formatting inside cells
makes text-extraction from React nodes unreliable) and renders twice: a normal scrollable
`<table>` on `md:` and up, a stacked label/value card per row below that. This is the
direct fix for a real crushed-table screenshot that motivated this app — don't regress it
by swapping in a plain `<table>` somewhere else.

### Next.js 16 — real breaking changes from what you might expect

This scaffold ships its own docs at `node_modules/next/dist/docs/` and explicitly warns
they differ from training data. Two that bit during the build, worth knowing before writing
more routes:
- **Middleware is now Proxy.** File is `proxy.ts` at repo root, function is `export default
  async function proxy(req)`, not `middleware.ts`/`middleware()`.
- **Dynamic route params are async** and typed via global helpers generated at build/dev
  time — `RouteContext<'/api/cards/[id]'>` in route handlers, `PageProps<'/notes/[id]'>` in
  pages. Always `await ctx.params` / `await params`. Run `npx next typegen` (or `next dev`/
  `next build`) before `tsc --noEmit` standalone, or these types won't exist yet and `tsc`
  will fail with `Cannot find name 'RouteContext'` — that's a generation-order issue, not a
  real error.

### App setup (first time)

```bash
npm install
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SESSION_SECRET (openssl rand -base64 32), APP_PASSCODE
```

Run `supabase/schema.sql` against your Supabase project (SQL Editor, or `psql`) once. Then
`npm run dev` (http://localhost:3000). Deploy: push to GitHub, import into Vercel, set the
same env vars there — every push redeploys and picks up any `learning/` changes
automatically, no extra step.

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

Paul uses macOS, Brave browser, VSCode. `learning/` content is pure markdown/JSON (no
Python needed — that's `youtube-research-pipeline/`). The app under `src/` is Node/Next.js
(`npm install`, no venv).

---

## What NOT to Do

- Do not write files into `second_brain/` from this repo's sessions — that vault only
  receives Paul's manually curated final selections.
- Do not consolidate or delete the broad topic-deck system in favor of deep-dive folders —
  they coexist by design (confirmed decision, 2026-07).
- Do not retrofit existing talk-track entries into the Director/Staff split automatically —
  only new entries use it unless Paul explicitly asks for a retrofit pass.
- Do not add complexity Paul hasn't asked for. Extend one domain/session at a time.
- Do not reintroduce a sync script or split the app back into a second repo — Paul
  explicitly rejected managing a clone/sync step; same-repo, live-file-read is the
  confirmed architecture.
- Do not add user accounts/OAuth to the app — passcode gate is the confirmed, deliberate
  choice.
- Do not make content edits in the app write back to files in `learning/` — mutations stay
  in Postgres (`local_override`/`is_deleted`) so the app never commits to git on its own.
- Do not build the "more of this" (live Claude API content generation) feature without
  discussing scope first — it's a real Phase 2, documented as deliberately deferred, not
  forgotten.
- Do not regress the responsive-table fix in `markdown-content.tsx` — it's the concrete
  problem the app exists to solve.
