import type { Question } from "../lib/questions";

type QuestionCardProps = {
  question: Question;
  sentiment?: {
    label: string;
    confidence: number | null;
  };
};

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function sentimentClass(label: string) {
  const normalized = label.toLowerCase();
  if (normalized === "positive" || normalized === "neutral" || normalized === "negative") {
    return `sentimentBadge sentiment-${normalized}`;
  }
  return "sentimentBadge";
}

export function QuestionCard({ question, sentiment }: QuestionCardProps) {
  const author = question.authorName || question.author;

  return (
    <li className="questionCard">
      <div className="questionContent">
        <p className="questionText">{question.text}</p>
        <p className="questionMeta">
          {author ? `${author} · ` : ""}
          {question.createdAt}
        </p>
      </div>
      {sentiment ? (
        <div className={sentimentClass(sentiment.label)}>
          <span>{sentiment.label}</span>
          {sentiment.confidence === null ? null : (
            <small>{formatPercent(sentiment.confidence)}</small>
          )}
        </div>
      ) : null}
    </li>
  );
}

