import { useEffect, useState } from "react";
import { QuestionForm } from "../components/QuestionForm";
import { QuestionList } from "../components/QuestionList";
import { sampleQuestions } from "../lib/questions";
import type { Question } from "../lib/questions";

const adjectives = ["Bright", "Curious", "Helpful", "Kind", "Sharp", "Sunny"];
const nouns = ["Builder", "Coder", "Guest", "Maker", "Reader", "Visitor"];

function createUsername() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(100 + Math.random() * 900);

  return `${adjective}${noun}${number}`;
}

export default function Page() {
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions);
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(createUsername());
  }, []);

  function addQuestion(text: string) {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `local-${Date.now()}`;

    setQuestions((current) => [
      {
        id,
        text,
        author: username || "Anonymous Visitor",
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
        </div>
        <QuestionForm onSubmit={addQuestion} />
        <p className="postingIdentity">
          Posting as <strong>{username || "Assigning name"}</strong>
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

