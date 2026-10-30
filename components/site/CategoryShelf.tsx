"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Category } from "@/lib/types";
import { GROUPS } from "@/lib/types";
import { imageUrl } from "@/lib/images";
import { gsap, prefersReducedMotion, useGSAP } from "./gsap";
import { IconArrow } from "./illustrations";

const FIELDS = ["field-sindoor", "field-neel", "field-haldi", "field-morpankhi", "field-kagoj"];

/** Categories as book spines on a shelf. A spine's thickness follows how many pieces it holds. */
export function CategoryShelf({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(categories[0]?.slug ?? "");
  const root = useRef<HTMLDivElement>(null);
  const max = Math.max(1, ...categories.map((c) => c.productCount));

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".spine-book", {
        yPercent: 100,
        duration: 1,
        stagger: 0.035,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
      });
    },
    { scope: root },
  );

  const ordered = GROUPS.flatMap((g) => categories.filter((c) => c.group === g.id));

  return (
    <div ref={root} className="shelf">
      <ul className="shelf-row">
        {ordered.map((c, i) => {
          const isOpen = open === c.slug;
          const img = imageUrl(c.image, 600);
          return (
            <li
              key={c.slug}
              className={`spine-book ${FIELDS[i % FIELDS.length]}`}
              data-open={isOpen || undefined}
              style={{ "--thick": `${44 + Math.round((c.productCount / max) * 46)}px` } as React.CSSProperties}
              onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(c.slug)}
            >
              <Link
                href={`/product-category/${c.slug}`}
                onFocus={() => setOpen(c.slug)}
                onClick={(e) => {
                  if (!isOpen) {
                    e.preventDefault();
                    setOpen(c.slug);
                  }
                }}
                aria-label={`${c.name}, ${c.productCount} pieces`}
              >
                <span className="spine-bn brush" lang="bn">
                  {c.nameBn ?? c.name}
                </span>
                <span className="spine-en">{c.name}</span>
                <span className="spine-count data">{c.productCount}</span>
                <span className="spine-cover" aria-hidden={!isOpen}>
                  {img ? <img src={img} alt="" loading="lazy" width={600} height={600} /> : null}
                  <span className="spine-cover-meta">
                    <span className="bn">{c.nameBn}</span>
                    <span>
                      {c.productCount} pieces <IconArrow width={18} height={18} />
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <ul className="shelf-ledge" aria-hidden>
        {GROUPS.map((g) => {
          const n = categories.filter((c) => c.group === g.id).length;
          return n ? (
            <li key={g.id} style={{ flexGrow: n }}>
              <span className="bn">{g.bn}</span> <span className="data">{g.label}</span>
            </li>
          ) : null;
        })}
      </ul>
    </div>
  );
}
