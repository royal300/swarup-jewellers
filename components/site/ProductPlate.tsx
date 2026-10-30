import Link from "next/link";
import type { Product, Settings } from "@/lib/types";
import { imageSrcSet, imageUrl } from "@/lib/images";
import { HallmarkLine } from "./Hallmark";

const FIELDS = ["field-sindoor", "field-neel", "field-morpankhi", "field-haldi", "field-kali"];

/** A piece as a small jacket: the photograph matted onto a flat field, its Bengali name behind, the hallmark line below. */
export function ProductPlate({ product, settings, index = 0, sizes = "(min-width: 900px) 30vw, 80vw" }: { product: Product; settings: Settings; index?: number; sizes?: string }) {
  const cat = product.categories[0];
  const img = product.images[0];
  return (
    <article className={`plate ${FIELDS[index % FIELDS.length]}`}>
      <Link href={`/product/${product.slug}`} className="plate-link">
        <span className="plate-bn brush" aria-hidden lang="bn">
          {cat?.nameBn ?? cat?.name ?? ""}
        </span>
        <span className="plate-mat">
          {img ? (
            <img src={imageUrl(img, 600)!} srcSet={imageSrcSet(img)} sizes={sizes} alt={product.name} loading="lazy" width={600} height={600} />
          ) : (
            <span className="plate-empty brush">{cat?.nameBn ?? "সোনা"}</span>
          )}
        </span>
        <span className="plate-name">
          <span className="plate-title">{product.name}</span>
          {cat ? <span className="plate-cat">{cat.name}</span> : null}
        </span>
      </Link>
      <HallmarkLine product={product} settings={settings} />
    </article>
  );
}
