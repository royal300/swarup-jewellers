import fs from "node:fs/promises";
import path from "node:path";

// In production nginx serves /uploads straight from disk; this handler covers dev and any direct hits.
export async function GET(_req: Request, ctx: RouteContext<"/uploads/[...path]">) {
  const { path: parts } = await ctx.params;
  const name = parts.join("/");
  if (!/^[a-z0-9_-]+-(600|1400)\.webp$/i.test(name)) return new Response("Not found", { status: 404 });
  const dir = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "uploads");
  try {
    const data = await fs.readFile(path.join(dir, name));
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
