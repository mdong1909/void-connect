import { defineEnv, email } from "void/env";

export const env = defineEnv({
  NOTIFICATION_EMAIL: email().optional(),
});
