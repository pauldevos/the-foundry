import { requireAuthOr401 } from "@/lib/require-auth";
import { decodeKey } from "@/lib/content";
import { setTalkTrackOverride, clearTalkTrackOverride, deleteTalkTrack } from "@/lib/state";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/talk-tracks/[id]">
) {
  const unauthorized = await requireAuthOr401();
  if (unauthorized) return unauthorized;
  const { id } = await ctx.params;
  const key = decodeKey(id);
  const body = await req.json();

  if (body.revert === true) {
    await clearTalkTrackOverride(key);
    return NextResponse.json({ ok: true });
  }

  const override: Record<string, unknown> = {};
  if (typeof body.director_framing === "string") override.director_framing = body.director_framing;
  if (typeof body.staff_framing === "string") override.staff_framing = body.staff_framing;

  await setTalkTrackOverride(key, override);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/talk-tracks/[id]">
) {
  const unauthorized = await requireAuthOr401();
  if (unauthorized) return unauthorized;
  const { id } = await ctx.params;
  await deleteTalkTrack(decodeKey(id));
  return NextResponse.json({ ok: true });
}
