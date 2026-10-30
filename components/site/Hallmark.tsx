import type { Product, Settings } from "@/lib/types";
import { estimate } from "@/lib/pricing";
import { digits, grams } from "@/lib/format";

/** The stamped data line every piece carries: weight, the rate basis, and the estimate. */
export function HallmarkLine({ product, settings, className }: { product: Product; settings: Settings; className?: string }) {
  const e = estimate(product, settings);
  const w = grams(product.weightGrams);
  return (
    <p className={`hallmark data ${className ?? ""}`}>
      <span>{w ? `${w}${product.weightNote ? ` ${product.weightNote}` : ""}` : "Weight on request"}</span>
      <span>{product.purity ? `${product.purity}` : e.basis.replace(" gold", "")} rate</span>
      <span className="hallmark-price">
        {e.kind === "fixed" ? `₹${digits(e.amount!)}` : e.kind === "estimate" ? `≈ ₹${digits(e.amount!)}` : "Price on request"}
      </span>
      <span>No. {product.id}</span>
    </p>
  );
}
