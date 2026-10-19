import { defineHandler } from "void";
import type { InferProps } from "void";
import { getUser, requireAuth } from "void/auth";
import { storage } from "void/storage";
import { db, desc } from "void/db";
import { questions } from "@schema";

export type Props = InferProps<typeof loader>;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

async function getImageContentType(file: File) {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isPng = [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => header[index] === byte);
  if (isPng) return "image/png";

  const isJpeg = [255, 216, 255].every((byte, index) => header[index] === byte);
  if (isJpeg) return "image/jpeg";

  const decoder = new TextDecoder();
  const isWebp =
    decoder.decode(header.slice(0, 4)) === "RIFF" && decoder.decode(header.slice(8, 12)) === "WEBP";
  return isWebp ? "image/webp" : null;
}

export const loader = defineHandler(async (c) => {
  const user = await getUser();

  if (!user) {
    return c.redirect("/login");
  }

  return {
    user: {
      id: user.id,
      name: user.email || user.name,
      email: user.email,
    },
    questions: await db.select().from(questions).orderBy(desc(questions.createdAt)),
  };
});

export const action = defineHandler(async (c) => {
  const user = await requireAuth(c);
  const body = c.req.header("content-type")?.startsWith("multipart/form-data")
    ? await c.req.parseBody()
    : await c.req.json<Record<string, unknown>>();

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const authorName = user.email || user.name || "Site visitor";

  if (!text) return c.json({ error: "Enter a question." }, 400);

  const image = body.image;
  let imageKey: string | null = null;

  if (image !== undefined && image !== null && image !== "") {
    if (!(image instanceof File) || image.size === 0) {
      return c.json({ error: "Choose a non-empty image file." }, 400);
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return c.json({ error: "Choose an image that is 5 MB or smaller." }, 413);
    }
    const contentType = await getImageContentType(image);
    if (!contentType) {
      return c.json({ error: "Choose a PNG, JPEG, or WebP image." }, 415);
    }

    imageKey = crypto.randomUUID();
    await storage.put(imageKey, image.stream(), {
      httpMetadata: { contentType },
    });
  }

  try {
    await db.insert(questions).values({ text, authorName, imageKey });
  } catch (error) {
    if (imageKey) {
      await storage.delete(imageKey);
    }
    throw error;
  }
});
