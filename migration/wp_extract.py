"""Extract the WooCommerce catalogue from the WordPress SQL dump into catalog.json.

Usage: python3 -I migration/wp_extract.py <dump.sql> <out_dir>
Writes <out_dir>/catalog.json and <out_dir>/image_urls.txt (one "file<TAB>url" per line).
"""
import html
import json
import os
import re
import sys
from collections import defaultdict

WANT = {"wp_posts", "wp_postmeta", "wp_terms", "wp_term_taxonomy", "wp_term_relationships", "wp_termmeta", "wp_options"}
UPLOADS = "https://swarupjewellers.com/wp-content/uploads/"

# Bengali display names and storefront groups for each WooCommerce category slug.
CATEGORY_EXTRA = {
    "sankha": ("শাঁখা", "bridal"),
    "pola": ("পলা", "bridal"),
    "pasting-pola": ("পেস্টিং পলা", "bridal"),
    "bracelet": ("নোয়া", "bridal"),
    "chur": ("চুড়", "bridal"),
    "bala": ("বালা", "bridal"),
    "kankan": ("কাঁকন", "bridal"),
    "mantasha": ("মানতাসা", "bridal"),
    "parl-mantasha": ("পার্ল মানতাসা", "bridal"),
    "necklace": ("নেকলেস", "neck"),
    "chain-necklace": ("চেন নেকলেস", "neck"),
    "pendant": ("লকেট", "neck"),
    "mangalsutra": ("মঙ্গলসূত্র", "neck"),
    "women-chain": ("লেডিস চেন", "neck"),
    "earring": ("কানের দুল", "everyday"),
    "women-ring": ("লেডিস আংটি", "everyday"),
    "bangle": ("চুড়ি", "everyday"),
    "ring": ("জেন্টস আংটি", "men"),
    "chain": ("জেন্টস চেন", "men"),
    "mens-bracelet": ("জেন্টস ব্রেসলেট", "men"),
}
CATEGORY_ORDER = list(CATEGORY_EXTRA)


def parse_values(s, i):
    rows = []
    n = len(s)
    while i < n:
        while i < n and s[i] in " \n\r\t,":
            i += 1
        if i >= n or s[i] == ";":
            break
        i += 1  # (
        row = []
        while True:
            while s[i] in " \n\r\t":
                i += 1
            if s[i] == "'":
                i += 1
                buf = []
                while True:
                    ch = s[i]
                    if ch == "\\":
                        nx = s[i + 1]
                        buf.append({"n": "\n", "r": "\r", "t": "\t", "0": "\0", "Z": "\x1a"}.get(nx, nx))
                        i += 2
                    elif ch == "'":
                        if s[i + 1] == "'":
                            buf.append("'")
                            i += 2
                        else:
                            i += 1
                            break
                    else:
                        buf.append(ch)
                        i += 1
                row.append("".join(buf))
            else:
                j = i
                while s[j] not in ",)":
                    j += 1
                tok = s[i:j].strip()
                row.append(None if tok == "NULL" else tok)
                i = j
            while s[i] in " \n\r\t":
                i += 1
            if s[i] == ",":
                i += 1
                continue
            i += 1  # )
            break
        rows.append(row)
    return rows, i


def load(path):
    with open(path, encoding="utf-8", errors="replace") as f:
        s = f.read()
    tables = defaultdict(list)
    pat = re.compile(r"INSERT INTO `([^`]+)` \(([^)]*)\) VALUES\s*")
    pos = 0
    while True:
        m = pat.search(s, pos)
        if not m:
            break
        name = m.group(1)
        if name in WANT:
            cols = [c.strip().strip("`") for c in m.group(2).split(",")]
            rows, pos = parse_values(s, m.end())
            tables[name].extend(dict(zip(cols, r)) for r in rows)
        else:
            pos = m.end()
    return tables


def text(s):
    s = re.sub(r"<[^>]+>", " ", s or "")
    s = html.unescape(s)
    return re.sub(r"\s+", " ", s).strip()


def parse_specs(content):
    """Pull weight, purity and dimension rows out of the free-form product content."""
    t = text(content)
    weight = None
    note = None
    m = re.search(r"(?:Net\s+)?Weight[^0-9]*?(?:Gross\s*)?([0-9]+(?:\.[0-9]+)?)\s*g\b\s*(\([^)]*\))?", t, re.I)
    if m:
        weight = round(float(m.group(1)), 3)
        if m.group(2):
            note = re.sub(r"\s+", " ", m.group(2).strip("() ")).strip().lower()
        else:
            tail = t[m.end(): m.end() + 30]
            m2 = re.match(r"\s*&(?:amp;)?\s*([0-9.]+)\s*g", tail)
            if m2:
                note = "pair: %s g & %s g" % (m.group(1), m2.group(1))
    purity = None
    m = re.search(r"Purity\s*([0-9]{2})\s*K", t, re.I)
    if m:
        purity = m.group(1) + "K"
    specs = []
    for label, pattern in (("Length", r"Length\s*-\s*([^W]+?)(?=\s*Width|$)"), ("Width", r"Width\s*-\s*([0-9.]+\s*mm)"), ("Height", r"Height\s*-\s*([0-9.]+\s*mm)")):
        m = re.search(pattern, t)
        if m:
            specs.append({"label": label, "value": m.group(1).strip()})
    return weight, note, purity, specs


def main():
    dump, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    tb = load(dump)
    posts = {p["ID"]: p for p in tb["wp_posts"]}
    meta = defaultdict(dict)
    for m in tb["wp_postmeta"]:
        meta[m["post_id"]][m["meta_key"]] = m["meta_value"] or ""
    terms = {t["term_id"]: t for t in tb["wp_terms"]}
    tax = {t["term_taxonomy_id"]: t for t in tb["wp_term_taxonomy"]}
    tmeta = defaultdict(dict)
    for m in tb["wp_termmeta"]:
        tmeta[m["term_id"]][m["meta_key"]] = m["meta_value"] or ""
    rel = defaultdict(list)
    for r in tb["wp_term_relationships"]:
        rel[r["object_id"]].append(r["term_taxonomy_id"])
    opts = {o["option_name"]: o["option_value"] for o in tb["wp_options"]}

    images = {}

    def image_file(att_id):
        f = meta.get(att_id, {}).get("_wp_attached_file")
        if not f:
            return None
        name = f.replace("/", "-").lower()
        images[name] = UPLOADS + f
        return name

    categories = []
    cat_by_tt = {}
    for tt in tax.values():
        if tt["taxonomy"] != "product_cat" or int(tt["count"]) == 0:
            continue
        term = terms[tt["term_id"]]
        slug = term["slug"]
        name_bn, group = CATEGORY_EXTRA.get(slug, (None, "everyday"))
        cat = {
            "slug": slug,
            "name": html.unescape(term["name"]),
            "nameBn": name_bn,
            "group": group,
            "image": image_file(tmeta[tt["term_id"]].get("thumbnail_id")) if tmeta[tt["term_id"]].get("thumbnail_id") else None,
            "sortOrder": CATEGORY_ORDER.index(slug) if slug in CATEGORY_ORDER else 99,
        }
        categories.append(cat)
        cat_by_tt[tt["term_taxonomy_id"]] = slug
    categories.sort(key=lambda c: c["sortOrder"])

    featured_tt = {k for k, t in tax.items() if t["taxonomy"] == "product_visibility" and terms[t["term_id"]]["slug"] == "featured"}
    products = []
    for p in tb["wp_posts"]:
        if p["post_type"] != "product" or p["post_status"] != "publish":
            continue
        pm = meta[p["ID"]]
        weight, note, purity, specs = parse_specs(p["post_content"])
        gallery = [g for g in (pm.get("_product_image_gallery") or "").split(",") if g]
        imgs = []
        for att in [pm.get("_thumbnail_id")] + gallery:
            if att:
                f = image_file(att)
                if f and f not in imgs:
                    imgs.append(f)
        products.append({
            "wpId": int(p["ID"]),
            "slug": p["post_name"],
            "name": html.unescape(p["post_title"]).strip(),
            "categories": [cat_by_tt[t] for t in rel[p["ID"]] if t in cat_by_tt],
            "description": text(p["post_excerpt"]),
            "weightGrams": weight,
            "weightNote": note,
            "purity": purity,
            "specs": specs,
            "images": imgs,
            "featured": any(t in featured_tt for t in rel[p["ID"]]),
            "views": int(pm.get("shopengine_product_views_count") or 0),
            "createdAt": p["post_date"],
        })
    products.sort(key=lambda x: x["createdAt"])

    logo = image_file("1001")
    settings = {
        "goldRate22": int(float(opts.get("gold_rate") or 0)),
        "silverRate": int(float(opts.get("silver_rate") or 0)),
        "logo": logo,
    }
    with open(os.path.join(out, "catalog.json"), "w", encoding="utf-8") as f:
        json.dump({"categories": categories, "products": products, "settings": settings}, f, ensure_ascii=False, indent=1)
    with open(os.path.join(out, "image_urls.txt"), "w") as f:
        for name, url in sorted(images.items()):
            f.write(name + "\t" + url + "\n")
    print("categories", len(categories), "products", len(products), "images", len(images))
    print("missing weight", sum(1 for x in products if x["weightGrams"] is None), "no category", sum(1 for x in products if not x["categories"]), "no image", sum(1 for x in products if not x["images"]))


if __name__ == "__main__":
    main()
