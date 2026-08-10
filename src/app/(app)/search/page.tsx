"use client";

import { useState } from "react";
import Link from "next/link";

type Results = {
  notes: { id: string; title: string; topic_slug: string }[];
  talkTracks: { id: string; heading: string; topic_slug: string }[];
  cards: { id: string; front: string; back: string; deckTopic: string }[];
};

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    setResults(await res.json());
    setLoading(false);
  }

  return (
    <div>
      <h1 className="mb-4 font-serif text-2xl text-stone-900">Search</h1>
      <form onSubmit={runSearch} className="mb-6 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search cards, notes, talk tracks..."
          className="flex-1 rounded-lg border border-stone-700 bg-stone-100 px-4 py-2.5 text-stone-900 outline-none focus:border-amber-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-stone-950 disabled:opacity-50"
        >
          {loading ? "..." : "Search"}
        </button>
      </form>

      {results && (
        <div className="space-y-6">
          {results.notes.length > 0 && (
            <section>
              <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-amber-700">
                Notes
              </h2>
              <div className="space-y-1">
                {results.notes.map((n) => (
                  <Link
                    key={n.id}
                    href={`/notes/${n.id}`}
                    className="block rounded border border-stone-300 bg-stone-100 p-3 text-sm text-stone-200 hover:border-amber-600"
                  >
                    {n.title}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.talkTracks.length > 0 && (
            <section>
              <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-amber-700">
                Talk Tracks
              </h2>
              <div className="space-y-1">
                {results.talkTracks.map((t) => (
                  <Link
                    key={t.id}
                    href={`/talk-tracks/${t.topic_slug}`}
                    className="block rounded border border-stone-300 bg-stone-100 p-3 text-sm text-stone-200 hover:border-amber-600"
                  >
                    {t.heading}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.cards.length > 0 && (
            <section>
              <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-amber-700">
                Cards
              </h2>
              <div className="space-y-1">
                {results.cards.map((c) => (
                  <div key={c.id} className="rounded border border-stone-300 bg-stone-100 p-3">
                    <p className="text-sm text-stone-200">{c.front}</p>
                    <p className="mt-1 text-xs text-stone-500">{c.back}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {results.notes.length === 0 &&
            results.talkTracks.length === 0 &&
            results.cards.length === 0 && (
              <p className="text-stone-500">No results.</p>
            )}
        </div>
      )}
    </div>
  );
}
