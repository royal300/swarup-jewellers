import type { Product, Settings } from "./types";

export type Estimate = {
  kind: "fixed" | "estimate" | "on-request";
  amount: number | null;
  ratePer10g: number | null;
  basis: string;
};

/** Rate per 10 g for a product's metal and purity. Unknown gold purity is priced at the 22K rate and says so. */
export function rateFor(product: Pick<Product, "metal" | "purity">, s: Settings): { rate: number | null; basis: string } {
  if (product.metal === "silver") return { rate: s.silverRate, basis: "silver" };
  const p = (product.purity || "").toUpperCase();
  if (p === "18K") return { rate: s.goldRate18 ?? (s.goldRate22 ? Math.round((s.goldRate22 * 18) / 22) : null), basis: "18K gold" };
  if (p === "14K") return { rate: s.goldRate22 ? Math.round((s.goldRate22 * 14) / 22) : null, basis: "14K gold" };
  if (p === "24K") return { rate: s.goldRate22 ? Math.round((s.goldRate22 * 24) / 22) : null, basis: "24K gold" };
  return { rate: s.goldRate22, basis: "22K gold" };
}

export function estimate(product: Pick<Product, "metal" | "purity" | "weightGrams" | "priceOverride">, s: Settings): Estimate {
  if (product.priceOverride) return { kind: "fixed", amount: product.priceOverride, ratePer10g: null, basis: "fixed price" };
  const { rate, basis } = rateFor(product, s);
  if (!rate || !product.weightGrams) return { kind: "on-request", amount: null, ratePer10g: rate, basis };
  return { kind: "estimate", amount: Math.round((rate / 10) * product.weightGrams), ratePer10g: rate, basis };
}
