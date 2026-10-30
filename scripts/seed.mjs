// Imports the WordPress catalogue (migration/catalog.json) and creates the first admin.
// Runs once: later deploys skip the import so admin edits are never overwritten.
// Pass --force to re-import products and categories from the catalogue.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { dbConfig, loadEnv } from "./env.mjs";

loadEnv();
const here = path.dirname(fileURLToPath(import.meta.url));
const force = process.argv.includes("--force");
const catalog = JSON.parse(fs.readFileSync(path.join(here, "..", "migration", "catalog.json"), "utf8"));
const keyOf = (file) => (file ? file.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase() : null);

const db = await mysql.createConnection(dbConfig());

const DEFAULT_SETTINGS = {
  gold_rate_22: String(catalog.settings.goldRate22 || ""),
  gold_rate_18: "",
  silver_rate: String(catalog.settings.silverRate || ""),
  rates_updated_at: new Date().toISOString(),
  phone: "+91 98306 98969",
  whatsapp: "919830698969",
  email: "swarupjewellers9176@gmail.com",
  address: "Badu Road, Rani Park, Madhyamgram Chowmatha, beside Indian Bank, Kolkata 700129",
  hours: "10:00 AM – 8:00 PM",
  map_url: "https://www.google.com/maps/search/?api=1&query=Swarup+Jewellers+Badu+Road+Madhyamgram+Kolkata+700129",
  facebook: "https://www.facebook.com/swarupjewellers",
  instagram: "",
  youtube: "",
  logo: keyOf(catalog.settings.logo) || "",
};
for (const [name, value] of Object.entries(DEFAULT_SETTINGS)) {
  await db.query("INSERT IGNORE INTO settings (name, value) VALUES (?, ?)", [name, value]);
}

const [[seeded]] = await db.query("SELECT value FROM settings WHERE name = 'catalog_seeded'");
if (seeded && !force) {
  console.log("catalogue already imported on", seeded.value, "- skipping (use --force to re-import)");
} else {
  const catIds = {};
  for (const c of catalog.categories) {
    await db.query(
      `INSERT INTO categories (slug, name, name_bn, grp, image, sort_order) VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), name_bn = VALUES(name_bn), grp = VALUES(grp), image = VALUES(image), sort_order = VALUES(sort_order)`,
      [c.slug, c.name, c.nameBn, c.group, keyOf(c.image), c.sortOrder],
    );
    const [[row]] = await db.query("SELECT id FROM categories WHERE slug = ?", [c.slug]);
    catIds[c.slug] = row.id;
  }
  for (const p of catalog.products) {
    await db.query(
      `INSERT INTO products (wp_id, slug, name, description, purity, weight_grams, weight_note, specs, is_featured, views, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), purity = VALUES(purity),
         weight_grams = VALUES(weight_grams), weight_note = VALUES(weight_note), specs = VALUES(specs), is_featured = VALUES(is_featured)`,
      [p.wpId, p.slug, p.name, p.description, p.purity, p.weightGrams, p.weightNote, JSON.stringify(p.specs || []), p.featured ? 1 : 0, p.views, p.createdAt],
    );
    const [[row]] = await db.query("SELECT id FROM products WHERE wp_id = ?", [p.wpId]);
    await db.query("DELETE FROM product_categories WHERE product_id = ?", [row.id]);
    for (const slug of p.categories) {
      if (catIds[slug]) await db.query("INSERT IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)", [row.id, catIds[slug]]);
    }
    await db.query("DELETE FROM product_images WHERE product_id = ?", [row.id]);
    let i = 0;
    for (const img of p.images) {
      await db.query("INSERT INTO product_images (product_id, image_key, sort_order) VALUES (?, ?, ?)", [row.id, keyOf(img), i++]);
    }
  }
  await db.query("REPLACE INTO settings (name, value) VALUES ('catalog_seeded', ?)", [new Date().toISOString()]);
  console.log(`imported ${catalog.categories.length} categories and ${catalog.products.length} products`);
}

const [[{ n }]] = await db.query("SELECT COUNT(*) AS n FROM admin_users");
if (n === 0) {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!password || password.length < 10) throw new Error("Set ADMIN_INITIAL_PASSWORD (10+ chars) to create the first admin");
  await db.query("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)", [username, await bcrypt.hash(password, 12)]);
  console.log(`created admin user "${username}"`);
}
await db.end();
