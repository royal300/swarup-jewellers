import type { SVGProps } from "react";

/*
 * Brush-line drawings for the lettered-jacket world. Every drawing is printed in two inks:
 * the key line in `--ink` and a slightly offset second impression in `--misreg-ink`.
 */

type P = SVGProps<SVGSVGElement> & { title?: string };

// Server and browser must print identical coordinates, so trig output is rounded before it reaches the DOM.
const r2 = (n: number) => Math.round(n * 100) / 100;

function Svg({ title, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg role={title ? "img" : undefined} aria-hidden={title ? undefined : true} {...rest}>
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** One bangle seen in perspective. `half` limits it to the front (lower) arc so a letter stroke can pass through it. */
function Bangle({
  cx,
  cy,
  rx,
  ry,
  w,
  kind,
  half,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  w: number;
  kind: "sankha" | "pola" | "noa";
  half?: "front" | "back";
}) {
  const id = `${kind}-${cx}-${cy}-${half ?? "all"}`;
  const fill = kind === "sankha" ? "var(--kagoj)" : kind === "pola" ? "var(--sindoor)" : "var(--haldi-hi)";
  const ridges = kind === "sankha" ? 28 : kind === "noa" ? 22 : 0;
  const ring = `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${2 * rx} 0 a ${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z M ${cx - rx + w} ${cy} a ${rx - w} ${ry - w * 0.42} 0 1 1 ${2 * (rx - w)} 0 a ${rx - w} ${ry - w * 0.42} 0 1 1 ${-2 * (rx - w)} 0 Z`;
  const clip = half === "front" ? `M ${cx - rx - 20} ${cy} H ${cx + rx + 20} V ${cy + ry + 40} H ${cx - rx - 20} Z` : half === "back" ? `M ${cx - rx - 20} ${cy} H ${cx + rx + 20} V ${cy - ry - 40} H ${cx - rx - 20} Z` : null;
  return (
    <g clipPath={clip ? `url(#c-${id})` : undefined}>
      {clip ? (
        <defs>
          <clipPath id={`c-${id}`}>
            <path d={clip} />
          </clipPath>
        </defs>
      ) : null}
      <path d={ring} fill="var(--misreg-ink)" fillRule="evenodd" transform="translate(5 3)" opacity="0.9" />
      <path d={ring} fill={fill} fillRule="evenodd" stroke="var(--kali)" strokeWidth="3.2" strokeLinejoin="round" />
      {kind === "pola" ? (
        <>
          <ellipse cx={cx} cy={cy} rx={rx - 2.5} ry={ry - 1.2} fill="none" stroke="var(--haldi-hi)" strokeWidth="4" />
          <ellipse cx={cx} cy={cy} rx={rx - w + 2.5} ry={ry - w * 0.42 + 1.2} fill="none" stroke="var(--haldi-hi)" strokeWidth="4" />
        </>
      ) : null}
      {Array.from({ length: ridges }, (_, i) => {
        const t = (i / ridges) * Math.PI * 2;
        const x1 = r2(cx + Math.cos(t) * (rx - 3));
        const y1 = r2(cy + Math.sin(t) * (ry - 1.5));
        const x2 = r2(cx + Math.cos(t) * (rx - w + 3));
        const y2 = r2(cy + Math.sin(t) * (ry - w * 0.42 + 1.5));
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={kind === "noa" ? "var(--haldi-deep)" : "var(--kali)"} strokeWidth={kind === "noa" ? 2 : 1.6} strokeLinecap="round" opacity={kind === "noa" ? 0.9 : 0.55} />;
      })}
    </g>
  );
}

const STACK: { kind: "sankha" | "pola" | "noa"; cy: number; rx: number; ry: number; w: number }[] = [
  { kind: "noa", cy: 70, rx: 88, ry: 24, w: 10 },
  { kind: "sankha", cy: 112, rx: 96, ry: 27, w: 24 },
  { kind: "pola", cy: 158, rx: 94, ry: 26, w: 20 },
  { kind: "sankha", cy: 202, rx: 96, ry: 27, w: 24 },
];

/** Sankha, pola and noa stacked as a bride wears them. Render a "back" and a "front" copy around a letter stroke. */
export function BangleStack({ half, ...rest }: P & { half?: "front" | "back" }) {
  return (
    <Svg viewBox="0 0 220 250" {...rest}>
      {STACK.map((b, i) => (
        <g key={i} className="bangle" data-i={i}>
          <Bangle cx={110} cy={b.cy} rx={b.rx} ry={b.ry} w={b.w} kind={b.kind} half={half} />
        </g>
      ))}
    </Svg>
  );
}

/** A chain hanging from the headstroke (matra) of the lettering, with a drop pendant. */
export function MatraChain(props: P) {
  return (
    <Svg viewBox="0 0 600 260" fill="none" {...props}>
      <path className="chain" d="M8 10 C 120 190, 480 190, 592 10" stroke="var(--misreg-ink)" strokeWidth="7" strokeDasharray="3 9" strokeLinecap="round" transform="translate(4 3)" />
      <path className="chain" d="M8 10 C 120 190, 480 190, 592 10" stroke="var(--kali)" strokeWidth="7" strokeDasharray="3 9" strokeLinecap="round" />
      <g className="pendant" transform="translate(300 150)">
        <path d="M0 0 C 26 22, 34 52, 0 92 C -34 52, -26 22, 0 0 Z" fill="var(--haldi-hi)" stroke="var(--kali)" strokeWidth="3.5" transform="translate(4 3)" opacity="0" />
        <path d="M0 0 C 26 22, 34 52, 0 92 C -34 52, -26 22, 0 0 Z" fill="var(--misreg-ink)" transform="translate(5 4)" />
        <path d="M0 0 C 26 22, 34 52, 0 92 C -34 52, -26 22, 0 0 Z" fill="var(--haldi-hi)" stroke="var(--kali)" strokeWidth="3.5" strokeLinejoin="round" />
        <circle cx="0" cy="48" r="11" fill="var(--sindoor)" stroke="var(--kali)" strokeWidth="3" />
        <path d="M-12 26 Q 0 34 12 26" stroke="var(--kali)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M-9 72 Q 0 78 9 72" stroke="var(--kali)" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </Svg>
  );
}

/** A gold grain resting in river silt — the Mati cue. */
export function Grain(props: P) {
  return (
    <Svg viewBox="0 0 400 300" fill="none" {...props}>
      {[0, 1, 2, 3].map((i) => (
        <path key={i} className="draw" d={`M${20 + i * 6} ${200 + i * 22} C 90 ${180 + i * 22}, 150 ${222 + i * 22}, 210 ${200 + i * 22} S 330 ${180 + i * 22}, ${384 - i * 6} ${200 + i * 22}`} stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" opacity={0.75 - i * 0.14} />
      ))}
      <g className="nugget">
        <path d="M168 150 C 172 122, 214 112, 236 128 C 258 144, 250 176, 222 182 C 196 188, 164 176, 168 150 Z" fill="var(--misreg-ink)" transform="translate(5 4)" />
        <path d="M168 150 C 172 122, 214 112, 236 128 C 258 144, 250 176, 222 182 C 196 188, 164 176, 168 150 Z" fill="var(--haldi-hi)" stroke="var(--kali)" strokeWidth="3.5" />
        <path d="M188 140 C 196 132, 210 130, 220 134" stroke="var(--kagoj)" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g className="glint" stroke="var(--haldi-hi)" strokeWidth="3.5" strokeLinecap="round">
        <path d="M206 92 V 70" />
        <path d="M258 108 L 274 94" />
        <path d="M154 108 L 138 94" />
        <path d="M282 150 H 304" />
        <path d="M130 150 H 108" />
      </g>
    </Svg>
  );
}

/** Three tongues of flame over a crucible — the Agun cue. */
export function Flame(props: P) {
  const tongue = (s: number, x: number) =>
    `M${x} 250 C ${x - 60 * s} ${210 - 20 * s}, ${x - 40 * s} ${150 - 40 * s}, ${x} ${70 - 30 * s} C ${x + 10 * s} ${130 - 20 * s}, ${x + 70 * s} ${170 - 10 * s}, ${x} 250 Z`;
  return (
    <Svg viewBox="0 0 400 340" fill="none" {...props}>
      <g className="flames">
        <path className="tongue" d={tongue(1.3, 200)} fill="var(--haldi)" stroke="var(--kali)" strokeWidth="3.5" strokeLinejoin="round" />
        <path className="tongue" d={tongue(0.9, 150)} fill="var(--haldi-hi)" stroke="var(--kali)" strokeWidth="3" strokeLinejoin="round" />
        <path className="tongue" d={tongue(1, 248)} fill="var(--haldi-hi)" stroke="var(--kali)" strokeWidth="3" strokeLinejoin="round" />
        <path className="tongue" d={tongue(0.55, 200)} fill="var(--kagoj)" stroke="var(--kali)" strokeWidth="2.6" strokeLinejoin="round" />
      </g>
      <path d="M96 246 H 304 L 284 312 C 260 326, 140 326, 116 312 Z" fill="var(--misreg-ink)" transform="translate(6 4)" />
      <path d="M96 246 H 304 L 284 312 C 260 326, 140 326, 116 312 Z" fill="var(--kali)" stroke="var(--kali)" strokeWidth="3.5" strokeLinejoin="round" />
      <ellipse cx="200" cy="248" rx="104" ry="12" fill="var(--haldi-hi)" stroke="var(--kali)" strokeWidth="3.5" />
    </Svg>
  );
}

/** Hammer over an anvil, with the wire it is turning into a ring — the Haturi cue. */
export function Hammer(props: P) {
  return (
    <Svg viewBox="0 0 420 340" fill="none" {...props}>
      <g className="anvil">
        <path d="M70 220 H 330 C 330 244, 300 252, 270 252 L 250 300 H 150 L 130 252 C 100 252, 70 244, 70 220 Z" fill="var(--misreg-ink)" transform="translate(6 4)" />
        <path d="M70 220 H 330 C 330 244, 300 252, 270 252 L 250 300 H 150 L 130 252 C 100 252, 70 244, 70 220 Z" fill="var(--kali)" />
        <path d="M30 220 C 40 206, 60 202, 70 202 H 330 V 220 Z" fill="var(--kali)" />
      </g>
      <path className="draw ring-wire" d="M200 196 m -34 0 a 34 12 0 1 0 68 0 a 34 12 0 1 0 -68 0" stroke="var(--haldi-hi)" strokeWidth="7" strokeLinecap="round" />
      <g className="sparks" stroke="var(--kali)" strokeWidth="3" strokeLinecap="round">
        <path d="M150 176 L 128 160" />
        <path d="M250 176 L 272 160" />
        <path d="M200 160 V 136" />
        <path d="M170 166 L 160 146" />
        <path d="M230 166 L 240 146" />
      </g>
      <g className="hammer">
        <path d="M330 30 L 236 168" stroke="var(--misreg-ink)" strokeWidth="16" strokeLinecap="round" transform="translate(5 3)" />
        <path d="M330 30 L 236 168" stroke="var(--kali)" strokeWidth="14" strokeLinecap="round" />
        <rect x="172" y="150" width="96" height="40" rx="6" transform="rotate(34 220 170)" fill="var(--misreg-ink)" />
        <rect x="168" y="146" width="96" height="40" rx="6" transform="rotate(34 216 166)" fill="var(--kagoj)" stroke="var(--kali)" strokeWidth="3.5" />
      </g>
    </Svg>
  );
}

/** Prajapati: the butterfly printed on every Bengali wedding card. */
export function Prajapati(props: P) {
  const wing = "M0 0 C 30 -60, 96 -84, 110 -40 C 120 -8, 70 6, 0 0 Z";
  const low = "M0 0 C 50 10, 96 30, 82 66 C 70 92, 26 64, 0 0 Z";
  return (
    <Svg viewBox="-130 -100 260 200" fill="none" {...props}>
      {[1, -1].map((s) => (
        <g key={s} transform={`scale(${s} 1)`}>
          <path d={wing} fill="var(--misreg-ink)" transform="translate(5 3)" />
          <path className="wing" d={wing} fill="var(--accent)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
          <path d={low} fill="var(--misreg-ink)" transform="translate(5 3)" />
          <path className="wing" d={low} fill="var(--field)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="62" cy="-34" r="12" fill="var(--field)" stroke="var(--ink)" strokeWidth="2.5" />
          <circle cx="52" cy="40" r="7" fill="var(--accent)" stroke="var(--ink)" strokeWidth="2.5" />
        </g>
      ))}
      <path d="M0 -26 C 6 -10, 6 30, 0 52 C -6 30, -6 -10, 0 -26 Z" fill="var(--ink)" />
      <path d="M0 -24 C -8 -46, -20 -60, -34 -66 M0 -24 C 8 -46, 20 -60, 34 -66" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

/** Betel leaf, held over the bride's face before Shubho Drishti. */
export function BetelLeaf(props: P) {
  const leaf = "M100 230 C 30 180, 10 110, 40 64 C 60 34, 92 40, 100 64 C 108 40, 140 34, 160 64 C 190 110, 170 180, 100 230 Z";
  return (
    <Svg viewBox="0 0 200 250" fill="none" {...props}>
      <path d={leaf} fill="var(--misreg-ink)" transform="translate(5 4)" />
      <path d={leaf} fill="var(--morpankhi)" stroke="var(--kali)" strokeWidth="3.5" strokeLinejoin="round" />
      <path className="draw" d="M100 64 V 226 M100 110 C 80 96, 60 96, 46 104 M100 110 C 120 96, 140 96, 154 104 M100 150 C 80 138, 58 140, 44 150 M100 150 C 120 138, 142 140, 156 150 M100 188 C 86 180, 70 182, 60 190 M100 188 C 114 180, 130 182, 140 190" stroke="var(--haldi-hi)" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

/** Alpana: rice-paste floor drawing, generated as rings of petals and dots. */
export function Alpana({ rings = 3, ...props }: P & { rings?: number }) {
  const parts: React.ReactNode[] = [];
  for (let r = 0; r < rings; r++) {
    const n = 8 + r * 4;
    const inner = 34 + r * 46;
    const outer = inner + 40;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (r % 2 ? Math.PI / n : 0);
      const a1 = a - Math.PI / n / 1.3;
      const a2 = a + Math.PI / n / 1.3;
      const p = (rad: number, ang: number) => `${(Math.cos(ang) * rad).toFixed(1)} ${(Math.sin(ang) * rad).toFixed(1)}`;
      parts.push(
        <path key={`p${r}-${i}`} className="draw" d={`M${p(inner, a1)} Q ${p(outer + 18, a1)} ${p(outer, a)} Q ${p(outer + 18, a2)} ${p(inner, a2)}`} />,
      );
      parts.push(<circle key={`d${r}-${i}`} cx={r2(Math.cos(a) * (outer + 14))} cy={r2(Math.sin(a) * (outer + 14))} r={3.2} fill="currentColor" stroke="none" />);
    }
    parts.push(<circle key={`c${r}`} className="draw" r={inner - 6} />);
  }
  const size = 34 + rings * 46 + 40;
  return (
    <Svg viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" {...props}>
      <circle r="10" fill="currentColor" />
      {parts}
    </Svg>
  );
}

/** Schematic of the Chowmatha crossing with the shop marked. Not to scale. */
export function ChowmathaMap(props: P) {
  return (
    <Svg viewBox="0 0 480 360" fill="none" {...props}>
      <path d="M-10 196 C 120 188, 340 204, 490 190" stroke="var(--kali)" strokeWidth="40" />
      <path d="M232 -10 C 226 120, 244 240, 236 370" stroke="var(--kali)" strokeWidth="40" />
      <path d="M-10 196 C 120 188, 340 204, 490 190" stroke="var(--kagoj)" strokeWidth="2.5" strokeDasharray="14 12" />
      <path d="M232 -10 C 226 120, 244 240, 236 370" stroke="var(--kagoj)" strokeWidth="2.5" strokeDasharray="14 12" />
      <circle cx="235" cy="194" r="34" fill="var(--haldi)" stroke="var(--kali)" strokeWidth="4" />
      <text x="235" y="200" textAnchor="middle" fontFamily="var(--f-bn)" fontWeight="800" fontSize="15" fill="var(--kali)">চৌমাথা</text>
      <g transform="translate(330 118)">
        <rect x="-36" y="-26" width="72" height="44" fill="var(--kagoj)" stroke="var(--kali)" strokeWidth="3" />
        <text x="0" y="2" textAnchor="middle" fontFamily="var(--f-letter)" fontWeight="700" fontSize="11" fill="var(--kali)">INDIAN</text>
        <text x="0" y="14" textAnchor="middle" fontFamily="var(--f-letter)" fontWeight="700" fontSize="11" fill="var(--kali)">BANK</text>
      </g>
      <g className="shop-pin" transform="translate(410 120)">
        <path d="M0 26 C -24 0, -26 -14, -26 -24 C -26 -40, -14 -50, 0 -50 C 14 -50, 26 -40, 26 -24 C 26 -14, 24 0, 0 26 Z" fill="var(--sindoor)" stroke="var(--kali)" strokeWidth="3.5" />
        <circle cx="0" cy="-24" r="9" fill="var(--haldi-hi)" stroke="var(--kali)" strokeWidth="3" />
      </g>
      <text x="470" y="176" textAnchor="end" fontFamily="var(--f-letter)" fontWeight="700" fontSize="14" letterSpacing="1.5" fill="var(--kali)">BADU ROAD →</text>
      <text x="410" y="92" textAnchor="middle" fontFamily="var(--f-letter)" fontWeight="800" fontSize="13" letterSpacing="1" fill="var(--sindoor-deep)">SWARUP</text>
    </Svg>
  );
}

/* Icons: one 2px stroke, square-ish terminals, drawn for this site. */

export function IconArrow(props: P) {
  return (
    <Svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </Svg>
  );
}

export function IconWhatsApp(props: P) {
  return (
    <Svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.2a9.7 9.7 0 0 0-8.4 14.6L2.3 21.7l5-1.3A9.7 9.7 0 1 0 12 2.2Zm0 17.7c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.7 2.6 4.1 3.6 1.5.7 2.1.7 2.9.6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.3Z" />
    </Svg>
  );
}

export function IconMenu(props: P) {
  return (
    <Svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...props}>
      <path d="M4 7h16M4 12h10M4 17h16" />
    </Svg>
  );
}

export function IconClose(props: P) {
  return (
    <Svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

export function IconPhone(props: P) {
  return (
    <Svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2" />
    </Svg>
  );
}

export function IconPin(props: P) {
  return (
    <Svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </Svg>
  );
}

export function IconSearch(props: P) {
  return (
    <Svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </Svg>
  );
}
