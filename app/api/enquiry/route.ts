import { execute } from "@/lib/db";

// Counts WhatsApp enquiries so the shop can see which pieces people ask about.
export async function POST(req: Request) {
  try {
    const body = JSON.parse((await req.text()) || "{}");
    const productId = Number.isInteger(body.productId) ? body.productId : null;
    const source = typeof body.source === "string" ? body.source.slice(0, 40) : "product";
    await execute("INSERT INTO enquiries (product_id, source) VALUES (?, ?)", [productId, source]);
  } catch {}
  return new Response(null, { status: 204 });
}
