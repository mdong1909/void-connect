import * as v from "valibot";
import { defineRoom } from "void/ws";
import { db, desc } from "void/db";
import { questions } from "@schema";

const ClientMessage = v.variant("type", [
  v.object({
    type: v.literal("question.create"),
    text: v.string(),
  }),
]);

const QuestionMessage = v.object({
  id: v.number(),
  text: v.string(),
  userId: v.nullable(v.string()),
  authorName: v.string(),
  createdAt: v.string(),
});

const ServerMessage = v.variant("type", [
  v.object({
    type: v.literal("questions.snapshot"),
    questions: v.array(QuestionMessage),
  }),
  v.object({
    type: v.literal("question.created"),
    question: QuestionMessage,
  }),
]);

export default defineRoom({
  messages: {
    client: ClientMessage,
    server: ServerMessage,
  },
  onBeforeConnect(ctx) {
    if (!ctx.user) {
      return new Response("Sign in required", { status: 401 });
    }
  },
  async onConnect(ctx) {
    const currentQuestions = await db
      .select()
      .from(questions)
      .orderBy(desc(questions.createdAt));

    await ctx.connection.send({
      type: "questions.snapshot",
      questions: currentQuestions,
    });
  },
  async onMessage(ctx, event) {
    const text = event.text.trim();

    if (!text) return;

    const authorName = ctx.user!.name || ctx.user!.email || "Site visitor";
    const [question] = await db
      .insert(questions)
      .values({
        text,
        userId: ctx.user!.id,
        authorName,
      })
      .returning();

    await ctx.room.broadcast({
      type: "question.created",
      question,
    });
  },
});
