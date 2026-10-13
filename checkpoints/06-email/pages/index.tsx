import { AuthPanel } from "../components/AuthPanel";
import { AiSentimentPanel } from "../components/AiSentimentPanel";
import { RealtimeQuestionQueue } from "../components/RealtimeQuestionQueue";
import type { Props } from "./index.server";

export default function Page({ user, questions }: Props) {
  return (
    <main className="appShell">
      <section className="intro">
        <p className="eyebrow">Live Workshop</p>
        <h1>Live Q&A Queue</h1>
        <p>Sign in, submit a question, and watch it appear in every open tab.</p>
      </section>

      <AuthPanel user={user} />

      <RealtimeQuestionQueue user={user} initialQuestions={questions} />

      <AiSentimentPanel />
    </main>
  );
}

