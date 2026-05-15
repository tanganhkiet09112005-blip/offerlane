import { notFound } from "next/navigation";
import { getAllStoreSlugs, getStoreBySlug } from "@/lib/data";
import { PageViewTracker } from "@/components/providers/PageViewTracker";
import { StorePageClient } from "@/components/store/StorePageClient";

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
    title: `${store.pageTitle} ${store.pagePeriodLabel}`,
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

  return (
    <main
      className="container page-main"
      data-page-type="store-offers"
      data-store-slug={store.slug}
    >
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
