"""
score.py — Score novelty of new content vs the existing corpus of processed videos.

The corpus/ directory holds one JSON file per processed video. Each file contains
the video's summary and key points. When scoring a new video, we load the corpus
and ask Claude how much of the new content is genuinely new vs already covered.

Once you've READ an artifact and decided it was worth keeping, move the corresponding
corpus JSON into corpus/read/ — this signals to the scorer that you've internalized
that content, making future novelty scores more accurate.
"""

import json
import os
import anthropic

client = anthropic.Anthropic()

NOVELTY_PROMPT = """You are comparing a new piece of content against a knowledge corpus.

Your job: rate how NOVEL the new content is, from 0–100%.

Scoring guide:
  0–20%  = Almost entirely covered by the corpus. Skip it.
  21–50% = Some familiar ground, a few new angles. Skim it.
  51–80% = Meaningfully new ideas with some overlap. Worth reading.
  81–100% = Largely new territory. High priority.

NEW CONTENT:
Summary: {new_summary}
Key points:
{new_key_points}

EXISTING CORPUS (what the user already knows):
{corpus_text}

Return ONLY valid JSON:
{{
  "novelty_score": 74,
  "verdict": "WORTH READING",
  "overlap_notes": "...",
  "new_angles": ["...", "..."]
}}

verdict must be one of: SKIP | SKIM | WORTH READING | HIGH PRIORITY
"""


def load_corpus(corpus_dir: str = "corpus", exclude_video_id: str = None) -> list[str]:
    """Load all processed content summaries from corpus/ and corpus/read/, optionally
    excluding one video (e.g. so a video isn't compared against itself when rescoring)."""
    summaries = []

    for subdir in [corpus_dir, os.path.join(corpus_dir, "read")]:
        if not os.path.exists(subdir):
            continue
        for filename in sorted(os.listdir(subdir)):
            if not filename.endswith(".json"):
                continue
            if exclude_video_id and filename == f"{exclude_video_id}.json":
                continue
            filepath = os.path.join(subdir, filename)
            try:
                with open(filepath) as f:
                    data = json.load(f)
                label = "(READ)" if "read" in subdir else "(processed)"
                summary = data.get("summary", "")
                points = data.get("key_points", [])
                summaries.append(
                    f"[{filename} {label}]\nSummary: {summary}\nPoints: {'; '.join(points[:5])}"
                )
            except Exception:
                continue

    return summaries


def score_novelty(
    new_summary: str,
    new_key_points: list,
    corpus_dir: str = "corpus",
    exclude_video_id: str = None,
) -> dict:
    """
    Score how novel the new content is vs the existing corpus.
    Returns dict with novelty_score, verdict, overlap_notes, new_angles.
    """
    corpus_summaries = load_corpus(corpus_dir, exclude_video_id=exclude_video_id)

    if not corpus_summaries:
        return {
            "novelty_score": 100,
            "verdict": "HIGH PRIORITY",
            "overlap_notes": "Corpus is empty — all content is new by default.",
            "new_angles": ["No existing corpus to compare against"],
        }

    # Safety ceiling only — current corpus sizes are nowhere near this many entries.
    corpus_text = "\n\n".join(corpus_summaries[-300:])

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": NOVELTY_PROMPT.format(
                    new_summary=new_summary,
                    new_key_points="\n".join(f"- {p}" for p in new_key_points),
                    corpus_text=corpus_text,
                ),
            }
        ],
    )

    raw = message.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.rsplit("```", 1)[0]

    return json.loads(raw.strip())


def save_to_corpus(video_id: str, extraction: dict, corpus_dir: str = "corpus") -> str:
    """Save a processed video's summary to corpus/ for future novelty comparisons."""
    os.makedirs(corpus_dir, exist_ok=True)
    data = {
        "video_id": video_id,
        "summary": extraction.get("summary", ""),
        "key_points": extraction.get("key_points", []),
        "topics": extraction.get("topics", []),
        "quality_rating": extraction.get("quality_rating", 0),
    }
    filepath = os.path.join(corpus_dir, f"{video_id}.json")
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)
    return filepath
