import { defineQueue } from "void";
import { db, and, eq, ne, inArray } from "void/db";
import { questions, questionSentiments } from "@schema";
import { classifyQuestion } from "../lib/classify-question";

type Message = { questionId: number; jobId: string };

export const maxBatchSize = 1;
export const maxBatchTimeout = 1;
export const maxRetries = 3;
export const retryDelay = 10;

export default defineQueue<Message>(async (batch) => {
  for (const message of batch.messages) {
    const { questionId, jobId } = message.body;
    const currentJob = and(
      eq(questionSentiments.questionId, questionId),
      eq(questionSentiments.jobId, jobId),
      ne(questionSentiments.status, "complete"),
    );
    const [job] = await db.select().from(questionSentiments).where(currentJob);

    // Ignore completed jobs and deliveries from a superseded job.
    if (!job) {
      message.ack();
      continue;
    }

    try {
      await db
        .update(questionSentiments)
        .set({ status: "processing", attempts: message.attempts })
        .where(currentJob);
      const [question] = await db.select().from(questions).where(eq(questions.id, questionId));
      if (!question) {
        message.ack();
        continue;
      }

      const result = await classifyQuestion(question.text);
      // Save the question and complete its current job together.
      await db.batch([
        db
          .update(questions)
          .set({ sentiment: result.label, sentimentConfidence: result.confidence })
          .where(
            inArray(
              questions.id,
              db
                .select({ id: questionSentiments.questionId })
                .from(questionSentiments)
                .where(currentJob),
            ),
          ),
        db
          .update(questionSentiments)
          .set({ ...result, status: "complete", attempts: message.attempts })
          .where(currentJob),
      ]);
      message.ack();
    } catch (error) {
      console.error("Sentiment job failed", { jobId, attempt: message.attempts, error });
      const exhausted = message.attempts >= maxRetries + 1;
      await db
        .update(questionSentiments)
        .set({ status: exhausted ? "failed" : "retrying", attempts: message.attempts })
        .where(currentJob);
      if (exhausted) message.ack();
      else message.retry({ delaySeconds: retryDelay });
    }
  }
});
