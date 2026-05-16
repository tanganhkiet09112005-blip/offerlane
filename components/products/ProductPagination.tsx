"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import styles from "./products.module.css";

function pageHref(page: number): string {
  return page <= 1 ? "/products" : `/products?page=${page}`;
}

export function ProductPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const onNavigate = (toPage: number) => {
    if (toPage === currentPage) return;
    trackEvent("paginate_products", {
      from_page: currentPage,
      to_page: toPage,
    });
  };

  return (
    <ul className={styles.paginationNav}>
      {pages.map((page) => (
        <li key={page}>
          <Link
            href={pageHref(page)}
            className={`${styles.pageLink} ${
              page === currentPage ? styles.pageActive : ""
            }`}
            aria-current={page === currentPage ? "page" : undefined}
            onClick={() => onNavigate(page)}
          >
            {page}
          </Link>
        </li>
      ))}
    </ul>
  );
}
