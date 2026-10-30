"use client";

import { useRef, useState } from "react";
import { imageUrl } from "@/lib/images";

/** Upload, order and remove photos. The first photo is the one shown in listings. */
export function ImageManager({ name, initial, single = false }: { name: string; initial: string[]; single?: boolean }) {
  const [keys, setKeys] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    // One photo per request keeps each upload small and lets the good ones land if one fails.
    for (const f of Array.from(single ? [files[0]] : files)) {
      const body = new FormData();
      body.append("files", f);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await res.json().catch(() => ({}));
        if (data.keys?.length) setKeys((k) => (single ? [data.keys[0]] : [...k, ...data.keys]));
        if (!res.ok) setError(data.error || `${f.name} could not be uploaded`);
      } catch {
        setError(`${f.name} could not be uploaded. Check the connection and try again.`);
      }
    }
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  const move = (i: number, d: number) =>
    setKeys((k) => {
      const n = [...k];
      const j = i + d;
      if (j < 0 || j >= n.length) return k;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <div className="adm-images">
      <input type="hidden" name={name} value={single ? (keys[0] ?? "") : JSON.stringify(keys)} />
      <ul>
        {keys.map((k, i) => (
          <li key={k}>
            <img src={imageUrl(k, 600)!} alt="" width={120} height={120} />
            {!single && i === 0 ? <span className="adm-tag">Main photo</span> : null}
            <div className="adm-image-tools">
              {!single ? (
                <>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">
                    ←
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === keys.length - 1} aria-label="Move later">
                    →
                  </button>
                </>
              ) : null}
              <button type="button" onClick={() => setKeys((all) => all.filter((_, j) => j !== i))} aria-label="Remove photo">
                Remove
              </button>
            </div>
          </li>
        ))}
        <li className="adm-image-add">
          <label>
            <input ref={input} type="file" accept="image/*" multiple={!single} onChange={(e) => upload(e.target.files)} disabled={busy} />
            <span>{busy ? "Uploading…" : single ? (keys.length ? "Replace photo" : "Add a photo") : "Add photos"}</span>
            <small>JPG, PNG or WebP, up to 15 MB each</small>
          </label>
        </li>
      </ul>
      {error ? <p className="adm-msg adm-msg-err">{error}</p> : null}
    </div>
  );
}
