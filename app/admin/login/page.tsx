import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth";
import { login } from "../actions";
import { ActionForm } from "@/components/admin/ActionForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await readSession()) redirect("/admin");
  return (
    <main className="adm-login">
      <div className="adm-login-card">
        <p className="adm-login-bn" lang="bn">
          স্বরূপ
        </p>
        <h1>Shop admin</h1>
        <p className="adm-muted">Sign in to update rates, products and categories.</p>
        <ActionForm action={login} submit="Sign in">
          <label className="adm-field">
            <span>Username</span>
            <input name="username" autoComplete="username" required autoFocus />
          </label>
          <label className="adm-field">
            <span>Password</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
        </ActionForm>
      </div>
    </main>
  );
}
