import { z } from 'zod';

export const courseItemTypeSchema = z.enum(['video', 'image']);

export const courseItemOutputSchema = z.object({
  id: z.uuid(),
  type: courseItemTypeSchema,
  url: z.url(),
  caption: z.string(),
  createdAt: z.number(),
});

export const courseItemListOutputSchema = z.array(courseItemOutputSchema);

export const addCourseItemInputSchema = z.object({
  type: courseItemTypeSchema,
  url: z.url(),
  caption: z.string().trim().min(1).max(300),
});

export const removeCourseItemInputSchema = z.object({
  id: z.uuid(),
});

export type CourseItemOutput = z.infer<typeof courseItemOutputSchema>;
export type AddCourseItemInput = z.infer<typeof addCourseItemInputSchema>;
export type RemoveCourseItemInput = z.infer<typeof removeCourseItemInputSchema>;
