import Link from "next/link";
import { notFound } from "next/navigation";
import { encodeKey, getAllDecks, getAllNotes, getAllTalkTrackSections } from "@/lib/content";
import { getNoteStateMap, resolveNoteState } from "@/lib/state";
import { getTopicsManifest, contentMatchesTopic } from "@/lib/topics";

export const dynamic = "force-dynamic";

export default async function TopicPage({ params }: PageProps<"/topics/[slug]">) {
  const { slug } = await params;
  const manifest = getTopicsManifest();
  const topic = manifest.topics.find((t) => t.slug === slug);
  if (!topic) notFound();

  const noteStateMap = await getNoteStateMap();

  const decks = getAllDecks().filter((d) =>
    contentMatchesTopic(topic, d.topicSlug, d.domain)
  );

  const notes = getAllNotes()
    .map((n) => ({ n, state: resolveNoteState(n.key, noteStateMap) }))
    .filter(
      ({ n, state }) =>
        !state.is_deleted && contentMatchesTopic(topic, n.topicSlug, n.domain)
    )
    .sort((a, b) => {
      const at = a.n.createdAt ? Date.parse(a.n.createdAt) : Infinity;
      const bt = b.n.createdAt ? Date.parse(b.n.createdAt) : Infinity;
      return bt - at;
    });

  // Unique talk-track source files matching this topic
  const talkTrackFiles = [
    ...new Map(
      getAllTalkTrackSections()
        .filter((s) => contentMatchesTopic(topic, s.topicSlug))
        .map((s) => [s.sourcePath, s])
    ).values(),
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-slate-200">{topic.label}</h1>
        <p className="mt-1 text-sm text-slate-400">{topic.description}</p>
      </div>

      <Link
        href={`/study-cards?topic=${topic.slug}`}
        className="mb-8 inline-flex items-center gap-2 rounded-lg border border-amber-500 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20"
      >
        Study Cards →
      </Link>

      {decks.length > 0 && (
        <section className="mb-8">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-amber-400">
              Card Decks
            </h2>
            <div className="space-y-2">
              {decks.map((d) => (
                <Link
                  key={d.sourcePath}
                  href={`/study-cards?deck=${encodeURIComponent(d.sourcePath)}`}
                  className="block rounded-lg border border-slate-700 bg-slate-900 p-4 hover:border-amber-500"
                >
                  <p className="font-serif text-slate-200 hover:text-amber-300">{d.topic}</p>
                  <p className="mt-1 font-mono text-xs text-slate-500">
                    {d.cardCount} cards · {d.starredCount} starred
                    {d.tier && ` · ${d.tier}`}
                  </p>
                </Link>
              ))}
            </div>
        </section>
      )}

      {notes.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-amber-400">
            Notes
          </h2>
          <div className="space-y-2">
            {notes.map(({ n, state }) => {
              const title = state.local_override?.title ?? n.title;
              return (
                <Link
                  key={n.key}
                  href={`/notes/${encodeKey(n.key)}`}
                  className="block rounded-lg border border-slate-700 bg-slate-900 p-4 hover:border-amber-500"
                >
                  <p className="font-serif text-slate-200">{title}</p>
                  <p className="mt-1 font-mono text-xs text-slate-500">
                    {n.topicSlug}
                    {n.createdAt && (
                      <span className="ml-2 text-slate-400">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {talkTrackFiles.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-amber-400">
            Talk Tracks
          </h2>
          <div className="space-y-2">
            {talkTrackFiles.map((s) => (
              <Link
                key={s.sourcePath}
                href={`/talk-tracks/${s.topicSlug}`}
                className="block rounded-lg border border-slate-700 bg-slate-900 p-4 hover:border-amber-500"
              >
                <p className="font-serif text-slate-200">{s.topicSlug}</p>
                <p className="mt-1 font-mono text-xs text-slate-500">{s.sourcePath}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {decks.length === 0 && notes.length === 0 && talkTrackFiles.length === 0 && (
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 text-center">
          <p className="text-slate-400">No content yet for this topic.</p>
          <p className="mt-1 text-xs text-slate-400">
            Content will appear here once decks, notes, or talk tracks are added under this topic.
          </p>
        </div>
      )}
    </div>
  );
}
