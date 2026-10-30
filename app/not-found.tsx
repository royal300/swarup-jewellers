import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeContent: "center", gap: 12, padding: 24, background: "var(--haldi)", color: "var(--kali)", textAlign: "center" }}>
      <p style={{ fontFamily: "var(--f-brush)", fontSize: "5rem", lineHeight: 1.1, color: "var(--sindoor)" }} lang="bn">
        হারিয়ে গেছে
      </p>
      <p style={{ fontWeight: 700 }}>This page could not be found.</p>
      <Link href="/">Back to Swarup Jewellers</Link>
    </main>
  );
}
