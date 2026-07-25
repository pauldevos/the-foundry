import Link from "next/link";
import { getAllTalkTrackSections } from "@/lib/content";
import { getTalkTrackStateMap, resolveTalkTrackState } from "@/lib/state";

export const dynamic = "force-dynamic";

export default async function TalkTracksListPage() {
  const stateMap = await getTalkTrackStateMap();
  const sections = getAllTalkTrackSections().filter(
    (s) => !resolveTalkTrackState(s.key, stateMap).is_deleted
  );

  const bySlug = new Map<string, number>();
  for (const s of sections) {
    bySlug.set(s.topicSlug, (bySlug.get(s.topicSlug) ?? 0) + 1);
  }

  return (
    <div>
      <h1 className="mb-4 font-serif text-2xl text-stone-100">Talk Tracks</h1>
      <div className="space-y-2">
        {[...bySlug.entries()].map(([slug, count]) => (
          <Link
            key={slug}
            href={`/talk-tracks/${slug}`}
            className="block rounded-lg border border-stone-800 bg-stone-900 p-4 hover:border-amber-700"
          >
            <p className="font-serif text-stone-100">{slug}</p>
            <p className="mt-1 text-xs text-stone-500">{count} talking points</p>
          </Link>
        ))}
        {bySlug.size === 0 && <p className="text-stone-500">No talk tracks yet.</p>}
      </div>
    </div>
  );
}
