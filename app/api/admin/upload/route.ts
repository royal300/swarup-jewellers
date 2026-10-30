import { readSession } from "@/lib/auth";
import { storeImage } from "@/lib/uploads";

export async function POST(req: Request) {
  if (!(await readSession())) return Response.json({ error: "Please sign in again." }, { status: 401 });
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return Response.json({ error: "No photos were attached." }, { status: 400 });
  const keys: string[] = [];
  try {
    for (const f of files.slice(0, 12)) keys.push(await storeImage(f, f.name));
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Upload failed", keys }, { status: 400 });
  }
  return Response.json({ keys });
}
