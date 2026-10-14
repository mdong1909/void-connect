import { sql } from "void/db";
import { integer, sqliteTable, text } from "void/schema-d1";

export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  authorName: text("author_name").notNull().default("Anonymous Visitor"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

