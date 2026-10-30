"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";
import { GROUPS } from "@/lib/types";
import { slugify } from "@/lib/format";
import { saveCategory } from "@/app/admin/actions";
import { ActionForm } from "./ActionForm";
import { ImageManager } from "./ImageManager";

export function CategoryForm({ category }: { category?: Category }) {
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [touched, setTouched] = useState(!!category);
  return (
    <ActionForm action={saveCategory} submit={category ? "Save category" : "Add category"}>
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="adm-grid">
        <section className="adm-panel">
          <h2>Names</h2>
          <div className="adm-row">
            <label className="adm-field">
              <span>English name</span>
              <input name="name" defaultValue={category?.name} required onChange={(e) => !touched && setSlug(slugify(e.target.value))} placeholder="Sankha" />
            </label>
            <label className="adm-field">
              <span>Bengali name</span>
              <input name="name_bn" defaultValue={category?.nameBn ?? ""} lang="bn" placeholder="শাঁখা" />
            </label>
          </div>
          <label className="adm-field">
            <span>Web address</span>
            <div className="adm-prefix">
              <span>/product-category/</span>
              <input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setTouched(true);
                }}
              />
            </div>
          </label>
          <label className="adm-field">
            <span>Description (optional)</span>
            <textarea name="description" rows={3} defaultValue={category?.description ?? ""} />
          </label>
          <div className="adm-row">
            <label className="adm-field">
              <span>Shelf group</span>
              <select name="grp" defaultValue={category?.group ?? "bridal"}>
                {GROUPS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="adm-field">
              <span>Order on the shelf</span>
              <input name="sort_order" type="number" min={0} max={999} defaultValue={category?.sortOrder ?? 50} />
            </label>
          </div>
          <div className="adm-toggles">
            <label>
              <input type="checkbox" name="is_visible" defaultChecked={category ? category.isVisible : true} /> Show on the website
            </label>
          </div>
        </section>
        <section className="adm-panel">
          <h2>Cover photo</h2>
          <p className="adm-muted">Shown when the spine is pulled out on the home page.</p>
          <ImageManager name="image" single initial={category?.image ? [category.image] : []} />
        </section>
      </div>
    </ActionForm>
  );
}
