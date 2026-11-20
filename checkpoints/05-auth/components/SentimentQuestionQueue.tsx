import { useEffect, useRef, useState } from "react";
import { connect } from "void/ws";
import type { Question } from "../lib/questions";
import { EmailSummaryButton } from "./EmailSummaryButton";
import { ImageQuestionForm as QuestionForm } from "./ImageQuestionForm";
import { QuestionList } from "./QuestionList";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
};

type ClientMessage = { type: "questions.refresh" };

type ServerMessage = { type: "questions.snapshot"; questions: Question[] };

type QuestionSocket = {
  send(event: ClientMessage): void;
  close(code?: number, reason?: string): void;
  on(type: "message", handler: (event: ServerMessage) => void): () => void;
  on(type: "open", handler: () => void): () => void;
  on(type: "close", handler: () => void): () => void;
  on(type: "error", handler: (error: unknown) => void): () => void;
};

type SentimentClassification = {
  id: string;
  label: string;
  confidence: number | null;
};

type SentimentResponse = {
  classifications: SentimentClassification[];
  questionCount?: number;
};

// Prepared queues ship before the WebSocket lesson creates this route.
const connectQuestions = connect as unknown as (url: "/questions") => QuestionSocket;

type SentimentQuestionQueueProps = {
  user: User;
  initialQuestions: Question[];
};

export function SentimentQuestionQueue({ user, initialQuestions }: SentimentQuestionQueueProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [status, setStatus] = useState<"offline" | "connecting" | "connected">("offline");
  const [sentiments, setSentiments] = useState<Record<string, SentimentClassification>>({});
  const [classifyError, setClassifyError] = useState("");
  const [classifyPending, setClassifyPending] = useState(false);
  const socketRef = useRef<QuestionSocket | null>(null);
  const displayName = user.email || user.name || "Site visitor";

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSavedClassifications() {
      try {
        const response = await fetch("/api/sentiment", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Could not load saved classifications.");
        const data = (await response.json()) as SentimentResponse;
        if (controller.signal.aborted) return;
        // A slower initial read must not replace results from a new classification.
        setSentiments((current) => ({
          ...Object.fromEntries(data.classifications.map((item) => [item.id, item])),
          ...current,
        }));
      } catch (reason) {
        if (!controller.signal.aborted) {
          setClassifyError(
            reason instanceof Error ? reason.message : "Could not load saved classifications.",
          );
        }
      }
    }

    void loadSavedClassifications();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setStatus("connecting");

    const socket = connectQuestions("/questions");
    socketRef.current = socket;

    const unsubscribeOpen = socket.on("open", () => setStatus("connected"));
    const unsubscribeClose = socket.on("close", () => setStatus("offline"));
    const unsubscribeError = socket.on("error", () => setStatus("connecting"));
    const unsubscribeMessage = socket.on("message", (event) => {
      setQuestions(event.questions);
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

  function notifyOtherTabs() {
    try {
      socketRef.current?.send({ type: "questions.refresh" });
    } catch {
      setStatus("offline");
    }
  }

  const statusLabel = status === "connected" ? "Realtime connected" : "Questions still save";

  async function classifyQuestions() {
    setClassifyPending(true);
    setClassifyError("");

    try {
      const response = await fetch("/api/sentiment", { method: "POST" });

      if (!response.ok) {
        throw new Error("Sentiment classification failed.");
      }

      const data = (await response.json()) as SentimentResponse;
      setSentiments(
        Object.fromEntries(
          data.classifications.map((classification) => [classification.id, classification]),
        ),
      );
    } catch (reason) {
      setClassifyError(
        reason instanceof Error ? reason.message : "Sentiment classification failed.",
      );
    } finally {
      setClassifyPending(false);
    }
  }

  return (
    <>
      <section className="panel">
        <div className="sectionHeader">
          <h2>Ask a Question</h2>
          <span>{statusLabel}</span>
        </div>
        <QuestionForm authorName={displayName} onSubmitted={notifyOtherTabs} />
        <p className="postingIdentity">
          Posting as <strong>{displayName}</strong>
        </p>
      </section>

      <section className="panel">
        <div className="sectionHeader">
          <h2>Current Questions</h2>
          <div className="sectionActions">
            <span>{questions.length} total</span>
            <button
              className="secondaryAction"
              type="button"
              onClick={classifyQuestions}
              disabled={classifyPending || questions.length === 0}
            >
              {classifyPending ? "Classifying..." : "Classify"}
            </button>
            <EmailSummaryButton questionCount={questions.length} recipientEmail={user.email} />
          </div>
        </div>
        {classifyError ? <p className="errorText queueError">{classifyError}</p> : null}
        <QuestionList questions={questions} sentiments={sentiments} />
      </section>
    </>
  );
}
