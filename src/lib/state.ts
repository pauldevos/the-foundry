import "server-only";
import { supabaseAdmin } from "./supabase";

export type CardOverride = { front?: string; back?: string; type?: string; starred?: boolean };
export type NoteOverride = { title?: string; body_markdown?: string };
export type TalkTrackOverride = { director_framing?: string; staff_framing?: string };

export type CardState = {
  is_deleted: boolean;
  local_override: CardOverride | null;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_due_at: string;
  last_reviewed_at: string | null;
};

// No row yet = never reviewed = due now, no override. A card with no Postgres
// row is exactly as reviewable as one that's been graded ten times — that's
// what lets a brand-new card in a JSON file show up in the queue immediately.
const DEFAULT_CARD_STATE: CardState = {
  is_deleted: false,
  local_override: null,
  ease_factor: 2.5,
  interval_days: 0,
  repetitions: 0,
  next_due_at: new Date(0).toISOString(),
  last_reviewed_at: null,
};

export async function getCardStateMap(): Promise<Map<string, CardState>> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("card_state").select("*");
  if (error) throw error;
  return new Map((data ?? []).map((r) => [r.card_key as string, r as unknown as CardState]));
}

export function resolveCardState(key: string, map: Map<string, CardState>): CardState {
  return map.get(key) ?? DEFAULT_CARD_STATE;
}

export async function getOneCardState(key: string): Promise<CardState> {
  const supabase = supabaseAdmin();
  const { data } = await supabase.from("card_state").select("*").eq("card_key", key).maybeSingle();
  return (data as unknown as CardState) ?? DEFAULT_CARD_STATE;
}

export async function setCardOverride(key: string, override: CardOverride): Promise<void> {
  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("card_state")
    .upsert(
      { card_key: key, local_override: override, updated_at: new Date().toISOString() },
      { onConflict: "card_key" }
    );
  if (error) throw error;
}

export async function clearCardOverride(key: string): Promise<void> {
  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("card_state")
    .upsert(
      { card_key: key, local_override: null, updated_at: new Date().toISOString() },
      { onConflict: "card_key" }
    );
  if (error) throw error;
}

export async function deleteCard(key: string): Promise<void> {
  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("card_state")
    .upsert(
      { card_key: key, is_deleted: true, updated_at: new Date().toISOString() },
      { onConflict: "card_key" }
    );
  if (error) throw error;
}

export async function gradeCard(
  key: string,
  next: { ease_factor: number; interval_days: number; repetitions: number; next_due_at: string },
  quality: number
): Promise<void> {
  const supabase = supabaseAdmin();
  const { error } = await supabase.from("card_state").upsert(
    {
      card_key: key,
      ease_factor: next.ease_factor,
      interval_days: next.interval_days,
      repetitions: next.repetitions,
      next_due_at: next.next_due_at,
      last_reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "card_key" }
  );
  if (error) throw error;
  await supabase.from("review_log").insert({ card_key: key, quality });
}

export type NoteState = { is_deleted: boolean; local_override: NoteOverride | null };
const DEFAULT_NOTE_STATE: NoteState = { is_deleted: false, local_override: null };

export async function getNoteStateMap(): Promise<Map<string, NoteState>> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("note_state").select("*");
  if (error) throw error;
  return new Map((data ?? []).map((r) => [r.note_key as string, r as unknown as NoteState]));
}

export function resolveNoteState(key: string, map: Map<string, NoteState>): NoteState {
  return map.get(key) ?? DEFAULT_NOTE_STATE;
}

export async function getOneNoteState(key: string): Promise<NoteState> {
  const supabase = supabaseAdmin();
  const { data } = await supabase.from("note_state").select("*").eq("note_key", key).maybeSingle();
  return (data as unknown as NoteState) ?? DEFAULT_NOTE_STATE;
}

export async function setNoteOverride(key: string, override: NoteOverride): Promise<void> {
  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("note_state")
    .upsert(
      { note_key: key, local_override: override, updated_at: new Date().toISOString() },
      { onConflict: "note_key" }
    );
  if (error) throw error;
}

export async function clearNoteOverride(key: string): Promise<void> {
  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("note_state")
    .upsert(
      { note_key: key, local_override: null, updated_at: new Date().toISOString() },
      { onConflict: "note_key" }
    );
  if (error) throw error;
}

export async function deleteNote(key: string): Promise<void> {
  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("note_state")
    .upsert(
      { note_key: key, is_deleted: true, updated_at: new Date().toISOString() },
      { onConflict: "note_key" }
    );
  if (error) throw error;
}

export type TalkTrackState = { is_deleted: boolean; local_override: TalkTrackOverride | null };
const DEFAULT_TALK_TRACK_STATE: TalkTrackState = { is_deleted: false, local_override: null };

export async function getTalkTrackStateMap(): Promise<Map<string, TalkTrackState>> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("talk_track_state").select("*");
  if (error) throw error;
  return new Map((data ?? []).map((r) => [r.section_key as string, r as unknown as TalkTrackState]));
}

export function resolveTalkTrackState(
  key: string,
  map: Map<string, TalkTrackState>
): TalkTrackState {
  return map.get(key) ?? DEFAULT_TALK_TRACK_STATE;
}

export async function setTalkTrackOverride(key: string, override: TalkTrackOverride): Promise<void> {
  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("talk_track_state")
    .upsert(
      { section_key: key, local_override: override, updated_at: new Date().toISOString() },
      { onConflict: "section_key" }
    );
  if (error) throw error;
}

export async function clearTalkTrackOverride(key: string): Promise<void> {
  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("talk_track_state")
    .upsert(
      { section_key: key, local_override: null, updated_at: new Date().toISOString() },
      { onConflict: "section_key" }
    );
  if (error) throw error;
}

export async function deleteTalkTrack(key: string): Promise<void> {
  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("talk_track_state")
    .upsert(
      { section_key: key, is_deleted: true, updated_at: new Date().toISOString() },
      { onConflict: "section_key" }
    );
  if (error) throw error;
}
