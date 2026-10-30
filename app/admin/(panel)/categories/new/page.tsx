import Link from "next/link";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata = { title: "Add a category" };

export default function NewCategory() {
  return (
    <div className="adm-page">
      <header className="adm-head">
        <h1>Add a category</h1>
        <Link href="/admin/categories" className="adm-link">
          ← All categories
        </Link>
      </header>
      <CategoryForm />
    </div>
  );
}
