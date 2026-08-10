import { getAllCards, encodeKey } from "@/lib/content";
import { getCardStateMap, resolveCardState } from "@/lib/state";
import ReviewClient from "./review-client";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const stateMap = await getCardStateMap();
  const now = new Date();

  const cards = getAllCards()
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
      <h1 className="mb-4 font-serif text-2xl text-stone-900">Review</h1>
      <ReviewClient initialCards={cards} />
    </div>
  );
}
