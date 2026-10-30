import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <Link href="/admin" className="adm-brand">
          <span lang="bn">স্বরূপ</span>
          <small>Shop admin</small>
        </Link>
        <AdminNav />
        <div className="adm-side-foot">
          <a href="/" target="_blank" rel="noopener">
            View website ↗
          </a>
          <form action={logout}>
            <button type="submit" className="adm-link">
              Sign out {session.username}
            </button>
          </form>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
