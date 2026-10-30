import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { countProducts, listCategories, listProducts, type ProductSort } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { GROUPS, type CategoryGroup } from "@/lib/types";
import { CatalogueControls } from "@/components/site/CatalogueControls";
import { Pager } from "@/components/site/Pager";
import { ProductPlate } from "@/components/site/ProductPlate";

export const metadata: Metadata = {
  title: "All collections",
  description: "Every piece at Swarup Jewellers, Madhyamgram: sankha, pola, noa, bala, necklaces, earrings, rings and more, with weight and today's-rate estimates.",
};

const PER_PAGE = 24;
const SORTS: ProductSort[] = ["new", "light", "heavy", "popular"];

export default async function Collections(props: PageProps<"/collections">) {
  const sp = await props.searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const group = GROUPS.find((g) => g.id === str("group"))?.id as CategoryGroup | undefined;
  const sort = SORTS.includes(str("sort") as ProductSort) ? (str("sort") as ProductSort) : "new";
  const q = str("q")?.slice(0, 60);
  const page = Math.max(1, Number(str("page")) || 1);

  const [settings, categories, total] = await Promise.all([getSettings(), listCategories(), countProducts({ group, q })]);
  const products = await listProducts({ group, q, sort, limit: PER_PAGE, offset: (page - 1) * PER_PAGE });
  const pages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <header className="cat-hero field-sindoor grain">
        <p className="cat-hero-bn brush misreg" data-text="সব গয়না" lang="bn">
          সব গয়না
        </p>
        <div className="cat-hero-copy">
          <h1 className="cat-title condensed">{q ? `“${q}”` : group ? GROUPS.find((g) => g.id === group)!.label : "Every piece in the shop"}</h1>
          <p className="data">
            {total} {total === 1 ? "piece" : "pieces"} · estimates at today&rsquo;s rate
          </p>
        </div>
        <nav className="cat-groups" aria-label="Kinds of jewellery">
          <Link href="/collections" aria-current={!group ? "page" : undefined}>
            All
          </Link>
          {GROUPS.map((g) => (
            <Link key={g.id} href={`/collections?group=${g.id}`} aria-current={group === g.id ? "page" : undefined}>
              <span className="bn">{g.bn}</span> {g.label}
            </Link>
          ))}
        </nav>
        <ul className="cat-jump">
          {categories
            .filter((c) => !group || c.group === group)
            .map((c) => (
              <li key={c.slug}>
                <Link href={`/product-category/${c.slug}`} className="chip">
                  <span className="bn">{c.nameBn ?? c.name}</span>
                  <span>{c.name}</span>
                  <span className="data">{c.productCount}</span>
                </Link>
              </li>
            ))}
        </ul>
      </header>
      <section className="cat-body field-kagoj grain">
        <Suspense>
          <CatalogueControls />
        </Suspense>
        {products.length ? (
          <div className="plate-grid">
            {products.map((p, i) => (
              <ProductPlate key={p.id} product={p} settings={settings} index={i} sizes="(min-width: 1200px) 24vw, (min-width: 700px) 45vw, 92vw" />
            ))}
          </div>
        ) : (
          <div className="empty">
            <p className="brush" lang="bn">
              খুঁজে পেলাম না
            </p>
            <p>Nothing matches that search. Try a category name like sankha or necklace, or ask us on WhatsApp: we may have it in the shop.</p>
            <Link href="/collections" className="link-arrow">
              Clear the search
            </Link>
          </div>
        )}
        <Pager page={page} pages={pages} basePath="/collections" params={{ group, sort: sort === "new" ? undefined : sort, q }} />
      </section>
    </>
  );
}
