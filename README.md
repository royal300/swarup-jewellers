# Swarup Jewellers — storefront and shop admin

Next.js 16 rebuild of swarupjewellers.com. Live at **https://swarup.rasatech.in**, admin at **https://swarup.rasatech.in/admin**.

## What's here

| Path | What it is |
|---|---|
| `app/(site)/` | Storefront: home (entry story, lettered hero, category shelf, newest pieces, craft story, today's rate, visit), `/collections`, `/product-category/[slug]`, `/product/[slug]`, `/todays-rate`, `/visit` |
| `app/admin/` | Shop admin: today's rates, products (add/edit/hide/delete, photos), categories, shop details, password |
| `components/site/` | Storefront components, hand-drawn SVG illustrations, GSAP + Lenis motion, the WebGL fire shader |
| `lib/` | Database access (mysql2), catalogue queries, pricing, sessions, image processing (sharp) |
| `db/schema.sql` | Tables: categories, products, product_categories, product_images, settings, admin_users, enquiries |
| `migration/` | `wp_extract.py` turned the WordPress dump into `catalog.json` (230 products, 20 categories); photos converted to WebP |
| `scripts/` | `migrate.mjs` (schema), `seed.mjs` (one-time catalogue import + first admin), `prepare-images.mjs` |
| `deploy.sh`, `deploy/` | Build locally, upload to the VPS, run migrations, restart PM2; nginx + SSL config |

URLs from the old site keep working: `/product/...` and `/product-category/...` use the same slugs, and `/shop` and `/contact-us` redirect.

## Daily use (shop owner)

1. Open `/admin` and sign in.
2. **Today** → type the 22K gold and silver rate per 10 g → *Update rates*. Every estimate on the site recalculates.
3. **Products** → *Add a product*: name, weight in grams, category, photos (first photo is the main one). Untick *Show on the website* to hide a piece without deleting it.
4. **Categories** → names in English and Bengali, shelf group, cover photo, order.

Prices on the site are estimates: rate for the purity × weight, labelled as metal value with making charges and GST extra. A *Fixed price* on a product overrides the estimate.

## Local development

```bash
npm install
npm run dev        # http://localhost:3130
```

`.env.local` points at the VPS database through an SSH tunnel on port 3307 (`ssh -L 3307:127.0.0.1:3306 <user>@<vps-ip>`). Copy `.env.example` for the variables.

## Deploying

```bash
./deploy.sh            # build, upload, migrate, restart
./deploy.sh --nginx    # also (re)install the nginx block and SSL certificate
```

Needs `.env.deploy` (see `.env.deploy.example`) and, on the very first deploy, `.env.production`. Both are git-ignored and hold the secrets; the admin password is `ADMIN_INITIAL_PASSWORD` in `.env.production` — change it after the first sign-in under **Shop details**.

On the server everything lives in `/var/www/swarup-jewellers` (`releases/`, `current`, `shared/uploads`, `shared/.env.production`), runs as PM2 app `swarup-jewellers` on 127.0.0.1:3130, and nginx serves it from `/etc/nginx/sites-available/swarup.rasatech.in`. The database is `swarup_jewellers` with its own user `swarup_app`, which has rights on that database only.
