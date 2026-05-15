import Link from "next/link";
import { getSiteConfig } from "@/lib/data";

export default function HomePage() {
  const site = getSiteConfig();

  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <h1 className="page-title">{site.brand.name}</h1>
      <p style={{ fontSize: "1.15rem", maxWidth: "36rem" }}>{site.brand.tagline}</p>
      <p style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link href="/products" className="btn btn--primary">
          Browse All Products
        </Link>
        <Link href="/store/carpuride" className="btn btn--outline">
          View Store Deals
        </Link>
      </p>
    </main>
  );
}
