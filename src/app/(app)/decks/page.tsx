import Link from "next/link";
import { getAllDecks } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function DecksListPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>;
}) {
  const { domain: activeDomain } = await searchParams;

  const allDecks = getAllDecks()
    // Newest first. A deck with no createdAt yet (just added, not committed when the date
    // manifest was last generated) sorts as "now" — treated as newest, not dropped to the
    // bottom. Mirrors the same rule on the Notes list.
    .sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : Infinity;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : Infinity;
      return bTime - aTime;
    });

  const domainCounts = new Map<string, number>();
  for (const d of allDecks) {
    domainCounts.set(d.domain, (domainCounts.get(d.domain) ?? 0) + 1);
  }
  const domains = [...domainCounts.entries()].sort((a, b) => b[1] - a[1]);

  const decks = activeDomain ? allDecks.filter((d) => d.domain === activeDomain) : allDecks;

  return (
    <div>
      <h1 className="mb-4 font-serif text-2xl text-slate-200">Decks</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/decks"
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            !activeDomain
              ? "border-amber-500 bg-amber-500 text-stone-950"
              : "border-stone-700 text-slate-300 hover:border-amber-500"
          }`}
        >
          All ({allDecks.length})
        </Link>
        {domains.map(([domain, count]) => (
          <Link
            key={domain}
            href={`/decks?domain=${encodeURIComponent(domain)}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              activeDomain === domain
                ? "border-amber-500 bg-amber-500 text-stone-950"
                : "border-stone-700 text-slate-300 hover:border-amber-500"
            }`}
          >
            {domain} ({count})
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        {decks.map((d) => (
          <Link
            key={d.sourcePath}
            href={`/study-cards?deck=${encodeURIComponent(d.sourcePath)}`}
            className="block rounded-lg border border-slate-700 bg-slate-900 p-4 hover:border-amber-500"
          >
            <p className="font-serif text-slate-200 hover:text-amber-300">{d.topic}</p>
            {d.tier && <p className="mt-1 text-xs text-slate-400">{d.tier}</p>}
            <p className="mt-1 font-mono text-xs text-slate-500">
              {d.cardCount} cards ({d.starredCount} starred) · {d.topicSlug}
              {d.createdAt && (
                <span className="ml-2 text-slate-400">
                  {new Date(d.createdAt).toLocaleDateString()}
                </span>
              )}
            </p>
          </Link>
        ))}
        {decks.length === 0 && <p className="text-slate-500">No decks in this category.</p>}
      </div>
    </div>
  );
}
