import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductsData } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductsData().items.find((p) => p.slug === slug);
  return { title: product?.title ?? "Product" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductsData().items.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <main className="container" data-page-type="product-detail" style={{ padding: "2rem 0" }}>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="breadcrumb__sep" />
        <Link href="/products">All Products</Link>
        <span className="breadcrumb__sep" />
        <span aria-current="page">{product.title}</span>
      </nav>

      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "minmax(0, 360px) 1fr" }}>
        <Image
          src={product.image.src}
          alt={product.image.alt}
          width={400}
          height={400}
          style={{ borderRadius: "var(--radius)", width: "100%", height: "auto" }}
        />
        <div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--color-accent)",
              textTransform: "uppercase",
            }}
          >
            {product.badge}
          </span>
          <h1 className="page-title">{product.title}</h1>
          <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            {product.currentPrice}{" "}
            <span style={{ fontSize: "1rem", color: "var(--color-muted)" }}>
              {product.currency}
            </span>
          </p>
          {product.compareAtPrice != null && (
            <p style={{ textDecoration: "line-through", color: "var(--color-muted)" }}>
              Was {product.compareAtPrice} {product.currency}
            </p>
          )}
          <p style={{ color: "var(--color-muted)" }}>Vendor: {product.vendor}</p>
          <p style={{ marginTop: "1rem" }}>
            Internal product detail placeholder. Purchases complete on the partner site.
          </p>
          <a
            href={product.outboundUrl}
            className="btn btn--primary"
            style={{ display: "inline-flex", marginTop: "1rem" }}
            target="_blank"
            rel="nofollow sponsored noopener"
          >
            Shop Now
          </a>
        </div>
      </div>
    </main>
  );
}
