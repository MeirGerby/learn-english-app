import { pgTable, uuid, integer, timestamp, primaryKey, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { words } from "./words.js";

// One row per (user, word), upserted on every answer. The (user_id,
// word_id) pair is the identity - no surrogate id, since a surrogate would
// need a separate unique index on the same pair anyway.
export const userWordProgress = pgTable(
  "user_word_progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // RESTRICT, not cascade: words are archived rather than deleted (see
    // words.archivedAt), so a real delete here means someone bypassed the
    // app - fail loudly rather than silently destroy student history.
    wordId: uuid("word_id")
      .notNull()
      .references(() => words.id, { onDelete: "restrict" }),
    timesSeen: integer("times_seen").notNull().default(0),
    timesCorrect: integer("times_correct").notNull().default(0),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
    // NULL = never answered correctly yet - distinguishable from "not seen".
    lastCorrectAt: timestamp("last_correct_at", { withTimezone: true }),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.wordId] }),
    // Teacher dashboard: "which words does the whole class struggle with"
    // scans by word, which the user-leading PK can't serve.
    index("user_word_progress_word_id_idx").on(t.wordId),
  ]
);
