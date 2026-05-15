import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllCategorySlugs,
  getCategoryPage,
  getCategoryProducts,
} from "@/lib/data";
import { ContentPageView } from "@/components/content/ContentPageView";
import { ProductCard } from "@/components/products/ProductCard";
import productStyles from "@/components/products/products.module.css";

export function generateStaticParams() {
  return getAllCategorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getCategoryPage(slug);
  return { title: page?.title ?? "Category" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = getCategoryPage(slug);
  if (!data) notFound();
  const products = getCategoryProducts(slug);

  return (
    <main className="container" data-page-type="category">
      <ContentPageView
        data={data}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: data.title },
        ]}
      >
        <section style={{ marginTop: "2rem" }} aria-labelledby="category-products-title">
          <h2 id="category-products-title" className="section-title">
            Products in {data.title}
          </h2>
          {products.length > 0 ? (
            <div className={productStyles.grid}>
              {products.map((product, index) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  position={index + 1}
                  listName={`category-${slug}`}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--color-muted)" }}>
              No products are assigned to this category yet. Check back after the
              next CMS import or browse all products below.
            </p>
          )}
        </section>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "2rem" }}>
          <Link href="/products" className="btn btn--primary">
            View all products
          </Link>
          <Link href="/store/carpuride" className="btn btn--outline">
            Featured store deals
          </Link>
        </div>
      </ContentPageView>
    </main>
  );
}
