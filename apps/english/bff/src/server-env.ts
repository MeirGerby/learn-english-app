import 'dotenv/config';
import { baseServerEnv } from '@learn-english/bff';
import { z } from 'zod';

const ServerEnvSchema = baseServerEnv.extend({
  ADMIN_EMAILS: z
    .string()
    .default('')
    .transform((value) =>
      value
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email !== ''),
    ),
  FRONTEND_URL: z.url().default('http://localhost:5173/learn-english-app'),
  RESEND_API_KEY: z
    .string()
    .optional()
    .transform((key) => key || undefined),
  RESEND_FROM_EMAIL: z.string().default('onboarding@resend.dev'),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

export function loadServerEnv(
  source: NodeJS.ProcessEnv = process.env,
): ServerEnv {
  return ServerEnvSchema.parse(source);
}
