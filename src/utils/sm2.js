// src/utils/sm2.js

/**
 * Apply the SM-2 algorithm for a single recall rating (0–5).
 * Returns an updated card object with new SM-2 fields.
 */
export function applySM2(card, quality) {
  let { repetitions, interval, easiness } = card;

  if (quality < 3) {
    repetitions = 0;
    interval    = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easiness);
    }
  }

  easiness = Math.max(
    1.3,
    easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const next = new Date();
  next.setDate(next.getDate() + interval);

  return {
    ...card,
    repetitions,
    interval,
    easiness,
    nextReview: next.toISOString().split('T')[0]
  };
}
