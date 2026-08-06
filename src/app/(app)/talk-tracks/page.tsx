import Link from "next/link";
import { getAllTalkTrackSections } from "@/lib/content";
import { getTalkTrackStateMap, resolveTalkTrackState } from "@/lib/state";

export const dynamic = "force-dynamic";

export default async function TalkTracksListPage() {
  const stateMap = await getTalkTrackStateMap();
  const sections = getAllTalkTrackSections().filter(
    (s) => !resolveTalkTrackState(s.key, stateMap).is_deleted
  );

  const bySlug = new Map<string, { count: number; createdAt: string | null }>();
  for (const s of sections) {
    const existing = bySlug.get(s.topicSlug);
    bySlug.set(s.topicSlug, {
      count: (existing?.count ?? 0) + 1,
      createdAt: existing?.createdAt ?? s.createdAt,
    });
  }
  // Newest first, same "no date yet = newest" rule as Notes/Decks.
  const entries = [...bySlug.entries()].sort((a, b) => {
    const aTime = a[1].createdAt ? Date.parse(a[1].createdAt) : Infinity;
    const bTime = b[1].createdAt ? Date.parse(b[1].createdAt) : Infinity;
    return bTime - aTime;
  });

  return (
    <div>
      <h1 className="mb-4 font-serif text-2xl text-stone-100">Talk Tracks</h1>
      <div className="space-y-2">
        {entries.map(([slug, { count, createdAt }]) => (
          <Link
            key={slug}
            href={`/talk-tracks/${slug}`}
            className="block rounded-lg border border-stone-800 bg-stone-900 p-4 hover:border-amber-700"
          >
            <p className="font-serif text-stone-100">{slug}</p>
            <p className="mt-1 font-mono text-xs text-stone-500">
              {count} talking points
              {createdAt && (
                <span className="ml-2 text-stone-600">
                  {new Date(createdAt).toLocaleDateString()}
                </span>
              )}
            </p>
          </Link>
        ))}
        {bySlug.size === 0 && <p className="text-stone-500">No talk tracks yet.</p>}
      </div>
    </div>
  );
}
