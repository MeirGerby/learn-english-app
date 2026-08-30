import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const courseItems = pgTable("course_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").notNull(), // "video" | "image", enforced at the zod/tRPC layer
  url: text("url").notNull(),
  caption: text("caption").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
