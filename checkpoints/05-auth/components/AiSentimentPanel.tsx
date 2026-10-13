import { useState } from "react";

type SentimentResponse = {
  label: string;
  confidence: number | null;
  probabilities: Record<string, number>;
  questionCount: number;
};

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function AiSentimentPanel() {
  const [sentiment, setSentiment] = useState<SentimentResponse | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function classifySentiment() {
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/sentiment", { method: "POST" });

      if (!response.ok) {
        throw new Error("Sentiment classification failed.");
      }

      const data = (await response.json()) as SentimentResponse;
      setSentiment(data);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Sentiment classification failed.",
      );
    } finally {
      setPending(false);
    }
  }

  const scores = sentiment
    ? Object.entries(sentiment.probabilities).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <section className="panel aiPanel">
      <div className="sectionHeader">
        <div>
          <h2>AI Sentiment</h2>
          <p className="questionMeta">
            Use Clef to classify the tone of the current question queue.
          </p>
        </div>
        <button type="button" onClick={classifySentiment} disabled={pending}>
          {pending ? "Classifying..." : "Classify"}
        </button>
      </div>

      {error ? <p className="errorText">{error}</p> : null}

      {sentiment ? (
        <div className="sentimentResult">
          <p className="sentimentLabel">{sentiment.label}</p>
          <p className="questionMeta">
            {sentiment.questionCount} questions analyzed
            {sentiment.confidence === null
              ? ""
              : ` with ${formatPercent(sentiment.confidence)} confidence`}
          </p>
          {scores.length > 0 ? (
            <ul className="sentimentScores">
              {scores.map(([label, score]) => (
                <li key={label}>
                  <span>{label}</span>
                  <span>{formatPercent(score)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <p className="emptyState">No sentiment classified yet.</p>
      )}
    </section>
  );
}
