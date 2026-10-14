import { AuthPanel } from "../components/AuthPanel";

export default function LoginPage() {
  return (
    <main className="appShell">
      <section className="intro">
        <p className="eyebrow">Live Workshop</p>
        <h1>Sign in to join the Q&A</h1>
        <p>
          Create an account or sign in before viewing and posting questions.
        </p>
      </section>

      <AuthPanel user={null} />
    </main>
  );
}
