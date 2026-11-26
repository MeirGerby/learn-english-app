import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// `generate` needs no database and ignores the URL below. `migrate`, `push`
// and `studio` connect: they read the BFF's .env and prefer the direct
// (unpooled) Neon connection, because pooled connections break migrations.
config({
  path: fileURLToPath(
    new URL('../../../apps/english/bff/.env', import.meta.url),
  ),
});

const migrationUrl =
  process.env['DATABASE_URL_UNPOOLED'] ?? process.env['DATABASE_URL'] ?? '';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './migrations',
  dbCredentials: {
    url: migrationUrl,
  },
});
