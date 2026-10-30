import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Privacy" };

export default async function Privacy() {
  const s = await getSettings();
  return (
    <section className="prose-page field-kagoj grain">
      <div className="prose">
        <h1 className="condensed">Privacy</h1>
        <p>This website shows the Swarup Jewellers catalogue. It has no customer accounts, no checkout and no tracking cookies.</p>
        <h2 className="condensed">What we store</h2>
        <p>
          When you tap a WhatsApp button we count that a piece was enquired about, with the time, so the shop knows which designs people ask for. We do not store your name, number or
          message; the conversation happens in WhatsApp between you and the shop.
        </p>
        <p>One small cookie remembers that you have already seen the opening story, so it does not play again.</p>
        <h2 className="condensed">Questions</h2>
        <p>
          Write to <a href={`mailto:${s.email}`}>{s.email}</a> or call {s.phone}.
        </p>
      </div>
    </section>
  );
}
