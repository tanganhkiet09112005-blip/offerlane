"use client";

import { useEffect, useRef } from "react";
import { captureAttribution, getAttribution, trackEvent } from "@/lib/analytics";

export function PageViewTracker({
  pageType,
  pageSlug,
  extra,
}: {
  pageType: string;
  pageSlug?: string;
  extra?: Record<string, string | number>;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    captureAttribution();
    const attribution = getAttribution();

    trackEvent("page_view", {
      page_type: pageType,
      page_slug: pageSlug ?? window.location.pathname,
      referrer: document.referrer || undefined,
      ...attribution,
      ...extra,
    });

    if (pageType === "store-offers" && pageSlug) {
      trackEvent("view_store", {
        store_slug: pageSlug,
        visible_offer_count: extra?.visible_offer_count,
        ...attribution,
      });
    }

    if (pageType === "blog-post" && pageSlug) {
      trackEvent("view_blog", {
        blog_slug: pageSlug,
        ...attribution,
        ...extra,
      });
    }
  }, [pageType, pageSlug, extra]);

  return null;
}
