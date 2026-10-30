import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { getProduct, listProducts } from "@/lib/catalog";
import { execute } from "@/lib/db";
import { digits, grams, shortDate } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { estimate } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { EnquireButton } from "@/components/site/EnquireButton";
import { IconPin } from "@/components/site/illustrations";
import { ProductGallery } from "@/components/site/ProductGallery";
import { ProductPlate } from "@/components/site/ProductPlate";

const siteUrl = process.env.SITE_URL || "https://swarup.rasatech.in";

export async function generateMetadata(props: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getProduct(slug);
  if (!p) return {};
  const cat = p.categories[0];
  const img = imageUrl(p.images[0], 1400);
  return {
    title: `${p.name}${cat ? ` · ${cat.name}` : ""}`,
    description: `${p.name}${p.weightGrams ? `, ${grams(p.weightGrams)}` : ""}. ${p.description ?? ""}`.slice(0, 300),
    openGraph: img ? { images: [{ url: img, width: 1400, height: 1400 }] } : undefined,
  };
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const settings = await getSettings();
  const cat = product.categories[0];
  const related = cat ? await listProducts({ category: cat.slug, excludeId: product.id, limit: 4, sort: "popular" }) : [];
  const e = estimate(product, settings);
  const w = grams(product.weightGrams);
  const url = `${siteUrl}/product/${product.slug}`;
  const waText = `Hello Swarup Jewellers, I'm interested in this piece:\n\n*${product.name}*${w ? ` (${w}${product.weightNote ? ` ${product.weightNote}` : ""})` : ""}\n${url}\n\nIs it available, and what is today's final price?`;

  after(() => execute("UPDATE products SET views = views + 1 WHERE id = ?", [product.id]).catch(() => {}));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.map((k) => `${siteUrl}${imageUrl(k, 1400)}`),
    category: cat?.name,
    material: product.metal === "silver" ? "Silver" : "Gold",
    weight: product.weightGrams ? { "@type": "QuantitativeValue", value: product.weightGrams, unitCode: "GRM" } : undefined,
    brand: { "@type": "Brand", name: "Swarup Jewellers" },
  };

  return (
    <>
      <article className="pd field-kagoj grain">
        <div className="pd-media">
          <ProductGallery images={product.images} name={product.name} fallback={cat?.nameBn ?? "সোনা"} />
        </div>
        <div className="pd-info">
          <nav className="crumbs data" aria-label="Breadcrumb">
            <Link href="/collections">Collections</Link>
            {cat ? (
              <>
                {" / "}
                <Link href={`/product-category/${cat.slug}`}>{cat.name}</Link>
              </>
            ) : null}
          </nav>
          {cat?.nameBn ? (
            <p className="pd-bn brush misreg" data-text={cat.nameBn} lang="bn">
              {cat.nameBn}
            </p>
          ) : null}
          <h1 className="pd-title condensed">{product.name}</h1>

          <dl className="pd-stamp">
            <div>
              <dt className="data">Weight</dt>
              <dd>
                {w ?? "On request"}
                {product.weightNote ? <small> {product.weightNote}</small> : null}
              </dd>
            </div>
            <div>
              <dt className="data">Purity</dt>
              <dd>{product.purity ?? (product.metal === "silver" ? "Silver" : "Ask in shop")}</dd>
            </div>
            <div>
              <dt className="data">Hallmark</dt>
              <dd>BIS HUID</dd>
            </div>
            <div>
              <dt className="data">Piece no.</dt>
              <dd>{product.id}</dd>
            </div>
          </dl>

          <div className="pd-price">
            {e.kind === "fixed" ? (
              <p className="pd-amount">₹{digits(e.amount!)}</p>
            ) : e.kind === "estimate" ? (
              <>
                <p className="pd-amount">≈ ₹{digits(e.amount!)}</p>
                <p className="pd-sum data">
                  ₹{digits(e.ratePer10g!)} per 10 g ({e.basis}, {shortDate(settings.ratesUpdatedAt)}) × {w}
                </p>
                <p className="pd-note">Metal value at today&rsquo;s rate. Making charges and GST are added in the shop; ask us for the final price.</p>
              </>
            ) : (
              <p className="pd-amount pd-amount-sm">Price on request</p>
            )}
          </div>

          <EnquireButton whatsapp={settings.whatsapp} text={waText} productId={product.id} className="btn-act pd-cta">
            Ask about this piece on WhatsApp
          </EnquireButton>

          {product.description ? <p className="pd-desc">{product.description}</p> : null}
          {product.specs.length ? (
            <dl className="pd-specs">
              {product.specs.map((s) => (
                <div key={s.label}>
                  <dt className="data">{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <p className="pd-visit">
            <IconPin width={18} height={18} /> See it in person at {settings.address.split(",").slice(0, 3).join(",")}. <Link href="/visit">Directions</Link>
          </p>
        </div>
      </article>

      {related.length ? (
        <section className="related field-kali grain" aria-labelledby="related-title">
          <header className="sec-head">
            <h2 id="related-title" className="sec-title condensed">
              More {cat?.name}
            </h2>
            <Link href={`/product-category/${cat!.slug}`} className="link-arrow">
              All {cat?.name} designs
            </Link>
          </header>
          <div className="plate-grid related-grid">
            {related.map((p, i) => (
              <ProductPlate key={p.id} product={p} settings={settings} index={i} sizes="(min-width: 1200px) 24vw, (min-width: 700px) 45vw, 92vw" />
            ))}
          </div>
        </section>
      ) : null}

      <div className="pd-sticky">
        <EnquireButton whatsapp={settings.whatsapp} text={waText} productId={product.id} source="product-sticky">
          WhatsApp about this piece
        </EnquireButton>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
