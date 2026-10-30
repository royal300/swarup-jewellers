import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { query } from "@/lib/db";
import { digits, shortDate } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { updateRates } from "../actions";
import { ActionForm } from "@/components/admin/ActionForm";

export const metadata = { title: "Today" };

export default async function Dashboard() {
  const s = await getSettings();
  const [[counts]] = await Promise.all([
    query<RowDataPacket & { products: number; published: number; categories: number; week: number; total: number }>(
      `SELECT (SELECT COUNT(*) FROM products) AS products,
              (SELECT COUNT(*) FROM products WHERE is_published = 1) AS published,
              (SELECT COUNT(*) FROM categories) AS categories,
              (SELECT COUNT(*) FROM enquiries WHERE created_at > NOW() - INTERVAL 7 DAY) AS week,
              (SELECT COUNT(*) FROM enquiries) AS total`,
    ),
  ]);
  const top = await query<RowDataPacket & { id: number; name: string; slug: string; n: number }>(
    `SELECT p.id, p.name, p.slug, COUNT(*) AS n FROM enquiries e JOIN products p ON p.id = e.product_id
     WHERE e.created_at > NOW() - INTERVAL 30 DAY GROUP BY p.id ORDER BY n DESC LIMIT 6`,
  );

  return (
    <div className="adm-page">
      <header className="adm-head">
        <h1>Today</h1>
        <div className="adm-head-actions">
          <Link href="/admin/products/new" className="adm-btn">
            Add a product
          </Link>
          <Link href="/admin/categories/new" className="adm-btn adm-btn-quiet">
            Add a category
          </Link>
        </div>
      </header>

      <section className="adm-panel adm-rates" aria-labelledby="rates-h">
        <h2 id="rates-h">Today&rsquo;s rate</h2>
        <p className="adm-muted">Per 10 grams. Every price estimate on the website is worked out from these. Last updated {shortDate(s.ratesUpdatedAt) || "never"}.</p>
        <ActionForm action={updateRates} submit="Update rates" className="adm-form adm-rate-form">
          <label className="adm-field adm-field-big">
            <span>22K gold ₹</span>
            <input name="gold_rate_22" inputMode="numeric" defaultValue={s.goldRate22 ?? ""} required />
          </label>
          <label className="adm-field adm-field-big">
            <span>18K gold ₹ (optional)</span>
            <input name="gold_rate_18" inputMode="numeric" defaultValue={s.goldRate18 ?? ""} placeholder={s.goldRate22 ? `auto: ${digits(Math.round((s.goldRate22 * 18) / 22))}` : ""} />
          </label>
          <label className="adm-field adm-field-big">
            <span>Silver ₹</span>
            <input name="silver_rate" inputMode="numeric" defaultValue={s.silverRate ?? ""} />
          </label>
        </ActionForm>
      </section>

      <section className="adm-stats" aria-label="At a glance">
        <div>
          <p className="adm-stat">{counts.published}</p>
          <p className="adm-muted">products on the website ({counts.products - counts.published} hidden)</p>
        </div>
        <div>
          <p className="adm-stat">{counts.categories}</p>
          <p className="adm-muted">categories</p>
        </div>
        <div>
          <p className="adm-stat">{counts.week}</p>
          <p className="adm-muted">WhatsApp enquiries this week ({counts.total} in all)</p>
        </div>
      </section>

      <section className="adm-panel" aria-labelledby="top-h">
        <h2 id="top-h">Most asked about, last 30 days</h2>
        {top.length ? (
          <ol className="adm-top">
            {top.map((t) => (
              <li key={t.id}>
                <Link href={`/admin/products/${t.id}`}>{t.name}</Link>
                <span className="adm-muted">
                  {t.n} {t.n === 1 ? "enquiry" : "enquiries"}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="adm-muted">No WhatsApp enquiries yet. They appear here when visitors tap &ldquo;Ask about this piece&rdquo;.</p>
        )}
      </section>
    </div>
  );
}
