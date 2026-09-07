import { z } from 'zod';

const bandSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

// Flat scope, no classes - any non-admin user is implicitly one of
// Hodaya's students (see the schema design discussion). lastActiveAt is
// derived from practice_sessions and absent for a student who has never
// completed a round yet.
export const studentListItemOutputSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  displayName: z.string().optional(),
  createdAt: z.number(),
  totalScore: z.number(),
  totalCorrect: z.number(),
  totalIncorrect: z.number(),
  bestStreak: z.number(),
  placementBand: bandSchema.optional(),
  lastActiveAt: z.number().optional(),
});

export const studentListOutputSchema = z.array(studentListItemOutputSchema);

export const getStudentSummaryInputSchema = z.object({
  userId: z.uuid(),
});

export type StudentListItemOutput = z.infer<typeof studentListItemOutputSchema>;
export type GetStudentSummaryInput = z.infer<typeof getStudentSummaryInputSchema>;
