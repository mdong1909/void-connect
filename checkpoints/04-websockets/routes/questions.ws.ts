import * as v from "valibot";
import { defineRoom } from "void/ws";
import { db, desc } from "void/db";
import { questions } from "@schema";

const ClientMessage = v.object({
  type: v.literal("questions.refresh"),
});

const QuestionMessage = v.object({
  id: v.number(),
  text: v.string(),
  authorName: v.optional(v.nullable(v.string())),
  imageKey: v.nullable(v.string()),
  createdAt: v.string(),
});

const ServerMessage = v.object({
  type: v.literal("questions.snapshot"),
  questions: v.array(QuestionMessage),
});

export default defineRoom({
  messages: {
    client: ClientMessage,
    server: ServerMessage,
  },
  async onConnect(ctx) {
    await ctx.connection.send({
      type: "questions.snapshot",
      questions: await db.select().from(questions).orderBy(desc(questions.createdAt)),
    });
  },
  async onMessage(ctx) {
    await ctx.room.broadcast({
      type: "questions.snapshot",
      questions: await db.select().from(questions).orderBy(desc(questions.createdAt)),
    });
  },
});
