import { requireAuthOr401 } from "@/lib/require-auth";
import { decodeKey } from "@/lib/content";
import { getOneCardState, gradeCard } from "@/lib/state";
import { nextSrsState, GRADE_QUALITY } from "@/lib/srs";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  ctx: RouteContext<"/api/cards/[id]/grade">
) {
  const unauthorized = await requireAuthOr401();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const key = decodeKey(id);
  const body = await req.json();
  const grade = body.grade as "recalled" | "missed";
  if (grade !== "recalled" && grade !== "missed") {
    return NextResponse.json({ error: "grade must be 'recalled' or 'missed'" }, { status: 400 });
  }

  const current = await getOneCardState(key);
  const quality = GRADE_QUALITY[grade];
  const next = nextSrsState(
    {
      ease_factor: current.ease_factor,
      interval_days: current.interval_days,
      repetitions: current.repetitions,
    },
    quality
  );

  await gradeCard(
    key,
    {
      ease_factor: next.ease_factor,
      interval_days: next.interval_days,
      repetitions: next.repetitions,
      next_due_at: next.next_due_at.toISOString(),
    },
    quality
  );

  return NextResponse.json({ ok: true, nextDueAt: next.next_due_at });
}
