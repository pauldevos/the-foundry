import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client, server-only. This is a single-user (passcode-gated) app —
// access control happens at the app layer (proxy.ts + verifySession), not via
// Postgres RLS, so the service role key is appropriate here and must never be
// exposed to the client.
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
