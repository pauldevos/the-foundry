import Link from "next/link";
import { getAllNotes, encodeKey } from "@/lib/content";
import { getNoteStateMap, resolveNoteState } from "@/lib/state";
import HideNoteButton from "@/components/hide-note-button";

export const dynamic = "force-dynamic";

export default async function NotesListPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>;
}) {
  const { domain: activeDomain } = await searchParams;
  const stateMap = await getNoteStateMap();
  const allNotes = getAllNotes()
    .map((n) => ({ n, state: resolveNoteState(n.key, stateMap) }))
    .filter(({ state }) => !state.is_deleted)
    // Newest first. A note with no createdAt yet (just created, not committed when the
    // date manifest was last generated) sorts as "now" — treated as the newest, not
    // dropped to the bottom.
    .sort((a, b) => {
      const aTime = a.n.createdAt ? Date.parse(a.n.createdAt) : Infinity;
      const bTime = b.n.createdAt ? Date.parse(b.n.createdAt) : Infinity;
      return bTime - aTime;
    });

  const domainCounts = new Map<string, number>();
  for (const { n } of allNotes) {
    domainCounts.set(n.domain, (domainCounts.get(n.domain) ?? 0) + 1);
  }
  const domains = [...domainCounts.entries()].sort((a, b) => b[1] - a[1]);

  const notes = activeDomain
    ? allNotes.filter(({ n }) => n.domain === activeDomain)
    : allNotes;

  return (
    <div>
      <h1 className="mb-4 font-serif text-2xl text-stone-100">Notes</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/notes"
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            !activeDomain
              ? "border-amber-600 bg-amber-700 text-stone-950"
              : "border-stone-700 text-stone-300 hover:border-amber-700"
          }`}
        >
          All ({allNotes.length})
        </Link>
        {domains.map(([domain, count]) => (
          <Link
            key={domain}
            href={`/notes?domain=${encodeURIComponent(domain)}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              activeDomain === domain
                ? "border-amber-600 bg-amber-700 text-stone-950"
                : "border-stone-700 text-stone-300 hover:border-amber-700"
            }`}
          >
            {domain} ({count})
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        {notes.map(({ n, state }) => {
          const title = state.local_override?.title ?? n.title;
          const id = encodeKey(n.key);
          return (
            <div
              key={n.key}
              className="flex items-center gap-2 rounded-lg border border-stone-800 bg-stone-900 p-4 hover:border-amber-700"
            >
              <Link href={`/notes/${id}`} className="min-w-0 flex-1">
                <p className="truncate font-serif text-stone-100">{title}</p>
                <p className="mt-1 font-mono text-xs text-stone-500">
                  {n.topicSlug}
                  {n.createdAt && (
                    <span className="ml-2 text-stone-600">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </Link>
              <HideNoteButton id={id} />
            </div>
          );
        })}
        {notes.length === 0 && <p className="text-stone-500">No notes in this category.</p>}
      </div>
    </div>
  );
}
