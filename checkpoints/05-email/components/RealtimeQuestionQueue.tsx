import { useEffect, useRef, useState } from "react";
import { connect } from "void/ws";
import type { Question } from "../lib/questions";
import { EmailSummaryButton } from "./EmailSummaryButton";
import { QuestionForm } from "./QuestionForm";
import { QuestionList } from "./QuestionList";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
};

type ClientMessage = {
  type: "question.create";
  text: string;
  authorName: string;
};

type ServerMessage =
  | {
      type: "questions.snapshot";
      questions: Question[];
    }
  | {
      type: "question.created";
      question: Question;
    };

type QuestionSocket = {
  send(event: ClientMessage): void;
  close(code?: number, reason?: string): void;
  on(type: "message", handler: (event: ServerMessage) => void): () => void;
  on(type: "open", handler: () => void): () => void;
  on(type: "close", handler: () => void): () => void;
  on(type: "error", handler: (error: unknown) => void): () => void;
};

type RealtimeQuestionQueueProps = {
  user: User;
  initialQuestions: Question[];
};

export function RealtimeQuestionQueue({ user, initialQuestions }: RealtimeQuestionQueueProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [status, setStatus] = useState<"offline" | "connecting" | "connected">("offline");
  const socketRef = useRef<QuestionSocket | null>(null);
  const displayName = user.email || user.name || "Site visitor";

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  useEffect(() => {
    setStatus("connecting");

    const socket = connect("/questions") as QuestionSocket;
    socketRef.current = socket;

    const unsubscribeOpen = socket.on("open", () => setStatus("connected"));
    const unsubscribeClose = socket.on("close", () => setStatus("offline"));
    const unsubscribeError = socket.on("error", () => setStatus("connecting"));
    const unsubscribeMessage = socket.on("message", (event) => {
      if (event.type === "questions.snapshot") {
        setQuestions(event.questions);
        return;
      }

      setQuestions((current) => [
        event.question,
        ...current.filter((question) => question.id !== event.question.id),
      ]);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeError();
      unsubscribeClose();
      unsubscribeOpen();
      socket.close();
      socketRef.current = null;
    };
  }, []);

  const submitThroughSocket =
    status === "connected"
      ? (text: string) => {
          socketRef.current?.send({
            type: "question.create",
            text,
            authorName: displayName,
          });
        }
      : undefined;

  const statusLabel = status === "connected" ? "Realtime connected" : "Saving fallback ready";

  return (
    <>
      <section className="panel">
        <div className="sectionHeader">
          <h2>Ask a Question</h2>
          <span>{statusLabel}</span>
        </div>
        <QuestionForm authorName={displayName} onSubmit={submitThroughSocket} />
        <p className="postingIdentity">
          Posting as <strong>{displayName}</strong>
        </p>
      </section>

      <section className="panel">
        <div className="sectionHeader">
          <h2>Current Questions</h2>
          <div className="sectionActions">
            <span>{questions.length} total</span>
            <EmailSummaryButton questionCount={questions.length} recipientEmail={user.email} />
          </div>
        </div>
        <QuestionList questions={questions} />
      </section>
    </>
  );
}
