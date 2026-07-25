# The Foundry

Paul's interview-prep knowledge base for AI Director / Head of AI and Principal-Staff AI
Engineer roles, plus the private app he reads and reviews it through.

- **`learning/`** — the content itself: flashcard decks, long-form notes, and talk tracks,
  built through live working sessions with Claude. See `CLAUDE.md` for the full system.
- **`src/`, `proxy.ts`, `supabase/`** — a passcode-gated Next.js app (spaced-repetition
  review, search, mobile-friendly reading) built directly on top of `learning/`. It reads
  content live from these files — no sync step, no second repo. See `CLAUDE.md`'s "The
  Study App" section for the architecture.

## App setup

```bash
npm install
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SESSION_SECRET (openssl rand -base64 32), APP_PASSCODE
```

Run `supabase/schema.sql` against a Supabase project once (SQL Editor, or `psql`), then:

```bash
npm run dev   # http://localhost:3000
```

## Deploy

Push to GitHub, import into Vercel, set the same env vars there. Every push redeploys and
picks up any `learning/` changes automatically — nothing to run manually.
