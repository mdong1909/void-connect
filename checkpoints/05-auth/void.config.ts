import { defineConfig } from "void/config";

export default defineConfig({
  head: {
    title: "Live Q&A Queue",
    htmlAttrs: { lang: "en" },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
  },
  auth: {
    providers: ["email"],
  },
  inference: {
    bindings: {
      db: true,
      ai: true,
    },
  },
});

