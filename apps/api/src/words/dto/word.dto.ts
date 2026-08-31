import { z } from 'zod';

export const listWordsByCategoryInputSchema = z.object({
  category: z.string(),
});

export const wordOutputSchema = z.object({
  id: z.uuid(),
  category: z.string(),
  slug: z.string(),
  word: z.string(),
  translation: z.string(),
  example: z.string(),
});

export const wordListOutputSchema = z.array(wordOutputSchema);

export type ListWordsByCategoryInput = z.infer<typeof listWordsByCategoryInputSchema>;
export type WordOutput = z.infer<typeof wordOutputSchema>;
