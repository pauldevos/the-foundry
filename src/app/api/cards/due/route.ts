import { requireAuthOr401 } from "@/lib/require-auth";
import { getAllCards, encodeKey } from "@/lib/content";
import { getCardStateMap, resolveCardState } from "@/lib/state";
import { NextResponse } from "next/server";

export async function GET() {
  const unauthorized = await requireAuthOr401();
  if (unauthorized) return unauthorized;

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
        topicSlug: c.topicSlug,
        type: override.type ?? c.type,
        front: override.front ?? c.front,
        back: override.back ?? c.back,
        starred: override.starred ?? c.starred,
        clipVideoId: c.clipVideoId,
        clipSeconds: c.clipSeconds,
      };
    });

  return NextResponse.json({ cards });
}
