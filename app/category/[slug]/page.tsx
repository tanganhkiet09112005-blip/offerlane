import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllCategorySlugs,
  getCategoryPage,
  getCategoryProducts,
  getCategoryStores,
} from "@/lib/data";
import { ContentPageView } from "@/components/content/ContentPageView";
import { ProductCard } from "@/components/products/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";
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
  return {
    title: page?.seo?.title ?? page?.title ?? "Category",
    description: page?.seo?.description ?? page?.lead,
  };
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
  const stores = getCategoryStores(slug);

  return (
    <main className="container" data-page-type="category">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: data.title,
          description: data.lead,
          url: `/category/${slug}`,
        }}
      />
      <ContentPageView
        data={data}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: data.title },
        ]}
      >
        <section style={{ marginTop: "2rem" }} aria-labelledby="category-stores-title">
          <h2 id="category-stores-title" className="section-title">
            Stores in {data.title}
          </h2>
          {stores.length > 0 ? (
            <ul style={{ display: "grid", gap: "1rem", padding: 0, listStyle: "none" }}>
              {stores.map((store) => (
                <li
                  key={store.slug}
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius)",
                    padding: "1rem",
                  }}
                >
                  <Link href={`/store/${store.slug}`} style={{ fontWeight: 700 }}>
                    {store.name}
                  </Link>
                  <p style={{ margin: "0.35rem 0 0", color: "var(--color-muted)" }}>
                    {store.description}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: "var(--color-muted)" }}>
              No stores are tagged for this category yet. Product picks are still
              available below.
            </p>
          )}
        </section>

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
