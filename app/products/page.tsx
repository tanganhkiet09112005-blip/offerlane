import { Suspense } from "react";
import { getProductsData } from "@/lib/data";
import { PageViewTracker } from "@/components/providers/PageViewTracker";
import { ProductsPageClient } from "@/components/products/ProductsPageClient";

export const metadata = {
  title: "All Products",
};

export default function ProductsPage() {
  const data = getProductsData();

  return (
    <main
      className="container page-main"
      data-page-type="products-catalog"
    >
      <PageViewTracker pageType="products-catalog" />
      <Suspense fallback={<p>Loading products…</p>}>
        <ProductsPageClient data={data} />
      </Suspense>
    </main>
  );
}
