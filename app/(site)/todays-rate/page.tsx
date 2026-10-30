import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { shortDate } from "@/lib/format";
import { EnquireButton } from "@/components/site/EnquireButton";
import { RateBoard } from "@/components/site/RateBoard";

export const metadata: Metadata = {
  title: "Today's gold and silver rate",
  description: "Today's 22K gold rate and silver rate per 10 grams at Swarup Jewellers, Madhyamgram, with a weight calculator.",
};

export default async function RatePage() {
  const s = await getSettings();
  const gold18 = s.goldRate18 ?? (s.goldRate22 ? Math.round((s.goldRate22 * 18) / 22) : null);
  return (
    <section className="rate-section rate-page field-neel grain" aria-labelledby="rate-title">
      <header className="sec-head">
        <p className="sec-bn brush misreg" data-text="আজকের দর" lang="bn">
          আজকের দর
        </p>
        <h1 id="rate-title" className="sec-title condensed">
          Today&rsquo;s rate at Swarup Jewellers
        </h1>
        <p className="sec-lede">
          The shop posts the 22K gold and silver rate every morning. {s.goldRate18 ? "" : "The 18K figure is worked out from the 22K rate (18 parts in 22). "}Use the calculator to see the metal value of any weight.
        </p>
      </header>
      <RateBoard rates={{ gold22: s.goldRate22, gold18, silver: s.silverRate }} updated={shortDate(s.ratesUpdatedAt)} />
      <div className="rate-ask">
        <EnquireButton whatsapp={s.whatsapp} text="Hello Swarup Jewellers, could you tell me today's making charges?" source="rate">
          Ask today&rsquo;s making charges
        </EnquireButton>
      </div>
    </section>
  );
}
