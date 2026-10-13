import { sendEmail } from "void/email";
import { env } from "../env";

type NotifyQuestionOptions = {
  authorName: string;
  authorEmail?: string | null;
  text: string;
};

export async function notifyQuestion({
  authorName,
  authorEmail,
  text,
}: NotifyQuestionOptions) {
  if (!env.NOTIFICATION_EMAIL) return;

  try {
    const result = await sendEmail({
      to: env.NOTIFICATION_EMAIL,
      replyTo: authorEmail
        ? { email: authorEmail, name: authorName }
        : undefined,
      subject: "New Live Q&A question",
      text: [
        `New question from ${authorName}:`,
        "",
        text,
        "",
        "Open the Live Q&A app to answer it during the session.",
      ].join("\n"),
    });

    if (!result.ok) {
      console.warn(
        "Question notification email failed",
        "error" in result ? result.error : result.deliveries,
      );
    }
  } catch (reason) {
    console.warn(
      "Question notification email failed",
      reason instanceof Error ? reason.message : reason,
    );
  }
}
