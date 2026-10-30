"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/types";
import { GROUPS } from "@/lib/types";
import { gsap, prefersReducedMotion } from "./gsap";
import { IconClose, IconMenu, IconWhatsApp } from "./illustrations";

type Props = { categories: Category[]; whatsapp: string; phone: string; address: string; hours: string };

const LINKS = [
  { href: "/collections", label: "Collections" },
  { href: "/todays-rate", label: "Today's rate" },
  { href: "/visit", label: "Visit the shop" },
];

export function Spine({ categories, whatsapp, phone, address, hours }: Props) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello Swarup Jewellers, I'd like to know more about your collection.")}`;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      window.__lenis?.stop();
      if (!prefersReducedMotion()) {
        gsap.fromTo(d, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "expo.out" });
        gsap.from(d.querySelectorAll(".flap-cat"), { y: 40, opacity: 0, duration: 0.6, stagger: 0.025, ease: "expo.out", delay: 0.15 });
      }
    } else if (!open && d.open) {
      const done = () => {
        d.close();
        window.__lenis?.start();
      };
      if (prefersReducedMotion()) done();
      else gsap.to(d, { clipPath: "inset(0 100% 0 0)", duration: 0.45, ease: "expo.in", onComplete: done });
    }
  }, [open]);

  return (
    <>
      <header className="spine field-sindoor">
        <Link href="/" className="spine-mark" aria-label="Swarup Jewellers home">
          <span className="brush">স্ব</span>
        </Link>
        <nav className="spine-links" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname.startsWith(l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="spine-title" tabIndex={-1} aria-hidden>
          <span className="bn">স্বরূপ জুয়েলার্স</span> <span>Swarup Jewellers · Madhyamgram</span>
        </Link>
        <div className="spine-actions">
          <a className="spine-wa" href={waHref} target="_blank" rel="noopener" aria-label="Message the shop on WhatsApp">
            <IconWhatsApp width={22} height={22} />
          </a>
          <button type="button" className="spine-menu" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
            <IconMenu width={24} height={24} />
            <span>Menu</span>
          </button>
        </div>
      </header>

      <dialog ref={dialog} className="flap field-neel grain" aria-label="All collections" onCancel={(e) => (e.preventDefault(), setOpen(false))}>
        <div className="flap-inner">
          <div className="flap-head">
            <p className="flap-brand brush misreg" data-text="স্বরূপ">
              স্বরূপ
            </p>
            <button type="button" className="flap-close" onClick={() => setOpen(false)}>
              <IconClose width={26} height={26} />
              <span>Close</span>
            </button>
          </div>
          <div className="flap-groups">
            {GROUPS.map((g) => {
              const cats = categories.filter((c) => c.group === g.id);
              if (!cats.length) return null;
              return (
                <section key={g.id} className="flap-group">
                  <h2 className="data">{g.label}</h2>
                  <ul>
                    {cats.map((c) => (
                      <li key={c.slug} className="flap-cat">
                        <Link href={`/product-category/${c.slug}`}>
                          <span className="flap-bn bn">{c.nameBn ?? c.name}</span>
                          <span className="flap-en">
                            {c.name} <span className="data">{c.productCount}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
          <div className="flap-foot">
            <nav aria-label="Pages">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </nav>
            <p>
              {address} · {hours} · <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
