import Link from "next/link";
import type { Category, Settings } from "@/lib/types";
import { imageUrl } from "@/lib/images";
import { Alpana } from "./illustrations";

export function SiteFooter({ settings, categories }: { settings: Settings; categories: Category[] }) {
  const logo = imageUrl(settings.logo, 600);
  const year = new Date().getFullYear();
  return (
    <footer className="footer field-kali grain">
      <Alpana className="footer-alpana" rings={3} />
      <div className="footer-top">
        <div className="footer-brand">
          {logo ? <img src={logo} alt="Swarup Jewellers" width={223} height={160} loading="lazy" /> : null}
          <p className="brush footer-bn" lang="bn">
            স্বরূপ জুয়েলার্স
          </p>
          <p className="footer-tag">The finest jewellery shop at Madhyamgram. From timeless gold to modern elegance, every piece here tells your story of shine.</p>
        </div>
        <nav className="footer-cats" aria-label="Collections">
          <p className="data">Collections</p>
          <ul>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/product-category/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="footer-contact">
          <p className="data">The shop</p>
          <address>{settings.address}</address>
          <p>{settings.hours}</p>
          <p>
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a>
            <br />
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </p>
          <ul className="footer-social">
            {settings.facebook ? (
              <li>
                <a href={settings.facebook} target="_blank" rel="noopener">
                  Facebook
                </a>
              </li>
            ) : null}
            {settings.instagram ? (
              <li>
                <a href={settings.instagram} target="_blank" rel="noopener">
                  Instagram
                </a>
              </li>
            ) : null}
            {settings.youtube ? (
              <li>
                <a href={settings.youtube} target="_blank" rel="noopener">
                  YouTube
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="footer-colophon data">
        <p>© {year} Swarup Jewellers, Madhyamgram</p>
        <p>Estimates use the shop&rsquo;s posted rate for metal value only; making charges and GST are extra.</p>
        <p>
          <Link href="/privacy-policy">Privacy</Link> · Site by Royal300
        </p>
      </div>
    </footer>
  );
}
