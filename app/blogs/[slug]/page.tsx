import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllBlogSlugs,
  getBlogPost,
  getBlogPostBySlug,
  getRecentBlogPosts,
} from "@/lib/data";
import { JsonLd } from "@/components/seo/JsonLd";
import styles from "@/components/blogs/blogs.module.css";

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

  return (
    <main className={`container ${styles.article}`} data-page-type="blog-post">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          author: { "@type": "Organization", name: post.author ?? "OfferLane" },
          datePublished: post.date,
          image: post.heroImage?.src,
        }}
      />
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="breadcrumb__sep" />
        <Link href="/blogs">Blogs</Link>
        <span className="breadcrumb__sep" />
        <span aria-current="page">{post.title}</span>
      </nav>
      <span className={styles.meta}>
        {post.category ?? "Guide"} - {post.author ?? "OfferLane Editorial"} - {post.date}
      </span>
      <h1 className="page-title">{post.title}</h1>
      <p className={styles.articleLead}>{post.excerpt}</p>

      {post.heroImage && (
        <div className={styles.hero}>
          <Image
            src={post.heroImage.src}
            alt={post.heroImage.alt}
            width={900}
            height={520}
            priority
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      )}

      {data.sections.map((section) => (
        <section key={section.heading} className={styles.section}>
          <h2>{section.heading}</h2>
          <p>{section.body}</p>
        </section>
      ))}

      {recentPosts.length > 0 && (
        <section className={styles.recent} aria-labelledby="recent-blogs">
          <h2 id="recent-blogs" className="section-title">
            Recent blogs
          </h2>
          <div className={styles.grid}>
            {recentPosts.map((recent) => (
              <Link
                key={recent.slug}
                href={`/blogs/${recent.slug}`}
                className={styles.card}
              >
                <span className={styles.meta}>
                  {recent.category ?? "Guide"} - {recent.date}
                </span>
                <h3>{recent.title}</h3>
                <p>{recent.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p style={{ marginTop: "2rem" }}>
        <Link href="/blogs" className="btn btn--outline">
          Back to blogs
        </Link>
      </p>
    </main>
  );
}
