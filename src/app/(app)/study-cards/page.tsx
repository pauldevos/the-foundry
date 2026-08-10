import Link from "next/link";
import { getAllCards, encodeKey } from "@/lib/content";
import { getCardStateMap, resolveCardState } from "@/lib/state";
import { getTopicsManifest, contentMatchesTopic } from "@/lib/topics";
import ReviewClient from "../review-client";

export const dynamic = "force-dynamic";

export default async function StudyCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic: activeTopicSlug } = await searchParams;
  const manifest = getTopicsManifest();
  const activeTopic = manifest.topics.find((t) => t.slug === activeTopicSlug);

  const stateMap = await getCardStateMap();
  const now = new Date();
  const allCards = getAllCards();

  // Due-count per topic for pill labels
  const topicDueCounts = new Map<string, number>();
  let totalDue = 0;
  for (const c of allCards) {
    const state = resolveCardState(c.key, stateMap);
    if (state.is_deleted || new Date(state.next_due_at) > now) continue;
    totalDue++;
    for (const t of manifest.topics) {
      if (contentMatchesTopic(t, c.topicSlug)) {
        topicDueCounts.set(t.slug, (topicDueCounts.get(t.slug) ?? 0) + 1);
      }
    }
  }

  const cards = allCards
    .filter((c) => !activeTopic || contentMatchesTopic(activeTopic, c.topicSlug))
    .map((c) => ({ c, state: resolveCardState(c.key, stateMap) }))
    .filter(({ state }) => !state.is_deleted && new Date(state.next_due_at) <= now)
    .sort((a, b) => +new Date(a.state.next_due_at) - +new Date(b.state.next_due_at))
    .slice(0, 200)
    .map(({ c, state }) => {
      const override = state.local_override ?? {};
      return {
        id: encodeKey(c.key),
        deckTopic: c.deckTopic,
        type: override.type ?? c.type,
        front: override.front ?? c.front,
        back: override.back ?? c.back,
        starred: override.starred ?? c.starred,
        clipVideoId: c.clipVideoId,
        clipSeconds: c.clipSeconds,
      };
    });

  return (
    <div>
      <h1 className="mb-4 font-serif text-2xl text-stone-900">Study Cards</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/study-cards"
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            !activeTopicSlug
              ? "border-amber-600 bg-amber-600 text-stone-950"
              : "border-stone-700 text-stone-700 hover:border-amber-600"
          }`}
        >
          All ({totalDue})
        </Link>
        {manifest.topics.map((t) => {
          const count = topicDueCounts.get(t.slug) ?? 0;
          if (count === 0) return null;
          return (
            <Link
              key={t.slug}
              href={`/study-cards?topic=${t.slug}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                activeTopicSlug === t.slug
                  ? "border-amber-600 bg-amber-600 text-stone-950"
                  : "border-stone-700 text-stone-700 hover:border-amber-600"
              }`}
            >
              {t.label} ({count})
            </Link>
          );
        })}
      </div>

      <ReviewClient initialCards={cards} />
    </div>
  );
}
