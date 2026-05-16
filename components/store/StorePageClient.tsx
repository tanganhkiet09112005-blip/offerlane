"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { trackEvent, trackOutbound } from "@/lib/analytics";
import type { Offer, StorePageData } from "@/lib/types";
import { StoreMiniCard } from "./StoreMiniCard";
import styles from "./store.module.css";

const SHARE_FALLBACK = "/assets/placeholders/store-share.svg";

function buildOfferFilters(store: StorePageData): string[] {
  const hasCoupon = store.offers.some((o) => o.type === "coupon");
  const hasDeal = store.offers.some((o) => o.type === "deal");
  const seen = new Set<string>();
  const out: string[] = [];

  for (const f of store.filters) {
    if (f === "All" && !seen.has("All")) {
      out.push("All");
      seen.add("All");
    } else if (f === "Coupons" && hasCoupon && !seen.has("Coupons")) {
      out.push("Coupons");
      seen.add("Coupons");
    } else if (f === "Deals" && hasDeal && !seen.has("Deals")) {
      out.push("Deals");
      seen.add("Deals");
    }
  }

  if (!seen.has("All")) {
    out.unshift("All");
    seen.add("All");
  }
  if (hasCoupon && !seen.has("Coupons")) {
    out.push("Coupons");
    seen.add("Coupons");
  }
  if (hasDeal && !seen.has("Deals")) {
    out.push("Deals");
    seen.add("Deals");
  }

  return out;
}

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

function formatExpiryLabel(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(t));
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
          aria-expanded={expanded}
          onClick={() => {
            setExpanded((v) => {
              const next = !v;
              if (next) {
                trackEvent("expand_offer", {
                  offer_id: offer.offerId,
                  store_slug: storeSlug,
                });
              }
              return next;
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
        {offer.engagementCount != null && offer.engagementLabel ? (
          <span className={styles.engagement}>
            {offer.engagementCount.toLocaleString()} {offer.engagementLabel}
          </span>
        ) : null}
        <time dateTime={offer.expiryDate} className={styles.offerExpiry}>
          Expires {formatExpiryLabel(offer.expiryDate)}
        </time>
      </div>
      {revealed && offer.couponCode ? (
        <div className={styles.couponReveal}>
          <span className={styles.couponCode}>{offer.couponCode}</span>
          <button
            type="button"
            className="btn btn--outline js-copy-coupon"
            onClick={copyCode}
          >
            Copy coupon
          </button>
          <button
            type="button"
            className={`btn btn--primary js-offer-partner`}
            onClick={goPartner}
          >
            Go to store
          </button>
        </div>
      ) : null}
      {!revealed ? (
        <div className={styles.offerActions}>
          <button
            type="button"
            className={`btn btn--cta ${styles.offerCta} ${
              offer.type === "deal" ? styles.offerCtaDeal : styles.offerCtaCoupon
            } js-offer-cta`}
            onClick={handleCta}
            data-event={offer.type === "coupon" ? "get_coupon" : "click_deal"}
          >
            {offer.ctaLabel}
          </button>
        </div>
      ) : null}
    </article>
  );
}

export function StorePageClient({ store }: { store: StorePageData }) {
  const filterTabs = useMemo(() => buildOfferFilters(store), [store]);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState(store.sortOptions[0] ?? "Latest");
  const [shareSrc, setShareSrc] = useState(
    store.shareBlock.image?.trim() || SHARE_FALLBACK
  );

  useEffect(() => {
    if (!filterTabs.includes(filter)) {
      setFilter("All");
    }
  }, [filterTabs, filter]);

  const filtered = useMemo(() => {
    let list = store.offers;
    if (filter === "Coupons") {
      list = list.filter((o) => o.type === "coupon");
    }
    if (filter === "Deals") {
      list = list.filter((o) => o.type === "deal");
    }
    return sortOffers(list, sort);
  }, [store.offers, filter, sort]);

  const onFilter = (value: string) => {
    setFilter(value);
    trackEvent("filter_offers", {
      store_slug: store.slug,
      filter_value: value,
    });
  };

  const onSort = (value: string) => {
    setSort(value);
    trackEvent("sort_offers", {
      store_slug: store.slug,
      sort_value: value,
    });
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
        body: JSON.stringify({
          email,
          placement: "store-inline",
          store: store.slug,
        }),
      });
      e.currentTarget.reset();
    },
    [store.slug]
  );

  const h1 = `${store.pageTitle}${store.pagePeriodLabel ? ` ${store.pagePeriodLabel}` : ""}`;

  const ratingHasScores =
    store.rating.enabled &&
    store.rating.count > 0 &&
    Number.isFinite(store.rating.average);

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
                width={120}
                height={120}
                className={styles.storeLogo}
                priority
              />
              <div className={styles.storeHeader__copy}>
                <p className={styles.storeName}>{store.name}</p>
                <h1 className={`page-title page-title--plain ${styles.storeH1}`}>
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
                <p className={styles.storeDescription}>{store.description}</p>
                {store.heroSupportText ? (
                  <p className={styles.heroSupport}>{store.heroSupportText}</p>
                ) : null}
              </div>
            </div>
          </header>

          <section className={styles.offersIntro} aria-labelledby="store-offers-heading">
            <div className={styles.rating} data-store-rating-enabled={store.rating.enabled}>
              <button type="button" className={`btn btn--outline ${styles.rateNowBtn}`}>
                {store.rating.rateNowLabel}
              </button>
              {ratingHasScores ? (
                <p className={styles.ratingStats}>
                  <strong>{store.rating.average.toFixed(1)}</strong>
                  <span className={styles.ratingOutOf}> / 5</span>
                  <span className={styles.ratingCount}>
                    · {store.rating.count.toLocaleString()} rating
                    {store.rating.count === 1 ? "" : "s"}
                  </span>
                </p>
              ) : (
                <p className={styles.ratingHint}>
                  {store.rating.enabled
                    ? "No community ratings yet — use Rate Now after you shop to help others decide."
                    : "Average ratings are not displayed for this merchant on OfferLane yet."}
                </p>
              )}
            </div>

            <div className={styles.offerSectionHead}>
              <h2 id="store-offers-heading" className={styles.offersHeading}>
                {store.name} coupons &amp; deals
              </h2>
              <p className={styles.offersSub}>
                Filter by offer type, then sort by what matters most. Terms and
                final prices are always set on the partner site.
              </p>
            </div>

            <div className={styles.toolbar}>
              <ul className={styles.tabs} role="tablist">
                {filterTabs.map((f) => (
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
              <label className={styles.sortLabel}>
                <span className={styles.sortLabelText}>Sort</span>
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

            <div
              className={styles.offerList}
              data-filter={filter}
              data-sort={sort}
            >
              {filtered.length === 0 ? (
                <p className={styles.offersEmpty}>
                  No offers in this view yet. Switch to{" "}
                  <button
                    type="button"
                    className={styles.offersEmptyLink}
                    onClick={() => onFilter("All")}
                  >
                    All
                  </button>{" "}
                  or check back after the next update.
                </p>
              ) : (
                filtered.map((offer) => (
                  <OfferCard
                    key={offer.offerId}
                    offer={offer}
                    storeSlug={store.slug}
                  />
                ))
              )}
            </div>
          </section>
        </div>

        <aside className={styles.compactCard} aria-label="Store summary">
          <Image
            src={store.logo.src}
            alt=""
            width={56}
            height={56}
            aria-hidden
            className={styles.compactLogo}
          />
          <p className={styles.compactDomain}>
            <strong>{store.domainLabel}</strong>
          </p>
          <p className={styles.compactDesc}>{store.description}</p>
        </aside>
      </div>

      <section className={styles.featuredSection}>
        <h2 className="section-title section-title--center">Featured stores</h2>
        <div className={styles.featuredGrid}>
          {store.featuredStores.map((s) => (
            <StoreMiniCard
              key={s.slug}
              name={s.name}
              href={s.href}
              logoSrc={s.logo}
            />
          ))}
        </div>
      </section>

      <section className={styles.relatedSection}>
        <h2 className="section-title section-title--center">Related stores</h2>
        <div className={styles.relatedGrid}>
          {store.relatedStores.map((s) => (
            <StoreMiniCard
              key={s.href}
              name={s.name}
              href={s.href}
            />
          ))}
        </div>
      </section>

      <section className={styles.shareBlock}>
        <div className={styles.shareImageWrap}>
          <Image
            src={shareSrc}
            alt=""
            width={200}
            height={120}
            className={styles.shareImage}
            onError={() => setShareSrc(SHARE_FALLBACK)}
          />
        </div>
        <div className={styles.shareCopy}>
          <h2>{store.shareBlock.title}</h2>
          <p>{store.shareBlock.description}</p>
        </div>
        <Link href={store.shareBlock.ctaUrl} className={`btn btn--primary btn--cta ${styles.shareCta}`}>
          {store.shareBlock.ctaLabel}
        </Link>
      </section>

      <section className={styles.inlineSignup} data-placement="store-inline">
        <div className={styles.inlineSignupInner}>
          <div>
            <h2>{store.inlineSignup.title}</h2>
            <p>{store.inlineSignup.description}</p>
          </div>
          <form onSubmit={inlineSignup} className={styles.inlineSignupForm}>
            <input
              type="email"
              name="email"
              required
              placeholder="you@email.com"
              aria-label="Email for offer alerts"
            />
            <button type="submit" className="btn btn--primary btn--cta">
              {store.inlineSignup.buttonLabel}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
