"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { z } from "zod";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { execute, pool, query } from "@/lib/db";
import { slugify } from "@/lib/format";
import { saveSettings } from "@/lib/settings";

export type FormState = { error?: string; ok?: string } | undefined;

/* ---------- Session ---------- */

const attempts = new Map<string, { n: number; until: number }>();

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const ip = (await headers()).get("x-real-ip") ?? "local";
  const a = attempts.get(ip);
  if (a && a.n >= 5 && a.until > Date.now()) return { error: "Too many attempts. Wait ten minutes and try again." };
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const rows = await query<RowDataPacket & { id: number; username: string; password_hash: string }>(
    "SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1",
    [username],
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    attempts.set(ip, { n: (a && a.until > Date.now() ? a.n : 0) + 1, until: Date.now() + 10 * 60 * 1000 });
    return { error: "That username and password don't match." };
  }
  attempts.delete(ip);
  await execute("UPDATE admin_users SET last_login_at = NOW() WHERE id = ?", [user.id]);
  await createSession({ uid: user.id, username: user.username });
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const session = await requireAdmin();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  if (next.length < 10) return { error: "Use at least 10 characters for the new password." };
  if (next !== String(form.get("confirm") ?? "")) return { error: "The two new passwords don't match." };
  const [user] = await query<RowDataPacket & { password_hash: string }>("SELECT password_hash FROM admin_users WHERE id = ?", [session.uid]);
  if (!user || !(await bcrypt.compare(current, user.password_hash))) return { error: "Your current password is not right." };
  await execute("UPDATE admin_users SET password_hash = ? WHERE id = ?", [await bcrypt.hash(next, 12), session.uid]);
  return { ok: "Password changed." };
}

/* ---------- Rates & settings ---------- */

const money = z
  .string()
  .trim()
  .transform((v) => v.replace(/[,₹\s]/g, ""))
  .refine((v) => v === "" || (/^\d+(\.\d+)?$/.test(v) && Number(v) > 0), "Enter a number like 13720");

export async function updateRates(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = z
    .object({ gold_rate_22: money, gold_rate_18: money, silver_rate: money })
    .safeParse({ gold_rate_22: form.get("gold_rate_22") ?? "", gold_rate_18: form.get("gold_rate_18") ?? "", silver_rate: form.get("silver_rate") ?? "" });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!parsed.data.gold_rate_22) return { error: "The 22K gold rate is needed for every estimate on the site." };
  await saveSettings({ ...parsed.data, rates_updated_at: new Date().toISOString() });
  return { ok: "Rates updated. The website shows them now." };
}

export async function updateSettings(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const fields = ["phone", "whatsapp", "email", "address", "hours", "map_url", "facebook", "instagram", "youtube"] as const;
  const values: Record<string, string> = {};
  for (const f of fields) values[f] = String(form.get(f) ?? "").trim();
  values.whatsapp = values.whatsapp.replace(/[^0-9]/g, "");
  if (values.whatsapp.length < 10) return { error: "WhatsApp number should include the country code, like 919830698969." };
  for (const f of ["map_url", "facebook", "instagram", "youtube"] as const) {
    if (values[f] && !/^https?:\/\//.test(values[f])) return { error: `${f.replace("_", " ")} must start with https://` };
  }
  await saveSettings(values);
  return { ok: "Shop details saved." };
}

/* ---------- Categories ---------- */

const categorySchema = z.object({
  name: z.string().trim().min(1, "Give the category a name").max(140),
  name_bn: z.string().trim().max(140),
  slug: z.string().trim().max(140),
  grp: z.enum(["bridal", "neck", "everyday", "men"]),
  description: z.string().trim().max(2000),
  image: z.string().trim().max(200),
  sort_order: z.coerce.number().int().min(0).max(999),
  is_visible: z.boolean(),
});

export async function saveCategory(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(form.get("id")) || null;
  const parsed = categorySchema.safeParse({
    name: form.get("name") ?? "",
    name_bn: form.get("name_bn") ?? "",
    slug: form.get("slug") ?? "",
    grp: form.get("grp") ?? "everyday",
    description: form.get("description") ?? "",
    image: form.get("image") ?? "",
    sort_order: form.get("sort_order") || 0,
    is_visible: form.get("is_visible") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const slug = slugify(d.slug || d.name);
  if (!slug) return { error: "The web address needs at least one English letter or number." };
  const clash = await query<RowDataPacket>("SELECT id FROM categories WHERE slug = ? AND id <> ?", [slug, id ?? 0]);
  if (clash.length) return { error: `Another category already uses /${slug}.` };
  const values = [slug, d.name, d.name_bn || null, d.grp, d.description || null, d.image || null, d.sort_order, d.is_visible ? 1 : 0];
  if (id) {
    await execute("UPDATE categories SET slug=?, name=?, name_bn=?, grp=?, description=?, image=?, sort_order=?, is_visible=? WHERE id=?", [...values, id]);
  } else {
    await execute("INSERT INTO categories (slug, name, name_bn, grp, description, image, sort_order, is_visible) VALUES (?,?,?,?,?,?,?,?)", values);
  }
  redirect("/admin/categories?saved=1");
}

export async function deleteCategory(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  if (id) await execute("DELETE FROM categories WHERE id = ?", [id]);
  redirect("/admin/categories?deleted=1");
}

/* ---------- Products ---------- */

const productSchema = z.object({
  name: z.string().trim().min(1, "Give the piece a name").max(200),
  slug: z.string().trim().max(180),
  description: z.string().trim().max(4000),
  metal: z.enum(["gold", "silver"]),
  purity: z.enum(["", "24K", "22K", "18K", "14K"]),
  weight_grams: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+(\.\d{1,3})?$/.test(v) && Number(v) > 0 && Number(v) < 10000), "Weight should be grams like 9.05"),
  weight_note: z.string().trim().max(120),
  price_override: money,
  is_featured: z.boolean(),
  is_published: z.boolean(),
  categories: z.array(z.coerce.number().int().positive()),
  images: z.array(z.string().regex(/^[a-z0-9_-]+$/i)).max(20),
  specs: z.array(z.object({ label: z.string().trim().max(60), value: z.string().trim().max(200) })).max(20),
});

export async function saveProduct(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(form.get("id")) || null;
  let images: unknown = [];
  let specs: unknown = [];
  try {
    images = JSON.parse(String(form.get("images") || "[]"));
    specs = JSON.parse(String(form.get("specs") || "[]"));
  } catch {
    return { error: "The photo list could not be read. Reload the page and try again." };
  }
  const parsed = productSchema.safeParse({
    name: form.get("name") ?? "",
    slug: form.get("slug") ?? "",
    description: form.get("description") ?? "",
    metal: form.get("metal") ?? "gold",
    purity: form.get("purity") ?? "",
    weight_grams: form.get("weight_grams") ?? "",
    weight_note: form.get("weight_note") ?? "",
    price_override: form.get("price_override") ?? "",
    is_featured: form.get("is_featured") === "on",
    is_published: form.get("is_published") === "on",
    categories: form.getAll("categories"),
    images,
    specs,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (!d.categories.length) return { error: "Pick at least one category so visitors can find the piece." };
  const slug = slugify(d.slug || d.name);
  if (!slug) return { error: "The web address needs at least one English letter or number." };
  const clash = await query<RowDataPacket>("SELECT id FROM products WHERE slug = ? AND id <> ?", [slug, id ?? 0]);
  if (clash.length) return { error: `Another piece already uses /product/${slug}. Change the web address.` };

  const values = [
    slug,
    d.name,
    d.description || null,
    d.metal,
    d.purity || null,
    d.weight_grams ? Number(d.weight_grams) : null,
    d.weight_note || null,
    d.price_override ? Number(d.price_override) : null,
    JSON.stringify(d.specs.filter((s) => s.label && s.value)),
    d.is_featured ? 1 : 0,
    d.is_published ? 1 : 0,
  ];
  const conn = await pool.getConnection();
  let productId = id;
  try {
    await conn.beginTransaction();
    if (id) {
      await conn.execute(
        "UPDATE products SET slug=?, name=?, description=?, metal=?, purity=?, weight_grams=?, weight_note=?, price_override=?, specs=?, is_featured=?, is_published=? WHERE id=?",
        [...values, id],
      );
    } else {
      const [res] = await conn.execute(
        "INSERT INTO products (slug, name, description, metal, purity, weight_grams, weight_note, price_override, specs, is_featured, is_published) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        values,
      );
      productId = (res as { insertId: number }).insertId;
    }
    await conn.execute("DELETE FROM product_categories WHERE product_id = ?", [productId]);
    for (const c of d.categories) await conn.execute("INSERT IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)", [productId, c]);
    await conn.execute("DELETE FROM product_images WHERE product_id = ?", [productId]);
    for (const [i, key] of d.images.entries()) await conn.execute("INSERT INTO product_images (product_id, image_key, sort_order) VALUES (?, ?, ?)", [productId, key, i]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  redirect(`/admin/products?saved=${productId}`);
}

export async function deleteProduct(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  if (id) await execute("DELETE FROM products WHERE id = ?", [id]);
  redirect("/admin/products?deleted=1");
}

export async function togglePublished(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  if (id) await execute("UPDATE products SET is_published = 1 - is_published WHERE id = ?", [id]);
  const back = String(form.get("back") || "/admin/products");
  redirect(back.startsWith("/admin") ? back : "/admin/products");
}
