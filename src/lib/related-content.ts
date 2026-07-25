import "server-only";
import { getAllDecks, getAllNotes, getAllTalkTrackSections, encodeKey } from "./content";
import { getNoteStateMap, getTalkTrackStateMap, resolveNoteState, resolveTalkTrackState } from "./state";

export async function relatedContent(topicSlug: string, excludeNoteKey?: string) {
  const [noteStateMap, talkTrackStateMap] = await Promise.all([
    getNoteStateMap(),
    getTalkTrackStateMap(),
  ]);

  const decks = getAllDecks()
    .filter((d) => d.topicSlug === topicSlug)
    .map((d) => ({ id: encodeKey(d.sourcePath), topic: d.topic, sourcePath: d.sourcePath }));

  const notes = getAllNotes()
    .filter((n) => n.topicSlug === topicSlug && n.key !== excludeNoteKey)
    .filter((n) => !resolveNoteState(n.key, noteStateMap).is_deleted)
    .map((n) => ({ id: encodeKey(n.key), title: n.title, sourcePath: n.sourcePath }));

  const talkTracks = getAllTalkTrackSections()
    .filter((s) => s.topicSlug === topicSlug)
    .filter((s) => !resolveTalkTrackState(s.key, talkTrackStateMap).is_deleted)
    .map((s) => ({ id: encodeKey(s.key), heading: s.heading, topicSlug: s.topicSlug }));

  return { decks, notes, talkTracks };
}
