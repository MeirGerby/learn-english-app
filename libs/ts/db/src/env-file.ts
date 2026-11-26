import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

// The migrate and seed scripts read the BFF's .env, so one file configures
// the database for both. An exported variable still wins.
export function loadBffEnv(): string {
  config({
    path: fileURLToPath(
      new URL('../../../../apps/english/bff/.env', import.meta.url),
    ),
  });

  const connectionString =
    process.env['DATABASE_URL_UNPOOLED'] ?? process.env['DATABASE_URL'];

  if (!connectionString) {
    console.error(
      'No DATABASE_URL_UNPOOLED and no DATABASE_URL. Set one in apps/english/bff/.env, or export it.',
    );
    process.exit(1);
  }

  return connectionString;
}
