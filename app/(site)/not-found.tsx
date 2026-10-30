import Link from "next/link";

export default function NotFound() {
  return (
    <section className="prose-page nf field-haldi grain">
      <div className="prose">
        <p className="brush nf-bn" lang="bn">
          হারিয়ে গেছে
        </p>
        <h1 className="condensed">This page has gone missing</h1>
        <p>The piece may have been sold or moved. The rest of the collection is still on the shelf.</p>
        <p>
          <Link href="/collections" className="link-arrow">
            Browse every piece
          </Link>
        </p>
      </div>
    </section>
  );
}
