"""
transcript.py — Pull transcripts from YouTube URLs
"""

import json
import os
import re
import urllib.parse
import urllib.request
from youtube_transcript_api import YouTubeTranscriptApi


def extract_video_id(url: str) -> str:
    patterns = [
        r'(?:v=)([a-zA-Z0-9_-]{11})',
        r'(?:youtu\.be/)([a-zA-Z0-9_-]{11})',
        r'(?:embed/)([a-zA-Z0-9_-]{11})',
        r'(?:shorts/)([a-zA-Z0-9_-]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise ValueError(f"Could not extract video ID from: {url}")


def get_video_title(video_id: str) -> str:
    """
    Fetch the video title via YouTube's public oEmbed endpoint — no API key needed.
    Falls back to the video ID if the request fails (private/deleted video, network issue).
    """
    oembed_url = "https://www.youtube.com/oembed?" + urllib.parse.urlencode(
        {"url": f"https://www.youtube.com/watch?v={video_id}", "format": "json"}
    )
    try:
        with urllib.request.urlopen(oembed_url, timeout=10) as response:
            return json.loads(response.read().decode()).get("title", video_id)
    except Exception:
        return video_id


def get_transcript(url: str) -> dict:
    """
    Pull the full transcript for a YouTube URL.
    Returns dict with video_id, title, text (full joined), and raw entries.
    """
    video_id = extract_video_id(url)
    title = get_video_title(video_id)

    fetched = YouTubeTranscriptApi().fetch(video_id)
    entries = fetched.to_raw_data()
    full_text = " ".join(entry["text"] for entry in entries)

    return {
        "video_id": video_id,
        "title": title,
        "url": url,
        "text": full_text,
        "entries": entries,
        "char_count": len(full_text),
    }


def save_transcript(transcript: dict, transcripts_dir: str = "transcripts") -> str:
    """Save the full transcript (text + timestamped entries) to transcripts/<video_id>.json."""
    os.makedirs(transcripts_dir, exist_ok=True)
    filepath = os.path.join(transcripts_dir, f"{transcript['video_id']}.json")
    with open(filepath, "w") as f:
        json.dump(transcript, f, indent=2)
    return filepath
