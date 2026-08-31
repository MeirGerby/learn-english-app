import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";

// PDF content stored as base64 text rather than a native bytea column -
// avoids needing a custom Drizzle column type and any driver-specific
// bytea encoding quirks, at the cost of ~33% storage overhead. Fine at
// this app's scale (a teacher's worksheets, not bulk file storage).
export const materials = pgTable(
  "materials",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    filename: text("filename").notNull(),
    caption: text("caption").notNull().default(""),
    fileSize: integer("file_size").notNull(),
    fileDataBase64: text("file_data_base64").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("materials_created_at_idx").on(t.createdAt)],
);
