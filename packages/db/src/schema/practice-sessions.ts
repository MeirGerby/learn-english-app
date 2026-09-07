import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { desc } from "drizzle-orm";
import { users } from "./users.js";

// One row per completed game round (not per answer - see the design
// discussion for why per-round was chosen). Powers activity history,
// daily streaks, and per-game/per-category trends over time - all of
// which user_stats' lifetime scalars can't answer.
export const practiceSessions = pgTable(
  "practice_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    game: text("game").notNull(), // GameKey, validated at the zod/tRPC layer
    // NULL = not category-scoped. Speed Round deliberately draws from
    // every category, so it has no single category to record.
    category: text("category"),
    correctCount: integer("correct_count").notNull(),
    totalCount: integer("total_count").notNull(),
    score: integer("score").notNull(),
    // Client-reported, optional. Server owns completedAt; a client-sent
    // startedAt would be clock-skew prone for no real benefit.
    durationSeconds: integer("duration_seconds"),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    // Dominant query: one student's recent activity + daily-streak
    // derivation. Streaks must be computed with `completed_at AT TIME
    // ZONE 'Asia/Jerusalem'`, not a bare UTC date, or a late-night session
    // lands on the wrong day.
    index("practice_sessions_user_completed_idx").on(t.userId, desc(t.completedAt)),
    // Teacher dashboard: recent activity across all students / "who's
    // gone quiet".
    index("practice_sessions_completed_idx").on(desc(t.completedAt)),
  ]
);
