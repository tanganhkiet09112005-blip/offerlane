import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBlogPosts } from "@/lib/data";
import { PageViewTracker } from "@/components/providers/PageViewTracker";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";
import styles from "@/components/blogs/blogs.module.css";

export const metadata: Metadata = buildPageMetadata({
  title: "OfferLane Blogs & Savings Guides",
  description:
    "Read OfferLane buying notes, savings guides, and affiliate deal explainers.",
  pathname: "/blogs",
});

const BLOG_PLACEHOLDER_IMAGE = "/assets/placeholders/product.svg";

export default function BlogsPage() {
  const posts = getBlogPosts();

  return (
    <main className={`container ${styles.index}`} data-page-type="blogs">
      <PageViewTracker pageType="blogs" />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "OfferLane Blogs",
          description:
            "Read OfferLane buying notes, savings guides, and affiliate deal explainers.",
          url: absoluteUrl("/blogs"),
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: posts.length,
            itemListElement: posts.map((post, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(`/blogs/${post.slug}`),
              name: post.title,
            })),
          },
        }}
      />
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="breadcrumb__sep" />
        <span aria-current="page">Blogs</span>
      </nav>
      <section className={styles.indexHero} aria-labelledby="blogs-title">
        <span className={styles.eyebrow}>OfferLane editorial</span>
        <h1 id="blogs-title" className="page-title page-title--plain">
          Blogs & savings guides
        </h1>
        <p className={styles.lead}>
          Deal timing, product checks, and merchant-term notes from the OfferLane
          editorial desk.
        </p>
      </section>

      {posts.length > 0 ? (
        <div className={styles.grid}>
          {posts.map((post) => {
            const imageSrc = post.heroImage?.src || BLOG_PLACEHOLDER_IMAGE;
            const imageAlt = post.heroImage?.alt || `${post.title} cover image`;

            return (
              <Link
                key={post.slug}
                href={`/blogs/${post.slug}`}
                className={styles.card}
              >
                <div className={styles.cardThumb}>
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className={styles.cardBody}>
                  <span className={styles.cardCategory}>
                    {post.category ?? "Guide"}
                  </span>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <span className={styles.meta}>
                    <span>{post.author ?? "OfferLane Editorial"}</span>
                    {post.date && <span aria-hidden="true">-</span>}
                    {post.date && <time dateTime={post.date}>{post.date}</time>}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <section className={styles.emptyState} aria-label="No blog posts">
          <h2>No guides published yet</h2>
          <p>OfferLane buying notes and savings guides will appear here.</p>
        </section>
      )}
    </main>
  );
}
