import { AiSentimentPanel } from "../components/AiSentimentPanel";
import { RealtimeQuestionQueue } from "../components/RealtimeQuestionQueue";
import type { Props } from "./index.server";

export default function Page({ questions }: Props) {
  return (
    <main className="appShell">
      <section className="intro">
        <p className="eyebrow">Live Workshop</p>
        <h1>Live Q&A Queue</h1>
        <p>
          Submit questions, watch them appear in every open tab, and classify
          the tone of what the room is asking.
        </p>
      </section>

      <RealtimeQuestionQueue initialQuestions={questions} />

      <AiSentimentPanel />
    </main>
  );
}

