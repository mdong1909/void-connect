import { action } from "@void/react";
import type { ActionResult } from "void/pages-client";
import { useEffect, useRef, useState } from "react";

// This prepared component ships before the Database lesson creates the action.
// It is first used by the Storage lesson, after that action is available.
const saveQuestion = action as unknown as (
  url: "/",
  options: { data: { text: string; authorName?: string; image?: File | null } },
) => Promise<ActionResult>;

type ImageQuestionFormProps = {
  onSubmit?: (text: string) => void | Promise<void>;
  onSubmitted?: () => void;
  authorName?: string;
  disabled?: boolean;
  allowImages?: boolean;
};

export function ImageQuestionForm({
  onSubmit,
  onSubmitted,
  authorName,
  disabled = false,
  allowImages = true,
}: ImageQuestionFormProps) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  function clearImage() {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <>
      <form
        className="questionForm"
        aria-busy={pending}
        onSubmit={async (event) => {
          event.preventDefault();
          const value = text.trim();
          if (!value || disabled || pending) return;
          if (allowImages && image && image.size > 5 * 1024 * 1024) {
            setError("Choose an image that is 5 MB or smaller.");
            return;
          }
          setPending(true);
          setError("");
          try {
            if (onSubmit) {
              await onSubmit(value);
            } else {
              const result = await saveQuestion("/", {
                data: { text: value, authorName, ...(allowImages ? { image } : {}) },
              });
              if (!result.ok) {
                const body = result.error.body as { error?: string } | null;
                setError(typeof body?.error === "string" ? body.error : result.error.message);
                return;
              }
            }
            setText("");
            clearImage();
            onSubmitted?.();
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
        {allowImages ? (
          <label className="imageAttachment">
            <span>Attach an image — optional</span>
            <input
              ref={fileInputRef}
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={disabled || pending}
              onChange={(event) => {
                setImage(event.target.files?.[0] ?? null);
                setError("");
              }}
            />
            <small>PNG, JPEG, or WebP. Maximum 5 MB.</small>
          </label>
        ) : null}
        {allowImages && previewUrl ? (
          <div className="imageAttachment">
            <img className="imagePreview" src={previewUrl} alt="Selected attachment preview" />
            <button
              type="button"
              disabled={disabled || pending}
              onClick={() => {
                clearImage();
                setError("");
              }}
            >
              Remove image
            </button>
          </div>
        ) : null}
      </form>
      {error ? (
        <p className="errorText" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
