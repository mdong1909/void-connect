import { defineScheduled } from "void";
import { count, db, sql } from "void/db";
import { questions } from "@schema";
import { sendQuestionSummaryEmail } from "../lib/question-summary-email";

// Every five minutes: :00, :05, :10, and so on.
export const cron = "*/5 * * * *";

export default defineScheduled(async () => {
  // Void Auth stores registered app users in the existing "user" table.
  const recipients = await db.select({ email: sql<string>`"email"` }).from(sql`"user"`);
  if (recipients.length === 0) return;

  const [summary] = await db.select({ questionCount: count() }).from(questions);
  let failed = 0;

  for (const { email } of recipients) {
    try {
      await sendQuestionSummaryEmail({
        recipientEmail: email,
        questionCount: summary.questionCount,
      });
    } catch {
      // A failed delivery must not prevent the remaining users from receiving theirs.
      failed += 1;
    }
  }

  if (failed > 0) {
    throw new Error(`Could not send summaries to ${failed} of ${recipients.length} users.`);
  }
});
