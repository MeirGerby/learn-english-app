import { LogLevel } from '@learn-english/logging';
import { z } from 'zod';

const OptionalText = z
  .string()
  .optional()
  .transform((text) => text || undefined);

export const BaseServerEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(8080),
  LOG_LEVEL: z.enum(LogLevel).default('info'),
  SERVICE_ENVIRONMENT: OptionalText,

  DATABASE_URL: z.url(),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
  DATABASE_SSL: z
    .string()
    .optional()
    .transform((value) => value === 'true'),

  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhd]$/, 'Use a number and a unit, for example 30d')
    .default('30d'),

  // Comma-separated browser origins allowed to call the BFF.
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin !== ''),
    ),
});

export type BaseServerEnv = z.infer<typeof BaseServerEnvSchema>;
