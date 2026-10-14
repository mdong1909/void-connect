import { sendEmail } from "void/email";

type SendQuestionSummaryEmailOptions = {
  recipientEmail: string;
  questionCount: number;
};

function questionLabel(count: number) {
  return count === 1 ? "question" : "questions";
}

export async function sendQuestionSummaryEmail({
  recipientEmail,
  questionCount,
}: SendQuestionSummaryEmailOptions) {
  const label = questionLabel(questionCount);
  const result = await sendEmail({
    to: recipientEmail,
    subject: `Live Q&A summary: ${questionCount} ${label}`,
    text: [
      `There ${questionCount === 1 ? "is" : "are"} ${questionCount} ${label} submitted in the Live Q&A queue.`,
      "",
      "Open the app to review the current queue before answering live.",
    ].join("\n"),
  });

  if (!result.ok) {
    console.warn(
      "Question summary email failed",
      "error" in result ? result.error : result.deliveries,
    );
    throw new Error("Question summary email failed.");
  }
}
