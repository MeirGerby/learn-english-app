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
});

export const recordGameCompletedInputSchema = z.object({
  gameKey: gameKeySchema,
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
