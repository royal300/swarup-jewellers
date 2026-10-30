import type { Metadata, Viewport } from "next";
import { fontVars } from "./fonts";
import "./globals.css";

const siteUrl = process.env.SITE_URL || "https://swarup.rasatech.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Swarup Jewellers · Bengali gold, Madhyamgram", template: "%s · Swarup Jewellers" },
  description:
    "Sankha, pola, noa, bala, necklaces and more from Swarup Jewellers, Madhyamgram Chowmatha, Kolkata. BIS HUID hallmarked gold, today's rate in plain view, enquire on WhatsApp.",
  openGraph: { type: "website", siteName: "Swarup Jewellers", locale: "en_IN" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#A3122A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
