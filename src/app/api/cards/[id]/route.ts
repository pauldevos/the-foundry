import { requireAuthOr401 } from "@/lib/require-auth";
import { decodeKey } from "@/lib/content";
import { setCardOverride, clearCardOverride, deleteCard } from "@/lib/state";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/cards/[id]">
) {
  const unauthorized = await requireAuthOr401();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const key = decodeKey(id);
  const body = await req.json();

  // "revert" clears the override so the card reads from the file again.
  if (body.revert === true) {
    await clearCardOverride(key);
    return NextResponse.json({ ok: true });
  }

  const override: Record<string, unknown> = {};
  if (typeof body.front === "string") override.front = body.front;
  if (typeof body.back === "string") override.back = body.back;
  if (typeof body.type === "string") override.type = body.type;
  if (typeof body.starred === "boolean") override.starred = body.starred;

  await setCardOverride(key, override);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/cards/[id]">
) {
  const unauthorized = await requireAuthOr401();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  await deleteCard(decodeKey(id));
  return NextResponse.json({ ok: true });
}
