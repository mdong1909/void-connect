import type { Question } from "../lib/questions";
import { QuestionCard } from "./QuestionCard";

type QuestionListProps = {
  questions: Question[];
  sentiments?: Record<
    string,
    {
      label: string;
      confidence: number | null;
    }
  >;
};

export function QuestionList({ questions, sentiments = {} }: QuestionListProps) {
  if (questions.length === 0) {
    return <p className="emptyState">No questions yet.</p>;
  }

  return (
    <ul className="questionList">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          sentiment={sentiments[String(question.id)]}
        />
      ))}
    </ul>
  );
}

