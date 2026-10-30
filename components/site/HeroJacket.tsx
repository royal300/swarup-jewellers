"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Category } from "@/lib/types";
import { digits } from "@/lib/format";
import { STORY_DONE } from "./EntryStory";
import { gsap, prefersReducedMotion, useGSAP } from "./gsap";
import { BangleStack, IconArrow, IconWhatsApp, MatraChain } from "./illustrations";
import { StepDigits } from "./StepDigits";

type Props = {
  rate22: number | null;
  rateDate: string;
  chips: Pick<Category, "slug" | "name" | "nameBn">[];
  total: number;
  whatsapp: string;
  waitForStory: boolean;
};

export function HeroJacket({ rate22, rateDate, chips, total, whatsapp, waitForStory }: Props) {
  const root = useRef<HTMLElement>(null);
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello Swarup Jewellers, I saw your website and would like to know more.")}`;

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const q = gsap.utils.selector(el);
      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      tl.from(q(".jk-word"), { clipPath: "inset(0% 100% 0% 0%)", duration: 1.3, ease: "brush" })
        .from(q(".jk-chain"), { clipPath: "inset(0% 50% 0% 50%)", duration: 1.1, ease: "power2.out" }, "<0.5")
        .from(q(".jk-chain .pendant"), { y: -60, opacity: 0, duration: 0.9, ease: "press" }, "<0.5")
        .from(q(".jk-bangles .bangle"), { y: -220, opacity: 0, duration: 0.9, stagger: 0.1, ease: "press" }, "<-0.2")
        .from(q(".jk-title .line"), { yPercent: 110, duration: 1, stagger: 0.08 }, "<0.1")
        .from(q(".jk-sticker-in"), { scale: 0, rotation: -120, duration: 1, ease: "back.out(1.7)" }, "<0.2")
        .from(q(".jk-flap > *"), { y: 30, opacity: 0, duration: 0.8, stagger: 0.06 }, "<0.2");

      // Scroll: the roman title stretches across its width axis as the jacket slides away.
      gsap.to(q(".jk-title"), {
        "--wdth": 125,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(q(".jk-word-wrap"), {
        yPercent: -12,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });

      if (!waitForStory) {
        tl.play();
        return;
      }
      const go = () => tl.play();
      window.addEventListener(STORY_DONE + ":start", go, { once: true });
      window.addEventListener(STORY_DONE, go, { once: true });
      return () => {
        window.removeEventListener(STORY_DONE + ":start", go);
        window.removeEventListener(STORY_DONE, go);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="jacket field-haldi grain" aria-labelledby="jk-title">
      <p className="jk-imprint data">Badu Road · Madhyamgram Chowmatha · Kolkata 700129</p>

      <Link href="/todays-rate" className="jk-sticker" aria-label={rate22 ? `Today's 22K gold rate ₹${digits(rate22)} per 10 grams` : "Today's rate"}>
        <span className="jk-sticker-in field-neel">
        <span className="bn">আজকের দর</span>
        <span className="data">22K · 10 g</span>
        {rate22 ? (
          <span className="jk-rate">
            ₹<StepDigits value={digits(rate22)} />
          </span>
        ) : (
          <span className="jk-rate">Ask us</span>
        )}
        <span className="data jk-date">{rateDate}</span>
        </span>
      </Link>

      <div className="jk-word-wrap" aria-hidden>
        <BangleStack className="jk-bangles jk-bangles-back" half="back" />
        <span className="jk-word brush misreg" data-text="সোনা" lang="bn">
          সোনা
        </span>
        <MatraChain className="jk-chain" />
        <BangleStack className="jk-bangles jk-bangles-front" half="front" />
      </div>

      <div className="jk-copy">
        <h1 id="jk-title" className="jk-title">
          <span className="line-mask">
            <span className="line">Gold for every</span>
          </span>
          <span className="line-mask">
            <span className="line">Bengali ritual</span>
          </span>
        </h1>
        <p className="jk-sub">
          Sankha, pola, noa, bala and everyday gold from Madhyamgram Chowmatha. BIS HUID hallmarked, weighed in grams, priced by today&rsquo;s rate,
          and one WhatsApp away.
        </p>
      </div>

      <nav className="jk-flap" aria-label="Find your piece">
        <p className="jk-flap-label extended">Find your piece</p>
        <ul className="jk-chips">
          {chips.map((c) => (
            <li key={c.slug}>
              <Link href={`/product-category/${c.slug}`} className="chip">
                <span className="bn">{c.nameBn ?? c.name}</span>
                <span>{c.name}</span>
              </Link>
            </li>
          ))}
          <li>
            <Link href="/collections" className="chip chip-all">
              All {total} pieces <IconArrow width={18} height={18} />
            </Link>
          </li>
        </ul>
        <a className="btn-act" href={waHref} target="_blank" rel="noopener">
          <IconWhatsApp width={20} height={20} /> WhatsApp the shop
        </a>
      </nav>
    </section>
  );
}
