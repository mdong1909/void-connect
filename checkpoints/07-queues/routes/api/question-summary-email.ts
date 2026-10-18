import { defineHandler } from "void";
import { requireAuth } from "void/auth";
import { db } from "void/db";
import { questions } from "@schema";
import { sendQuestionSummaryEmail } from "../../lib/question-summary-email";

type ErrorResponseOptions = {
  status: number;
  message: string;
};

function errorResponse({ status, message }: ErrorResponseOptions) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

export const POST = defineHandler(async (c) => {
  const user = await requireAuth(c);
  const recipientEmail = user.email;

  if (!recipientEmail) {
    return errorResponse({
      status: 400,
      message: "Your account needs an email address before sending a summary.",
    });
  }

  const currentQuestions = await db.select().from(questions);
  const questionCount = currentQuestions.length;

  try {
    await sendQuestionSummaryEmail({
      recipientEmail,
      questionCount,
    });
  } catch {
    return errorResponse({
      status: 500,
      message: "Could not send the question summary email.",
    });
  }

  return {
    ok: true,
    recipientEmail,
    questionCount,
  };
});
