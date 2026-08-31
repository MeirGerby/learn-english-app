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

export const requestPasswordResetInputSchema = z.object({
  email: z.email(),
});

export const resetPasswordInputSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

export const changePasswordInputSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type AuthUserOutput = z.infer<typeof authUserOutputSchema>;
export type AuthOutput = z.infer<typeof authOutputSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetInputSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>;
