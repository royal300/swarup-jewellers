import Link from "next/link";

/** Every piece in a category placed on one gram scale, so weights compare at a glance. */
export function GramRuler({ items }: { items: { slug: string; name: string; weight: number }[] }) {
  if (items.length < 2) return null;
  const max = Math.max(...items.map((i) => i.weight));
  const step = max > 60 ? 20 : max > 25 ? 10 : max > 10 ? 5 : 2;
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  return (
    <figure className="ruler">
      <figcaption className="data">Every piece on one scale · grams</figcaption>
      <div className="ruler-track">
        {ticks.map((t) => (
          <span key={t} className="ruler-tick" style={{ left: `${(t / top) * 100}%` }}>
            <span className="data">{t}</span>
          </span>
        ))}
        {items.map((i, n) => (
          <Link key={i.slug} href={`/product/${i.slug}`} className="ruler-mark" style={{ left: `${(i.weight / top) * 100}%`, "--lane": n % 3 } as React.CSSProperties} title={`${i.name} · ${i.weight} g`}>
            <span className="sr-only">
              {i.name}, {i.weight} grams
            </span>
          </Link>
        ))}
      </div>
    </figure>
  );
}
