import "server-only";
import { verifySession } from "@/lib/session";
import { NextResponse } from "next/server";

/** Real (non-optimistic) auth check for route handlers — proxy.ts only redirects,
 * it doesn't stop a direct API call. Returns a 401 response to short-circuit on,
 * or null if the caller is authenticated. */
export async function requireAuthOr401(): Promise<NextResponse | null> {
  const ok = await verifySession();
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
