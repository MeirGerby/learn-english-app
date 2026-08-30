import { pgTable, uuid, text, uniqueIndex, index } from "drizzle-orm/pg-core";

// No categories table - the 10 categories/bands/Hebrew labels are a fixed,
// code-level taxonomy (see @learn-english/shared's constants.ts), never
// created/edited at runtime. category is validated at the zod/tRPC layer
// against that shared CategoryKey enum, not a DB foreign key.
export const words = pgTable(
  "words",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    category: text("category").notNull(),
    slug: text("slug").notNull(), // slugified word, for idempotent seeding
    word: text("word").notNull(),
    translation: text("translation").notNull(),
    example: text("example").notNull(),
  },
  (t) => [
    uniqueIndex("words_category_slug_unique").on(t.category, t.slug),
    index("words_category_idx").on(t.category),
  ]
);
