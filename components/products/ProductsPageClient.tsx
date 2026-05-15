"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { trackEvent } from "@/lib/analytics";
import type { ProductsPageData } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import styles from "./products.module.css";

export function ProductsPageClient({ data }: { data: ProductsPageData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? "1") || 1;
  const pageSize = data.pageSize;

  const pageItems = useMemo(
    () => data.items.filter((p) => p.page === currentPage),
    [data.items, currentPage]
  );

  const totalPages = data.pagination.totalPages;
  const totalItems = data.pagination.totalItems;
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const goPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    trackEvent("paginate_products", {
      from_page: currentPage,
      to_page: page,
    });
    router.push(page === 1 ? "/products" : `/products?page=${page}`);
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="breadcrumb__sep" />
        <span aria-current="page">All Products</span>
      </nav>

      <h1 className="page-title">{data.title}</h1>

      <div className={styles.grid}>
        {pageItems.map((product, i) => (
          <ProductCard key={product.productId} product={product} position={start + i} />
        ))}
      </div>

      <nav className={styles.pagination} aria-label="Pagination">
        <p className={styles.paginationInfo}>
          Showing {start} - {end} of {totalItems}
        </p>
        <ul className={styles.paginationNav}>
          <li>
            <button
              type="button"
              className={`${styles.pageLink} ${currentPage <= 1 ? styles.pageDisabled : ""}`}
              onClick={() => goPage(1)}
              disabled={currentPage <= 1}
              aria-label="First page"
            >
              {"<<"}
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`${styles.pageLink} ${currentPage <= 1 ? styles.pageDisabled : ""}`}
              onClick={() => goPage(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Previous page"
            >
              {"<"}
            </button>
          </li>
          {pages.map((p) => (
            <li key={p}>
              <button
                type="button"
                className={`${styles.pageLink} ${p === currentPage ? styles.pageActive : ""}`}
                onClick={() => goPage(p)}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className={`${styles.pageLink} ${
                currentPage >= totalPages ? styles.pageDisabled : ""
              }`}
              onClick={() => goPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
            >
              {">"}
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`${styles.pageLink} ${
                currentPage >= totalPages ? styles.pageDisabled : ""
              }`}
              onClick={() => goPage(totalPages)}
              disabled={currentPage >= totalPages}
              aria-label="Last page"
            >
              {">>"}
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
