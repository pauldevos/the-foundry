import { requireAuthOr401 } from "@/lib/require-auth";
import { decodeKey } from "@/lib/content";
import { setNoteOverride, clearNoteOverride, deleteNote } from "@/lib/state";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/notes/[id]">
) {
  const unauthorized = await requireAuthOr401();
  if (unauthorized) return unauthorized;
  const { id } = await ctx.params;
  const key = decodeKey(id);
  const body = await req.json();

  if (body.revert === true) {
    await clearNoteOverride(key);
    return NextResponse.json({ ok: true });
  }

  const override: Record<string, unknown> = {};
  if (typeof body.title === "string") override.title = body.title;
  if (typeof body.body_markdown === "string") override.body_markdown = body.body_markdown;

  await setNoteOverride(key, override);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/notes/[id]">
) {
  const unauthorized = await requireAuthOr401();
  if (unauthorized) return unauthorized;
  const { id } = await ctx.params;
  await deleteNote(decodeKey(id));
  return NextResponse.json({ ok: true });
}
