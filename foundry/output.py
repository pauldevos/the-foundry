"""
output.py — Write processed content to a markdown artifact in output/youtube/

After reading an artifact and deciding it's worth keeping:
  1. Move corpus/<video_id>.json → corpus/read/<video_id>.json
  2. Copy the relevant sections into second_brain manually (or via a future script)
"""

import os
import re
from datetime import datetime


STAR_FULL = "⭐"
STAR_EMPTY = "☆"

VERDICT_EMOJI = {
    "SKIP": "🔴",
    "SKIM": "🟡",
    "WORTH READING": "🟢",
    "HIGH PRIORITY": "🔥",
}


def slugify(text: str, max_length: int = 60) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return slug[:max_length].rstrip("-")


def generate_artifact(
    url: str,
    video_id: str,
    title: str,
    extraction: dict,
    novelty: dict,
    discovered: list,
    output_dir: str = "output/youtube",
) -> str:
    """
    Write a single markdown file with all extracted knowledge from the video.
    Returns the file path.
    """
    os.makedirs(output_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M")
    slug = slugify(title) or video_id
    filename = f"{timestamp}_{slug}.md"
    filepath = os.path.join(output_dir, filename)
    suffix = 2
    while os.path.exists(filepath):
        filename = f"{timestamp}_{slug}-{suffix}.md"
        filepath = os.path.join(output_dir, filename)
        suffix += 1

    rating = extraction.get("quality_rating", 0)
    stars = STAR_FULL * rating + STAR_EMPTY * (5 - rating)

    novelty_score = novelty.get("novelty_score", "?")
    verdict = novelty.get("verdict", "UNKNOWN")
    verdict_emoji = VERDICT_EMOJI.get(verdict, "❓")

    topics = extraction.get("topics", [])
    topics_str = " · ".join(f"`{t}`" for t in topics) if topics else "—"

    lines = [
        f"# {title}",
        f"**Source:** {url}",
        f"**Processed:** {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f"**Topics:** {topics_str}",
        "",
        "---",
        "",
        f"## {stars}  Quality {rating}/5   ·   {verdict_emoji} {novelty_score}% Novel   ·   {verdict}",
        "",
        f"*{extraction.get('quality_reasoning', '')}*",
        "",
        "---",
        "",
        "## Summary",
        "",
        extraction.get("summary", ""),
        "",
        "---",
        "",
        "## Speakers",
        "",
    ]

    speakers = extraction.get("speakers", [])
    if speakers:
        for s in speakers:
            name = s.get("name", "Unknown")
            role = s.get("role", "")
            affiliation = s.get("affiliation", "")
            detail = " — ".join(p for p in [role, affiliation] if p)
            lines.append(f"- **{name}**" + (f" ({detail})" if detail else ""))
    else:
        lines.append("*No speakers identified.*")

    lines += ["", "---", "", "## Quotes & Attributions", ""]

    quotes = extraction.get("quotes", [])
    if quotes:
        for q in quotes:
            quote_text = q.get("quote", "")
            attributed = q.get("attributed_to", "Unknown")
            context = q.get("context", "")
            lines += [
                f"> \"{quote_text}\"",
                f">",
                f"> — **{attributed}**",
                f"> *{context}*" if context else "",
                "",
            ]
    else:
        lines.append("*No quotes found in this transcript.*")

    lines += ["", "---", "", "## Key Points", ""]
    for i, point in enumerate(extraction.get("key_points", []), 1):
        lines.append(f"{i}. {point}")

    problems = extraction.get("problems_and_solutions", [])
    if problems:
        lines += ["", "---", "", "## Problems & Solutions", ""]
        for p in problems:
            lines.append(f"- **Problem:** {p.get('problem', '')}")
            lines.append(f"  **Solution:** {p.get('solution', '')}")

    # Novelty analysis
    overlap = novelty.get("overlap_notes", "")
    new_angles = novelty.get("new_angles", [])

    lines += ["", "---", "", "## Novelty Analysis", ""]
    if overlap:
        lines += [f"**Overlap with existing corpus:** {overlap}", ""]
    if new_angles:
        lines.append("**What's genuinely new:**")
        for angle in new_angles:
            lines.append(f"- {angle}")

    # Recommended videos
    if discovered:
        lines += ["", "---", "", "## Recommended — Watch Next", ""]
        for v in discovered:
            lines.append(f"- [{v['title']}]({v['url']}) — *{v['channel']}*")

    lines += [
        "",
        "---",
        "",
        "## Actions",
        "",
        "- [ ] Read this artifact",
        "- [ ] Worth keeping? → move `corpus/" + video_id + ".json` to `corpus/read/`",
        "- [ ] Best quotes → add to second_brain",
        "- [ ] Best key points → add to second_brain concept note",
    ]

    with open(filepath, "w") as f:
        f.write("\n".join(lines))

    return filepath
