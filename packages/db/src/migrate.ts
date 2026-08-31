import "dotenv/config";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { getDatabaseConnection } from "./client.js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required.");
}
const { db, pool } = getDatabaseConnection(connectionString);

async function runMigrations() {
  console.log("Running migrations...");

  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log("Migrations completed successfully!");
}

runMigrations()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
