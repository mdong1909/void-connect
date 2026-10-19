import { defineHandler } from "void";
import { requireAuth } from "void/auth";
import { storage } from "void/storage";

export const GET = defineHandler(async (c) => {
  await requireAuth(c);
  const key = c.req.param("key");
  if (!key || !/^[0-9a-f-]{36}$/.test(key)) return c.notFound();

  const object = await storage.get(key);
  if (!object) return c.notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Content-Disposition", "attachment");

  return new Response(object.body, { headers });
});
