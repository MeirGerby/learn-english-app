import { pgTable, uuid, integer, jsonb, text, smallint, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users.js";

// roundsCompleted as jsonb and achievements as a text[] (not normalized
// tables) - both are small, code-defined enums, and the app always
// reads/writes the whole stats object as one shape. A normalized model
// would need a join+aggregation on every read for no benefit at this
// app's scale (a teacher + a handful of students, not a multi-tenant
// SaaS with real concurrent-writer contention).
export const userStats = pgTable("user_stats", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  totalScore: integer("total_score").notNull().default(0),
  totalCorrect: integer("total_correct").notNull().default(0),
  totalIncorrect: integer("total_incorrect").notNull().default(0),
  bestStreak: integer("best_streak").notNull().default(0),
  roundsCompleted: jsonb("rounds_completed").notNull().default({}),
  achievements: text("achievements")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  placementBand: smallint("placement_band"),
  placementScore: integer("placement_score"),
  placementTotalQuestions: integer("placement_total_questions"),
  placementCompletedAt: timestamp("placement_completed_at", { withTimezone: true }),
});
