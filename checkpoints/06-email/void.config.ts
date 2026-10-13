import { defineConfig } from "void/config";

export default defineConfig({
  auth: {
    providers: ["email"],
  },
  inference: {
    bindings: {
      db: true,
      ai: true,
      email: true,
    },
  },
});

