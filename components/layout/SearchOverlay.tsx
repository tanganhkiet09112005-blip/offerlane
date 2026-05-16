"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useShell } from "@/components/providers/ShellProvider";
import { trackEvent } from "@/lib/analytics";
import styles from "./layout.module.css";

export function SearchOverlay() {
  const { site, searchOpen, closeSearch } = useShell();
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return site.searchMockResults;
    return site.searchMockResults.filter((r) =>
      r.title.toLowerCase().includes(q)
    );
  }, [query, site.searchMockResults]);

  if (!searchOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent("search_submit", { query });
  };

  const trapFocus = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className={styles.searchOverlay}
      data-overlay="search"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="overlay-backdrop" onClick={closeSearch} aria-hidden />
      <section
        ref={panelRef}
        className={`modal-panel ${styles.searchPanel}`}
        onKeyDown={trapFocus}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={closeSearch}
          aria-label="Close search"
        >
          x
        </button>
        <h2>{site.header.searchLabel}</h2>
        <form onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="search-input">
            Search
          </label>
          <input
            id="search-input"
            type="search"
            className={styles.searchInput}
            placeholder="Search stores, products, blogs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </form>
        <p className="sr-only">Search results</p>
        {results.length > 0 ? (
          <ul className={styles.searchResults}>
            {results.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  onClick={() => {
                    trackEvent("search_result_click", {
                      title: r.title,
                      href: r.href,
                    });
                    closeSearch();
                  }}
                >
                  <strong>{r.title}</strong>
                  <span> - {r.type}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.searchEmpty}>No results found. Try another term.</p>
        )}
        <Link href="/blogs" className={styles.searchViewAll} onClick={closeSearch}>
          View all blogs
        </Link>
      </section>
    </div>
  );
}
