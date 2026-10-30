"use client";

import { useCallback, useRef, useState } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "./gsap";
import { BangleStack, BetelLeaf, Flame, Grain, Hammer, Prajapati } from "./illustrations";
import { MoltenCanvas } from "./MoltenCanvas";

const CUES = [
  { id: "mati", bn: "মাটি", en: "Mati", line: "It begins as a grain in the earth.", field: "field-neel" },
  { id: "agun", bn: "আগুন", en: "Agun", line: "Fire teaches it to flow.", field: "field-sindoor" },
  { id: "haturi", bn: "হাতুড়ি", en: "Haturi", line: "A karigar’s hammer gives it a shape.", field: "field-haldi" },
  { id: "alta", bn: "আলতা", en: "Alta", line: "And a bride gives it a story.", field: "field-morpankhi" },
] as const;

export const STORY_DONE = "sj:story-done";

function markSeen() {
  document.cookie = "sj_story=1; path=/; max-age=31536000; samesite=lax";
}

/** The entry story: four named cues, skippable, scrubbable from the cue rail. Shown once per visitor. */
export function EntryStory() {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [cue, setCue] = useState(0);
  const [gone, setGone] = useState(false);
  const [fire, setFire] = useState(false);

  const finish = useCallback(() => {
    markSeen();
    document.documentElement.classList.remove("story-lock");
    window.__lenis?.start();
    window.dispatchEvent(new Event(STORY_DONE));
    setGone(true);
    // Scroll effects were measured under the overlay; measure again now the page is scrollable.
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        finish();
        return;
      }
      window.__lenis?.stop();
      const q = gsap.utils.selector(el);
      const plates = q(".story-plate");
      gsap.set(plates.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(q(".story-word"), { clipPath: "inset(0% 100% 0% 0%)" });
      gsap.set(q(".story-line"), { y: 24, opacity: 0 });

      const t = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: () => exit() });
      tl.current = t;

      const word = (i: number) => {
        t.to(q(`.story-plate:nth-child(${i + 1}) .story-word`), { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "brush" }, "<0.15");
        t.to(q(`.story-plate:nth-child(${i + 1}) .story-line`), { y: 0, opacity: 1, duration: 0.8 }, "<0.45");
      };
      const enter = (i: number, from: string) => {
        t.addLabel(CUES[i].id);
        t.call(() => setCue(i));
        t.fromTo(plates[i], { clipPath: from }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "expo.inOut" });
      };

      // Mati: night silt, a single grain catches the light.
      t.addLabel("mati");
      t.call(() => setCue(0));
      t.from(q(".s-mati .draw"), { drawSVG: "0%", duration: 1.4, stagger: 0.12, ease: "power2.out" }, 0.1);
      t.from(q(".s-mati .nugget"), { scale: 0, transformOrigin: "50% 50%", duration: 0.9, ease: "press" }, 0.5);
      t.from(q(".s-mati .glint path"), { drawSVG: "50% 50%", opacity: 0, duration: 0.5, stagger: 0.06 }, 1.0);
      word(0);
      t.to({}, { duration: 0.5 });

      // Agun: the field floods red, the fire comes alive behind the crucible.
      enter(1, "inset(100% 0% 0% 0%)");
      t.call(() => setFire(true), undefined, "<");
      t.from(q(".s-agun .tongue"), { scaleY: 0, transformOrigin: "50% 100%", duration: 0.9, stagger: 0.08, ease: "back.out(2)" }, "<0.3");
      word(1);
      t.to({}, { duration: 0.6 });

      // Haturi: three strikes; the wire closes into a ring.
      enter(2, "inset(0% 100% 0% 0%)");
      t.call(() => setFire(false));
      t.set(q(".s-haturi .ring-wire"), { drawSVG: "0%" }, "<");
      word(2);
      for (let k = 0; k < 3; k++) {
        t.fromTo(q(".s-haturi .hammer"), { rotation: -24 }, { rotation: 0, transformOrigin: "96% 4%", duration: 0.32, ease: "power3.in" }, k === 0 ? "<0.2" : ">0.05");
        t.fromTo(q(".s-haturi .sparks path"), { drawSVG: "0% 0%", opacity: 1 }, { drawSVG: "0% 100%", duration: 0.2, stagger: 0.02 }, ">");
        t.to(q(".s-haturi .ring-wire"), { drawSVG: `${(k + 1) * 34}%`, duration: 0.3 }, "<");
        t.to(q(".s-haturi .story-art"), { y: 5, duration: 0.06, yoyo: true, repeat: 1, ease: "none" }, "<");
        t.to(q(".s-haturi .sparks path"), { opacity: 0, duration: 0.25 }, ">");
        t.to(q(".s-haturi .hammer"), { rotation: -24, transformOrigin: "96% 4%", duration: 0.28, ease: "power2.out" }, "<");
      }
      t.to({}, { duration: 0.3 });

      // Alta: the bangles slide on, the betel leaves part, the prajapati opens its wings.
      enter(3, "inset(0% 0% 100% 0%)");
      t.from(q(".s-alta .bangle"), { y: -160, opacity: 0, duration: 0.8, stagger: 0.12, ease: "press" }, "<0.35");
      t.from(q(".s-alta .leaf-l"), { x: 60, rotation: 20, opacity: 0, duration: 0.9 }, "<0.2");
      t.from(q(".s-alta .leaf-r"), { x: -60, rotation: -20, opacity: 0, duration: 0.9 }, "<");
      t.from(q(".s-alta .wing"), { scaleX: 0, transformOrigin: "0% 50%", duration: 0.7, ease: "back.out(2.4)" }, "<0.3");
      word(3);
      t.to({}, { duration: 0.7 });

      // The jacket: the shop's name presses onto haldi, the same field the home page opens on.
      t.addLabel("name");
      t.call(() => setCue(4));
      t.fromTo(q(".story-name"), { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(150% at 50% 50%)", duration: 1.1, ease: "expo.inOut" });
      t.from(q(".story-name .name-bn"), { scale: 1.25, opacity: 0, duration: 0.9, ease: "press" }, "<0.45");
      t.from(q(".story-name .name-en"), { y: 20, opacity: 0, duration: 0.7 }, "<0.3");
      t.to({}, { duration: 0.6 });

      function exit() {
        gsap.to(el, {
          yPercent: -100,
          duration: 1,
          ease: "expo.inOut",
          onStart: () => window.dispatchEvent(new Event(STORY_DONE + ":start")),
          onComplete: finish,
        });
      }

      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") skip();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    },
    { scope: root },
  );

  const skip = useCallback(() => {
    const t = tl.current;
    if (!t) return finish();
    t.progress(1);
  }, [finish]);

  const seek = (label: string) => {
    const t = tl.current;
    if (t) t.play(label);
  };

  if (gone) return null;

  return (
    <div ref={root} className="story" role="dialog" aria-modal="true" aria-label="Swarup Jewellers — the story of gold">
      <div className="story-plates">
        {CUES.map((c) => (
          <section key={c.id} className={`story-plate grain ${c.field} s-${c.id}`} aria-label={c.en}>
            {c.id === "agun" ? <MoltenCanvas active={fire} className="story-molten" /> : null}
            <div className="story-art">
              {c.id === "mati" ? <Grain /> : null}
              {c.id === "agun" ? <Flame /> : null}
              {c.id === "haturi" ? <Hammer /> : null}
              {c.id === "alta" ? (
                <div className="alta-set">
                  <BetelLeaf className="leaf-l" />
                  <BangleStack className="alta-bangles" />
                  <BetelLeaf className="leaf-r" />
                  <Prajapati className="alta-praja" />
                </div>
              ) : null}
            </div>
            <p className="story-word brush misreg" data-text={c.bn} lang="bn">
              {c.bn}
            </p>
            <p className="story-line">
              <span className="data">{c.en}</span> {c.line}
            </p>
          </section>
        ))}
      </div>
      <div className="story-name field-haldi grain">
        <p className="name-bn brush misreg" data-text="স্বরূপ" lang="bn">
          স্বরূপ
        </p>
        <p className="name-en extended">Swarup Jewellers · Madhyamgram</p>
      </div>
      <div className="story-rail">
        <ol>
          {CUES.map((c, i) => (
            <li key={c.id}>
              <button type="button" onClick={() => seek(c.id)} aria-current={cue === i ? "step" : undefined} data-past={cue > i || undefined}>
                <span className="bn">{c.bn}</span> <span className="data">{c.en}</span>
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="story-skip" onClick={skip}>
          Skip<span className="skip-long"> to the jewellery</span>
        </button>
      </div>
    </div>
  );
}
