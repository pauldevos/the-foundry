"""
discover.py — Find similar YouTube videos based on topics and key points
from already-processed content.

Requires YOUTUBE_API_KEY in .env (free — Google Cloud Console, YouTube Data API v3).
Falls back to a notice if the key is missing.
"""

import os
from googleapiclient.discovery import build


def get_youtube_service():
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        raise EnvironmentError(
            "YOUTUBE_API_KEY not set. Get a free key at:\n"
            "https://console.cloud.google.com → APIs → YouTube Data API v3"
        )
    return build("youtube", "v3", developerKey=api_key)


def discover_similar_videos(
    topics: list,
    key_points: list,
    exclude_video_ids: list = None,
    max_results: int = 8,
) -> list:
    """
    Search YouTube for videos related to the given topics and key points.
    Returns a list of dicts with url, title, channel, description, published_at.

    Strategy: run 2 searches — one on topics, one on the most specific key point —
    then deduplicate and return the top max_results.
    """
    youtube = get_youtube_service()
    exclude_ids = set(exclude_video_ids or [])
    seen_ids = set()
    results = []

    queries = []
    if topics:
        queries.append(" ".join(topics[:4]))
    if key_points:
        # Use the first key point as a more specific search
        queries.append(key_points[0][:100])

    for query in queries:
        try:
            response = (
                youtube.search()
                .list(
                    q=query,
                    part="snippet",
                    type="video",
                    maxResults=max_results,
                    order="relevance",
                    relevanceLanguage="en",
                    videoDuration="medium",  # 4–20 min; omit for longer content
                )
                .execute()
            )
        except Exception as e:
            print(f"   ⚠ YouTube search failed for query '{query[:40]}...': {e}")
            continue

        for item in response.get("items", []):
            vid_id = item["id"]["videoId"]
            if vid_id in exclude_ids or vid_id in seen_ids:
                continue
            seen_ids.add(vid_id)
            snippet = item["snippet"]
            results.append(
                {
                    "video_id": vid_id,
                    "url": f"https://www.youtube.com/watch?v={vid_id}",
                    "title": snippet["title"],
                    "channel": snippet["channelTitle"],
                    "description": snippet.get("description", "")[:200],
                    "published_at": snippet["publishedAt"],
                }
            )

        if len(results) >= max_results:
            break

    return results[:max_results]
