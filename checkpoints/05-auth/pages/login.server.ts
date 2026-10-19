import { defineHandler } from "void";
import { getUser } from "void/auth";

export const loader = defineHandler(async (c) => {
  const user = await getUser();

  if (user) {
    return c.redirect("/");
  }

  return {};
});
