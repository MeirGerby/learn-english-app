import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import "dotenv/config";

function createDatabaseClient(connectionString: string) {
  const pool = new Pool({
    connectionString,
  });

  const db = drizzle({
    client: pool,
  });

  return {
    db,
    pool,
  };
}

export function getDatabaseConnection(connectionString: string) {
  if (!connectionString) {
    throw new Error("A database connection string or DATABASE_URL environment variable is required.");
  }

  return createDatabaseClient(connectionString);
}

export type Database = ReturnType<typeof createDatabaseClient>["db"];
export type DatabasePool = ReturnType<typeof createDatabaseClient>["pool"];
