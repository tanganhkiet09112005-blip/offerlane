"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { trackEvent, trackOutbound } from "@/lib/analytics";
import type { Product } from "@/lib/types";
import styles from "./products.module.css";

function queueNonCriticalTrack(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  if ("requestIdleCallback" in window) {
    const idleId = window.requestIdleCallback(callback, { timeout: 1200 });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = globalThis.setTimeout(callback, 150);
  return () => globalThis.clearTimeout(timeoutId);
}

export function ProductCard({
  product,
  position,
  listName = "all-products",
}: {
  product: Product;
  position: number;
  listName?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const viewed = useRef(false);
  const cancelQueuedView = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !viewed.current) {
          viewed.current = true;
          obs.unobserve(entry.target);
          cancelQueuedView.current = queueNonCriticalTrack(() => {
            trackEvent("view_product", {
              product_id: product.productId,
              list_name: listName,
              position,
            });
          });
        }
      },
      { rootMargin: "80px 0px", threshold: 0.35 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelQueuedView.current?.();
      cancelQueuedView.current = null;
    };
  }, [product.productId, position, listName]);

  const onInternalClick = () => {
    trackEvent("view_product", {
      product_id: product.productId,
      list_name: listName,
      position,
      source: "click",
    });
  };

  const onShopNow = (e: React.MouseEvent) => {
    e.preventDefault();
    trackOutbound({
      events: [
        {
          name: "view_product",
          payload: {
            product_id: product.productId,
            list_name: listName,
            position,
            source: "shop_now",
          },
        },
        {
          name: "outbound_click",
          payload: {
            placement: "product-card",
            entity_type: "product",
            entity_id: product.productId,
          },
        },
      ],
      url: product.outboundUrl,
    });
  };

  const priceFmt = (n: number) =>
    n.toFixed(Number.isInteger(n) ? 0 : 2);

  return (
    <article
      ref={ref}
      className={styles.card}
      data-product-id={product.productId}
      data-currency={product.currency}
      data-page={product.page}
      data-badge={product.badge.toLowerCase()}
    >
      <div className={styles.media}>
        <Link
          href={product.internalUrl}
          className={`${styles.badgeLink} js-product-link`}
          onClick={onInternalClick}
        >
          {product.badge}
        </Link>
        <Link
          href={product.internalUrl}
          className={`${styles.imageLink} js-product-link`}
          onClick={onInternalClick}
        >
          <Image
            src={product.image.src}
            alt={product.image.alt}
            fill
            sizes="(max-width: 640px) 130px, 200px"
          />
        </Link>
      </div>

      <div className={styles.body}>
        <Link
          href={product.internalUrl}
          className={`${styles.titleLink} js-product-link`}
          onClick={onInternalClick}
        >
          {product.title}
        </Link>
        <div className={styles.priceBlock}>
          <span className={styles.currency}>{product.currency}</span>
          <div className={styles.priceRow}>
            <span className={`product-card__price-current ${styles.priceCurrent}`}>
              {priceFmt(product.currentPrice)}
            </span>
            {product.compareAtPrice != null && (
              <span className={styles.compare}>
                {priceFmt(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      <a
        href={product.outboundUrl}
        className={`btn btn--primary btn--cta ${styles.cta} js-shop-now`}
        onClick={onShopNow}
        data-event="outbound_click"
        rel="nofollow sponsored noopener"
      >
        Shop Now
      </a>
    </article>
  );
}
