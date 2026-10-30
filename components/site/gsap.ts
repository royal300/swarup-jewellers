"use client";

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase, useGSAP);

// A brush stroke: fast attack, long feathered tail.
CustomEase.create("brush", "M0,0 C0.12,0.6 0.22,0.92 0.42,0.98 0.62,1.02 0.8,1 1,1");
// A die press: one overshoot, then still.
CustomEase.create("press", "M0,0 C0.3,0 0.42,1.18 0.6,1.06 0.72,0.98 0.84,1 1,1");

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, SplitText, useGSAP };
