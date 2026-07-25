import Link from "next/link";
import { getAllNotes, encodeKey } from "@/lib/content";
import { getNoteStateMap, resolveNoteState } from "@/lib/state";

export const dynamic = "force-dynamic";

export default async function NotesListPage() {
  const stateMap = await getNoteStateMap();
  const notes = getAllNotes()
    .map((n) => ({ n, state: resolveNoteState(n.key, stateMap) }))
    .filter(({ state }) => !state.is_deleted)
    .sort((a, b) => a.n.sourcePath.localeCompare(b.n.sourcePath));

  return (
    <div>
      <h1 className="mb-4 font-serif text-2xl text-stone-100">Notes</h1>
      <div className="space-y-2">
        {notes.map(({ n, state }) => {
          const title = state.local_override?.title ?? n.title;
          return (
            <Link
              key={n.key}
              href={`/notes/${encodeKey(n.key)}`}
              className="block rounded-lg border border-stone-800 bg-stone-900 p-4 hover:border-amber-700"
            >
              <p className="font-serif text-stone-100">{title}</p>
              <p className="mt-1 font-mono text-xs text-stone-500">{n.topicSlug}</p>
            </Link>
          );
        })}
        {notes.length === 0 && <p className="text-stone-500">No notes yet.</p>}
      </div>
    </div>
  );
}
