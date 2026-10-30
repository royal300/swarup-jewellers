"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "./gsap";

/** On wide screens the newest pieces travel sideways while the section is pinned; on phones they are a swipe row. */
export function NewestGallery({ head, children }: { head: React.ReactNode; children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        const el = track.current!;
        const distance = () => Math.max(0, el.scrollWidth - el.clientWidth);
        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        gsap.utils.toArray<HTMLElement>(".plate", el).forEach((p, i) => {
          gsap.from(p, { rotate: i % 2 ? 3 : -3, duration: 1, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 70%", once: true } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="newest-pin">
      {head}
      <div ref={track} className="newest-track">
        {children}
      </div>
    </div>
  );
}
