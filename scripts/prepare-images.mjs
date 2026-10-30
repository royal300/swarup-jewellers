// Converts the downloaded WordPress originals into the storefront's WebP sizes.
// Usage: node scripts/prepare-images.mjs [srcDir] [outDir]
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const src = process.argv[2] || "migration/wp-images";
const out = process.argv[3] || "migration/uploads";
const SIZES = [600, 1400];
fs.mkdirSync(out, { recursive: true });

const files = fs.readdirSync(src).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
let done = 0;
const queue = [...files];
async function worker() {
  while (queue.length) {
    const file = queue.shift();
    const key = file.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
    for (const w of SIZES) {
      const target = path.join(out, `${key}-${w}.webp`);
      if (fs.existsSync(target)) continue;
      await sharp(path.join(src, file)).rotate().resize({ width: w, height: w, fit: "inside", withoutEnlargement: true }).webp({ quality: w > 1000 ? 80 : 76 }).toFile(target);
    }
    done++;
    if (done % 50 === 0) console.log(`${done}/${files.length}`);
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
console.log(`prepared ${done} images into ${out}`);
