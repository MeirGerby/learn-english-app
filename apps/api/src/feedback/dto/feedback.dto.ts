import { z } from 'zod';

export const feedbackOutputSchema = z.object({
  id: z.uuid(),
  text: z.string(),
  authorEmail: z.email(),
  createdAt: z.number(),
});

export const feedbackListOutputSchema = z.array(feedbackOutputSchema);

export const createFeedbackInputSchema = z.object({
  text: z.string().trim().min(1).max(2000),
});

export const removeFeedbackInputSchema = z.object({
  id: z.uuid(),
});

export type FeedbackOutput = z.infer<typeof feedbackOutputSchema>;
export type CreateFeedbackInput = z.infer<typeof createFeedbackInputSchema>;
export type RemoveFeedbackInput = z.infer<typeof removeFeedbackInputSchema>;
