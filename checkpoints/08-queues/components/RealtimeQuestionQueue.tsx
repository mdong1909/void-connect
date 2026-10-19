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

type SentimentJob = {
  questionId: number;
  jobId: string;
  status: "queued" | "processing" | "retrying" | "complete" | "failed";
  label: string | null;
  confidence: number | null;
  attempts: number;
};

type RealtimeQuestionQueueProps = {
  user: User;
  initialQuestions: Question[];
};

export function RealtimeQuestionQueue({ user, initialQuestions }: RealtimeQuestionQueueProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [status, setStatus] = useState<"offline" | "connecting" | "connected">("offline");
  const [sentiments, setSentiments] = useState<Record<string, SentimentClassification>>({});
  const [jobs, setJobs] = useState<SentimentJob[]>([]);
  const [pollError, setPollError] = useState("");
  const [queueNotice, setQueueNotice] = useState("");
  const [classifyError, setClassifyError] = useState("");
  const [classifyPending, setClassifyPending] = useState(false);
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

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;

    async function refreshJobs() {
      try {
        const response = await fetch("/api/sentiment", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Could not refresh classification progress.");
        const data = (await response.json()) as {
          jobs: SentimentJob[];
          classifications: SentimentClassification[];
        };
        if (controller.signal.aborted) return;
        setJobs(data.jobs);
        setSentiments(
          Object.fromEntries([
            ...data.classifications.map((item) => [item.id, item]),
            ...data.jobs.map((job) => [
              String(job.questionId),
              {
                id: String(job.questionId),
                label: job.status === "complete" ? (job.label ?? "unknown") : job.status,
                confidence: job.status === "complete" ? job.confidence : null,
              },
            ]),
          ]),
        );
        setPollError("");
      } catch {
        if (!controller.signal.aborted) setPollError("Could not refresh progress. Retrying…");
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(refreshJobs, 1000);
      }
    }

    void refreshJobs();
    return () => {
      controller.abort();
      clearTimeout(timer);
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
    setQueueNotice("");

    try {
      const response = await fetch("/api/sentiment", { method: "POST" });

      if (!response.ok) {
        throw new Error("Some questions could not be queued. Click Classify to retry failed jobs.");
      }

      const data = (await response.json()) as { queued: number };
      setQueueNotice(
        data.queued > 0
          ? `${data.queued} question(s) queued. You can keep posting or close this tab.`
          : "All questions are already queued or complete.",
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
              {classifyPending ? "Queueing..." : "Classify"}
            </button>
            <EmailSummaryButton questionCount={questions.length} recipientEmail={user.email} />
          </div>
        </div>
        <p className="questionMeta" role="status">
          {
            Object.values(sentiments).filter(
              (item) => !["queued", "processing", "retrying", "failed"].includes(item.label),
            ).length
          }{" "}
          classified ·{" "}
          {jobs.filter((job) => ["queued", "processing", "retrying"].includes(job.status)).length}{" "}
          pending · {jobs.filter((job) => job.status === "failed").length} failed
        </p>
        {queueNotice ? (
          <p className="questionMeta" role="status">
            {queueNotice}
          </p>
        ) : null}
        {pollError ? <p className="errorText">{pollError}</p> : null}
        {classifyError ? <p className="errorText queueError">{classifyError}</p> : null}
        <QuestionList questions={questions} sentiments={sentiments} />
      </section>
    </>
  );
}
