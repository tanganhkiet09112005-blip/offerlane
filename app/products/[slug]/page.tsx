import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPopularProducts,
  getProductBySlug,
  getProductsData,
  getRelatedProducts,
} from "@/lib/data";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductOutboundLink } from "@/components/products/ProductOutboundLink";
import { JsonLd } from "@/components/seo/JsonLd";
import gridStyles from "@/components/products/products.module.css";
import styles from "@/components/products/product-detail.module.css";

export function generateStaticParams() {
  return getProductsData().items.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.seo?.title ?? `${product.title} Deal Review`,
    description:
      product.seo?.description ??
      product.shortDescription ??
      `Compare ${product.title} pricing and partner terms on OfferLane.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const detailSections =
    product.detailSections && product.detailSections.length > 0
      ? product.detailSections
      : [
          {
            heading: "Why it earns a lane",
            body: `${product.title} is listed for shoppers comparing ${product.category ?? "deal"} options before visiting a partner checkout page.`,
          },
          {
            heading: "Before you click out",
            body: "Confirm merchant compatibility notes, coupon restrictions, warranty terms, shipping costs, and final price before completing purchase.",
          },
        ];
  const similarProducts = getRelatedProducts(product, 4);
  const popularProducts = getPopularProducts(product, 4);

  return (
    <main className={`container ${styles.detail}`} data-page-type="product-detail">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          image: product.image.src,
          brand: product.vendor,
          description: product.shortDescription ?? product.title,
          offers: {
            "@type": "Offer",
            price: product.currentPrice,
            priceCurrency: product.currency,
            url: product.outboundUrl,
            availability: "https://schema.org/InStock",
          },
        }}
      />

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="breadcrumb__sep" />
        <Link href="/products">All Products</Link>
        <span className="breadcrumb__sep" />
        <span aria-current="page">{product.title}</span>
      </nav>

      <section className={styles.hero}>
        <div className={styles.imageWrap}>
          <Image
            src={product.image.src}
            alt={product.image.alt}
            width={520}
            height={520}
            priority
            style={{ width: "100%", height: "auto" }}
          />
        </div>
        <div>
          <span className={styles.ribbon}>
            {product.promoRibbon ?? product.badge}
          </span>
          <h1 className="page-title">{product.title}</h1>
          <p className={styles.summary}>
            {product.shortDescription ??
              "A curated OfferLane product note for comparing price, partner terms, and checkout context."}
          </p>
          <div className={styles.price}>
            <span className={styles.current}>
              {product.currentPrice} {product.currency}
            </span>
            {product.compareAtPrice != null && (
              <span className={styles.compare}>
                Was {product.compareAtPrice} {product.currency}
              </span>
            )}
          </div>
          <p className={styles.vendor}>
            Vendor:{" "}
            {product.vendorHref ? (
              <a
                href={product.vendorHref}
                target="_blank"
                rel="nofollow sponsored noopener"
              >
                {product.vendor}
              </a>
            ) : (
              product.vendor
            )}
          </p>
          <ProductOutboundLink
            product={product}
            placement="product-detail"
            className="btn btn--primary btn--cta"
          />
        </div>
      </section>

      <p className={styles.disclosure}>
        OfferLane may earn a commission when you click partner links. Purchases
        complete on the merchant site, where final pricing and terms are set.
      </p>

      {detailSections.map((section) => (
        <section key={section.heading} className={styles.section}>
          <h2>{section.heading}</h2>
          <p>{section.body}</p>
        </section>
      ))}

      {similarProducts.length > 0 && (
        <section className={styles.related} aria-labelledby="similar-products">
          <h2 id="similar-products" className="section-title">
            Similar products
          </h2>
          <div className={gridStyles.grid}>
            {similarProducts.map((item, index) => (
              <ProductCard
                key={item.productId}
                product={item}
                position={index + 1}
                listName="product-detail-similar"
              />
            ))}
          </div>
        </section>
      )}

      {popularProducts.length > 0 && (
        <section className={styles.related} aria-labelledby="popular-products">
          <h2 id="popular-products" className="section-title">
            Popular product lanes
          </h2>
          <div className={gridStyles.grid}>
            {popularProducts.map((item, index) => (
              <ProductCard
                key={item.productId}
                product={item}
                position={index + 1}
                listName="product-detail-popular"
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
