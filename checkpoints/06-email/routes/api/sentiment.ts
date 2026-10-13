import { defineHandler } from "void";
import { ai } from "void/ai";
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
  answers?: {
    sentiment?: string | ClefChoiceAnswer;
  };
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

export const POST = defineHandler(async () => {
  const currentQuestions = await db
    .select()
    .from(questions)
    .orderBy(desc(questions.createdAt));

  const questionTexts = currentQuestions
    .slice(0, 12)
    .map((question, index) => `${index + 1}. ${question.text}`);

  if (questionTexts.length === 0) {
    return {
      label: "No questions yet",
      confidence: null,
      probabilities: {},
      questionCount: 0,
    };
  }

  const result = (await ai.run("@cf/cloudflare/clef" as string, {
    model: "clef",
    state: {
      event: "Live conference Q&A",
      questions: questionTexts,
    },
    questions: {
      sentiment: {
        type: "choice",
        instructions:
          "Classify the overall sentiment of this live Q&A queue.",
        criteria: {
          positive: "Curious, excited, appreciative, or optimistic.",
          neutral: "Informational, factual, or mixed without strong emotion.",
          negative: "Frustrated, confused, skeptical, disappointed, or worried.",
        },
      },
    },
  })) as ClefResult;

  const answer = result.answers?.sentiment;

  return {
    label: readLabel(answer) || "unknown",
    confidence: readConfidence(answer),
    probabilities: readProbabilities(answer),
    questionCount: questionTexts.length,
  };
});
