import { pgTable, uuid, text, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// No categories table - the 10 categories/bands/Hebrew labels are a fixed,
// code-level taxonomy (see @learn-english/shared's constants.ts), never
// created/edited at runtime. category is validated at the zod/tRPC layer
// against that shared CategoryKey enum, not a DB foreign key.
//
// No `band` column either - band is a pure function of category
// (CATEGORY_BANDS in packages/shared), so storing both would invite drift.
export const words = pgTable(
  "words",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    category: text("category").notNull(),
    // Frozen at creation, never re-derived from `word` - editing a word's
    // text must not change its slug, or the (idempotent-seeding) seed
    // script would treat it as a missing row and re-insert the original
    // alongside the edit.
    slug: text("slug").notNull(),
    word: text("word").notNull(),
    translation: text("translation").notNull(),
    example: text("example").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    // NULL = active. Archived words disappear from games and browsing but
    // keep every user_word_progress row pointing at them intact - words
    // are archived, never hard-deleted, once student progress exists.
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("words_category_slug_unique").on(t.category, t.slug),
    index("words_category_idx").on(t.category),
    // Every gameplay read filters to active words; a partial index keeps
    // it cheap as the archived set grows.
    index("words_active_category_idx").on(t.category).where(sql`${t.archivedAt} IS NULL`),
  ]
);
