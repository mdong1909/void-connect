import { useEffect, useState } from "react";
import { ImageQuestionForm as QuestionForm } from "../components/ImageQuestionForm";
import { QuestionList } from "../components/QuestionList";
import type { Props } from "./index.server";

const adjectives = ["Bright", "Curious", "Helpful", "Kind", "Sharp", "Sunny"];
const nouns = ["Builder", "Coder", "Guest", "Maker", "Reader", "Visitor"];

function createUsername() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(100 + Math.random() * 900);

  return `${adjective}${noun}${number}`;
}

export default function Page({ questions }: Props) {
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(createUsername());
  }, []);

  return (
    <main className="appShell">
      <section className="intro">
        <p className="eyebrow">Live Workshop</p>
        <h1>Live Q&A Queue</h1>
        <p>Submit question during the session</p>
      </section>

      <section className="panel">
        <div className="sectionHeader">
          <h2>Ask a Question</h2>
        </div>
        <QuestionForm authorName={username} disabled={!username} />
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
