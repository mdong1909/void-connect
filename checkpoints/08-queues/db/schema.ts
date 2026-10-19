import { sql } from "void/db";
import { integer, real, sqliteTable, text } from "void/schema-d1";

export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  authorName: text("author_name").notNull().default("Anonymous Visitor"),
  imageKey: text("image_key"),
  sentiment: text("sentiment"),
  sentimentConfidence: real("sentiment_confidence"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const questionSentiments = sqliteTable("question_sentiments", {
  questionId: integer("question_id")
    .primaryKey()
    .references(() => questions.id, { onDelete: "cascade" }),
  jobId: text("job_id").notNull(),
  status: text("status").notNull().default("queued"),
  label: text("label"),
  confidence: real("confidence"),
  attempts: integer("attempts").notNull().default(0),
});
