import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

type CreateDbOptions = {
  connectionString: string;
  ssl?: boolean;
  max?: number;
};

export const createDb = ({
  connectionString,
  ssl,
  max = 10,
}: CreateDbOptions) => {
  // `prepare: false` because Neon's pooled endpoint is PgBouncer in
  // transaction mode, which cannot keep prepared statements between queries.
  // When `ssl` is not set, postgres-js follows the URL's `sslmode`.
  const client = postgres(connectionString, {
    max,
    // postgres-js reads the URL only when the key is absent, not undefined.
    ...(ssl ? { ssl } : {}),
    prepare: false,
  });
  const db = drizzle(client, { schema });

  return { db, client };
};

export type Db = ReturnType<typeof createDb>['db'];

export type User = typeof schema.users.$inferSelect;

export * from './schema.js';
