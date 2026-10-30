import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = { title: { default: "Shop admin", template: "%s · Shop admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
