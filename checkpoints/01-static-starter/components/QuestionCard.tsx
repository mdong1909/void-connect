import type { Question } from "../lib/questions";

type QuestionCardProps = {
  question: Question;
};

export function QuestionCard({ question }: QuestionCardProps) {
  const author = question.authorName || question.author;

  return (
    <li className="questionCard">
      <div className="votePill">{question.votes ?? "Q"}</div>
      <div>
        <p className="questionText">{question.text}</p>
        <p className="questionMeta">
          {author ? `${author} · ` : ""}
          {question.createdAt}
        </p>
      </div>
    </li>
  );
}

