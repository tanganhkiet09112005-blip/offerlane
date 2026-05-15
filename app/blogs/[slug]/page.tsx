import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost } from "@/lib/data";
import { ContentPageView } from "@/components/content/ContentPageView";

export function generateStaticParams() {
  return [
    { slug: "stack-seasonal-coupons" },
    { slug: "smart-home-deals-guide" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getBlogPost(slug);
  return { title: page?.title ?? "Blog" };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = getBlogPost(slug);
  if (!data) notFound();

  return (
    <main className="container" data-page-type="blog-post">
      <ContentPageView
        data={data}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Blogs", href: "/blogs" },
          { label: data.title },
        ]}
      >
        <Link href="/blogs" className="btn btn--outline">
          ← Back to blogs
        </Link>
      </ContentPageView>
    </main>
  );
}
