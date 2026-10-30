import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { categoryWeights, countProducts, getCategory, listProducts, type ProductSort } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { GROUPS } from "@/lib/types";
import { CatalogueControls } from "@/components/site/CatalogueControls";
import { EnquireButton } from "@/components/site/EnquireButton";
import { GramRuler } from "@/components/site/GramRuler";
import { Pager } from "@/components/site/Pager";
import { ProductPlate } from "@/components/site/ProductPlate";

const PER_PAGE = 24;
const SORTS: ProductSort[] = ["new", "light", "heavy", "popular"];
const FIELDS = ["field-sindoor", "field-neel", "field-morpankhi", "field-haldi"];

export async function generateMetadata(props: PageProps<"/product-category/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const c = await getCategory(slug);
  if (!c) return {};
  return {
    title: `${c.name}${c.nameBn ? ` (${c.nameBn})` : ""}`,
    description: c.description || `${c.productCount} ${c.name} designs in gold at Swarup Jewellers, Madhyamgram, with weights and today's-rate estimates.`,
  };
}

export default async function CategoryPage(props: PageProps<"/product-category/[slug]">) {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const category = await getCategory(slug);
  if (!category || !category.isVisible) notFound();
  const sort = SORTS.includes(sp.sort as ProductSort) ? (sp.sort as ProductSort) : "new";
  const page = Math.max(1, Number(sp.page) || 1);
  const [settings, products, total, weights] = await Promise.all([
    getSettings(),
    listProducts({ category: slug, sort, limit: PER_PAGE, offset: (page - 1) * PER_PAGE }),
    countProducts({ category: slug }),
    categoryWeights(slug),
  ]);
  const group = GROUPS.find((g) => g.id === category.group);
  const field = FIELDS[category.sortOrder % FIELDS.length];
  const ws = weights.map((w) => Number(w.weight_grams));

  return (
    <>
      <header className={`cat-hero ${field} grain`}>
        <nav className="crumbs data" aria-label="Breadcrumb">
          <Link href="/collections">Collections</Link> / {group ? <Link href={`/collections?group=${group.id}`}>{group.label}</Link> : null}
        </nav>
        <p className="cat-hero-bn brush misreg" data-text={category.nameBn ?? category.name} lang="bn">
          {category.nameBn ?? category.name}
        </p>
        <div className="cat-hero-copy">
          <h1 className="cat-title condensed">{category.name}</h1>
          <p className="data">
            {total} {total === 1 ? "piece" : "pieces"}
            {ws.length ? ` · ${Math.min(...ws)} g to ${Math.max(...ws)} g` : ""}
          </p>
          {category.description ? <p className="cat-desc">{category.description}</p> : null}
        </div>
        <GramRuler items={weights.map((w) => ({ slug: w.slug, name: w.name, weight: Number(w.weight_grams) }))} />
      </header>
      <section className="cat-body field-kagoj grain">
        <Suspense>
          <CatalogueControls showSearch={false} />
        </Suspense>
        <div className="plate-grid">
          {products.map((p, i) => (
            <ProductPlate key={p.id} product={p} settings={settings} index={i + category.sortOrder} sizes="(min-width: 1200px) 24vw, (min-width: 700px) 45vw, 92vw" />
          ))}
        </div>
        <Pager page={page} pages={Math.ceil(total / PER_PAGE)} basePath={`/product-category/${slug}`} params={{ sort: sort === "new" ? undefined : sort }} />
        <div className="cat-ask">
          <p>Looking for a {category.name.toLowerCase()} design that isn&rsquo;t here? The shop has more pieces than the website.</p>
          <EnquireButton whatsapp={settings.whatsapp} text={`Hello Swarup Jewellers, I'm looking for ${category.name} designs. Could you show me more?`} source={`category:${slug}`}>
            Ask for more {category.name} designs
          </EnquireButton>
        </div>
      </section>
    </>
  );
}
