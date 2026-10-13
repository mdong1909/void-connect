import type { FormEvent } from "react";

type QuestionFormProps = {
  onSubmit?: (text: string) => void;
  disabled?: boolean;
};

export function QuestionForm({ onSubmit, disabled = false }: QuestionFormProps) {
  const isClientOnly = Boolean(onSubmit);

  function submit(event: FormEvent<HTMLFormElement>) {
    if (!onSubmit) return;

    event.preventDefault();

    const form = event.currentTarget;
    const value = new FormData(form).get("text");

    if (typeof value !== "string") return;

    const text = value.trim();

    if (!text) return;

    onSubmit(text);
    form.reset();
  }

  return (
    <form
      className="questionForm"
      method={isClientOnly ? undefined : "post"}
      onSubmit={submit}
    >
      <input
        name="text"
        placeholder="Ask a question for the room"
        aria-label="Question"
        disabled={disabled}
        required
      />
      <button type="submit" disabled={disabled}>
        Submit
      </button>
    </form>
  );
}

