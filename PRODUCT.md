# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (pinned by the user), self-hosted on the user's Ubuntu VPS behind nginx, PM2-managed, MariaDB database `swarup_jewellers` on the same server. Deployed with `deploy.sh`. Public URL: https://swarup.rasatech.in.

## Users

- **Shoppers in and around Madhyamgram / North Kolkata**, mostly Bengali families, browsing on their phones for traditional gold ornaments: wedding sets (Sankha, Pola, Noa, Chur, Bala, Mantasha, Kankan), everyday pieces (chains, rings, earrings, pendants), and gifts. They decide on a specific piece, then message the shop on WhatsApp.
- **The shop owner / staff** (admin): keep the catalogue current, add and edit products and categories, upload photos, and update the daily 22K gold and silver rate.

## Product Purpose

A digital showroom for Swarup Jewellers that replaces the WordPress/WooCommerce site. Visitors browse the real catalogue, see weight, purity and an approximate price from today's rate, and send a chosen piece to the shop on WhatsApp. Success = more WhatsApp enquiries that name a specific product.

## Positioning

A neighbourhood Bengali goldsmith in Madhyamgram, not a national chain: traditional Bengali bridal forms (Sankha, Pola, Noa, Chur, Bala, Mantasha, Kankan, Pasting Pola, Parl Mantasha) sit at the centre of the catalogue, every piece is BIS HUID hallmarked, and the daily rate is published openly.

## Operating Context

- Ordering happens on WhatsApp (+91 98306 98969); no online checkout or cart.
- The shop: Badu Road, Rani Park, Madhyamgram Chowmatha, beside Indian Bank, Kolkata 700129. Open 10:00 AM to 8:00 PM. Email swarupjewellers9176@gmail.com. Facebook: facebook.com/swarupjewellers.
- The owner updates the "Today 22K 10gm Gold Rate" and "10gm Silver Rate" by hand (last values on the old site: ₹13,720 and ₹2,200).

## Capabilities and Constraints

- Catalogue: 230 products in 22 categories migrated from the WordPress dump, each with a main photo plus gallery, weight (grams), purity (KT) where recorded, short description.
- Price: shown as an estimate = rate for the piece's purity × weight, labelled approximate with making charges and GST extra. When weight is missing, show "Price on request".
- Primary action: WhatsApp enquiry for a specific piece (prefilled message with product name and link).
- Admin section: login, CRUD for products and categories, image upload, featured flags, daily gold/silver rates, store info.
- Language: English for all UI and copy, with Bengali-script words used as display typography and category names (decision recorded 2026-10-31).

## Brand Commitments

- Name: Swarup Jewellers. Existing logo (attachment 1001 in the WordPress dump).
- Trust marks used on the old site: BIS HUID Hallmarked, Certified Jewellery, Elegant Design.
- Line from the old homepage the owner wrote: "The Finest Jewellery Shop at Madhyamgram. From timeless gold to modern elegance — every piece here tells your story of shine."

## Evidence on Hand

- Product photos and data: WordPress dump `u615577413_p6Zzj.sql` and images at swarupjewellers.com/wp-content/uploads.
- No founding year, founder name, generation count, awards, testimonials or customer counts are known. Do not invent them; the story is about the craft (gold, fire, karigar, bride), not the shop's history.
- About Us page on the old site is theme lorem ipsum and must not be carried over.

## Product Principles

1. The piece is the hero: every route ends at a specific ornament and a one-tap WhatsApp enquiry.
2. Honest numbers: weight, purity and today's rate in plain view; estimates always labelled as estimates.
3. Bengali first in spirit: the bridal forms and their names lead, not generic "rings & necklaces".
4. The owner must be able to run it alone from a phone.

## Accessibility & Inclusion

Mobile-first (most visitors are on phones, often mid-range Android on 4G). The entry story must be skippable and must respect reduced-motion preferences.
