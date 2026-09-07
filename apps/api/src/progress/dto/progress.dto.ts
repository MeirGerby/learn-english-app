import { z } from 'zod';
import { GAME_KEYS } from '@learn-english/shared';

const gameKeySchema = z.enum(GAME_KEYS);

export const weakWordOutputSchema = z.object({
  wordId: z.uuid(),
  word: z.string(),
  translation: z.string(),
  timesSeen: z.number(),
  timesCorrect: z.number(),
});

export const recentSessionOutputSchema = z.object({
  id: z.uuid(),
  game: gameKeySchema,
  category: z.string().optional(),
  correctCount: z.number(),
  totalCount: z.number(),
  score: z.number(),
  completedAt: z.number(),
});

export const progressSummaryOutputSchema = z.object({
  wordsPracticed: z.number(),
  // Lowest-accuracy words, minimum 3 attempts (see ProgressRepository -
  // fewer than that and one unlucky miss would dominate the list).
  weakWords: z.array(weakWordOutputSchema),
  recentSessions: z.array(recentSessionOutputSchema),
  // Distinct calendar days (Asia/Jerusalem) with at least one completed
  // round, in the last 7 days.
  practiceDaysThisWeek: z.number(),
});

export type WeakWordOutput = z.infer<typeof weakWordOutputSchema>;
export type RecentSessionOutput = z.infer<typeof recentSessionOutputSchema>;
export type ProgressSummaryOutput = z.infer<typeof progressSummaryOutputSchema>;
