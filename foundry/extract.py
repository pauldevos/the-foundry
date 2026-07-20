"""
extract.py — Use Claude to pull speakers, quotes, key points, problems/solutions,
and quality rating from a transcript.
"""

import json
import anthropic

client = anthropic.Anthropic()

# Safety ceiling only — normal videos (even 2-3hr podcasts) come in well under this.
# Guards against pathological inputs (e.g. a 10hr+ lecture) blowing the context window.
MAX_TRANSCRIPT_CHARS = 500_000

EXTRACTION_PROMPT = """You are analyzing a YouTube video transcript for a knowledge system called The Foundry.

Extract the following with care and precision:

1. SPEAKERS — Identify everyone who speaks (hosts, guests, interviewees). For each:
   name, their role/title, and the company or organization they're affiliated with.
   Infer from context (introductions, bios mentioned, company names dropped) if not stated
   outright; use "unknown" for anything you can't determine.

2. QUOTES — The most notable, quotable statements in the video. This is the highest-priority
   extraction — be generous and thorough. Capture ALL of:
   - Memorable things a speaker says in their own words (verbatim if possible)
   - Quotes a speaker attributes to a named third party (something someone else said or wrote —
     speakers often reference other people by name; capture those quotes too, not just the
     speakers' own words)
   For each: the quote text, who said it (match to a name in SPEAKERS if it's one of them,
   otherwise the named third party), and brief context — why it matters or what point it supports.

3. KEY POINTS — 7-10 specific, actionable, or insight-dense ideas. Be specific. Avoid vague
   summaries. Write these as standalone sentences someone could act on or remember.

4. PROBLEMS & SOLUTIONS — Concrete problem/solution pairs discussed: the specific problem,
   and how it was solved or proposed to be solved.

5. SUMMARY — 2-3 sentences. What is this video actually about? Who should watch it?

6. QUALITY RATING — Rate 1-5 stars based on:
    - Depth of insight (surface-level recap = low, novel frameworks = high)
    - Originality of ideas
    - Quality of sources and citations
    - Practical value
    Provide a one-sentence reason for the rating.

7. TOPICS — List 3-6 topic tags (e.g. "LLM architecture", "sleep science", "stoicism")

Return ONLY valid JSON, no markdown fences, with this exact structure:
{
  "speakers": [
    {"name": "...", "role": "...", "affiliation": "..."}
  ],
  "quotes": [
    {"quote": "...", "attributed_to": "...", "context": "..."}
  ],
  "key_points": ["...", "..."],
  "problems_and_solutions": [
    {"problem": "...", "solution": "..."}
  ],
  "summary": "...",
  "quality_rating": 4,
  "quality_reasoning": "...",
  "topics": ["...", "..."]
}

TRANSCRIPT:
{transcript}
"""


def extract_content(transcript_text: str) -> dict:
    """
    Send transcript to Claude and extract structured knowledge artifacts.
    """
    truncated = transcript_text[:MAX_TRANSCRIPT_CHARS]
    if len(transcript_text) > MAX_TRANSCRIPT_CHARS:
        truncated += "\n\n[TRANSCRIPT TRUNCATED — original was longer]"

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=8192,
        messages=[
            {
                "role": "user",
                "content": EXTRACTION_PROMPT.replace("{transcript}", truncated),
            }
        ],
    )

    raw = message.content[0].text.strip()

    # Strip accidental markdown fences if Claude adds them
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.rsplit("```", 1)[0]

    return json.loads(raw.strip())
