import { defineHandler } from "void";
import type { InferProps } from "void";
import { getUser, requireAuth } from "void/auth";
import { db, desc } from "void/db";
import { questions } from "@schema";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async () => {
  const user = await getUser();

  return {
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      : null,
    questions: await db
      .select()
      .from(questions)
      .orderBy(desc(questions.createdAt)),
  };
});

export const action = defineHandler(async (c) => {
  const user = await requireAuth(c);
  const body = await c.req.parseBody();
  const value = body.text;

  if (typeof value !== "string") return;

  const text = value.trim();

  if (!text) return;

  const authorName = user.name || user.email || "Site visitor";

  await db.insert(questions).values({
    text,
    userId: user.id,
    authorName,
  });
});

