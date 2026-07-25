/**
 * Standard SM-2 spaced-repetition scheduling.
 * Grading maps from the app's 3-option UI: Recalled -> quality 4, Missed ->
 * quality 1. "Not useful" doesn't go through this at all — it just sets
 * is_deleted directly (a removal, not a grade).
 */

export type SrsState = {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
};

export function nextSrsState(state: SrsState, quality: number): SrsState & { next_due_at: Date } {
  let { ease_factor, interval_days, repetitions } = state;

  if (quality < 3) {
    // Failed recall: reset repetitions and interval, but keep ease factor's
    // long-term memory of how hard this card generally is.
    repetitions = 0;
    interval_days = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval_days = 1;
    else if (repetitions === 2) interval_days = 6;
    else interval_days = Math.round(interval_days * ease_factor);
  }

  ease_factor = Math.max(
    1.3,
    ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const next_due_at = new Date(Date.now() + interval_days * 24 * 60 * 60 * 1000);

  return { ease_factor, interval_days, repetitions, next_due_at };
}

export const GRADE_QUALITY = {
  recalled: 4,
  missed: 1,
} as const;
