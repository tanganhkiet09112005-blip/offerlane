import type { Metadata } from "next";
import Link from "next/link";
import { getProductsData } from "@/lib/data";
import { PageViewTracker } from "@/components/providers/PageViewTracker";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductPagination } from "@/components/products/ProductPagination";
import { JsonLd } from "@/components/seo/JsonLd";
import styles from "@/components/products/products.module.css";

export const metadata: Metadata = {
  title: "Affiliate Products & Deal Picks",
  description:
    "Browse OfferLane affiliate product picks with current prices, merchant links, and category-focused deal notes.",
};

function readPage(value?: string | string[]): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw ?? "1");
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string | string[] }>;
}) {
  const data = getProductsData();
  const params = await searchParams;
  const currentPage = Math.min(
    readPage(params?.page),
    data.pagination.totalPages
  );
  const pageSize = data.pageSize;
  const pageItems = data.items.filter((product) => product.page === currentPage);
  const totalItems = data.pagination.totalItems;
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <main className="container page-main" data-page-type="products-catalog">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: data.title,
          url: "/products",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: totalItems,
            itemListElement: pageItems.map((product, index) => ({
              "@type": "ListItem",
              position: start + index,
              url: product.internalUrl,
              name: product.title,
            })),
          },
        }}
      />
      <PageViewTracker pageType="products-catalog" />
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="breadcrumb__sep" />
        <span aria-current="page">All Products</span>
      </nav>

      <h1 className="page-title">{data.title}</h1>
      <p style={{ color: "var(--color-muted)", maxWidth: "42rem" }}>
        Compare curated affiliate picks before leaving OfferLane for partner
        checkout pages. Prices and availability are controlled by merchants.
      </p>

      <div className={styles.grid}>
        {pageItems.map((product, i) => (
          <ProductCard
            key={product.productId}
            product={product}
            position={start + i}
          />
        ))}
      </div>

      <nav className={styles.pagination} aria-label="Pagination">
        <p className={styles.paginationInfo}>
          Showing {start} - {end} of {totalItems}
        </p>
        <ProductPagination
          currentPage={currentPage}
          totalPages={data.pagination.totalPages}
        />
      </nav>
    </main>
  );
}
