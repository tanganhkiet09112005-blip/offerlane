import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getBlogPosts,
  getFeaturedProducts,
  getFeaturedStores,
  getSiteConfig,
} from "@/lib/data";
import { HomeNewsletterForm } from "@/components/home/HomeNewsletterForm";
import { ProductCard } from "@/components/products/ProductCard";
import productStyles from "@/components/products/products.module.css";
import { PageViewTracker } from "@/components/providers/PageViewTracker";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";
import styles from "@/components/home/home.module.css";

export const metadata: Metadata = buildPageMetadata({
  title: "OfferLane | Deals, Coupon Codes & Smart Shopping Guides",
  description:
    "OfferLane curates affiliate product picks, verified coupon codes, and deal guides for shoppers who compare before clicking out.",
  pathname: "/",
});

// Category emoji markers — visual shorthand without copying any brand
const CATEGORY_ICONS: Record<string, string> = {
  "auto-tech": "🚗",
  "smart-home": "🏠",
  wellness: "💪",
  outdoor: "🏕️",
  office: "💼",
  gadgets: "📱",
  deals: "🏷️",
  lifestyle: "✨",
};

function getCategoryIcon(href: string): string {
  const slug = href.split("/").pop() ?? "";
  return CATEGORY_ICONS[slug] ?? "🔖";
}

export default function HomePage() {
  const site = getSiteConfig();
  const products = getFeaturedProducts(site.home?.featuredProductLimit ?? 6);
  const posts = getBlogPosts();
  const stores = getFeaturedStores(6);

  const headlineSlugs = new Set(site.home?.headlinePostSlugs ?? []);
  const headlines = posts.filter((p) => headlineSlugs.has(p.slug));
  // Featured articles: up to 4, skip those already in headline strip
  const articlePosts = posts.filter((p) => !headlineSlugs.has(p.slug)).slice(0, 4);
  const displayArticles = articlePosts.length > 0 ? articlePosts : posts.slice(0, 4);

  const categoryPills = site.home?.storeCategoryPills ?? site.header.shortcutNav;

  return (
    <main className={styles.home} data-page-type="home">
      <PageViewTracker pageType="home" />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: site.brand.name,
          url: absoluteUrl("/"),
          description: site.brand.tagline,
          logo: absoluteUrl("/assets/placeholders/store.svg"),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.brand.name,
          description: site.brand.tagline,
          url: absoluteUrl("/"),
          publisher: {
            "@type": "Organization",
            name: site.brand.name,
          },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${absoluteUrl("/")}?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }}
      />

      {/* ── 1. HERO ──────────────────────────────────────────── */}
      <section className={styles.hero} aria-label="Welcome to OfferLane">
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <p className={styles.heroBadge}>🏷️ Curated Affiliate Deals</p>
            <h1 className={styles.heroTitle}>{site.brand.name}</h1>
            <p className={styles.heroLead}>
              Compare verified coupon codes, affiliate product picks, and partner
              deal guides — all in one lane. We do the homework so you click with
              confidence.
            </p>

            {/* Category pill navigation */}
            {categoryPills.length > 0 && (
              <ul className={styles.pillRow} aria-label="Browse by category">
                {categoryPills.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.heroPill}>
                      <span aria-hidden="true">{getCategoryIcon(link.href)}</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className={styles.heroActions}>
              <Link href="/products" className="btn btn--primary btn--lg">
                Browse Deals
              </Link>
              <Link href="/blogs" className={styles.heroSecondaryLink}>
                Read savings guides →
              </Link>
            </div>
          </div>

          {/* Hero stats bar */}
          <div className={styles.heroStats} aria-label="Site highlights">
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>{products.length}+</span>
              <span className={styles.heroStatLabel}>Curated picks</span>
            </div>
            <div className={styles.heroStatDivider} aria-hidden="true" />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>{stores.length}+</span>
              <span className={styles.heroStatLabel}>Partner stores</span>
            </div>
            <div className={styles.heroStatDivider} aria-hidden="true" />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>{posts.length}+</span>
              <span className={styles.heroStatLabel}>Deal guides</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FEATURED PRODUCTS ────────────────────────────── */}
      {products.length > 0 && (
        <section
          className={`container ${styles.section}`}
          aria-labelledby="home-products"
        >
          <div className={styles.sectionHeader}>
            <h2 id="home-products" className="section-title">
              Deal picks moving this week
            </h2>
            <Link href="/products" className={styles.sectionLink}>
              View all →
            </Link>
          </div>
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

      {/* ── 3. HEADLINE STRIP ───────────────────────────────── */}
      {headlines.length > 0 && (
        <section
          className={`container ${styles.section}`}
          aria-labelledby="home-headlines"
        >
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
                <span className={styles.headlineCategory}>
                  {post.category ?? "OfferLane Editorial"}
                </span>
                <span className={styles.headlineTitle}>{post.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 4. FEATURED ARTICLES (blog cards with thumbnail) ── */}
      {displayArticles.length > 0 && (
        <section
          className={`container ${styles.section}`}
          aria-labelledby="home-articles"
        >
          <div className={styles.sectionHeader}>
            <h2 id="home-articles" className="section-title">
              Buying guides &amp; savings notes
            </h2>
            <Link href="/blogs" className={styles.sectionLink}>
              All guides →
            </Link>
          </div>
          <div className={styles.articleGrid}>
            {displayArticles.map((post) => (
              <Link
                key={post.slug}
                href={`/blogs/${post.slug}`}
                className={styles.articleCard}
              >
                {/* Thumbnail */}
                <div className={styles.articleThumb}>
                  {post.heroImage?.src ? (
                    <Image
                      src={post.heroImage.src}
                      alt={post.heroImage.alt ?? post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className={styles.articleThumbFallback} aria-hidden="true">
                      <span>{post.category ?? "Guide"}</span>
                    </div>
                  )}
                </div>
                {/* Body */}
                <div className={styles.articleBody}>
                  {post.category && (
                    <span className={styles.articleCategory}>{post.category}</span>
                  )}
                  <h3 className={styles.articleTitle}>{post.title}</h3>
                  <p className={styles.articleExcerpt}>{post.excerpt}</p>
                  <div className={styles.articleMeta}>
                    <span>{post.author ?? "OfferLane Editorial"}</span>
                    {post.date && <span aria-hidden="true">·</span>}
                    {post.date && <time dateTime={post.date}>{post.date}</time>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 5. FEATURED STORES ──────────────────────────────── */}
      {stores.length > 0 && (
        <section
          className={`container ${styles.section}`}
          aria-labelledby="home-stores"
        >
          <div className={styles.sectionHeader}>
            <h2 id="home-stores" className="section-title">
              Partner stores &amp; current deals
            </h2>
            <Link href="/stores" className={styles.sectionLink}>
              All stores →
            </Link>
          </div>
          <div className={styles.storeGrid}>
            {stores.map((store) => (
              <Link
                key={store.slug}
                href={`/store/${store.slug}`}
                className={styles.storeCard}
              >
                <div className={styles.storeCardLogo}>
                  <Image
                    src={
                      store.logo.src &&
                      store.logo.src !== "/assets/placeholders/store.svg"
                        ? store.logo.src
                        : "/assets/placeholders/store.svg"
                    }
                    alt={store.logo.alt ?? store.name}
                    width={56}
                    height={56}
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div className={styles.storeCardBody}>
                  {store.promoRibbon && (
                    <span className={styles.storeRibbon}>{store.promoRibbon}</span>
                  )}
                  <p className={styles.storeCardName}>{store.name}</p>
                  <p className={styles.storeCardDesc}>{store.description}</p>
                </div>
                <span className={styles.storeCardCta} aria-label={`See ${store.name} deals`}>
                  View deals →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 6. NEWSLETTER CTA ───────────────────────────────── */}
      <section className={styles.newsletterSection} aria-labelledby="home-newsletter">
        <div className="container">
          <div className={styles.newsletterInner}>
            <div className={styles.newsletterText}>
              <h2 id="home-newsletter" className={styles.newsletterTitle}>
                Get the weekly deal digest
              </h2>
              <p className={styles.newsletterLead}>
                Fresh coupon codes, partner highlights, and buying guide picks —
                delivered before the deals expire.
              </p>
            </div>
            <HomeNewsletterForm />
            <p className={styles.newsletterDisclaimer}>
              No spam. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
