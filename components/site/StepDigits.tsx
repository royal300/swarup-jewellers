"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "./gsap";

/** A number that steps into place digit by digit, like a destination blind: whole steps, one overshoot, then still. */
export function StepDigits({ value, className }: { value: string; className?: string }) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const cols = el.querySelectorAll<HTMLElement>(".sd-col");
      const tl = gsap.timeline({ paused: true });
      cols.forEach((col, i) => {
        const steps = Number(col.dataset.d);
        tl.fromTo(col, { y: 0, yPercent: 0 }, { y: 0, yPercent: -steps * 10, duration: 0.5 + steps * 0.07, ease: "back.out(1.6)" }, i * 0.07);
      });
      const st = ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => tl.play() });
      return () => st.kill();
    },
    { scope: root, dependencies: [value] },
  );

  return (
    <span ref={root} className={`sd ${className ?? ""}`} aria-label={value}>
      {value.split("").map((ch, i) =>
        /[0-9]/.test(ch) ? (
          <span key={i} className="sd-win" aria-hidden>
            <span className="sd-col" data-d={ch} style={{ transform: `translateY(${-Number(ch) * 10}%)` }}>
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} className="sd-sep" aria-hidden>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}
