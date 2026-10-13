export type Question = {
  id: string | number;
  text: string;
  author?: string;
  authorName?: string | null;
  userId?: string | null;
  votes?: number;
  createdAt: string;
};

export const sampleQuestions: Question[] = [
  {
    id: "sample-1",
    text: "How does deployment work?",
    author: "Maya",
    votes: 12,
    createdAt: "Pinned",
  },
  {
    id: "sample-2",
    text: "Where will the database fit into this app?",
    author: "Nico",
    votes: 8,
    createdAt: "2 min ago",
  },
  {
    id: "sample-3",
    text: "Can this update live when someone else submits?",
    author: "Ari",
    votes: 5,
    createdAt: "4 min ago",
  },
];

