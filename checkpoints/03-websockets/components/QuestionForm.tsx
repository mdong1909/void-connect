import { useState } from "react";

type QuestionFormProps = {
  onSubmit?: (text: string) => void;
  authorName?: string;
  disabled?: boolean;
};

export function QuestionForm({
  onSubmit,
  authorName,
  disabled = false,
}: QuestionFormProps) {
  const [text, setText] = useState("");
  const isClientOnly = Boolean(onSubmit);

  return (
    <form
      className="questionForm"
      method={isClientOnly ? undefined : "post"}
      onSubmit={(event) => {
        if (!onSubmit) return;
        event.preventDefault();
        const value = text.trim();
        if (!value) return;
        onSubmit(value);
        setText("");
      }}
    >
      {authorName ? (
        <input type="hidden" name="authorName" value={authorName} />
      ) : null}
      <input
        name="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Ask a question for the room"
        aria-label="Question"
        disabled={disabled}
        required
      />
      <button type="submit" disabled={disabled || (isClientOnly && !text.trim())}>
        Submit
      </button>
    </form>
  );
}

