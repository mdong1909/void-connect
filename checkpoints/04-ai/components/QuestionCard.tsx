import type { Question } from "../lib/questions";

type QuestionCardProps = {
  question: Question;
};

export function QuestionCard({ question }: QuestionCardProps) {
  const author = question.authorName || "Anonymous poster";

  return (
    <li className="questionCard">
      <div>
        <p className="questionText">{question.text}</p>
        <p className="questionMeta">
          {author} · Saved {question.createdAt}
        </p>
      </div>
    </li>
  );
}

