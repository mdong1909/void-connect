import { defineHandler } from "void";
import type { InferProps } from "void";
import { getUser } from "void/auth";
import { db, desc } from "void/db";
import { questions } from "@schema";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c) => {
  const user = await getUser();

  if (!user) {
    return c.redirect("/login");
  }

  return {
    user: {
      id: user.id,
      name: user.email || user.name,
      email: user.email,
    },
    questions: await db.select().from(questions).orderBy(desc(questions.createdAt)),
  };
});

export const action = defineHandler(async (c) => {
  const body = await c.req.json<{ text?: unknown; authorName?: unknown }>();
  const value = body.text;
  const authorValue = body.authorName;

  if (typeof value !== "string") return;

  const text = value.trim();
  const authorName =
    typeof authorValue === "string" && authorValue.trim()
      ? authorValue.trim()
      : "Anonymous Visitor";

  if (!text) return;

  await db.insert(questions).values({ text, authorName });
});
