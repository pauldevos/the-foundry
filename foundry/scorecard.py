"""
scorecard.py — Maintain a running markdown index of every processed video,
ranked by novelty, linking to each video's output artifact and saved transcript.
"""

import json
import os

DATA_PATH = "output/scorecard_data.json"
SCORECARD_PATH = "output/scorecard.md"

STAR_FULL = "⭐"
STAR_EMPTY = "☆"

VERDICT_EMOJI = {
    "SKIP": "🔴",
    "SKIM": "🟡",
    "WORTH READING": "🟢",
    "HIGH PRIORITY": "🔥",
}


def _load(data_path: str) -> list:
    if not os.path.exists(data_path):
        return []
    with open(data_path) as f:
        return json.load(f)


def _save(entries: list, data_path: str) -> None:
    os.makedirs(os.path.dirname(data_path) or ".", exist_ok=True)
    with open(data_path, "w") as f:
        json.dump(entries, f, indent=2)


def _render(entries: list, scorecard_path: str) -> None:
    scorecard_dir = os.path.dirname(scorecard_path) or "."
    ranked = sorted(entries, key=lambda e: e["novelty_score"], reverse=True)

    lines = [
        "# Foundry Scorecard",
        "",
        "Every processed video, ranked by novelty. Regenerated automatically on each run — do not edit by hand.",
        "",
        "| Novelty | Verdict | Quality | Title | Transcript | Processed |",
        "|---|---|---|---|---|---|",
    ]
    for e in ranked:
        stars = STAR_FULL * e["quality_rating"] + STAR_EMPTY * (5 - e["quality_rating"])
        emoji = VERDICT_EMOJI.get(e["verdict"], "❓")
        artifact_rel = os.path.relpath(e["artifact_path"], scorecard_dir)
        transcript_rel = os.path.relpath(e["transcript_path"], scorecard_dir)
        title = e["title"].replace("|", "\\|")
        lines.append(
            f"| {emoji} {e['novelty_score']}% | {e['verdict']} | {stars} "
            f"| [{title}]({artifact_rel}) | [transcript]({transcript_rel}) | {e['processed_at']} |"
        )

    with open(scorecard_path, "w") as f:
        f.write("\n".join(lines) + "\n")


def update_scorecard(
    video_id: str,
    title: str,
    url: str,
    artifact_path: str,
    transcript_path: str,
    quality_rating: int,
    novelty_score: int,
    verdict: str,
    processed_at: str,
    data_path: str = DATA_PATH,
    scorecard_path: str = SCORECARD_PATH,
) -> str:
    """Upsert this video's row (by video_id) and re-render the scorecard. Returns the scorecard path."""
    entries = [e for e in _load(data_path) if e["video_id"] != video_id]
    entries.append(
        {
            "video_id": video_id,
            "title": title,
            "url": url,
            "artifact_path": artifact_path,
            "transcript_path": transcript_path,
            "quality_rating": quality_rating,
            "novelty_score": novelty_score,
            "verdict": verdict,
            "processed_at": processed_at,
        }
    )
    _save(entries, data_path)
    _render(entries, scorecard_path)
    return scorecard_path
