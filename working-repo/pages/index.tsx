import { useState } from "react";
import { QuestionForm } from "../components/QuestionForm";
import { QuestionList } from "../components/QuestionList";
import { sampleQuestions } from "../lib/questions";
import type { Question } from "../lib/questions";

export default function Page() {
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions);

  function addQuestion(text: string) {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `local-${Date.now()}`;

    setQuestions((current) => [
      {
        id,
        text,
        author: "You",
        votes: 0,
        createdAt: "Just now",
      },
      ...current,
    ]);
  }

  return (
    <main className="appShell">
      <section className="intro">
        <p className="eyebrow">Live Workshop</p>
        <h1>Live Q&A Queue</h1>
        <p>
          Submit questions during the session and keep the most useful topics
          easy to see.
        </p>
      </section>

      <section className="panel">
        <div className="sectionHeader">
          <h2>Ask a Question</h2>
          <span>Static starter</span>
        </div>
        <QuestionForm onSubmit={addQuestion} />
        <p className="hint">
          This version updates the screen, but refresh the page and new
          questions disappear.
        </p>
      </section>

      <section className="panel">
        <div className="sectionHeader">
          <h2>Current Questions</h2>
          <span>{questions.length} total</span>
        </div>
        <QuestionList questions={questions} />
      </section>
    </main>
  );
}

