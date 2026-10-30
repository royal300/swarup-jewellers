import type { Settings } from "@/lib/types";
import { ChowmathaMap, IconPhone, IconPin } from "./illustrations";
import { EnquireButton } from "./EnquireButton";

export function VisitPanel({ settings, headingLevel = 2 }: { settings: Settings; headingLevel?: 1 | 2 }) {
  const H = `h${headingLevel}` as "h1" | "h2";
  return (
    <div className="visit">
      <div className="visit-copy">
        <p className="visit-bn brush misreg" data-text="দোকানে আসুন" lang="bn">
          দোকানে আসুন
        </p>
        <H className="visit-title condensed">Come and hold it before you decide</H>
        <address className="visit-address">
          <span className="extended">Swarup Jewellers</span>
          {settings.address}
        </address>
        <dl className="visit-facts">
          <div>
            <dt className="data">Open</dt>
            <dd>{settings.hours}</dd>
          </div>
          <div>
            <dt className="data">Call</dt>
            <dd>
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a>
            </dd>
          </div>
          <div>
            <dt className="data">Write</dt>
            <dd>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </dd>
          </div>
        </dl>
        <div className="visit-actions">
          <a className="btn-ghost" href={settings.mapUrl} target="_blank" rel="noopener">
            <IconPin width={20} height={20} /> Directions
          </a>
          <a className="btn-ghost" href={`tel:${settings.phone.replace(/\s/g, "")}`}>
            <IconPhone width={20} height={20} /> Call the shop
          </a>
          <EnquireButton whatsapp={settings.whatsapp} text="Hello Swarup Jewellers, I'd like to visit the shop. Could you share today's timings?" source="visit">
            WhatsApp before you come
          </EnquireButton>
        </div>
      </div>
      <figure className="visit-map">
        <ChowmathaMap />
        <figcaption className="data">Madhyamgram Chowmatha · beside Indian Bank · not to scale</figcaption>
      </figure>
    </div>
  );
}
