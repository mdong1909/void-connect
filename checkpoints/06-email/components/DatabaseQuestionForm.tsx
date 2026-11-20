import { action } from "@void/react";
import type { ActionResult } from "void/pages-client";
import { useState } from "react";

// This form is prepared before the Database lesson creates the page action.
const saveQuestion = action as unknown as (
  url: "/",
  options: { data: { text: string; authorName?: string } },
) => Promise<ActionResult>;

type DatabaseQuestionFormProps = {
  onSubmit?: (text: string) => void | Promise<void>;
  authorName?: string;
  disabled?: boolean;
};

export function DatabaseQuestionForm({ onSubmit, authorName, disabled = false }: DatabaseQuestionFormProps) {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  return (
    <>
      <form
        className="questionForm"
        aria-busy={pending}
        onSubmit={async (event) => {
          event.preventDefault();
          const value = text.trim();
          if (!value || disabled || pending) return;

          setPending(true);
          setError("");
          try {
            if (onSubmit) {
              await onSubmit(value);
            } else {
              const result = await saveQuestion("/", {
                data: { text: value, authorName },
              });
              if (!result.ok) {
                setError(result.error.message);
                return;
              }
            }
            setText("");
          } catch {
            setError("Could not submit your question. Please try again.");
          } finally {
            setPending(false);
          }
        }}
      >
        <input
          name="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Ask a question for the room"
          aria-label="Question"
          disabled={disabled || pending}
          required
        />
        <button type="submit" disabled={disabled || pending || !text.trim()}>
          {pending ? "Submitting…" : "Submit"}
        </button>
      </form>
      {error ? (
        <p className="errorText" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
