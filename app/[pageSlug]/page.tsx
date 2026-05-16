import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CONTENT_PAGE_SLUGS,
  getContentPage,
  type ContentPageSlug,
} from "@/lib/data";
import { ContentPageView } from "@/components/content/ContentPageView";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return CONTENT_PAGE_SLUGS.map((pageSlug) => ({ pageSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pageSlug: string }>;
}) {
  const { pageSlug } = await params;
  const page = getContentPage(pageSlug);
  if (!page) return { title: "Page" };
  return buildPageMetadata({
    title: page.seo?.title ?? page.title,
    description:
      page.seo?.description ??
      page.lead ??
      `${page.title} — OfferLane affiliate publisher policies and information.`,
    pathname: `/${pageSlug}`,
  });
}

function isContentSlug(slug: string): slug is ContentPageSlug {
  return (CONTENT_PAGE_SLUGS as readonly string[]).includes(slug);
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ pageSlug: string }>;
}) {
  const { pageSlug } = await params;
  if (!isContentSlug(pageSlug)) notFound();

  const data = getContentPage(pageSlug);
  if (!data) notFound();

  const breadcrumb = [{ label: "Home", href: "/" }, { label: data.title }];

  return (
    <main className="container" data-page-type="content">
      <ContentPageView data={data} breadcrumb={breadcrumb} />
    </main>
  );
}
