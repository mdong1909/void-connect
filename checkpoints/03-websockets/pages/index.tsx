import { RealtimeQuestionQueue } from "../components/RealtimeQuestionQueue";
import type { Props } from "./index.server";

export default function Page({ questions }: Props) {
  return (
    <main className="appShell">
      <section className="intro">
        <p className="eyebrow">Live Workshop</p>
        <h1>Live Q&A Queue</h1>
        <p>
          Submit an anonymous question and watch it appear in every open tab.
        </p>
      </section>

      <RealtimeQuestionQueue initialQuestions={questions} />
    </main>
  );
}

