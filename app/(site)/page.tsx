import Link from "next/link";
import { cookies } from "next/headers";
import { countProducts, listCategories, listProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { shortDate } from "@/lib/format";
import { CategoryShelf } from "@/components/site/CategoryShelf";
import { CraftStory } from "@/components/site/CraftStory";
import { EntryStory } from "@/components/site/EntryStory";
import { HeroJacket } from "@/components/site/HeroJacket";
import { IconArrow, Prajapati } from "@/components/site/illustrations";
import { NewestGallery } from "@/components/site/NewestGallery";
import { ProductPlate } from "@/components/site/ProductPlate";
import { RateBoard } from "@/components/site/RateBoard";
import { Seals } from "@/components/site/Seals";
import { VisitPanel } from "@/components/site/VisitPanel";

export default async function Home() {
  const [settings, categories, newest, total, jar] = await Promise.all([
    getSettings(),
    listCategories(),
    listProducts({ sort: "new", limit: 10 }),
    countProducts(),
    cookies(),
  ]);
  const showStory = !jar.get("sj_story");
  const chipSlugs = ["sankha", "pola", "bracelet", "bala", "necklace", "earring"];
  const chips = chipSlugs.map((s) => categories.find((c) => c.slug === s)).filter((c): c is NonNullable<typeof c> => !!c);
  const rateDate = shortDate(settings.ratesUpdatedAt);
  const gold18 = settings.goldRate18 ?? (settings.goldRate22 ? Math.round((settings.goldRate22 * 18) / 22) : null);

  return (
    <>
      {showStory ? <EntryStory /> : null}
      <HeroJacket rate22={settings.goldRate22} rateDate={rateDate} chips={chips} total={total} whatsapp={settings.whatsapp} waitForStory={showStory} />

      <section className="shelf-section field-kali grain" aria-labelledby="shelf-title">
        <header className="sec-head">
          <p className="sec-bn brush misreg" data-text="কোন গয়না?" lang="bn">
            কোন গয়না?
          </p>
          <h2 id="shelf-title" className="sec-title condensed">
            Twenty kinds of gold, one shelf
          </h2>
          <p className="sec-lede">Each spine is a collection, as thick as the number of pieces in it. Pull one out to open it.</p>
        </header>
        <CategoryShelf categories={categories} />
      </section>

      <section className="newest field-kagoj grain" aria-labelledby="newest-title">
        <NewestGallery
          head={
            <header className="sec-head newest-head">
              <p className="sec-bn brush misreg" data-text="নতুন" lang="bn">
                নতুন
              </p>
              <h2 id="newest-title" className="sec-title condensed">
                Newest pieces in the shop
              </h2>
              <Link href="/collections" className="link-arrow">
                See all {total} <IconArrow width={20} height={20} />
              </Link>
            </header>
          }
        >
          {newest.map((p, i) => (
            <ProductPlate key={p.id} product={p} settings={settings} index={i} sizes="(min-width: 900px) 26vw, 78vw" />
          ))}
        </NewestGallery>
      </section>

      <section aria-label="How gold becomes an ornament">
        <CraftStory />
      </section>

      <section className="rate-section field-neel grain" aria-labelledby="rate-title">
        <header className="sec-head">
          <p className="sec-bn brush misreg" data-text="আজকের দর" lang="bn">
            আজকের দর
          </p>
          <h2 id="rate-title" className="sec-title condensed">
            Today&rsquo;s rate, in plain view
          </h2>
          <p className="sec-lede">Every estimate on this site is worked out from these numbers and the weight of the piece. Nothing hidden in the arithmetic.</p>
        </header>
        <RateBoard rates={{ gold22: settings.goldRate22, gold18: gold18, silver: settings.silverRate }} updated={rateDate} />
      </section>

      <section className="promise field-haldi grain" aria-labelledby="promise-title">
        <Prajapati className="promise-praja" />
        <h2 id="promise-title" className="sec-title condensed">
          Three promises, pressed into every piece
        </h2>
        <Seals />
      </section>

      <section className="visit-section field-sindoor grain" aria-label="Visit the shop">
        <VisitPanel settings={settings} />
      </section>
    </>
  );
}
