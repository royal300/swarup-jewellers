import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { IMAGE_SIZES } from "./images";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export function uploadDir() {
  return path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "uploads");
}

/** Stores one uploaded photo as the storefront's WebP sizes and returns its key. */
export async function storeImage(file: File, hint: string) {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image`);
  if (file.size > MAX_UPLOAD_BYTES) throw new Error(`${file.name} is larger than 15 MB`);
  const base = hint
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "photo";
  const key = `${base}-${Date.now().toString(36)}${crypto.randomBytes(3).toString("hex")}`;
  const input = Buffer.from(await file.arrayBuffer());
  const dir = uploadDir();
  await fs.mkdir(dir, { recursive: true });
  for (const w of IMAGE_SIZES) {
    await sharp(input)
      .rotate()
      .resize({ width: w, height: w, fit: "inside", withoutEnlargement: true })
      .webp({ quality: w > 1000 ? 80 : 76 })
      .toFile(path.join(dir, `${key}-${w}.webp`));
  }
  return key;
}
