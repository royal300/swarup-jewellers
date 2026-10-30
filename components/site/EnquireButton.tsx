"use client";

import { IconWhatsApp } from "./illustrations";

/** Opens WhatsApp with the piece named, and records the enquiry for the shop's dashboard. */
export function EnquireButton({ whatsapp, text, productId, source = "product", className, children }: { whatsapp: string; text: string; productId?: number; source?: string; className?: string; children?: React.ReactNode }) {
  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
  return (
    <a
      className={className ?? "btn-act"}
      href={href}
      target="_blank"
      rel="noopener"
      onClick={() => {
        try {
          navigator.sendBeacon("/api/enquiry", JSON.stringify({ productId, source }));
        } catch {}
      }}
    >
      <IconWhatsApp width={20} height={20} /> {children ?? "Ask about this piece"}
    </a>
  );
}
