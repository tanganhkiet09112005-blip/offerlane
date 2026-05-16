import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllCategorySlugs,
  getCategoryPage,
  getCategoryProducts,
  getCategoryStores,
  getRelatedCategories,
} from "@/lib/data";
import { ProductCard } from "@/components/products/ProductCard";
import { PageViewTracker } from "@/components/providers/PageViewTracker";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
} from "@/lib/seo";
import { StoreMiniCard } from "@/components/store/StoreMiniCard";
import productStyles from "@/components/products/products.module.css";
import styles from "../category.module.css";

export function generateStaticParams() {
  return getAllCategorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getCategoryPage(slug);
  if (!page) return { title: "Category" };
  return buildPageMetadata({
    title: page.seo?.title ?? `${page.title} Deals, Products & Stores`,
    description:
      page.seo?.description ??
      page.lead ??
      `Browse ${page.title} deals, products, and partner stores on OfferLane.`,
    pathname: page.seo?.canonical ?? `/category/${slug}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = getCategoryPage(slug);
  if (!data) notFound();
  const products = getCategoryProducts(slug);
  const stores = getCategoryStores(slug);
  const relatedCategories = getRelatedCategories(slug);

  const hasStores = stores.length > 0;
  const hasProducts = products.length > 0;
  const storeCtaHref =
    stores.length > 0 ? `/store/${stores[0].slug}` : "/stores";

  return (
    <main
      className={`container page-main ${styles.categoryMain}`}
      data-page-type="category"
      data-category-slug={slug}
    >
      <PageViewTracker
        pageType="category"
        pageSlug={slug}
        extra={{
          visible_product_count: products.length,
          visible_store_count: stores.length,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: data.title,
          description: data.lead,
          url: absoluteUrl(`/category/${slug}`),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Categories", path: "/categories" },
          { name: data.title, path: `/category/${slug}` },
        ])}
      />

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="breadcrumb__sep" />
        <Link href="/categories">Categories</Link>
        <span className="breadcrumb__sep" />
        <span aria-current="page">{data.title}</span>
      </nav>

      <header className={styles.hero}>
        <h1 className={`page-title ${styles.heroTitle}`}>{data.title}</h1>
        <p className={styles.heroLead}>{data.lead}</p>
        {relatedCategories.length > 0 ? (
          <ul className={styles.chips} aria-label="Related categories">
            {relatedCategories.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/category/${cat.slug}`} className={styles.chip}>
                  {cat.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      {!hasStores && !hasProducts ? (
        <div className={styles.emptyState}>
          <p>
            Nothing is tagged to <strong>{data.title}</strong> yet. Browse all
            products or open a featured store for live coupons and deals.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/products" className="btn btn--primary btn--cta">
              View all products
            </Link>
            <Link href="/stores" className="btn btn--outline">
              Browse stores
            </Link>
          </div>
        </div>
      ) : null}

      {hasStores || hasProducts ? (
        <>
          <section
            className={styles.section}
            aria-labelledby="category-stores-heading"
          >
            <h2 id="category-stores-heading" className={styles.sectionTitle}>
              Stores in {data.title}
            </h2>
            {hasStores ? (
              <div className={styles.storeGrid}>
                {stores.map((store) => (
                  <StoreMiniCard
                    key={store.slug}
                    name={store.name}
                    href={`/store/${store.slug}`}
                    description={store.description}
                    logoSrc={store.logo?.src}
                    ribbon={store.promoRibbon}
                  />
                ))}
              </div>
            ) : (
              <p className={styles.emptyHint}>
                No stores are tagged for this category yet. Product picks may
                still appear below, or browse all stores for current offers.
              </p>
            )}
          </section>

          <section
            className={styles.section}
            aria-labelledby="category-products-heading"
          >
            <h2 id="category-products-heading" className={styles.sectionTitle}>
              Products in {data.title}
            </h2>
            {hasProducts ? (
              <div className={productStyles.grid}>
                {products.map((product, index) => (
                  <ProductCard
                    key={product.productId}
                    product={product}
                    position={index + 1}
                    listName={`category-${slug}`}
                  />
                ))}
              </div>
            ) : (
              <p className={styles.emptyHint}>
                No products are assigned to this category yet. Try another topic
                from the chips above or open the full catalog.
              </p>
            )}
          </section>
        </>
      ) : null}

      <div className={`${styles.ctaRow} ${styles.footerCtas}`}>
        <Link href="/products" className="btn btn--primary">
          View all products
        </Link>
        <Link href={storeCtaHref} className="btn btn--outline">
          {stores.length > 0
            ? `Deals at ${stores[0].name}`
            : "Browse all stores"}
        </Link>
      </div>
    </main>
  );
}
