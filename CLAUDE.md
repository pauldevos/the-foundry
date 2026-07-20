# The Foundry — Claude Session Guide

## What This Is

The Foundry is a content intelligence pipeline built for Paul (Principal Architect, AI/ML focus, McKinney TX).
It ingests YouTube videos (and eventually: blogs, papers, books, podcasts) and outputs structured
knowledge artifacts: quotes with attribution, key points, novelty scores, and similar video recommendations.

**The two-repo system:**
- `the-foundry/` ← YOU ARE HERE. This is the pipeline. Raw content goes in, refined artifacts come out.
- `second_brain/` ← Paul's Obsidian vault. Only curated, approved content lands there. Do not mix these.

---

## Repo Structure

```
the-foundry/
├── CLAUDE.md              ← this file
├── process.py             ← CLI entry point: python process.py <youtube_url>
├── foundry/
│   ├── transcript.py      ← pulls transcript + title via youtube-transcript-api / oEmbed
│   ├── extract.py         ← Claude extracts speakers, quotes, key points, problems/solutions
│   ├── score.py           ← novelty scoring vs corpus/
│   ├── discover.py        ← YouTube Data API v3 — finds similar videos
│   ├── output.py          ← writes markdown artifact to output/youtube/
│   └── scorecard.py       ← maintains output/scorecard.md, a ranked index of every processed video
├── transcripts/           ← one JSON per processed video (full text + timestamped entries)
├── corpus/                ← one JSON per processed video (summary + key points for comparison)
│   └── read/              ← move a JSON here once Paul has READ and kept the artifact
├── output/
│   ├── scorecard.md       ← ranked index of every video: novelty, quality, links to artifact + transcript
│   ├── scorecard_data.json ← backing data for scorecard.md — don't edit by hand, regenerated each run
│   └── youtube/           ← generated markdown artifacts — this is Paul's reading inbox
├── inputs/                ← drop batch URL lists here (future feature)
├── requirements.txt
├── .env.example
└── .gitignore
```

---

## Architecture — Pipeline Flow

`process.py:process_video()` is the sole orchestrator. It runs eight steps in sequence, threading
data structures from one module to the next:

1. **`transcript.get_transcript(url)`** → `{video_id, title, url, text, entries, char_count}`.
   Extracts the video ID via regex (handles `v=`, `youtu.be/`, `embed/`, `shorts/` URL forms),
   fetches the title via YouTube's public oEmbed endpoint (no API key needed, falls back to the
   video ID on failure), then pulls the transcript via `youtube-transcript-api`'s instance-based
   `.fetch()` API (v1.x — not the old static `get_transcript()`).
2. **`transcript.save_transcript(transcript)`** → writes `transcripts/<video_id>.json` (full text +
   timestamped caption entries), for future search/algorithms over the raw corpus.
3. **`extract.extract_content(text)`** → `{speakers[], quotes[], key_points[], problems_and_solutions[], summary, quality_rating, quality_reasoning, topics[]}`.
   One Claude call (`claude-opus-4-5`). No truncation in practice — capped at 500,000 chars as a
   safety ceiling only, far above what a normal video transcript reaches. Quotes capture both a
   speaker's own words and any named third party they reference. Prompt substitution uses
   `.replace("{transcript}", ...)`, not `.format()` — the prompt's JSON example contains literal
   braces that break `str.format()`.
4. **`score.score_novelty(summary, key_points)`** → `{novelty_score, verdict, overlap_notes, new_angles[]}`.
   Loads every `corpus/*.json` and `corpus/read/*.json` (capped at the most recent 30, entries
   tagged `(READ)` vs `(processed)`) and asks Claude to rate novelty against them. An empty corpus
   short-circuits to 100% / `HIGH PRIORITY` without a Claude call. This is the only novelty
   mechanism — there's no per-video "is this novel" judgment in `extract.py`, since that can't mean
   anything without a reference corpus to compare against.
5. **`discover.discover_similar_videos(topics, key_points, exclude_video_ids)`** → `list[dict]`.
   Requires `YOUTUBE_API_KEY`; raises `EnvironmentError` if missing. Runs up to two YouTube
   searches (topics joined, then the first key point) and dedupes by video ID. `process.py` catches
   both `EnvironmentError` and generic failures here so a discovery problem never aborts the run —
   it just prints a warning and continues with an empty list.
6. **`output.generate_artifact(...)`** → writes `output/youtube/YYYY-MM-DD_HHMM_<title-slug>.md`
   (title slugified via `output.slugify()`, collision-suffixed if a file already exists for that
   minute), assembling every prior step's output into the final markdown artifact.
7. **`score.save_to_corpus(video_id, extraction)`** → writes `corpus/<video_id>.json` (summary,
   key points, topics, quality rating only — not the full extraction).
8. **`scorecard.update_scorecard(...)`** → upserts this video's row (keyed by `video_id`) into
   `output/scorecard_data.json`, then re-renders `output/scorecard.md` sorted by novelty score,
   descending. Title text has `|` escaped as `\|` before insertion — many YouTube video titles
   contain a literal pipe (e.g. `"... | Guest Name"`), which otherwise breaks the markdown table.

The `extraction` dict from step 3 is the central structure: it flows unchanged into steps 4, 5, 6, and 7.

**Claude call convention:** both `extract.py` and `score.py` prompt Claude for raw JSON and then
strip accidental ```` ``` ```` / ```` ```json ```` fences before `json.loads`. Follow this same
stripping pattern in any new module that adds a Claude call, for consistency.

---

## Setup (First Time)

```bash
cd ~/github/the-foundry
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env — add ANTHROPIC_API_KEY and optionally YOUTUBE_API_KEY
```

**ANTHROPIC_API_KEY** — required. Get at console.anthropic.com.
**YOUTUBE_API_KEY** — optional but recommended. Enables the "discover similar videos" feature.
Get free at: Google Cloud Console → APIs & Services → YouTube Data API v3. Free tier: 10,000 units/day.

---

## Usage

```bash
# Activate venv first
source .venv/bin/activate

# Process a single video
python process.py "https://www.youtube.com/watch?v=..."

# Skip video discovery (faster, no YouTube API key needed)
python process.py "https://www.youtube.com/watch?v=..." --no-discover

# Custom output directory
python process.py "https://www.youtube.com/watch?v=..." --output-dir ~/Desktop/foundry-output
```

---

## What the Pipeline Produces

Each run outputs a single markdown file in `output/youtube/` named `YYYY-MM-DD_HHMM_<title-slug>.md` containing:

1. **Quality rating** (1–5 stars) with one-sentence reasoning
2. **Novelty score** (0–100%) + verdict: SKIP / SKIM / WORTH READING / HIGH PRIORITY
3. **Summary** — 2-3 sentences
4. **Speakers** — name, role, and affiliation for each person speaking
5. **Quotes** — a speaker's own memorable words, plus any named third party they reference (e.g., "Winston Churchill said X in this talk")
6. **Key points** — 7-10 specific, actionable insights
7. **Problems & solutions** — concrete problem/solution pairs discussed
8. **Novelty analysis** — what overlaps with the corpus, what's genuinely new
9. **Recommended videos** — 5-8 similar videos from YouTube (only when discovery runs)

---

## The Corpus — How Novelty Scoring Works

Every processed video gets a small JSON saved to `corpus/<video_id>.json` containing its summary and key points.
When scoring future videos, the pipeline loads these and asks Claude how much of the new content is already covered.

**The feedback loop:**
- After Paul reads an artifact and decides it's worth keeping → move `corpus/<video_id>.json` to `corpus/read/`
- The `read/` subfolder tells the scorer "Paul has internalized this" — making future novelty scores more accurate
- If Paul skips an artifact (not worth keeping) → leave the corpus JSON where it is (still useful for comparison)

Over time the corpus becomes a model of what Paul knows. Scores get more useful as it grows.

---

## Paul's Priority Domains

Interest areas for content discovery and ingestion:

1. AI Architecture & LLMs — model internals, LLMOps, evals, agents, governance, prompt engineering, retrieval-augmented generation, vector databases
2. Claude & AI Tools — MCP, enterprise deployment, Claude features
3. Texas Family Law — 50/50 custody, Child Support rights, income shares, politicians that support 50-50 custody and no child support payments, SB 849 (equal parenting presumption, effective Sept 2025)
4.  Health Optimization — peptides, athletic performance, anti-aging, hormone optimization, longevity, blood panels (diagnostics, biomarkers, labs)
5. Investing & Wealth Building — Stocks, Crypto, DFW real estate, Small Businesses, Networking asymmetric bets
6. Document AI: OCR, document understanding,layout aware extraction, complex document processing, document summarization, document classification, document extraction, document search, document retrieval, document question answering


---

## Planned Extensions (Not Built Yet)

These are queued for future sessions — do not build unless Paul asks:

- **Batch processing** — `process_batch.py <file_with_urls>` to process a list of URLs overnight
- **Blog/article ingestion** — `process_url.py` using web scraping for non-YouTube URLs
- **PDF/paper ingestion** — `process_pdf.py` for AI research papers
- **Channel scanner** — given a YouTube channel URL, find the top N most relevant videos
- **Seed channels** — Paul provides 5-10 "gold standard" channels; pipeline finds similar channels
- **Weekly digest** — aggregates the week's artifacts into a single ranked reading list
- **Export to second_brain** — script to move approved artifacts into the Obsidian vault

---

## Key Decisions Made

- **Two repos, clean separation**: `the-foundry` (pipeline) vs `second_brain` (vault). Never mix.
- **Corpus is append-only**: old corpus entries are never deleted, only moved to `corpus/read/`.
- **Claude model**: `claude-opus-4-5` for extraction and scoring (best comprehension of nuance).
- **Transcript limit**: 60,000 chars (~90 min video). Longer videos get truncated with a notice.
- **No embeddings**: novelty scoring uses Claude text comparison, not vector similarity. Simpler, good enough.
- **Discovery uses YouTube Data API v3**: free, 10K units/day. Each search costs ~100 units. ~100 videos/day free.

---

## Environment

Paul uses:
- macOS, Brave browser, VSCode
- Python via venv (`.venv/` in repo root)
- Anthropic API key (separate from Claude Pro subscription)
- `.env` file in repo root for secrets

---

## What NOT to Do

- Do not write files into `second_brain/` from this session. Foundry outputs go to `output/` only.
- Do not install packages globally — always use the `.venv`
- Do not commit `.env`, `corpus/`, or `output/` to git (`.gitignore` handles this)
- Do not add complexity Paul hasn't asked for. Extend one thing at a time.
