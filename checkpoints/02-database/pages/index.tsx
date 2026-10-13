import { QuestionForm } from "../components/QuestionForm";
import { QuestionList } from "../components/QuestionList";
import type { Props } from "./index.server";

export default function Page({ questions }: Props) {
  return (
    <main className="appShell">
      <section className="intro">
        <p className="eyebrow">Live Workshop</p>
        <h1>Live Q&A Queue</h1>
        <p>
          Submit a question, refresh the page, and confirm it is still there.
        </p>
      </section>

      <section className="panel">
        <div className="sectionHeader">
          <h2>Ask a Question</h2>
          <span>Database-backed</span>
        </div>
        <QuestionForm />
        <p className="hint">
          This version saves new questions to the database.
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

