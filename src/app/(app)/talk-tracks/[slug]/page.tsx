import { notFound } from "next/navigation";
import { getAllTalkTrackSections, encodeKey } from "@/lib/content";
import { getTalkTrackStateMap, resolveTalkTrackState } from "@/lib/state";
import { relatedContent } from "@/lib/related-content";
import TalkTrackActions from "@/components/talk-track-actions";

export const dynamic = "force-dynamic";

export default async function TalkTrackDomainPage({
  params,
}: PageProps<"/talk-tracks/[slug]">) {
  const { slug } = await params;
  const stateMap = await getTalkTrackStateMap();

  const sections = getAllTalkTrackSections()
    .filter((s) => s.topicSlug === slug)
    .map((s) => ({ s, state: resolveTalkTrackState(s.key, stateMap) }))
    .filter(({ state }) => !state.is_deleted)
    .sort((a, b) => a.s.sectionIndex - b.s.sectionIndex);

  if (sections.length === 0) notFound();

  const related = await relatedContent(slug);

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl text-stone-900">{slug}</h1>
      <p className="mb-6 text-sm text-stone-500">{sections.length} talking points</p>

      <div className="space-y-6">
        {sections.map(({ s, state }) => {
          const director = state.local_override?.director_framing ?? s.director;
          const staff = state.local_override?.staff_framing ?? s.staff;

          return (
            <div key={s.key} className="rounded-lg border border-stone-300 bg-stone-100 p-4">
              <h3 className="mb-2 font-serif text-lg text-stone-900">{s.heading}</h3>
              {director || staff ? (
                <>
                  {director && (
                    <div className="mb-3">
                      <p className="mb-1 font-mono text-xs uppercase tracking-wide text-amber-700">
                        Director
                      </p>
                      <p className="text-sm leading-relaxed text-stone-700">{director}</p>
                    </div>
                  )}
                  {staff && (
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase tracking-wide text-amber-700">
                        Principal / Staff
                      </p>
                      <p className="text-sm leading-relaxed text-stone-700">{staff}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm leading-relaxed text-stone-700">{s.unified}</p>
              )}
              <TalkTrackActions
                id={encodeKey(s.key)}
                director={director}
                staff={staff}
                unified={s.unified}
              />
            </div>
          );
        })}
      </div>

      {(related.decks.length > 0 || related.notes.length > 0) && (
        <aside className="mt-8 rounded-lg border border-stone-300 bg-stone-100 p-4">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-amber-700">
            Related
          </h2>
          {related.decks.length > 0 && (
            <p className="text-sm text-stone-700">
              Cards: {related.decks.map((d) => d.topic).join(", ")}
            </p>
          )}
          {related.notes.length > 0 && (
            <p className="mt-1 text-sm text-stone-700">
              Notes: {related.notes.map((n) => n.title).join(", ")}
            </p>
          )}
        </aside>
      )}
    </div>
  );
}
