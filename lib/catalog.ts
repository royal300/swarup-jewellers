import "server-only";
import type { RowDataPacket } from "mysql2";
import { query } from "./db";
import type { Category, CategoryGroup, Product, Spec } from "./types";

type CategoryRow = RowDataPacket & {
  id: number; slug: string; name: string; name_bn: string | null; grp: CategoryGroup; description: string | null;
  image: string | null; sort_order: number; is_visible: number; product_count: number;
};

const toCategory = (r: CategoryRow): Category => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  nameBn: r.name_bn,
  group: r.grp,
  description: r.description,
  image: r.image,
  sortOrder: r.sort_order,
  isVisible: !!r.is_visible,
  productCount: Number(r.product_count || 0),
});

const CATEGORY_SQL = `
  SELECT c.*, (SELECT COUNT(*) FROM product_categories pc JOIN products p ON p.id = pc.product_id
               WHERE pc.category_id = c.id AND p.is_published = 1) AS product_count
  FROM categories c`;

export async function listCategories(opts: { includeHidden?: boolean } = {}): Promise<Category[]> {
  const rows = await query<CategoryRow>(`${CATEGORY_SQL} ${opts.includeHidden ? "" : "WHERE c.is_visible = 1"} ORDER BY c.sort_order, c.name`);
  return rows.map(toCategory);
}

export async function getCategory(slug: string): Promise<Category | null> {
  const rows = await query<CategoryRow>(`${CATEGORY_SQL} WHERE c.slug = ? LIMIT 1`, [slug]);
  return rows[0] ? toCategory(rows[0]) : null;
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const rows = await query<CategoryRow>(`${CATEGORY_SQL} WHERE c.id = ? LIMIT 1`, [id]);
  return rows[0] ? toCategory(rows[0]) : null;
}

type ProductRow = RowDataPacket & {
  id: number; slug: string; name: string; description: string | null; metal: string; purity: string | null;
  weight_grams: number | null; weight_note: string | null; price_override: number | null; specs: string | null;
  is_featured: number; is_published: number; views: number; created_at: Date; updated_at: Date;
};

function parseSpecs(raw: string | null): Spec[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x) => x && x.label && x.value) : [];
  } catch {
    return [];
  }
}

async function hydrate(rows: ProductRow[]): Promise<Product[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const imgs = await query<RowDataPacket & { product_id: number; image_key: string }>(
    "SELECT product_id, image_key FROM product_images WHERE product_id IN (?) ORDER BY sort_order, id",
    [ids],
  );
  const cats = await query<RowDataPacket & { product_id: number; slug: string; name: string; name_bn: string | null; grp: CategoryGroup }>(
    `SELECT pc.product_id, c.slug, c.name, c.name_bn, c.grp FROM product_categories pc
     JOIN categories c ON c.id = pc.category_id WHERE pc.product_id IN (?) ORDER BY c.sort_order`,
    [ids],
  );
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    metal: r.metal === "silver" ? "silver" : "gold",
    purity: r.purity,
    weightGrams: r.weight_grams == null ? null : Number(r.weight_grams),
    weightNote: r.weight_note,
    priceOverride: r.price_override == null ? null : Number(r.price_override),
    specs: parseSpecs(r.specs),
    isFeatured: !!r.is_featured,
    isPublished: !!r.is_published,
    views: r.views,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    images: imgs.filter((i) => i.product_id === r.id).map((i) => i.image_key),
    categories: cats.filter((c) => c.product_id === r.id).map((c) => ({ slug: c.slug, name: c.name, nameBn: c.name_bn, group: c.grp })),
  }));
}

export type ProductSort = "new" | "light" | "heavy" | "popular";

export type ProductQuery = {
  category?: string;
  group?: CategoryGroup;
  q?: string;
  sort?: ProductSort;
  featured?: boolean;
  limit?: number;
  offset?: number;
  includeUnpublished?: boolean;
  excludeId?: number;
};

function where(q: ProductQuery) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (!q.includeUnpublished) clauses.push("p.is_published = 1");
  if (q.category) {
    clauses.push("EXISTS (SELECT 1 FROM product_categories pc JOIN categories c ON c.id = pc.category_id WHERE pc.product_id = p.id AND c.slug = ?)");
    params.push(q.category);
  }
  if (q.group) {
    clauses.push("EXISTS (SELECT 1 FROM product_categories pc JOIN categories c ON c.id = pc.category_id WHERE pc.product_id = p.id AND c.grp = ?)");
    params.push(q.group);
  }
  if (q.q) {
    clauses.push("(p.name LIKE ? OR p.description LIKE ? OR EXISTS (SELECT 1 FROM product_categories pc JOIN categories c ON c.id = pc.category_id WHERE pc.product_id = p.id AND (c.name LIKE ? OR c.name_bn LIKE ?)))");
    const like = `%${q.q}%`;
    params.push(like, like, like, like);
  }
  if (q.featured) clauses.push("p.is_featured = 1");
  if (q.excludeId) {
    clauses.push("p.id <> ?");
    params.push(q.excludeId);
  }
  return { sql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
}

const ORDER: Record<ProductSort, string> = {
  new: "p.created_at DESC, p.id DESC",
  light: "p.weight_grams IS NULL, p.weight_grams ASC",
  heavy: "p.weight_grams IS NULL, p.weight_grams DESC",
  popular: "p.views DESC, p.id DESC",
};

export async function listProducts(q: ProductQuery = {}): Promise<Product[]> {
  const w = where(q);
  const rows = await query<ProductRow>(
    `SELECT p.* FROM products p ${w.sql} ORDER BY ${ORDER[q.sort || "new"]} LIMIT ? OFFSET ?`,
    [...w.params, q.limit ?? 48, q.offset ?? 0],
  );
  return hydrate(rows);
}

export async function countProducts(q: ProductQuery = {}): Promise<number> {
  const w = where(q);
  const rows = await query<RowDataPacket & { n: number }>(`SELECT COUNT(*) AS n FROM products p ${w.sql}`, w.params);
  return Number(rows[0]?.n || 0);
}

export async function getProduct(slug: string, opts: { includeUnpublished?: boolean } = {}): Promise<Product | null> {
  const rows = await query<ProductRow>(
    `SELECT p.* FROM products p WHERE p.slug = ? ${opts.includeUnpublished ? "" : "AND p.is_published = 1"} LIMIT 1`,
    [slug],
  );
  return (await hydrate(rows))[0] ?? null;
}

export async function getProductById(id: number): Promise<Product | null> {
  const rows = await query<ProductRow>("SELECT p.* FROM products p WHERE p.id = ? LIMIT 1", [id]);
  return (await hydrate(rows))[0] ?? null;
}

/** Weights of every published piece in a category, for the gram ruler. */
export async function categoryWeights(slug: string) {
  return query<RowDataPacket & { slug: string; name: string; weight_grams: number }>(
    `SELECT p.slug, p.name, p.weight_grams FROM products p
     JOIN product_categories pc ON pc.product_id = p.id JOIN categories c ON c.id = pc.category_id
     WHERE c.slug = ? AND p.is_published = 1 AND p.weight_grams IS NOT NULL ORDER BY p.weight_grams`,
    [slug],
  );
}
