import { z } from 'zod';
import { GAME_KEYS } from '@learn-english/shared';

const gameKeySchema = z.enum(GAME_KEYS);
const bandSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

// A plain string-keyed record, not z.record(gameKeySchema, ...) - a round
// count is only ever written for games actually played, so most keys are
// absent rather than present-with-zero, and zod's record type requires
// every enum key to be present when the key schema is an enum.
export const userStatsOutputSchema = z.object({
  totalScore: z.number(),
  totalCorrect: z.number(),
  totalIncorrect: z.number(),
  bestStreak: z.number(),
  roundsCompleted: z.record(z.string(), z.number()),
  achievements: z.array(z.string()),
  placementBand: bandSchema.optional(),
  placementScore: z.number().optional(),
  placementTotalQuestions: z.number().optional(),
  placementCompletedAt: z.number().optional(),
});

export const statsWithUnlocksOutputSchema = z.object({
  stats: userStatsOutputSchema,
  newlyUnlocked: z.array(z.string()),
});

export const recordAnswerInputSchema = z.object({
  points: z.number().optional(),
  correct: z.boolean(),
  currentStreak: z.number().optional(),
  // Optional so games can be wired to send it incrementally, one at a
  // time, rather than needing a single all-8-games cutover. When present,
  // also upserts a user_word_progress row for this (user, word).
  wordId: z.uuid().optional(),
});

export const recordGameCompletedInputSchema = z.object({
  gameKey: gameKeySchema,
  // Optional session fields - when correctCount/totalCount/score are all
  // present, a practice_sessions row is recorded alongside the existing
  // roundsCompleted increment. Same incremental-rollout reasoning as
  // wordId above. category is separately optional even when the others
  // are sent - Speed Round spans every category, so it has none to report.
  category: z.string().optional(),
  correctCount: z.number().optional(),
  totalCount: z.number().optional(),
  score: z.number().optional(),
  durationSeconds: z.number().optional(),
});

export const savePlacementResultInputSchema = z.object({
  band: bandSchema,
  score: z.number(),
  totalQuestions: z.number(),
});

export type UserStatsOutput = z.infer<typeof userStatsOutputSchema>;
export type StatsWithUnlocksOutput = z.infer<typeof statsWithUnlocksOutputSchema>;
export type RecordAnswerInput = z.infer<typeof recordAnswerInputSchema>;
export type RecordGameCompletedInput = z.infer<typeof recordGameCompletedInputSchema>;
export type SavePlacementResultInput = z.infer<typeof savePlacementResultInputSchema>;
