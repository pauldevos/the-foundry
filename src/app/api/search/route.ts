import { requireAuthOr401 } from "@/lib/require-auth";
import { getAllCards, getAllNotes, getAllTalkTrackSections, encodeKey } from "@/lib/content";
import { getCardStateMap, getNoteStateMap, getTalkTrackStateMap, resolveCardState, resolveNoteState, resolveTalkTrackState } from "@/lib/state";
import { NextResponse } from "next/server";

// Content volume here is a few hundred cards and a few dozen docs — a plain
// in-memory substring scan on every request is simpler than standing up a
// search index, and fast enough not to matter at this scale.
function matches(haystacks: Array<string | null | undefined>, terms: string[]): boolean {
  const text = haystacks.filter(Boolean).join(" ").toLowerCase();
  return terms.every((t) => text.includes(t));
}

export async function GET(req: Request) {
  const unauthorized = await requireAuthOr401();
  if (unauthorized) return unauthorized;

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ notes: [], talkTracks: [], cards: [] });
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);

  const [cardStateMap, noteStateMap, talkTrackStateMap] = await Promise.all([
    getCardStateMap(),
    getNoteStateMap(),
    getTalkTrackStateMap(),
  ]);

  const notes = getAllNotes()
    .map((n) => ({ n, state: resolveNoteState(n.key, noteStateMap) }))
    .filter(({ state }) => !state.is_deleted)
    .map(({ n, state }) => ({
      id: encodeKey(n.key),
      title: state.local_override?.title ?? n.title,
      topicSlug: n.topicSlug,
      body: state.local_override?.body_markdown ?? n.bodyMarkdown,
    }))
    .filter((n) => matches([n.title, n.body], terms))
    .slice(0, 20)
    .map(({ id, title, topicSlug }) => ({ id, title, topic_slug: topicSlug }));

  const talkTracks = getAllTalkTrackSections()
    .map((s) => ({ s, state: resolveTalkTrackState(s.key, talkTrackStateMap) }))
    .filter(({ state }) => !state.is_deleted)
    .map(({ s, state }) => ({
      id: encodeKey(s.key),
      heading: s.heading,
      topicSlug: s.topicSlug,
      director: state.local_override?.director_framing ?? s.director,
      staff: state.local_override?.staff_framing ?? s.staff,
      unified: s.unified,
    }))
    .filter((s) => matches([s.heading, s.director, s.staff, s.unified], terms))
    .slice(0, 20)
    .map(({ id, heading, topicSlug }) => ({ id, heading, topic_slug: topicSlug }));

  const cards = getAllCards()
    .map((c) => ({ c, state: resolveCardState(c.key, cardStateMap) }))
    .filter(({ state }) => !state.is_deleted)
    .map(({ c, state }) => ({
      id: encodeKey(c.key),
      front: state.local_override?.front ?? c.front,
      back: state.local_override?.back ?? c.back,
      deckTopic: c.deckTopic,
    }))
    .filter((c) => matches([c.front, c.back], terms))
    .slice(0, 20);

  return NextResponse.json({ notes, talkTracks, cards });
}
