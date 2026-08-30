import { z } from 'zod';

export const registerInputSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(200),
});

export const loginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const authUserOutputSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  isAdmin: z.boolean(),
});

export const authOutputSchema = z.object({
  user: authUserOutputSchema,
  token: z.string(),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type AuthUserOutput = z.infer<typeof authUserOutputSchema>;
export type AuthOutput = z.infer<typeof authOutputSchema>;
