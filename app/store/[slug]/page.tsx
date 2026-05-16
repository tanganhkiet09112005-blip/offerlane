import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllStoreSlugs, getStoreBySlug } from "@/lib/data";
import { PageViewTracker } from "@/components/providers/PageViewTracker";
import { StorePageClient } from "@/components/store/StorePageClient";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
} from "@/lib/seo";

export function generateStaticParams() {
  return getAllStoreSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = getStoreBySlug(slug);
  if (!store) return { title: "Store Not Found" };
  return buildPageMetadata({
    title:
      store.seo?.title ??
      `${store.pageTitle}${store.pagePeriodLabel ? ` ${store.pagePeriodLabel}` : ""}`,
    description: store.seo?.description ?? store.description,
    pathname: store.seo?.canonical ?? `/store/${store.slug}`,
    ogImage: store.logo.src,
  });
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = getStoreBySlug(slug);
  if (!store) notFound();

  const pageName = `${store.pageTitle}${store.pagePeriodLabel ? ` ${store.pagePeriodLabel}` : ""}`;

  return (
    <main
      className="container page-main"
      data-page-type="store-offers"
      data-store-slug={store.slug}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: pageName,
          description: store.description,
          url: absoluteUrl(`/store/${store.slug}`),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Stores", path: "/stores" },
          { name: store.name, path: `/store/${store.slug}` },
        ])}
      />
      <PageViewTracker
        pageType="store-offers"
        pageSlug={store.slug}
        extra={{
          visible_offer_count: store.offers.length,
        }}
      />
      <StorePageClient store={store} />
    </main>
  );
}
