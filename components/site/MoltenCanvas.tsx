"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

const vertex = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// Molten gold rising through sindoor: domain-warped fbm mapped onto the site's inks.
const fragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;
uniform float uHeat;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
void main() {
  vec2 uv = vUv;
  uv.x *= uRes.x / uRes.y;
  vec2 p = uv * 2.4;
  p.y -= uTime * 0.22;
  vec2 q = vec2(fbm(p + uTime * 0.05), fbm(p + vec2(5.2, 1.3)));
  vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + uTime * 0.12), fbm(p + 3.0 * q + vec2(8.3, 2.8)));
  float f = fbm(p + 3.2 * r);
  float rise = smoothstep(1.05, -0.1, vUv.y) * smoothstep(0.12, 0.42, vUv.y);
  float h = clamp(f * 1.35 * rise * uHeat + rise * 0.18, 0.0, 1.0);
  vec3 deep = vec3(0.431, 0.039, 0.110);
  vec3 sindoor = vec3(0.639, 0.071, 0.165);
  vec3 haldi = vec3(0.886, 0.643, 0.149);
  vec3 kagoj = vec3(0.937, 0.886, 0.769);
  vec3 col = mix(deep, sindoor, smoothstep(0.05, 0.38, h));
  col = mix(col, haldi, smoothstep(0.42, 0.7, h));
  col = mix(col, kagoj, smoothstep(0.82, 0.98, h));
  // Posterise slightly so the fire prints in flat inks rather than a photographic glow.
  col = floor(col * 9.0) / 9.0;
  gl_FragColor = vec4(col, 1.0);
}`;

export function MoltenCanvas({ active, heat = 1, className }: { active: boolean; heat?: number; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef<{ raf: number; program?: Program; renderer?: Renderer; t0: number }>({ raf: 0, t0: 0 });

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 1.5), alpha: false, antialias: false });
    } catch {
      return; // No WebGL: the flat sindoor field underneath stays.
    }
    const gl = renderer.gl;
    el.appendChild(gl.canvas);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: { uTime: { value: 0 }, uRes: { value: [1, 1] }, uHeat: { value: heat } },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h);
      program.uniforms.uRes.value = [w, h];
    };
    resize();
    window.addEventListener("resize", resize);
    state.current.program = program;
    state.current.renderer = renderer;
    const s = state.current;
    s.t0 = performance.now();
    const loop = (t: number) => {
      program.uniforms.uTime.value = (t - s.t0) / 1000;
      renderer.render({ scene: mesh });
      s.raf = requestAnimationFrame(loop);
    };
    (el as HTMLDivElement & { __start?: () => void }).__start = () => {
      cancelAnimationFrame(s.raf);
      s.raf = requestAnimationFrame(loop);
    };
    (el as HTMLDivElement & { __stop?: () => void }).__stop = () => cancelAnimationFrame(s.raf);
    return () => {
      cancelAnimationFrame(s.raf);
      window.removeEventListener("resize", resize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, [heat]);

  useEffect(() => {
    const el = host.current as (HTMLDivElement & { __start?: () => void; __stop?: () => void }) | null;
    if (!el) return;
    if (active) el.__start?.();
    else el.__stop?.();
  }, [active]);

  return <div ref={host} className={className} aria-hidden />;
}
