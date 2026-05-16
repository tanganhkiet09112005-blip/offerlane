import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/lib/data";
import { PageViewTracker } from "@/components/providers/PageViewTracker";
import { JsonLd } from "@/components/seo/JsonLd";
import styles from "@/components/blogs/blogs.module.css";

export const metadata: Metadata = {
  title: "OfferLane Blogs & Savings Guides",
  description:
    "Read OfferLane buying notes, savings guides, and affiliate deal explainers.",
};

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
          url: "/blogs",
        }}
      />
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="breadcrumb__sep" />
        <span aria-current="page">Blogs</span>
      </nav>
      <h1 className="page-title">Blogs</h1>
      <p className={styles.lead}>
        Deal timing, product checks, and merchant-term notes from the OfferLane
        editorial desk.
      </p>
      <div className={styles.grid}>
        {posts.map((post) => (
          <Link key={post.slug} href={`/blogs/${post.slug}`} className={styles.card}>
            <span className={styles.meta}>
              {post.category ?? "Guide"} - {post.author ?? "OfferLane"} - {post.date}
            </span>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
