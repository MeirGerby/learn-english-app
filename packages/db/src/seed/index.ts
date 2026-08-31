import "dotenv/config";
import * as dotenv from "dotenv";
import * as path from "path";
import { WORD_DATA } from "@learn-english/shared";
import type { CategoryKey, WordEntry } from "@learn-english/shared";
import { getDatabaseConnection } from "../client.js";
import { words } from "../schema/index.js";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required.");
}
const { db, pool } = getDatabaseConnection(connectionString);

// Same idempotency key the old Firestore import used (category + slugified
// word as the doc id) - upsert semantics, safe to re-run.
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const BATCH_SIZE = 500;

async function seedWords() {
  const rows = (Object.entries(WORD_DATA) as [CategoryKey, WordEntry[]][]).flatMap(([category, entries]) =>
    entries.map((entry) => ({
      category,
      slug: slugify(entry.word),
      word: entry.word,
      translation: entry.translation,
      example: entry.example,
    }))
  );

  console.log(`Seeding ${rows.length} words...`);

  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const result = await db
      .insert(words)
      .values(batch)
      .onConflictDoNothing({ target: [words.category, words.slug] })
      .returning({ id: words.id });
    inserted += result.length;
    console.log(`  batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.length}/${batch.length} new rows`);
  }

  console.log(`Done - ${inserted} new words inserted, ${rows.length - inserted} already existed.`);
}

seedWords()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
