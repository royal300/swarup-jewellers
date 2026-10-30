"use client";

import { useMemo, useState } from "react";
import { digits } from "@/lib/format";
import { StepDigits } from "./StepDigits";

type Rates = { gold22: number | null; gold18: number | null; silver: number | null };

/** Today's rate board with a weight calculator. Estimates are gold value only, before making charges and GST. */
export function RateBoard({ rates, updated }: { rates: Rates; updated: string }) {
  const [weight, setWeight] = useState("10");
  const [metal, setMetal] = useState<"22" | "18" | "silver">("22");
  const rows = [
    { id: "22" as const, bn: "২২ ক্যারেট", label: "22K gold", value: rates.gold22 },
    { id: "18" as const, bn: "১৮ ক্যারেট", label: "18K gold", value: rates.gold18 },
    { id: "silver" as const, bn: "রুপো", label: "Silver", value: rates.silver },
  ].filter((r) => r.value);

  const est = useMemo(() => {
    const g = Number(weight);
    const r = rows.find((x) => x.id === metal)?.value;
    return g > 0 && r ? Math.round((r / 10) * g) : null;
  }, [weight, metal, rows]);

  return (
    <div className="rateboard">
      <dl className="rate-rows">
        {rows.map((r) => (
          <div key={r.id} className="rate-row">
            <dt>
              <span className="bn">{r.bn}</span>
              <span className="data">{r.label} · per 10 g</span>
            </dt>
            <dd>
              ₹<StepDigits value={digits(r.value!)} />
            </dd>
          </div>
        ))}
      </dl>
      <p className="data rate-updated">Updated {updated} · set by the shop each morning</p>

      <form className="calc" onSubmit={(e) => e.preventDefault()}>
        <p className="calc-title condensed">What would it cost?</p>
        <div className="calc-fields">
          <label>
            <span className="data">Weight in grams</span>
            <input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, ""))} aria-describedby="calc-note" />
          </label>
          <label>
            <span className="data">Metal</span>
            <select value={metal} onChange={(e) => setMetal(e.target.value as typeof metal)}>
              {rows.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <output className="calc-out" aria-live="polite">
          {est ? <>≈ ₹{digits(est)}</> : "—"}
        </output>
        <p id="calc-note" className="calc-note">
          Metal value only. Making charges and GST are added in the shop and vary by piece, so ask us on WhatsApp for the final price.
        </p>
      </form>
    </div>
  );
}
