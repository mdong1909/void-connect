import { ai } from "void/ai";

type Choice = {
  choice?: string;
  label?: string;
  answer?: string;
  value?: string;
  confidence?: number;
};

export async function classifyQuestion(text: string) {
  const result = (await ai.run("@cf/cloudflare/clef" as string, {
    model: "clef",
    state: { event: "Live conference Q&A", text },
    questions: {
      sentiment: {
        type: "choice",
        instructions: `Classify the sentiment of this question: "${text}"`,
        criteria: {
          positive: "Curious, excited, appreciative, or optimistic.",
          neutral: "Informational, factual, or mixed without strong emotion.",
          negative: "Frustrated, confused, skeptical, disappointed, or worried.",
        },
      },
    },
  })) as { answers?: { sentiment?: string | Choice } };

  const answer = result.answers?.sentiment;
  const label = (
    typeof answer === "string"
      ? answer
      : answer?.choice || answer?.label || answer?.answer || answer?.value
  )
    ?.toLowerCase()
    .trim();

  if (label !== "positive" && label !== "neutral" && label !== "negative") {
    throw new Error("AI did not return a sentiment label.");
  }

  return {
    label,
    confidence: typeof answer === "object" ? (answer.confidence ?? null) : null,
  };
}
