import "server-only";
import fs from "node:fs";
import path from "node:path";

// Content lives in learning/, right here in this repo, and is read fresh on
// every request — there is no sync step. New content shows up the moment
// Vercel redeploys after a push. See supabase/schema.sql for why Postgres
// only holds review state, not content.
const LEARNING_DIR = path.join(process.cwd(), "learning");

export type DeckContent = {
  sourcePath: string;
  topic: string;
  tier: string | null;
  topicSlug: string;
  note: string | null;
  sources: Array<{ name: string; url: string }>;
};

export type CardContent = {
  key: string; // `${sourcePath}#${sourceIndex}` — the stable identity used for state lookups
  sourcePath: string;
  sourceIndex: number;
  deckTopic: string;
  topicSlug: string;
  type: string;
  front: string;
  back: string;
  starred: boolean;
  clipVideoId: string | null;
  clipSeconds: number | null;
};

export type NoteContent = {
  key: string; // sourcePath
  sourcePath: string;
  title: string;
  bodyMarkdown: string;
  topicSlug: string;
  domain: string; // first folder under notes/ (e.g. "rag-pipeline"), or "general" for loose top-level notes
  createdAt: string | null; // ISO date of the file's first commit, from generate-content-dates.mjs; null if not yet committed
};

// { "notes/foo.md": "2026-07-20T..." } — generated at build/dev time by
// scripts/generate-content-dates.mjs (see predev/prebuild in package.json). Read once per
// process, not per request — this file only changes when the process restarts anyway.
let contentDatesCache: Record<string, string> | null = null;
function getContentDates(): Record<string, string> {
  if (contentDatesCache) return contentDatesCache;
  const file = path.join(LEARNING_DIR, ".content-dates.json");
  contentDatesCache = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf-8")) : {};
  return contentDatesCache!;
}

/** First path segment under notes/, or "general" if the note has no subfolder —
 * used to group/filter the notes list by domain (e.g. clicking "rag-pipeline"). */
function domainFromRelPath(relToNotes: string): string {
  const parts = relToNotes.split(path.sep);
  return parts.length > 1 ? parts[0] : "general";
}

export type TalkTrackSection = {
  key: string; // `${sourcePath}#${sectionIndex}`
  sourcePath: string;
  sectionIndex: number;
  heading: string;
  director: string | null;
  staff: string | null;
  unified: string | null;
  topicSlug: string;
};

/** Opaque, URL-safe encoding for a content key so it can live in a single
 * dynamic route segment (`/api/cards/[id]`) even though keys contain "/" and "#". */
export function encodeKey(key: string): string {
  return Buffer.from(key, "utf-8").toString("base64url");
}
export function decodeKey(encoded: string): string {
  return Buffer.from(encoded, "base64url").toString("utf-8");
}

function walk(dir: string, extFilter: (f: string) => boolean): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, extFilter));
    else if (extFilter(entry.name)) out.push(full);
  }
  return out;
}

/** Derive a stable topic_slug from a file's path relative to its content-type root.
 * "rag-architecture.json" -> "rag-architecture"
 * "rag-pipeline/04-retrieval.json" -> "rag-pipeline-04-retrieval" */
function slugFromRelPath(relPath: string): string {
  return relPath
    .replace(/\.(json|md)$/, "")
    .split(path.sep)
    .join("-")
    .toLowerCase();
}

function extractTitle(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

/** Splits a talk-track markdown file into "### On ..." sections, and detects the
 * two-register format (**Director framing:** / **Principal/Staff framing:**) vs.
 * pre-convention unified text. */
function parseTalkTrackSections(markdown: string) {
  const sections: Array<{
    heading: string;
    director: string | null;
    staff: string | null;
    unified: string | null;
  }> = [];

  const parts = markdown.split(/^###\s+/m).slice(1); // drop preamble before first ### heading
  for (const part of parts) {
    const [headingLine, ...rest] = part.split("\n");
    const body = rest.join("\n").trim();
    const directorMatch = body.match(
      /\*\*Director framing:\*\*\s*([\s\S]*?)(?=\n\*\*Principal\/Staff framing:\*\*|$)/
    );
    const staffMatch = body.match(/\*\*Principal\/Staff framing:\*\*\s*([\s\S]*)/);

    sections.push({
      heading: headingLine.trim(),
      director: directorMatch ? directorMatch[1].trim() : null,
      staff: staffMatch ? staffMatch[1].trim() : null,
      unified: directorMatch || staffMatch ? null : body,
    });
  }
  return sections;
}

export function getAllDecks(): DeckContent[] {
  const decksRoot = path.join(LEARNING_DIR, "decks");
  const files = walk(decksRoot, (f) => f.endsWith(".json"));
  return files.map((file) => {
    const relPath = path.relative(LEARNING_DIR, file);
    const relToDecks = path.relative(decksRoot, file);
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
    return {
      sourcePath: relPath,
      topic: parsed.topic,
      tier: parsed.tier ?? null,
      topicSlug: slugFromRelPath(relToDecks),
      note: parsed.note ?? null,
      sources: parsed.sources ?? [],
    };
  });
}

export function getAllCards(): CardContent[] {
  const decksRoot = path.join(LEARNING_DIR, "decks");
  const files = walk(decksRoot, (f) => f.endsWith(".json"));
  const cards: CardContent[] = [];

  for (const file of files) {
    const relPath = path.relative(LEARNING_DIR, file);
    const relToDecks = path.relative(decksRoot, file);
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
    const topicSlug = slugFromRelPath(relToDecks);
    const deckCards: Array<Record<string, unknown>> = parsed.cards ?? [];

    deckCards.forEach((c, i) => {
      cards.push({
        key: `${relPath}#${i}`,
        sourcePath: relPath,
        sourceIndex: i,
        deckTopic: parsed.topic,
        topicSlug,
        type: c.type as string,
        front: c.front as string,
        back: c.back as string,
        starred: Boolean(c.starred),
        clipVideoId: (c.video_id as string) ?? null,
        clipSeconds: (c.t as number) ?? null,
      });
    });
  }
  return cards;
}

export function getAllNotes(): NoteContent[] {
  const notesRoot = path.join(LEARNING_DIR, "notes");
  const files = walk(notesRoot, (f) => f.endsWith(".md"));
  return files.map((file) => {
    const relPath = path.relative(LEARNING_DIR, file);
    const relToNotes = path.relative(notesRoot, file);
    const body = fs.readFileSync(file, "utf-8");
    return {
      key: relPath,
      sourcePath: relPath,
      title: extractTitle(body, path.basename(file, ".md")),
      bodyMarkdown: body,
      topicSlug: slugFromRelPath(relToNotes),
      domain: domainFromRelPath(relToNotes),
      createdAt: getContentDates()[relPath] ?? null,
    };
  });
}

export function getNoteByKey(key: string): NoteContent | null {
  return getAllNotes().find((n) => n.key === key) ?? null;
}

// Fixed 8-slot dark-mode categorical palette (validated against this app's
// bg-stone-950 surface via the dataviz skill's validate_palette.js - all 8
// checks pass, adjacent-pair CVD ΔE 8.4+, normal-vision ΔE 19.3+, contrast
// >=3:1). Order is the CVD-safety mechanism, not cosmetic - never reorder or
// cycle past slot 8; a 9th category folds into a muted/outlined treatment
// instead of a generated hue (see extendedAxes below).
export const CATEGORICAL_PALETTE_DARK = [
  "#3987e5", // 1 blue
  "#d95926", // 2 orange
  "#199e70", // 3 aqua
  "#c98500", // 4 yellow
  "#d55181", // 5 magenta
  "#008300", // 6 green
  "#9085e9", // 7 violet
  "#e66767", // 8 red
] as const;

export type MatrixAxis = {
  id: string;
  number: number;
  name: string;
  definition: string;
  colorSlot: number; // 1-8, indexes CATEGORICAL_PALETTE_DARK
};
export type MatrixExtendedAxis = { id: string; name: string; definition: string };
export type MatrixDomainExample = { axisId: string; text: string };
export type MatrixDomain = {
  id: string;
  name: string;
  dominantAxisIds: string[];
  why: string;
  examples: MatrixDomainExample[];
  personal?: string;
};
export type CrossCuttingLens = {
  title: string;
  intro: string;
  precision: { label: string; definition: string };
  recall: { label: string; definition: string };
  whyItMatters: string;
  onEvalsOwnership: { heading: string; text: string };
};
export type TaxonomyMatrixData = {
  title: string;
  intro: string;
  axes: MatrixAxis[];
  extendedAxes: MatrixExtendedAxis[];
  crossCuttingLens?: CrossCuttingLens;
  domains: MatrixDomain[];
  closing: string;
};

/** A note can optionally have a sibling "<basename>.data.json" file next to its
 * .md source - when present, the note detail page renders a bespoke component
 * fed by this structured data instead of generic markdown. Convention, not a
 * new top-level content type: the .md file stays canonical for search/list/
 * dates/topicSlug, this is a purely presentational override for one page. */
export function getNoteMatrixData(note: NoteContent): TaxonomyMatrixData | null {
  const dataPath = path.join(LEARNING_DIR, note.sourcePath).replace(/\.md$/, ".data.json");
  if (!fs.existsSync(dataPath)) return null;
  return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
}

export function getAllTalkTrackSections(): TalkTrackSection[] {
  const dir = path.join(LEARNING_DIR, "talk-tracks");
  const files = walk(dir, (f) => f.endsWith(".md"));
  const sections: TalkTrackSection[] = [];

  for (const file of files) {
    const relPath = path.relative(LEARNING_DIR, file);
    const relToDir = path.relative(dir, file);
    const domainSlug = slugFromRelPath(relToDir);
    const markdown = fs.readFileSync(file, "utf-8");

    parseTalkTrackSections(markdown).forEach((s, i) => {
      sections.push({
        key: `${relPath}#${i}`,
        sourcePath: relPath,
        sectionIndex: i,
        heading: s.heading,
        director: s.director,
        staff: s.staff,
        unified: s.unified,
        topicSlug: domainSlug,
      });
    });
  }
  return sections;
}
