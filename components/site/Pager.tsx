import Link from "next/link";

export function Pager({ page, pages, basePath, params }: { page: number; pages: number; basePath: string; params: Record<string, string | undefined> }) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "page") sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return `${basePath}${s ? `?${s}` : ""}`;
  };
  return (
    <nav className="pager" aria-label="Pages">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev">
          ← Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="data">
        Page {page} of {pages}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} rel="next">
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
