import Link from "next/link";
import type { ContentPageData } from "@/lib/types";
import styles from "./content.module.css";

export function ContentPageView({
  data,
  breadcrumb,
  children,
}: {
  data: ContentPageData;
  breadcrumb?: { label: string; href?: string }[];
  children?: React.ReactNode;
}) {
  return (
    <article className={styles.article}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="breadcrumb" aria-label="Breadcrumb">
          {breadcrumb.map((item, i) => (
            <span key={item.label}>
              {i > 0 && <span className="breadcrumb__sep" />}
              {item.href ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span aria-current="page">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <h1 className="page-title">{data.title}</h1>
      <p className={styles.lead}>{data.lead}</p>

      {data.posts && data.posts.length > 0 && (
        <ul className={styles.list}>
          {data.posts.map((post) => (
            <li key={post.slug} className={styles.listItem}>
              <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
              <p className={styles.meta}>{post.date}</p>
              <p>{post.excerpt}</p>
            </li>
          ))}
        </ul>
      )}

      {data.categoryList && data.categoryList.length > 0 && (
        <ul className={styles.list}>
          {data.categoryList.map((cat) => (
            <li key={cat.slug} className={styles.listItem}>
              <Link href={`/category/${cat.slug}`}>{cat.title}</Link>
              <p>{cat.description}</p>
            </li>
          ))}
        </ul>
      )}

      {data.storeList && data.storeList.length > 0 && (
        <ul className={styles.list}>
          {data.storeList.map((store) => (
            <li key={store.slug} className={styles.listItem}>
              <Link href={store.href}>{store.name}</Link>
              <p>{store.description}</p>
            </li>
          ))}
        </ul>
      )}

      {data.sections.map((section) => (
        <section key={section.heading} className={styles.section}>
          <h2>{section.heading}</h2>
          <p>{section.body}</p>
        </section>
      ))}

      {children}
    </article>
  );
}
