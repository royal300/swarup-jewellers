const SEALS = [
  { ring: "BIS · HUID · HALLMARKED · BIS · HUID · HALLMARKED · ", bn: "হলমার্ক", field: "field-sindoor" },
  { ring: "CERTIFIED JEWELLERY · CERTIFIED JEWELLERY · ", bn: "সার্টিফায়েড", field: "field-neel" },
  { ring: "ELEGANT DESIGN · ELEGANT DESIGN · ELEGANT DESIGN · ", bn: "নকশা", field: "field-morpankhi" },
];

/** The shop's three promises as pressed seals. */
export function Seals() {
  return (
    <ul className="seals">
      {SEALS.map((s, i) => (
        <li key={i} className={`seal ${s.field}`}>
          <svg viewBox="0 0 200 200" aria-hidden>
            <defs>
              <path id={`seal-${i}`} d="M100 100 m -74 0 a 74 74 0 1 1 148 0 a 74 74 0 1 1 -148 0" />
            </defs>
            <circle cx="100" cy="100" r="96" fill="var(--field)" stroke="var(--ink)" strokeWidth="3" />
            <circle cx="100" cy="100" r="58" fill="none" stroke="var(--ink)" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
            <g className="seal-ring">
              <text fontFamily="var(--f-letter)" fontWeight="700" fontSize="15.5" letterSpacing="2.6" fill="var(--ink)">
                <textPath href={`#seal-${i}`}>{s.ring}</textPath>
              </text>
            </g>
          </svg>
          <span className="seal-bn brush" lang="bn">
            {s.bn}
          </span>
          <span className="sr-only">{s.ring.split(" · ").slice(0, 3).join(" ")}</span>
        </li>
      ))}
    </ul>
  );
}
