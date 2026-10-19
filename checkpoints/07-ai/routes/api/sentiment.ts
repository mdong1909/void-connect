import { defineHandler } from "void";
import { requireAuth } from "void/auth";
import { ai } from "void/ai";
import { db, desc, eq, isNotNull } from "void/db";
import { questions } from "@schema";

type ClefChoiceAnswer = {
  choice?: string;
  label?: string;
  answer?: string;
  value?: string;
  confidence?: number;
  probabilities?: Record<string, number>;
  scores?: Record<string, number>;
};

type ClefResult = {
  answers?: Record<string, string | ClefChoiceAnswer | undefined>;
};

type SentimentAnswer = string | ClefChoiceAnswer | undefined;

function readLabel(answer: SentimentAnswer) {
  if (typeof answer === "string") return answer;
  return answer?.choice || answer?.label || answer?.answer || answer?.value;
}

function readConfidence(answer: SentimentAnswer) {
  return typeof answer === "object" && answer ? (answer.confidence ?? null) : null;
}

function readProbabilities(answer: SentimentAnswer) {
  if (typeof answer !== "object" || !answer) return {};
  return answer.probabilities || answer.scores || {};
}

const sentimentCriteria = {
  positive: "Curious, excited, appreciative, or optimistic.",
  neutral: "Informational, factual, or mixed without strong emotion.",
  negative: "Frustrated, confused, skeptical, disappointed, or worried.",
};

function normalizeLabel(label: string | undefined) {
  const value = label?.toLowerCase().trim();
  if (value === "positive" || value === "neutral" || value === "negative") {
    return value;
  }
  return "unknown";
}

export const GET = defineHandler(async (c) => {
  await requireAuth(c);
  c.header("Cache-Control", "no-store");
  const saved = await db.select().from(questions).where(isNotNull(questions.sentiment));
  return c.json({
    classifications: saved.map((question) => ({
      id: String(question.id),
      label: question.sentiment!,
      confidence: question.sentimentConfidence,
    })),
  });
});

export const POST = defineHandler(async (c) => {
  await requireAuth(c);
  const currentQuestions = await db.select().from(questions).orderBy(desc(questions.createdAt));

  if (currentQuestions.length === 0) {
    return {
      questionCount: 0,
      classifications: [],
    };
  }

  const clefQuestions = Object.fromEntries(
    currentQuestions.map((question, index) => [
      `question_${index}`,
      {
        type: "choice",
        instructions: `Classify the sentiment of this question: "${question.text}"`,
        criteria: sentimentCriteria,
      },
    ]),
  );

  const result = (await ai.run("@cf/cloudflare/clef" as string, {
    model: "clef",
    state: {
      event: "Live conference Q&A",
      questions: currentQuestions.map((question, index) => ({
        number: index + 1,
        text: question.text,
      })),
    },
    questions: clefQuestions,
  })) as ClefResult;

  const classifications = [];
  for (const [index, question] of currentQuestions.entries()) {
    const answer = result.answers?.[`question_${index}`];
    const label = normalizeLabel(readLabel(answer));
    const confidence = readConfidence(answer);

    await db
      .update(questions)
      .set({ sentiment: label, sentimentConfidence: confidence })
      .where(eq(questions.id, question.id));

    classifications.push({
      id: String(question.id),
      label,
      confidence,
      probabilities: readProbabilities(answer),
    });
  }

  return { questionCount: currentQuestions.length, classifications };
});
