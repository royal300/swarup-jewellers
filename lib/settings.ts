import "server-only";
import type { RowDataPacket } from "mysql2";
import { execute, query } from "./db";
import type { Settings } from "./types";

type Row = RowDataPacket & { name: string; value: string | null; updated_at: Date };

const num = (v?: string | null) => {
  const n = v ? Number(String(v).replace(/[^0-9.]/g, "")) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
};

export async function getSettings(): Promise<Settings> {
  const rows = await query<Row>("SELECT name, value, updated_at FROM settings");
  const m = new Map(rows.map((r) => [r.name, r.value ?? ""]));
  const updated = m.get("rates_updated_at");
  return {
    goldRate22: num(m.get("gold_rate_22")),
    goldRate18: num(m.get("gold_rate_18")),
    silverRate: num(m.get("silver_rate")),
    ratesUpdatedAt: updated ? new Date(updated) : null,
    phone: m.get("phone") || "",
    whatsapp: (m.get("whatsapp") || "").replace(/[^0-9]/g, ""),
    email: m.get("email") || "",
    address: m.get("address") || "",
    hours: m.get("hours") || "",
    mapUrl: m.get("map_url") || "",
    facebook: m.get("facebook") || "",
    instagram: m.get("instagram") || "",
    youtube: m.get("youtube") || "",
    logo: m.get("logo") || "",
  };
}

export async function saveSettings(values: Record<string, string>) {
  for (const [name, value] of Object.entries(values)) {
    await execute("INSERT INTO settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)", [name, value]);
  }
}
