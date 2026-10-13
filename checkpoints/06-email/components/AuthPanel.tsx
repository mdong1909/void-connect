import { type FormEvent, useState } from "react";

type User = {
  name?: string | null;
  email?: string | null;
};

type AuthPanelProps = {
  user: User | null;
};

async function getAuthClient() {
  const client = await import("void/client");
  return client.auth;
}

export function AuthPanel({ user }: AuthPanelProps) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (user) {
    return (
      <section className="panel authPanel">
        <div>
          <p className="eyebrow">Signed in</p>
          <h2>{user.name || user.email}</h2>
        </div>
        <button
          type="button"
          onClick={async () => {
            const auth = await getAuthClient();
            await auth.signOut();
            window.location.reload();
          }}
        >
          Sign out
        </button>
      </section>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const auth = await getAuthClient();

      if (mode === "sign-up") {
        await auth.signUp.email({
          name: name.trim() || email,
          email,
          password,
        });
      } else {
        await auth.signIn.email({
          email,
          password,
        });
      }

      window.location.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Auth failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="panel authPanel">
      <div className="sectionHeader">
        <div>
          <h2>{mode === "sign-in" ? "Sign in" : "Create account"}</h2>
          <p className="questionMeta">
            Use any workshop email and a password you will remember.
          </p>
        </div>
        <div className="authTabs" aria-label="Auth mode">
          <button
            type="button"
            className={mode === "sign-in" ? "active" : ""}
            onClick={() => setMode("sign-in")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === "sign-up" ? "active" : ""}
            onClick={() => setMode("sign-up")}
          >
            Sign up
          </button>
        </div>
      </div>

      <form className="authForm" onSubmit={submit}>
        {mode === "sign-up" ? (
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Display name"
            aria-label="Display name"
          />
        ) : null}
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          type="email"
          aria-label="Email"
          required
        />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          type="password"
          aria-label="Password"
          required
        />
        <button type="submit" disabled={pending}>
          {pending ? "Working..." : mode === "sign-in" ? "Sign in" : "Sign up"}
        </button>
      </form>

      {error ? <p className="errorText">{error}</p> : null}
    </section>
  );
}

