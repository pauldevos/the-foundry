import Link from "next/link";
import { notFound } from "next/navigation";
import { decodeKey, encodeKey, getNoteByKey, getNoteMatrixData } from "@/lib/content";
import { getOneNoteState } from "@/lib/state";
import { relatedContent } from "@/lib/related-content";
import MarkdownContent from "@/components/markdown-content";
import TaxonomyMatrix from "@/components/taxonomy-matrix";
import NoteActions from "@/components/note-actions";

export const dynamic = "force-dynamic";

export default async function NoteDetailPage({
  params,
}: PageProps<"/notes/[id]">) {
  const { id } = await params;
  const key = decodeKey(id);
  const note = getNoteByKey(key);
  if (!note) notFound();

  const state = await getOneNoteState(key);
  if (state.is_deleted) notFound();

  const title = state.local_override?.title ?? note.title;
  const body = state.local_override?.body_markdown ?? note.bodyMarkdown;

  const related = await relatedContent(note.topicSlug, note.key);
  const matrixData = getNoteMatrixData(note);

  return (
    <article>
      <NoteActions id={encodeKey(note.key)} title={title} bodyMarkdown={body} />
      {matrixData ? (
        <TaxonomyMatrix data={matrixData} />
      ) : (
        <MarkdownContent>{body}</MarkdownContent>
      )}

      {(related.decks.length > 0 || related.talkTracks.length > 0) && (
        <aside className="mt-8 rounded-lg border border-slate-700 bg-slate-900 p-4">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-amber-400">
            Related
          </h2>
          {related.decks.length > 0 && (
            <div className="mb-2">
              <span className="text-xs text-slate-500">Cards: </span>
              {related.decks.map((d) => (
                <span key={d.id} className="text-sm text-slate-300">
                  {d.topic}
                </span>
              ))}
            </div>
          )}
          {related.talkTracks.length > 0 && (
            <div>
              <span className="text-xs text-slate-500">Talk track: </span>
              <Link
                href={`/talk-tracks/${note.topicSlug}`}
                className="text-sm text-amber-400 hover:underline"
              >
                {note.topicSlug}
              </Link>
            </div>
          )}
        </aside>
      )}
    </article>
  );
}
