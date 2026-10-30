import Link from "next/link";
import { countProducts, listCategories, listProducts } from "@/lib/catalog";
import { grams } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { togglePublished } from "../../actions";

export const metadata = { title: "Products" };
const PER = 40;

export default async function ProductsAdmin(props: PageProps<"/admin/products">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 60) : undefined;
  const category = typeof sp.category === "string" && sp.category ? sp.category : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const [categories, total, products] = await Promise.all([
    listCategories({ includeHidden: true }),
    countProducts({ q, category, includeUnpublished: true }),
    listProducts({ q, category, includeUnpublished: true, limit: PER, offset: (page - 1) * PER }),
  ]);
  const pages = Math.ceil(total / PER);
  const qs = (p: number) => `?${new URLSearchParams({ ...(q ? { q } : {}), ...(category ? { category } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;
  const back = `/admin/products${qs(page)}`;

  return (
    <div className="adm-page">
      <header className="adm-head">
        <h1>Products</h1>
        <div className="adm-head-actions">
          <Link href="/admin/products/new" className="adm-btn">
            Add a product
          </Link>
        </div>
      </header>
      {sp.saved ? <p className="adm-flash">Saved. It&rsquo;s live on the website.</p> : null}
      {sp.deleted ? <p className="adm-flash">Product deleted.</p> : null}

      <form className="adm-filter" role="search">
        <input name="q" defaultValue={q} placeholder="Search by name" aria-label="Search products" />
        <select name="category" defaultValue={category ?? ""} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name} ({c.productCount})
            </option>
          ))}
        </select>
        <button type="submit" className="adm-btn adm-btn-quiet">
          Filter
        </button>
        <span className="adm-muted">{total} products</span>
      </form>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th scope="col">Photo</th>
              <th scope="col">Name</th>
              <th scope="col">Category</th>
              <th scope="col">Weight</th>
              <th scope="col">On website</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.images[0] ? <img src={imageUrl(p.images[0], 600)!} alt="" width={52} height={52} loading="lazy" /> : <span className="adm-noimg" />}</td>
                <td>
                  <Link href={`/admin/products/${p.id}`} className="adm-rowlink">
                    {p.name}
                  </Link>
                  {p.isFeatured ? <span className="adm-tag">Featured</span> : null}
                  <div className="adm-muted adm-small">No. {p.id}</div>
                </td>
                <td>{p.categories.map((c) => c.name).join(", ") || "—"}</td>
                <td className="adm-num">{grams(p.weightGrams) ?? "—"}</td>
                <td>
                  <form action={togglePublished}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="back" value={back} />
                    <button type="submit" className={`adm-pill ${p.isPublished ? "adm-pill-on" : ""}`} aria-label={p.isPublished ? `Hide ${p.name}` : `Show ${p.name}`}>
                      {p.isPublished ? "Shown" : "Hidden"}
                    </button>
                  </form>
                </td>
                <td className="adm-row-actions">
                  <Link href={`/admin/products/${p.id}`}>Edit</Link>
                  <a href={`/product/${p.slug}`} target="_blank" rel="noopener">
                    View ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 ? (
        <nav className="adm-pager" aria-label="Pages">
          {page > 1 ? <Link href={`/admin/products${qs(page - 1)}`}>← Previous</Link> : <span />}
          <span className="adm-muted">
            Page {page} of {pages}
          </span>
          {page < pages ? <Link href={`/admin/products${qs(page + 1)}`}>Next →</Link> : <span />}
        </nav>
      ) : null}
    </div>
  );
}
