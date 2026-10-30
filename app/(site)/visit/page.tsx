import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { VisitPanel } from "@/components/site/VisitPanel";

export const metadata: Metadata = {
  title: "Visit the shop",
  description: "Swarup Jewellers, Badu Road, Rani Park, Madhyamgram Chowmatha, beside Indian Bank, Kolkata 700129. Opening hours, phone, WhatsApp and directions.",
};

export default async function VisitPage() {
  const settings = await getSettings();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: "Swarup Jewellers",
    address: { "@type": "PostalAddress", streetAddress: "Badu Road, Rani Park, Madhyamgram Chowmatha", addressLocality: "Kolkata", postalCode: "700129", addressRegion: "West Bengal", addressCountry: "IN" },
    telephone: settings.phone,
    email: settings.email,
    sameAs: [settings.facebook, settings.instagram, settings.youtube].filter(Boolean),
  };
  return (
    <section className="visit-section visit-page field-sindoor grain">
      <VisitPanel settings={settings} headingLevel={1} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </section>
  );
}
