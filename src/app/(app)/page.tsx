import Link from "next/link";
import { databricksGuides } from "@/lib/materials";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 p-6 sm:p-9">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-amber-400">Architect study path</p>
        <h1 className="max-w-3xl font-serif text-3xl leading-tight text-slate-100 sm:text-4xl">
          Databricks Apps, AI services, and delivery—organized for fast architecture decisions.
        </h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-slate-400">
          Start with the five-dimension references, then use the notes, cards, and talk tracks to turn the platform knowledge into build and interview fluency.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/databricks-study.html" className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-950 hover:bg-amber-400">
            Open Databricks study map →
          </a>
          <Link href="/materials" className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm text-slate-200 hover:border-amber-500 hover:text-amber-300">
            Browse all materials
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-wide text-amber-400">Start here</p>
            <h2 className="font-serif text-2xl text-slate-100">Databricks 5-dimension deep dives</h2>
          </div>
          <a href="/databricks-5dim.html" className="text-sm text-slate-400 hover:text-amber-300">Full platform reference →</a>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {databricksGuides.map((guide, index) => (
            <a key={guide.href} href={guide.href} className="group rounded-xl border border-slate-700 bg-slate-900 p-5 transition hover:border-amber-500">
              <div className="flex items-start justify-between gap-3">
                <p className="font-serif text-lg text-slate-100 group-hover:text-amber-300">{guide.title}</p>
                <span className="font-mono text-xs text-slate-600">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-amber-400">{guide.topic}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{guide.description}</p>
            </a>
          ))}
        </div>
      </section>

      <section>
        <p className="mb-3 font-mono text-xs uppercase tracking-wide text-amber-400">Practice loop</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/study-cards" className="rounded-xl border border-slate-700 bg-slate-900 p-5 hover:border-amber-500">
            <p className="font-serif text-lg text-slate-100">Review</p>
            <p className="mt-1 text-sm text-slate-400">Use spaced recall after each deep dive.</p>
          </Link>
          <Link href="/notes" className="rounded-xl border border-slate-700 bg-slate-900 p-5 hover:border-amber-500">
            <p className="font-serif text-lg text-slate-100">Notes</p>
            <p className="mt-1 text-sm text-slate-400">Read the longer architecture and implementation material.</p>
          </Link>
          <Link href="/talk-tracks" className="rounded-xl border border-slate-700 bg-slate-900 p-5 hover:border-amber-500">
            <p className="font-serif text-lg text-slate-100">Talk tracks</p>
            <p className="mt-1 text-sm text-slate-400">Practice explaining tradeoffs out loud.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
