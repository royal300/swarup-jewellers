"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { IconSearch } from "./illustrations";

const SORTS = [
  { id: "new", label: "Newest" },
  { id: "popular", label: "Most viewed" },
  { id: "light", label: "Lightest" },
  { id: "heavy", label: "Heaviest" },
];

/** Search and sort for a catalogue page; state lives in the URL so results can be shared on WhatsApp. */
export function CatalogueControls({ showSearch = true }: { showSearch?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [pending, start] = useTransition();

  const push = (next: Record<string, string | null>) => {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete("page");
    start(() => router.push(`${pathname}${sp.size ? `?${sp}` : ""}`, { scroll: false }));
  };

  return (
    <div className="cat-controls" data-pending={pending || undefined}>
      {showSearch ? (
        <form
          role="search"
          className="cat-search"
          onSubmit={(e) => {
            e.preventDefault();
            push({ q: q.trim() || null });
          }}
        >
          <label className="sr-only" htmlFor="cat-q">
            Search the collection
          </label>
          <input id="cat-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: sankha, necklace, 8 g…" />
          <button type="submit" aria-label="Search">
            <IconSearch width={20} height={20} />
          </button>
        </form>
      ) : null}
      <div className="cat-sort" role="group" aria-label="Sort">
        {SORTS.map((s) => {
          const active = (params.get("sort") ?? "new") === s.id;
          return (
            <button key={s.id} type="button" aria-pressed={active} onClick={() => push({ sort: s.id === "new" ? null : s.id })}>
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
