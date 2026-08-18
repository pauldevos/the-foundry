import Link from "next/link";
import { getAllDecks, getAllNotes, getAllTalkTrackSections } from "@/lib/content";
import { databricksGuides, referenceGuides } from "@/lib/materials";
import { getTopicsManifest } from "@/lib/topics";

export default function MaterialsPage() {
  const topics = getTopicsManifest().topics;
  const decks = getAllDecks();
  const notes = getAllNotes();
  const talkTracks = getAllTalkTrackSections();

  return (
    <div>
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 font-mono text-xs uppercase tracking-wide text-amber-400">Learning library</p>
        <h1 className="font-serif text-3xl text-slate-100">Find the right material, then practice it.</h1>
        <p className="mt-3 leading-relaxed text-slate-400">
          Reference guides for orientation, notes for understanding, cards for recall, and talk tracks for explaining ideas out loud.
        </p>
      </div>

      <section className="mb-10 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-wide text-amber-400">Featured path</p>
            <h2 className="font-serif text-2xl text-slate-100">Databricks architect 5-dims</h2>
          </div>
          <a href="/databricks-study.html" className="text-sm text-amber-300 hover:text-amber-200">Open study map →</a>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {databricksGuides.map((guide) => (
            <a key={guide.href} href={guide.href} className="rounded-lg border border-slate-700 bg-slate-900 p-4 hover:border-amber-500">
              <p className="font-serif text-slate-100">{guide.title}</p>
              <p className="mt-1 text-xs text-amber-400">{guide.topic}</p>
              <p className="mt-2 text-sm text-slate-400">{guide.description}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-amber-400">Study formats</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/notes" className="rounded-xl border border-slate-700 bg-slate-900 p-5 hover:border-amber-500">
            <p className="font-serif text-lg text-slate-100">Notes</p>
            <p className="mt-1 text-sm text-slate-400">{notes.length} deep-dive materials with an in-page table of contents.</p>
          </Link>
          <Link href="/study-cards" className="rounded-xl border border-slate-700 bg-slate-900 p-5 hover:border-amber-500">
            <p className="font-serif text-lg text-slate-100">Spaced recall</p>
            <p className="mt-1 text-sm text-slate-400">{decks.length} decks. Review what is due, on any device.</p>
          </Link>
          <Link href="/talk-tracks" className="rounded-xl border border-slate-700 bg-slate-900 p-5 hover:border-amber-500">
            <p className="font-serif text-lg text-slate-100">Explain it aloud</p>
            <p className="mt-1 text-sm text-slate-400">{talkTracks.length} prompts for verbal recall and architectural reasoning.</p>
          </Link>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-amber-400">Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map((topic) => (
            <Link key={topic.slug} href={`/topics/${topic.slug}`} className="rounded-lg border border-slate-700 bg-slate-900 p-4 hover:border-amber-500">
              <p className="font-serif text-slate-100">{topic.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{topic.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-amber-400">Visual reference guides</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {referenceGuides.map((guide) => (
            <Link key={guide.href} href={guide.href} className="rounded-lg border border-slate-700 bg-slate-900 p-4 hover:border-amber-500">
              <p className="font-serif text-slate-100">{guide.title}</p>
              <p className="mt-1 text-xs text-amber-400">{guide.topic}</p>
              <p className="mt-2 text-sm text-slate-400">{guide.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
