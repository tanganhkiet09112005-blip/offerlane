"use client";

import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import type { StorePageData } from "@/lib/types";
import styles from "./blogs.module.css";

export function BlogRelatedStoreCard({
  store,
  blogSlug,
  position,
}: {
  store: StorePageData;
  blogSlug: string;
  position: number;
}) {
  return (
    <Link
      href={`/store/${store.slug}`}
      className={`${styles.card} ${styles.storeCard}`}
      data-event="click_blog_store"
      data-store-slug={store.slug}
      onClick={() => {
        trackEvent("click_blog_store", {
          blog_slug: blogSlug,
          store_slug: store.slug,
          store_id: store.storeId,
          list_name: "blog-related-stores",
          position,
        });
      }}
    >
      <Image src={store.logo.src} alt="" width={48} height={48} aria-hidden />
      <span>
        <span className={styles.storeName}>{store.name}</span>
        <span className={styles.meta}>{store.domainLabel}</span>
        <span className={styles.storeDescription}>{store.description}</span>
      </span>
    </Link>
  );
}
