import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, listCategories } from "@/lib/catalog";
import { deleteProduct } from "../../../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Edit product" };

export default async function EditProduct(props: PageProps<"/admin/products/[id]">) {
  const { id } = await props.params;
  const [product, categories] = await Promise.all([getProductById(Number(id)), listCategories({ includeHidden: true })]);
  if (!product) notFound();
  return (
    <div className="adm-page">
      <header className="adm-head">
        <h1>{product.name}</h1>
        <div className="adm-head-actions">
          <a href={`/product/${product.slug}`} target="_blank" rel="noopener" className="adm-link">
            View on website ↗
          </a>
          <Link href="/admin/products" className="adm-link">
            ← All products
          </Link>
        </div>
      </header>
      <ProductForm product={product} categories={categories} />
      <form action={deleteProduct} className="adm-danger">
        <input type="hidden" name="id" value={product.id} />
        <p className="adm-muted">Deleting removes the piece from the website for good. To take it down for a while, untick &ldquo;Show on the website&rdquo; instead.</p>
        <ConfirmButton message={`Delete ${product.name}? This cannot be undone.`}>Delete this product</ConfirmButton>
      </form>
    </div>
  );
}
