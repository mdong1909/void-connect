import { AuthPanel } from "../components/AuthPanel";
import { AuthenticatedQuestionQueue as RealtimeQuestionQueue } from "../components/AuthenticatedQuestionQueue";
import type { Props } from "./index.server";

export default function Page({ user, questions }: Props) {
  return (
    <main className="appShell">
      <section className="intro">
        <p className="eyebrow">Live Workshop</p>
        <h1>Live Q&A Queue</h1>
        <p>Submit question during the session</p>
      </section>

      <AuthPanel user={user} />

      <RealtimeQuestionQueue user={user} initialQuestions={questions} />
    </main>
  );
}
