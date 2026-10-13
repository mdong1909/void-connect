import { defineConfig } from "void/config";

export default defineConfig({
  inference: {
    bindings: {
      db: true,
      ai: true,
    },
  },
});

