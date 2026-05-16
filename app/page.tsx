import type { Metadata } from "next";
import Link from "next/link";
import {
  getBlogPosts,
  getFeaturedProducts,
  getSiteConfig,
} from "@/lib/data";
import { ProductCard } from "@/components/products/ProductCard";
import productStyles from "@/components/products/products.module.css";
import { PageViewTracker } from "@/components/providers/PageViewTracker";
import { JsonLd } from "@/components/seo/JsonLd";
import styles from "@/components/home/home.module.css";

export const metadata: Metadata = {
  title: "OfferLane | Deals, Reviews & Promo Codes",
  description:
    "OfferLane curates affiliate product picks, coupon pages, and deal guides for shoppers who compare before clicking out.",
};

export default function HomePage() {
  const site = getSiteConfig();
  const products = getFeaturedProducts(site.home?.featuredProductLimit ?? 8);
  const posts = getBlogPosts();
  const headlineSlugs = new Set(site.home?.headlinePostSlugs ?? []);
  const headlines = posts.filter((post) => headlineSlugs.has(post.slug));

  return (
    <main className={`container ${styles.home}`} data-page-type="home">
      <PageViewTracker pageType="home" />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.brand.name,
          description: site.brand.tagline,
          url: "/",
        }}
      />

      <section className={styles.hero}>
        <h1 className="page-title">{site.brand.name}</h1>
        <p className={styles.heroLead}>
          Curated affiliate product picks, coupon pages, and editorial buying
          notes for shoppers who want the deal context before the merchant tab.
        </p>
        <ul className={styles.pillRow} aria-label="Featured categories">
          {(site.home?.storeCategoryPills ?? site.header.shortcutNav).map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.pill}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className={styles.actionRow}>
          <Link href="/products" className="btn btn--primary">
            Browse products
          </Link>
          <Link href="/store/carpuride" className="btn btn--outline">
            Open store deals
          </Link>
        </p>
      </section>

      {products.length > 0 && (
        <section className={styles.section} aria-labelledby="home-products">
          <h2 id="home-products" className="section-title">
            Deal picks moving this week
          </h2>
          <div className={productStyles.grid}>
            {products.map((product, index) => (
              <ProductCard
                key={product.productId}
                product={product}
                position={index + 1}
                listName="home-featured-products"
              />
            ))}
          </div>
        </section>
      )}

      {headlines.length > 0 && (
        <section className={styles.section} aria-labelledby="home-headlines">
          <h2 id="home-headlines" className="section-title">
            Fresh notes from the lane
          </h2>
          <div className={styles.headlineStrip}>
            {headlines.map((post) => (
              <Link
                key={post.slug}
                href={`/blogs/${post.slug}`}
                className={styles.headlineItem}
              >
                <span>{post.category ?? "OfferLane Editorial"}</span>
                {post.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className={styles.section} aria-labelledby="home-articles">
          <h2 id="home-articles" className="section-title">
            Buying guides and savings notes
          </h2>
          <div className={styles.articleGrid}>
            {posts.slice(0, 4).map((post) => (
              <Link
                key={post.slug}
                href={`/blogs/${post.slug}`}
                className={styles.articleCard}
              >
                <span className={styles.meta}>
                  {post.category ?? "Guide"} - {post.date}
                </span>
                <h3 className={styles.cardTitle}>{post.title}</h3>
                <p className={styles.cardText}>{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section} aria-labelledby="home-partners">
        <h2 id="home-partners" className="section-title">
          Partner lanes to watch
        </h2>
        <div className={styles.linkGrid}>
          {(site.home?.partnerLinks ?? []).map((link) => (
            <Link key={link.href} href={link.href} className={styles.linkCard}>
              <span className={styles.meta}>Partner spotlight</span>
              <h3 className={styles.cardTitle}>{link.label}</h3>
              <p className={styles.cardText}>
                Open the current coupon page, compare merchant terms, and click
                through only when the offer fits.
              </p>
            </Link>
          ))}
          {(site.home?.socialLinks ?? []).map((link) => (
            <Link key={link.href} href={link.href} className={styles.linkCard}>
              <span className={styles.meta}>Community signal</span>
              <h3 className={styles.cardTitle}>{link.label}</h3>
              <p className={styles.cardText}>
                Review editorial notes and category picks before choosing a
                partner checkout path.
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
