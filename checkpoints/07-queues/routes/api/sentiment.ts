import { defineHandler } from "void";
import { requireAuth } from "void/auth";
import { db, and, eq, isNull, isNotNull } from "void/db";
import { queues } from "void/queues";
import { questions, questionSentiments } from "@schema";

export const GET = defineHandler(async (c) => {
  await requireAuth(c);
  c.header("Cache-Control", "no-store");
  const saved = await db.select().from(questions).where(isNotNull(questions.sentiment));
  return c.json({
    jobs: await db.select().from(questionSentiments),
    classifications: saved.map((question) => ({
      id: String(question.id),
      label: question.sentiment!,
      confidence: question.sentimentConfidence,
    })),
  });
});

export const POST = defineHandler(async (c) => {
  await requireAuth(c);
  const currentQuestions = await db
    .select({ id: questions.id })
    .from(questions)
    .where(isNull(questions.sentiment));
  let queued = 0;
  let failed = 0;

  for (const question of currentQuestions) {
    const jobId = crypto.randomUUID();
    const [job] = await db
      .insert(questionSentiments)
      .values({ questionId: question.id, jobId, status: "queued" })
      .onConflictDoUpdate({
        target: questionSentiments.questionId,
        set: { jobId, status: "queued", label: null, confidence: null, attempts: 0 },
        setWhere: eq(questionSentiments.status, "failed"),
      })
      .returning();

    // Existing active or completed work does not need another job.
    if (!job) continue;

    try {
      await queues.sentiment.send({ questionId: question.id, jobId });
      queued += 1;
    } catch {
      await db
        .update(questionSentiments)
        .set({ status: "failed" })
        .where(
          and(
            eq(questionSentiments.questionId, question.id),
            eq(questionSentiments.jobId, jobId),
            eq(questionSentiments.status, "queued"),
          ),
        );
      failed += 1;
    }
  }

  return c.json({ queued, failed }, failed ? 503 : 202);
});
