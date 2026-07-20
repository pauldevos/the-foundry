#!/usr/bin/env python3
"""
The Foundry — Content Processing Pipeline
=========================================
Usage:
    python process.py <youtube_url>
    python process.py <youtube_url> --no-discover
    python process.py <youtube_url> --output-dir /path/to/output

What it does:
  1. Pulls the YouTube transcript and saves it to transcripts/
  2. Extracts speakers, quotes, key points, problems/solutions, summary, quality rating
  3. Scores novelty vs your existing corpus
  4. Discovers 5-8 similar YouTube videos (requires YOUTUBE_API_KEY)
  5. Writes a single markdown artifact to output/youtube/
  6. Saves a corpus entry for future novelty comparisons
  7. Updates output/scorecard.md — a ranked index of every processed video
"""

import argparse
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

from foundry.transcript import get_transcript, save_transcript
from foundry.extract import extract_content
from foundry.score import score_novelty, save_to_corpus
from foundry.discover import discover_similar_videos
from foundry.output import generate_artifact
from foundry.scorecard import update_scorecard


def process_video(url: str, discover: bool = True, output_dir: str = "output/youtube") -> str:
    print(f"\n🔥 The Foundry\n{'─' * 40}")
    print(f"   {url}\n")

    # 1. Transcript
    print("📼  Pulling transcript...")
    transcript = get_transcript(url)
    video_id = transcript["video_id"]
    print(f"    ✓ {transcript['char_count']:,} chars  (video_id: {video_id})")
    transcript_path = save_transcript(transcript)
    print(f"    ✓ saved to {transcript_path}")

    # 2. Extract
    print("\n🧠  Extracting quotes, key points, summary...")
    extraction = extract_content(transcript["text"])
    print(f"    ✓ {len(extraction.get('quotes', []))} quotes")
    print(f"    ✓ {len(extraction.get('key_points', []))} key points")
    print(f"    ✓ Quality: {'⭐' * extraction.get('quality_rating', 0)} ({extraction.get('quality_rating', 0)}/5)")

    # 3. Novelty score
    print("\n📊  Scoring novelty vs corpus...")
    novelty = score_novelty(
        new_summary=extraction.get("summary", ""),
        new_key_points=extraction.get("key_points", []),
    )
    print(f"    ✓ {novelty['novelty_score']}% novel  →  {novelty['verdict']}")

    # 4. Discovery
    discovered = []
    if discover:
        print("\n🔍  Discovering similar videos...")
        try:
            discovered = discover_similar_videos(
                topics=extraction.get("topics", []),
                key_points=extraction.get("key_points", []),
                exclude_video_ids=[video_id],
            )
            print(f"    ✓ {len(discovered)} recommendations found")
        except EnvironmentError as e:
            print(f"    ⚠  Skipped: {e}")
        except Exception as e:
            print(f"    ⚠  Discovery failed: {e}")

    # 5. Write artifact
    print("\n📝  Writing artifact...")
    artifact_path = generate_artifact(
        url=url,
        video_id=video_id,
        title=transcript["title"],
        extraction=extraction,
        novelty=novelty,
        discovered=discovered,
        output_dir=output_dir,
    )
    print(f"    ✓ {artifact_path}")

    # 6. Save to corpus
    print("\n💾  Saving to corpus...")
    corpus_path = save_to_corpus(video_id, extraction)
    print(f"    ✓ {corpus_path}")

    # 7. Update scorecard
    print("\n📇  Updating scorecard...")
    scorecard_path = update_scorecard(
        video_id=video_id,
        title=transcript["title"],
        url=url,
        artifact_path=artifact_path,
        transcript_path=transcript_path,
        quality_rating=extraction.get("quality_rating", 0),
        novelty_score=novelty.get("novelty_score", 0),
        verdict=novelty.get("verdict", "UNKNOWN"),
        processed_at=datetime.now().strftime("%Y-%m-%d %H:%M"),
    )
    print(f"    ✓ {scorecard_path}")

    print(f"\n{'─' * 40}")
    print(f"✅  Done\n")
    print(f"Next: open {artifact_path} and read it.")
    print(f"If it's worth keeping, move corpus/{video_id}.json → corpus/read/\n")

    return artifact_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="The Foundry — process a YouTube video into a knowledge artifact"
    )
    parser.add_argument("url", help="YouTube URL to process")
    parser.add_argument(
        "--no-discover",
        action="store_true",
        help="Skip YouTube video discovery (faster, no API key needed)",
    )
    parser.add_argument(
        "--output-dir",
        default="output/youtube",
        help="Directory to write artifacts to (default: output/youtube)",
    )
    args = parser.parse_args()

    process_video(
        url=args.url,
        discover=not args.no_discover,
        output_dir=args.output_dir,
    )
