import { listCategories } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Spine } from "@/components/site/Spine";
import "./site.css";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), listCategories()]);
  return (
    <>
      <SmoothScroll />
      <Spine categories={categories} whatsapp={settings.whatsapp} phone={settings.phone} address={settings.address} hours={settings.hours} />
      <div className="page">
        <main id="main">{children}</main>
        <SiteFooter settings={settings} categories={categories} />
      </div>
    </>
  );
}
