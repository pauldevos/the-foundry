import Link from "next/link";
import { getAllNotes, encodeKey } from "@/lib/content";
import { getNoteStateMap, resolveNoteState } from "@/lib/state";

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
    .sort((a, b) => a.n.sourcePath.localeCompare(b.n.sourcePath));

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
        {notes.length === 0 && <p className="text-stone-500">No notes in this category.</p>}
      </div>
    </div>
  );
}
