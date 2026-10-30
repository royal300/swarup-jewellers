import Link from "next/link";
import { listCategories } from "@/lib/catalog";
import { imageUrl } from "@/lib/images";
import { GROUPS } from "@/lib/types";

export const metadata = { title: "Categories" };

export default async function CategoriesAdmin(props: PageProps<"/admin/categories">) {
  const sp = await props.searchParams;
  const categories = await listCategories({ includeHidden: true });
  return (
    <div className="adm-page">
      <header className="adm-head">
        <h1>Categories</h1>
        <div className="adm-head-actions">
          <Link href="/admin/categories/new" className="adm-btn">
            Add a category
          </Link>
        </div>
      </header>
      {sp.saved ? <p className="adm-flash">Category saved.</p> : null}
      {sp.deleted ? <p className="adm-flash">Category deleted. Its products are still in the shop, just without that category.</p> : null}
      {GROUPS.map((g) => {
        const cats = categories.filter((c) => c.group === g.id);
        if (!cats.length) return null;
        return (
          <section key={g.id} className="adm-panel">
            <h2>{g.label}</h2>
            <ul className="adm-cats">
              {cats.map((c) => (
                <li key={c.id}>
                  {c.image ? <img src={imageUrl(c.image, 600)!} alt="" width={56} height={56} loading="lazy" /> : <span className="adm-noimg" />}
                  <Link href={`/admin/categories/${c.id}`} className="adm-rowlink">
                    {c.name} <span lang="bn">{c.nameBn}</span>
                  </Link>
                  <span className="adm-muted">{c.productCount} shown</span>
                  {!c.isVisible ? <span className="adm-tag">Hidden</span> : null}
                  <span className="adm-muted adm-small">order {c.sortOrder}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
