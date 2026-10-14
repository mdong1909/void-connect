import { useEffect, useRef, useState } from "react";
import { connect } from "void/ws";
import type { Question } from "../lib/questions";
import { QuestionForm } from "./QuestionForm";
import { QuestionList } from "./QuestionList";

const adjectives = ["Bright", "Curious", "Helpful", "Kind", "Sharp", "Sunny"];
const nouns = ["Builder", "Coder", "Guest", "Maker", "Reader", "Visitor"];
const usernameStorageKey = "live-qa-username";

function createUsername() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(100 + Math.random() * 900);

  return `${adjective}${noun}${number}`;
}

function getStoredUsername() {
  const saved = sessionStorage.getItem(usernameStorageKey);

  if (saved) return saved;

  const username = createUsername();
  sessionStorage.setItem(usernameStorageKey, username);

  return username;
}

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
  initialQuestions: Question[];
};

export function RealtimeQuestionQueue({
  initialQuestions,
}: RealtimeQuestionQueueProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [status, setStatus] = useState<"offline" | "connecting" | "connected">(
    "offline",
  );
  const [username, setUsername] = useState("");
  const socketRef = useRef<QuestionSocket | null>(null);

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  useEffect(() => {
    setUsername(getStoredUsername());
  }, []);

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
            authorName: username || "Anonymous Visitor",
          });
        }
      : undefined;

  const statusLabel =
    status === "connected"
      ? "Realtime connected"
      : "Saving fallback ready";

  return (
    <>
      <section className="panel">
        <div className="sectionHeader">
          <h2>Ask a Question</h2>
          <span>{statusLabel}</span>
        </div>
        <QuestionForm
          authorName={username || "Anonymous Visitor"}
          onSubmit={submitThroughSocket}
        />
        <p className="postingIdentity">
          Posting as <strong>{username || "Assigning name"}</strong>
        </p>
        <p className="hint">
          {status === "connected"
            ? "Open this app in another tab. New questions will appear there instantly with their generated usernames."
            : "The app can still save questions with generated usernames while the realtime connection is starting."}
        </p>
      </section>

      <section className="panel">
        <div className="sectionHeader">
          <h2>Current Questions</h2>
          <span>{questions.length} total</span>
        </div>
        <QuestionList questions={questions} />
      </section>
    </>
  );
}
