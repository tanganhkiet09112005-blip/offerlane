import type { Metadata } from "next";

/** Safe fallback when NEXT_PUBLIC_SITE_URL is unset (dev/build). */
export const FALLBACK_SITE_URL = "https://example.com";

export const DEFAULT_OG_IMAGE = "/assets/placeholders/store-share.svg";

export const SITE_NAME = "OfferLane";

/** Public routes included in sitemap (no auth stubs or dead paths). */
export const SITEMAP_STATIC_PATHS = [
  "/",
  "/products",
  "/blogs",
  "/about",
  "/terms",
  "/privacy",
  "/categories",
  "/stores",
  "/contact",
] as const;

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_SITE_URL;
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  if (!path) return getSiteUrl();
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

export function absoluteImageUrl(src?: string | null): string {
  if (!src?.trim()) return absoluteUrl(DEFAULT_OG_IMAGE);
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return absoluteUrl(src);
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export type BuildPageMetadataInput = {
  title: string;
  description?: string;
  pathname: string;
  ogImage?: string | null;
  ogType?: "website" | "article";
  noindex?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  pathname,
  ogImage,
  ogType = "website",
  noindex,
}: BuildPageMetadataInput): Metadata {
  const desc =
    description?.trim() ||
    "OfferLane curates affiliate deals, coupon codes, and partner offers.";
  const canonical = absoluteUrl(pathname);
  const image = absoluteImageUrl(ogImage);

  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title,
      description: desc,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_US",
      type: ogType,
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [image],
    },
    ...(noindex
      ? { robots: { index: false, follow: false } }
      : undefined),
  };
}
