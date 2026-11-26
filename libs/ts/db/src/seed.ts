import { loadBffEnv } from './env-file.js';
import { createDb } from './index.js';
import { words } from './schema.js';
import { WORD_DATA } from './word-data.js';

const BATCH_SIZE = 500;

// The idempotency key is the category plus the slugified word, so the seed
// can run again and only inserts what is missing.
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const { db, client } = createDb({
  connectionString: loadBffEnv(),
  ssl: process.env['DATABASE_SSL'] === 'true',
  max: 1,
});

const rows = Object.entries(WORD_DATA).flatMap(([category, entries]) =>
  entries.map((entry) => ({
    category,
    slug: slugify(entry.word),
    word: entry.word,
    translation: entry.translation,
    example: entry.example,
  })),
);

try {
  console.log(`seed: ${rows.length} words`);

  let inserted = 0;

  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    const batch = rows.slice(start, start + BATCH_SIZE);
    const result = await db
      .insert(words)
      .values(batch)
      .onConflictDoNothing({ target: [words.category, words.slug] })
      .returning({ id: words.id });

    inserted += result.length;
  }

  console.log(
    `seed: ${inserted} new words, ${rows.length - inserted} already existed`,
  );
} finally {
  await client.end();
}
