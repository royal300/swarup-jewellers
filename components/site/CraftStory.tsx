"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "./gsap";
import { BangleStack, Flame, Grain, Hammer } from "./illustrations";

const STEPS = [
  {
    id: "mati",
    bn: "মাটি",
    title: "Weight first",
    body: "Every ornament starts as raw gold, weighed before anything else happens. That weight follows the piece all the way to you, which is why every piece here shows it in grams.",
    field: "field-neel",
    Art: Grain,
  },
  {
    id: "agun",
    bn: "আগুন",
    title: "Melted to 22 parts in 24",
    body: "Pure gold is too soft to wear every day, so it is melted and alloyed. 22 karat means 22 parts gold in 24, about 91.6%, the purity most Bengali bridal pieces are made in.",
    field: "field-sindoor",
    Art: Flame,
  },
  {
    id: "haturi",
    bn: "হাতুড়ি",
    title: "Shaped by hand",
    body: "Then the hammer, the draw plate and the karigar’s patience: sheet becomes bala, wire becomes filigree, and a pola gets its gold collar.",
    field: "field-haldi",
    Art: Hammer,
  },
  {
    id: "alta",
    bn: "আলতা",
    title: "Hallmarked, then worn",
    body: "Before it reaches a bride’s wrist, a piece is hallmarked by BIS and given a six-digit HUID code you can check yourself in the BIS CARE app.",
    field: "field-morpankhi",
    Art: BangleStack,
  },
];

/** The story again, slower: four stacked jackets that slide over one another as you scroll. */
export function CraftStory() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(".craft-panel").forEach((panel, i, all) => {
        const word = panel.querySelector(".craft-word");
        gsap.fromTo(word, { "--wscale": 0.55 }, { "--wscale": 1, ease: "none", scrollTrigger: { trigger: panel, start: "top bottom", end: "top top", scrub: true } });
        // Only some drawings have hand-drawn strokes (the fire and the bangles are solid shapes).
        const strokes = panel.querySelectorAll(".draw");
        if (strokes.length) {
          gsap.from(strokes, { drawSVG: "0%", stagger: 0.05, ease: "none", scrollTrigger: { trigger: panel, start: "top 80%", end: "top 20%", scrub: true } });
        }
        gsap.from(panel.querySelector(".craft-art"), { y: 80, rotate: i % 2 ? 6 : -6, ease: "none", scrollTrigger: { trigger: panel, start: "top bottom", end: "top top", scrub: true } });
        if (i < all.length - 1) {
          gsap.to(panel.querySelector(".craft-inner"), { scale: 0.92, opacity: 0.4, ease: "none", scrollTrigger: { trigger: all[i + 1], start: "top bottom", end: "top top", scrub: true } });
        }
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="craft">
      {STEPS.map(({ id, bn, title, body, field, Art }) => (
        <section key={id} className={`craft-panel grain ${field}`} aria-labelledby={`craft-${id}`}>
          <div className="craft-inner">
            <p className="craft-word brush misreg" data-text={bn} aria-hidden lang="bn">
              {bn}
            </p>
            <div className="craft-art">
              <Art />
            </div>
            <div className="craft-copy">
              <h3 id={`craft-${id}`} className="condensed">
                {title}
              </h3>
              <p>{body}</p>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
