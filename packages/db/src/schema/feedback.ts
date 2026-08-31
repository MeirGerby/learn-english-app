import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";

// Admin-only "notes to self" log (not student-submitted feedback) - only
// reachable from the admin panel. authorId is a proper FK now that real
// user rows exist (an improvement over the old denormalized authorEmail
// string); the router joins to users to produce authorEmail for display.
export const feedback = pgTable("feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  text: text("text").notNull(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
