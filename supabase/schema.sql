-- Foundry Study app schema.
--
-- Content (decks, cards, notes, talk tracks) is NOT stored here — it lives in
-- learning/ in this same repo and is read live from the filesystem at request
-- time (see src/lib/content.ts). There is no sync step and no content table to
-- keep in sync: the moment a file changes and Vercel redeploys, the app sees it.
--
-- Postgres holds only the things that have no file equivalent: spaced-repetition
-- state, and in-app edit/delete overrides layered on top of file content. Every
-- state row is keyed by a stable string derived from the content's file path
-- (see keyFor* in src/lib/content.ts), not a DB-generated id — so state can be
-- written for a card/note/section before any row exists for it (upsert), and a
-- brand-new card in a JSON file is immediately reviewable with default SRS state
-- even though Postgres has never seen it.

create table card_state (
  card_key text primary key,               -- "decks/rag-architecture.json#3"
  is_deleted boolean not null default false,
  local_override jsonb,                    -- {front?, back?, type?, starred?}
  ease_factor real not null default 2.5,
  interval_days real not null default 0,
  repetitions int not null default 0,
  next_due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table review_log (
  id uuid primary key default gen_random_uuid(),
  card_key text not null,
  quality int not null,                    -- SM-2 quality 0-5 (we use 1 or 4, see lib/srs.ts)
  reviewed_at timestamptz not null default now()
);

create table note_state (
  note_key text primary key,               -- the note's source_path, e.g. "notes/rag-pipeline/04-retrieval.md"
  is_deleted boolean not null default false,
  local_override jsonb,                    -- {title?, body_markdown?}
  updated_at timestamptz not null default now()
);

create table talk_track_state (
  section_key text primary key,            -- "talk-tracks/rag-pipeline.md#2"
  is_deleted boolean not null default false,
  local_override jsonb,                    -- {director_framing?, staff_framing?}
  updated_at timestamptz not null default now()
);

create index card_state_next_due_idx on card_state (next_due_at) where is_deleted = false;
