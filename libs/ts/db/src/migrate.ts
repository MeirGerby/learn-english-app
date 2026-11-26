import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { loadBffEnv } from './env-file.js';
import { createDb } from './index.js';

const { db, client } = createDb({
  connectionString: loadBffEnv(),
  ssl: process.env['DATABASE_SSL'] === 'true',
  max: 1,
});

try {
  await migrate(db, {
    migrationsFolder: fileURLToPath(new URL('../migrations', import.meta.url)),
  });
  console.log('migrate: the database is up to date');
} finally {
  await client.end();
}
