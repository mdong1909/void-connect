import { useEffect, useRef, useState } from "react";
import { connect } from "void/ws";
import type { Question } from "../lib/questions";
import { ImageQuestionForm as QuestionForm } from "./ImageQuestionForm";
import { QuestionList } from "./QuestionList";

const adjectives = ["Bright", "Curious", "Helpful", "Kind", "Sharp", "Sunny"];
const nouns = ["Builder", "Coder", "Guest", "Maker", "Reader", "Visitor"];

function createUsername() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(100 + Math.random() * 900);

  return `${adjective}${noun}${number}`;
}

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

// Prepared queues ship before the WebSocket lesson creates this route.
const connectQuestions = connect as unknown as (url: "/questions") => QuestionSocket;

type RealtimeQuestionQueueProps = {
  initialQuestions: Question[];
};

export function RealtimeQuestionQueue({ initialQuestions }: RealtimeQuestionQueueProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [status, setStatus] = useState<"offline" | "connecting" | "connected">("offline");
  const [username, setUsername] = useState("");
  const socketRef = useRef<QuestionSocket | null>(null);

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  useEffect(() => {
    setUsername(createUsername());
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

  return (
    <>
      <section className="panel">
        <div className="sectionHeader">
          <h2>Ask a Question</h2>
          <span>{statusLabel}</span>
        </div>
        <QuestionForm
          authorName={username || "Anonymous Visitor"}
          allowImages
          onSubmitted={notifyOtherTabs}
        />
        <p className="postingIdentity">
          Posting as <strong>{username || "Assigning name"}</strong>
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
