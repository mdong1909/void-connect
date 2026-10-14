import { useState } from "react";

type EmailSummaryButtonProps = {
  questionCount: number;
  recipientEmail?: string | null;
};

type EmailSummaryResponse = {
  ok?: boolean;
  recipientEmail?: string;
  questionCount?: number;
  error?: string;
};

function questionLabel(count: number) {
  return count === 1 ? "question" : "questions";
}

export function EmailSummaryButton({
  questionCount,
  recipientEmail,
}: EmailSummaryButtonProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function sendSummary() {
    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/question-summary-email", {
        method: "POST",
      });
      const data = (await response.json().catch(() => ({}))) as EmailSummaryResponse;

      if (!response.ok) {
        throw new Error(data.error || "Could not send the question summary email.");
      }

      const sentCount = data.questionCount ?? questionCount;
      const sentRecipient = data.recipientEmail || recipientEmail || "your email";

      setStatus("sent");
      setMessage(
        `Sent ${sentCount} ${questionLabel(sentCount)} to ${sentRecipient}.`,
      );
    } catch (reason) {
      setStatus("error");
      setMessage(
        reason instanceof Error
          ? reason.message
          : "Could not send the question summary email.",
      );
    }
  }

  return (
    <div className="emailSummaryAction">
      <button
        className="secondaryAction"
        type="button"
        onClick={sendSummary}
        disabled={status === "sending" || !recipientEmail}
      >
        {status === "sending" ? "Sending..." : "Email Summary"}
      </button>
      {message ? (
        <p className={`emailSummaryStatus ${status === "error" ? "error" : ""}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
