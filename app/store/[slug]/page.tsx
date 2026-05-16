import { notFound } from "next/navigation";
import { getAllStoreSlugs, getStoreBySlug } from "@/lib/data";
import { PageViewTracker } from "@/components/providers/PageViewTracker";
import { StorePageClient } from "@/components/store/StorePageClient";
import { JsonLd } from "@/components/seo/JsonLd";

export function generateStaticParams() {
  return getAllStoreSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = getStoreBySlug(slug);
  if (!store) return { title: "Store Not Found" };
  return {
    title: store.seo?.title ?? `${store.pageTitle} ${store.pagePeriodLabel}`,
    description: store.seo?.description ?? store.description,
  };
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = getStoreBySlug(slug);
  if (!store) notFound();

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"
  ).replace(/\/$/, "");

  return (
    <main
      className="container page-main"
      data-page-type="store-offers"
      data-store-slug={store.slug}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${store.pageTitle} ${store.pagePeriodLabel}`,
          description: store.description,
          url: `${siteUrl}/store/${store.slug}`,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: `${siteUrl}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Stores",
              item: `${siteUrl}/stores`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: store.name,
              item: `${siteUrl}/store/${store.slug}`,
            },
          ],
        }}
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
