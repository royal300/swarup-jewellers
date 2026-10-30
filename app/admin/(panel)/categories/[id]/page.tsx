import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryById } from "@/lib/catalog";
import { deleteCategory } from "../../../actions";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export const metadata = { title: "Edit category" };

export default async function EditCategory(props: PageProps<"/admin/categories/[id]">) {
  const { id } = await props.params;
  const category = await getCategoryById(Number(id));
  if (!category) notFound();
  return (
    <div className="adm-page">
      <header className="adm-head">
        <h1>{category.name}</h1>
        <div className="adm-head-actions">
          <a href={`/product-category/${category.slug}`} target="_blank" rel="noopener" className="adm-link">
            View on website ↗
          </a>
          <Link href="/admin/categories" className="adm-link">
            ← All categories
          </Link>
        </div>
      </header>
      <CategoryForm category={category} />
      <form action={deleteCategory} className="adm-danger">
        <input type="hidden" name="id" value={category.id} />
        <p className="adm-muted">Deleting a category keeps its products; they just stop appearing under it. To hide it for a while, untick &ldquo;Show on the website&rdquo; instead.</p>
        <ConfirmButton message={`Delete the ${category.name} category?`}>Delete this category</ConfirmButton>
      </form>
    </div>
  );
}
