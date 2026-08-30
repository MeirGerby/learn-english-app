import type { Band } from "./types.js";

// Global accuracy across the mixed-difficulty placement test determines
// the band: consistently getting Band 3 questions right requires broad
// mastery, so a high overall score is what unlocks it.
export function scoreToBand(correctCount: number, totalQuestions: number): Band {
  if (totalQuestions === 0) return 1;
  const ratio = correctCount / totalQuestions;
  if (ratio >= 0.75) return 3;
  if (ratio >= 0.4) return 2;
  return 1;
}
