"use client";

import { useState } from "react";
import type { Category, Product } from "@/lib/types";
import { GROUPS } from "@/lib/types";
import { slugify } from "@/lib/format";
import { saveProduct } from "@/app/admin/actions";
import { ActionForm } from "./ActionForm";
import { ImageManager } from "./ImageManager";

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [specs, setSpecs] = useState(product?.specs.length ? product.specs : []);
  const chosen = new Set(product?.categories.map((c) => c.slug));

  return (
    <ActionForm action={saveProduct} submit={product ? "Save changes" : "Add product"}>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <div className="adm-grid">
        <section className="adm-panel">
          <h2>The piece</h2>
          <label className="adm-field">
            <span>Name</span>
            <input
              name="name"
              value={name}
              required
              maxLength={200}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="e.g. Sankha 18"
            />
          </label>
          <label className="adm-field">
            <span>Web address</span>
            <div className="adm-prefix">
              <span>/product/</span>
              <input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                placeholder="sankha-18"
              />
            </div>
          </label>
          <label className="adm-field">
            <span>Short description</span>
            <textarea name="description" rows={4} defaultValue={product?.description ?? ""} maxLength={4000} />
          </label>
          <div className="adm-row">
            <label className="adm-field">
              <span>Weight (grams)</span>
              <input name="weight_grams" inputMode="decimal" defaultValue={product?.weightGrams ?? ""} placeholder="9.05" />
            </label>
            <label className="adm-field">
              <span>Weight note</span>
              <input name="weight_note" defaultValue={product?.weightNote ?? ""} placeholder="each / pair" maxLength={120} />
            </label>
          </div>
          <div className="adm-row">
            <label className="adm-field">
              <span>Metal</span>
              <select name="metal" defaultValue={product?.metal ?? "gold"}>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
              </select>
            </label>
            <label className="adm-field">
              <span>Purity</span>
              <select name="purity" defaultValue={product?.purity ?? ""}>
                <option value="">Not stated (priced at 22K)</option>
                <option value="24K">24K</option>
                <option value="22K">22K</option>
                <option value="18K">18K</option>
                <option value="14K">14K</option>
              </select>
            </label>
            <label className="adm-field">
              <span>Fixed price ₹ (optional)</span>
              <input name="price_override" inputMode="numeric" defaultValue={product?.priceOverride ?? ""} placeholder="leave empty to estimate" />
            </label>
          </div>
        </section>

        <section className="adm-panel">
          <h2>Photos</h2>
          <ImageManager name="images" initial={product?.images ?? []} />
        </section>

        <section className="adm-panel">
          <h2>Categories</h2>
          {GROUPS.map((g) => {
            const cats = categories.filter((c) => c.group === g.id);
            if (!cats.length) return null;
            return (
              <fieldset key={g.id} className="adm-checks">
                <legend>{g.label}</legend>
                {cats.map((c) => (
                  <label key={c.id}>
                    <input type="checkbox" name="categories" value={c.id} defaultChecked={chosen.has(c.slug)} />
                    {c.name}
                  </label>
                ))}
              </fieldset>
            );
          })}
        </section>

        <section className="adm-panel">
          <h2>Details</h2>
          <p className="adm-muted">Optional rows like Length, Width or Stone.</p>
          <input type="hidden" name="specs" value={JSON.stringify(specs)} />
          {specs.map((s, i) => (
            <div key={i} className="adm-row adm-spec">
              <input aria-label="Label" value={s.label} placeholder="Length" onChange={(e) => setSpecs((x) => x.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} />
              <input aria-label="Value" value={s.value} placeholder="17.78 cm" onChange={(e) => setSpecs((x) => x.map((y, j) => (j === i ? { ...y, value: e.target.value } : y)))} />
              <button type="button" className="adm-link" onClick={() => setSpecs((x) => x.filter((_, j) => j !== i))}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="adm-btn adm-btn-quiet" onClick={() => setSpecs((x) => [...x, { label: "", value: "" }])}>
            Add a detail row
          </button>
          <div className="adm-toggles">
            <label>
              <input type="checkbox" name="is_published" defaultChecked={product ? product.isPublished : true} /> Show on the website
            </label>
            <label>
              <input type="checkbox" name="is_featured" defaultChecked={product?.isFeatured ?? false} /> Featured
            </label>
          </div>
        </section>
      </div>
    </ActionForm>
  );
}
