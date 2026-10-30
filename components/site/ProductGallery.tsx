"use client";

import { useState } from "react";
import { imageSrcSet, imageUrl } from "@/lib/images";

export function ProductGallery({ images, name, fallback }: { images: string[]; name: string; fallback: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) {
    return (
      <div className="pg-main pg-empty">
        <span className="brush">{fallback}</span>
      </div>
    );
  }
  return (
    <div className="pg">
      <div className="pg-main">
        {images.map((key, i) => (
          <img
            key={key}
            src={imageUrl(key, 1400)!}
            srcSet={imageSrcSet(key)}
            sizes="(min-width: 1000px) 50vw, 100vw"
            alt={i === 0 ? name : `${name}, view ${i + 1}`}
            width={1400}
            height={1400}
            data-active={i === active || undefined}
            fetchPriority={i === 0 ? "high" : undefined}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>
      {images.length > 1 ? (
        <ul className="pg-thumbs" aria-label="Views">
          {images.map((key, i) => (
            <li key={key}>
              <button type="button" aria-pressed={i === active} onClick={() => setActive(i)} aria-label={`Show view ${i + 1}`}>
                <img src={imageUrl(key, 600)!} alt="" width={120} height={120} loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
