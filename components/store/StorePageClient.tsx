"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { trackEvent, trackOutbound } from "@/lib/analytics";
import type { Offer, StorePageData } from "@/lib/types";
import styles from "./store.module.css";

function sortOffers(offers: Offer[], sort: string): Offer[] {
  const list = [...offers];
  if (sort === "Popular") {
    return list.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  }
  if (sort === "Expiry") {
    return list.sort(
      (a, b) =>
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );
  }
  return list;
}

function OfferCard({
  offer,
  storeSlug,
}: {
  offer: Offer;
  storeSlug: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const handleCta = () => {
    if (offer.type === "coupon") {
      trackEvent("get_coupon", {
        offer_id: offer.offerId,
        store_slug: storeSlug,
        coupon_code_present: !!offer.couponCode,
      });
      setRevealed(true);
      return;
    }
    trackOutbound({
      events: [
        {
          name: "click_deal",
          payload: {
            offer_id: offer.offerId,
            store_slug: storeSlug,
          },
        },
        {
          name: "outbound_click",
          payload: {
            placement: "offer-cta",
            entity_type: "deal",
            entity_id: offer.offerId,
          },
        },
      ],
      url: offer.outboundUrl,
    });
  };

  const copyCode = async () => {
    if (!offer.couponCode) return;
    await navigator.clipboard.writeText(offer.couponCode);
    trackEvent("copy_coupon", {
      offer_id: offer.offerId,
      store_slug: storeSlug,
      coupon_code: offer.couponCode,
    });
  };

  const goPartner = () => {
    trackOutbound({
      events: [
        {
          name: "outbound_click",
          payload: {
            placement: "offer-partner",
            entity_type: offer.type,
            entity_id: offer.offerId,
          },
        },
      ],
      url: offer.outboundUrl,
    });
  };

  return (
    <article
      className={styles.offerCard}
      data-offer-id={offer.offerId}
      data-store-slug={storeSlug}
      data-offer-type={offer.type}
      data-expiry={offer.expiryDate}
      data-popularity={offer.popularity ?? 0}
    >
      <div className={styles.offerBadgeCol}>{offer.badge}</div>
      <div className={styles.offerBody}>
        <h3 className={styles.offerTitle}>{offer.headline}</h3>
        <button
          type="button"
          className={`${styles.offerMore} js-offer-more`}
          onClick={() => {
            setExpanded((v) => !v);
            trackEvent("expand_offer", {
              offer_id: offer.offerId,
              store_slug: storeSlug,
            });
          }}
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
        <p
          className={`${styles.offerDesc} ${
            !expanded ? styles.offerDescCollapsed : ""
          }`}
        >
          {offer.summary}
        </p>
      </div>
      <div className={styles.offerMeta}>
        {offer.engagementCount != null && offer.engagementLabel && (
          <span className={styles.engagement}>
            {offer.engagementCount} {offer.engagementLabel}
          </span>
        )}
        <time dateTime={offer.expiryDate}>
          Expiry {offer.expiryDate}
        </time>
      </div>
      {revealed && offer.couponCode && (
        <div className={styles.couponReveal}>
          <span className={styles.couponCode}>{offer.couponCode}</span>
          <button
            type="button"
            className="btn btn--outline js-copy-coupon"
            onClick={copyCode}
          >
            Copy
          </button>
          <button type="button" className="btn btn--primary" onClick={goPartner}>
            Go to store
          </button>
        </div>
      )}
      {!revealed && (
        <div className={styles.offerActions}>
          <button
            type="button"
            className={`btn btn--primary btn--cta ${styles.offerCta} js-offer-cta`}
            onClick={handleCta}
            data-event={offer.type === "coupon" ? "get_coupon" : "click_deal"}
          >
            {offer.ctaLabel}
          </button>
        </div>
      )}
    </article>
  );
}

export function StorePageClient({ store }: { store: StorePageData }) {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState(store.sortOptions[0] ?? "Latest");

  const filtered = useMemo(() => {
    let list = store.offers;
    if (filter === "Coupons") {
      list = list.filter((o) => o.type === "coupon");
    }
    return sortOffers(list, sort);
  }, [store.offers, filter, sort]);

  const onFilter = (value: string) => {
    setFilter(value);
    trackEvent("filter_offers", { store_slug: store.slug, filter_value: value });
  };

  const onSort = (value: string) => {
    setSort(value);
    trackEvent("sort_offers", { store_slug: store.slug, sort_value: value });
  };

  const inlineSignup = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const email = String(new FormData(e.currentTarget).get("email") ?? "");
      trackEvent("newsletter_signup", {
        placement: "store-inline",
        page_type: "store-offers",
      });
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, placement: "store-inline", store: store.slug }),
      });
      e.currentTarget.reset();
    },
    [store.slug]
  );

  const h1 = `${store.pageTitle} ${store.pagePeriodLabel}`;

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="breadcrumb__sep" />
        <Link href="/stores">Stores</Link>
        <span className="breadcrumb__sep" />
        <span aria-current="page">{store.name}</span>
      </nav>

      <div className={styles.storeLayout}>
        <div>
          <header className={styles.storeHeader}>
            <span className={styles.ribbon}>{store.promoRibbon}</span>
            <div className={styles.storeHeader__row}>
              <Image
                src={store.logo.src}
                alt={store.logo.alt}
                width={80}
                height={80}
                className={styles.storeLogo}
                priority
              />
              <div>
                <h1 className="page-title page-title--plain" style={{ marginBottom: "0.5rem" }}>
                  {h1}
                </h1>
                <a
                  href={`https://${store.domainLabel}`}
                  className={styles.domainLink}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                >
                  {store.domainLabel}
                </a>
                <p>{store.description}</p>
              </div>
            </div>
          </header>

          <section className={styles.offersIntro}>
            <section className={styles.rating} data-store-rating-enabled="true">
              <button type="button" className="btn btn--outline">
                {store.rating.rateNowLabel}
              </button>
              <span>
                Average rating: Rated: {store.rating.average} of 5
              </span>
            </section>

            <h2>
              {store.name} Coupons and Promo Codes
            </h2>

            <div className={styles.toolbar}>
              <ul className={styles.tabs} role="tablist">
                {store.filters.map((f) => (
                  <li key={f} role="presentation">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={filter === f}
                      className={`${styles.tab} ${
                        filter === f ? styles.tabActive : ""
                      }`}
                      onClick={() => onFilter(f)}
                    >
                      {f}
                    </button>
                  </li>
                ))}
              </ul>
              <label>
                <span className="sr-only">Sort offers</span>
                <select
                  className={styles.sortSelect}
                  value={sort}
                  onChange={(e) => onSort(e.target.value)}
                  aria-label="Sort offers"
                >
                  {store.sortOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.offerList} data-filter={filter} data-sort={sort}>
              {filtered.map((offer) => (
                <OfferCard key={offer.offerId} offer={offer} storeSlug={store.slug} />
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.compactCard} aria-label="Store summary">
          <Image
            src={store.logo.src}
            alt=""
            width={48}
            height={48}
            aria-hidden
          />
          <p>
            <strong>{store.domainLabel}</strong>
          </p>
          <p>{store.description}</p>
        </aside>
      </div>

      <section className={styles.featuredSection}>
        <h2 className="section-title section-title--center">Featured Stores</h2>
        <div className={styles.featuredGrid}>
          {store.featuredStores.map((s) => (
            <Link key={s.slug} href={s.href} className={styles.featuredItem}>
              <Image src={s.logo} alt={s.name} width={100} height={40} />
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.relatedSection}>
        <h2 className="section-title section-title--center">Related Stores</h2>
        <ul className={styles.relatedList}>
          {store.relatedStores.map((s) => (
            <li key={s.href}>
              <Link href={s.href}>{s.name}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.shareBlock}>
        <Image
          src={store.shareBlock.image}
          alt=""
          width={200}
          height={120}
          style={{ borderRadius: "var(--radius)" }}
        />
        <div>
          <h2>{store.shareBlock.title}</h2>
          <p>{store.shareBlock.description}</p>
        </div>
        <Link href={store.shareBlock.ctaUrl} className="btn btn--primary btn--cta">
          {store.shareBlock.ctaLabel}
        </Link>
      </section>

      <section
        className={styles.inlineSignup}
        data-placement="store-inline"
      >
        <h2>{store.inlineSignup.title}</h2>
        <p>{store.inlineSignup.description}</p>
        <form onSubmit={inlineSignup}>
          <input type="email" name="email" required placeholder="you@email.com" />
          <button type="submit" className="btn btn--primary">
            {store.inlineSignup.buttonLabel}
          </button>
        </form>
      </section>
    </>
  );
}
