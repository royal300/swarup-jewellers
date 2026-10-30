import type { MetadataRoute } from "next";
import { listCategories, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || "https://swarup.rasatech.in";
  const [cats, products] = await Promise.all([listCategories(), listProducts({ limit: 5000 })]);
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/collections`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/todays-rate`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/visit`, changeFrequency: "monthly", priority: 0.6 },
    ...cats.map((c) => ({ url: `${base}/product-category/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
