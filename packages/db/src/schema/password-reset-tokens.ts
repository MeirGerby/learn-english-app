import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";

// tokenHash stores a SHA-256 hash of the raw token sent in the reset
// email, never the token itself - matches how passwordHash never stores
// a plaintext password. One row per requested reset; consumed (deleted)
// on successful use or superseded by a newer request for the same user.
export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("password_reset_tokens_user_id_idx").on(t.userId)],
);
