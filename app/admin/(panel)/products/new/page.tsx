import Link from "next/link";
import { listCategories } from "@/lib/catalog";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Add a product" };

export default async function NewProduct() {
  const categories = await listCategories({ includeHidden: true });
  return (
    <div className="adm-page">
      <header className="adm-head">
        <h1>Add a product</h1>
        <Link href="/admin/products" className="adm-link">
          ← All products
        </Link>
      </header>
      <ProductForm categories={categories} />
    </div>
  );
}
