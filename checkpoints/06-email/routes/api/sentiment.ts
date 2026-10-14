import { defineHandler } from "void";
import { ai } from "void/ai";
import { requireAuth } from "void/auth";
import { db, desc } from "void/db";
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
  return typeof answer === "object" && answer ? answer.confidence ?? null : null;
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

export const POST = defineHandler(async (c) => {
  await requireAuth(c);

  const currentQuestions = await db
    .select()
    .from(questions)
    .orderBy(desc(questions.createdAt));

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

  return {
    questionCount: currentQuestions.length,
    classifications: currentQuestions.map((question, index) => {
      const answer = result.answers?.[`question_${index}`];

      return {
        id: String(question.id),
        label: normalizeLabel(readLabel(answer)),
        confidence: readConfidence(answer),
        probabilities: readProbabilities(answer),
      };
    }),
  };
});
