import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllBlogSlugs,
  getBlogPost,
  getBlogPostBySlug,
  getFeaturedProducts,
  getProductsBySlugs,
  getRecentBlogPosts,
  getStoresBySlugs,
} from "@/lib/data";
import { BlogRelatedStoreCard } from "@/components/blogs/BlogRelatedStoreCard";
import { ProductCard } from "@/components/products/ProductCard";
import productStyles from "@/components/products/products.module.css";
import { PageViewTracker } from "@/components/providers/PageViewTracker";
import { JsonLd } from "@/components/seo/JsonLd";
import styles from "@/components/blogs/blogs.module.css";

const BLOG_PLACEHOLDER_IMAGE = "/assets/placeholders/product.svg";

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Blog" };
  return {
    title: post.seo?.title ?? post.title,
    description: post.seo?.description ?? post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  const data = getBlogPost(slug);
  if (!post || !data) notFound();

  const recentPosts = getRecentBlogPosts(slug, 3);
  const relatedProductSlugs = post.relatedProductSlugs ?? [];
  const relatedStoreSlugs = post.relatedStoreSlugs ?? [];
  const hasRelatedProductSlugs = relatedProductSlugs.length > 0;
  const recommendedProducts = hasRelatedProductSlugs
    ? getProductsBySlugs(relatedProductSlugs)
    : getFeaturedProducts(3);
  const relatedStores = relatedStoreSlugs.length
    ? getStoresBySlugs(relatedStoreSlugs)
    : [];
  const heroImage = post.heroImage?.src || BLOG_PLACEHOLDER_IMAGE;
  const heroAlt = post.heroImage?.alt || `${post.title} cover image`;
  const ctaHref = recommendedProducts[0]?.internalUrl ?? "/products";

  return (
    <main className={`container ${styles.article}`} data-page-type="blog-post">
      <PageViewTracker
        pageType="blog-post"
        pageSlug={post.slug}
        extra={{ blog_title: post.title }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          author: { "@type": "Organization", name: post.author ?? "OfferLane" },
          datePublished: post.date,
          image: heroImage,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blogs",
              item: "/blogs",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: post.title,
              item: `/blogs/${post.slug}`,
            },
          ],
        }}
      />
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="breadcrumb__sep" />
        <Link href="/blogs">Blogs</Link>
        <span className="breadcrumb__sep" />
        <span aria-current="page">{post.title}</span>
      </nav>

      <header className={styles.articleHeader}>
        <div className={styles.articleIntro}>
          <span className={styles.eyebrow}>{post.category ?? "Guide"}</span>
          <h1 className="page-title page-title--plain">{post.title}</h1>
          <p className={styles.articleLead}>{post.excerpt}</p>
          <div className={styles.articleMetaLine}>
            <span>{post.author ?? "OfferLane Editorial"}</span>
            {post.date && <span aria-hidden="true">-</span>}
            {post.date && <time dateTime={post.date}>{post.date}</time>}
          </div>
        </div>
        <div className={styles.hero}>
          <Image
            src={heroImage}
            alt={heroAlt}
            width={900}
            height={520}
            priority
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      </header>

      <article className={styles.articleBody} aria-label="Article body">
        {data.sections.map((section) => (
          <section key={section.heading} className={styles.section}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </article>

      {post.ctaLabel && (
        <section className={styles.ctaBlock} aria-labelledby="blog-cta">
          <span className={styles.eyebrow}>Next lane</span>
          <h2 id="blog-cta">Ready to compare the picks?</h2>
          <p>
            Use the related product and store sections below to keep researching
            before you leave for a merchant site.
          </p>
          <Link href={ctaHref} className="btn btn--primary">
            {post.ctaLabel}
          </Link>
        </section>
      )}

      {recommendedProducts.length > 0 && (
        <section className={styles.recent} aria-labelledby="blog-products">
          <h2 id="blog-products" className="section-title">
            Product picks mentioned by OfferLane
          </h2>
          <div className={productStyles.grid}>
            {recommendedProducts.map((product, index) => (
              <ProductCard
                key={product.productId}
                product={product}
                position={index + 1}
                listName={
                  hasRelatedProductSlugs
                    ? "blog-related-products"
                    : "blog-recommended-products"
                }
                contextEvent={{
                  name: "click_blog_product",
                  payload: {
                    blog_slug: post.slug,
                    source: hasRelatedProductSlugs
                      ? "related_product_slugs"
                      : "featured_fallback",
                  },
                }}
              />
            ))}
          </div>
        </section>
      )}

      {relatedStores.length > 0 && (
        <section className={styles.recent} aria-labelledby="blog-stores">
          <h2 id="blog-stores" className="section-title">
            Related stores and deals
          </h2>
          <div className={styles.grid}>
            {relatedStores.map((store, index) => (
              <BlogRelatedStoreCard
                key={store.storeId}
                store={store}
                blogSlug={post.slug}
                position={index + 1}
              />
            ))}
          </div>
        </section>
      )}

      {recentPosts.length > 0 && (
        <section className={styles.recent} aria-labelledby="recent-blogs">
          <h2 id="recent-blogs" className="section-title">
            Recent blogs
          </h2>
          <div className={styles.grid}>
            {recentPosts.map((recent) => (
              <Link key={recent.slug} href={`/blogs/${recent.slug}`} className={styles.card}>
                <div className={styles.cardThumb}>
                  <Image
                    src={recent.heroImage?.src || BLOG_PLACEHOLDER_IMAGE}
                    alt={recent.heroImage?.alt || `${recent.title} cover image`}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
                <div className={styles.cardBody}>
                  <span className={styles.cardCategory}>
                    {recent.category ?? "Guide"}
                  </span>
                  <h3>{recent.title}</h3>
                  <p>{recent.excerpt}</p>
                  <span className={styles.meta}>
                    {recent.author ?? "OfferLane Editorial"}
                    {recent.date && <span aria-hidden="true">-</span>}
                    {recent.date && <time dateTime={recent.date}>{recent.date}</time>}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className={styles.backLink}>
        <Link href="/blogs" className="btn btn--outline">
          Back to blogs
        </Link>
      </p>
    </main>
  );
}
