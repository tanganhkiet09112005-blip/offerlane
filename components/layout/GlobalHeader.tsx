"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShell } from "@/components/providers/ShellProvider";
import styles from "./layout.module.css";

function isNavActive(pathname: string, href: string): boolean {
  if (!href || href === "#") return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoMark() {
  return (
    <span className={styles.logoMark} aria-hidden>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="4"
          y="10"
          width="5"
          height="14"
          rx="1.5"
          fill="var(--color-primary)"
        />
        <rect
          x="12"
          y="7"
          width="5"
          height="17"
          rx="1.5"
          fill="var(--color-primary)"
          opacity="0.55"
        />
        <rect
          x="20"
          y="13"
          width="5"
          height="11"
          rx="1.5"
          fill="var(--color-accent)"
        />
      </svg>
    </span>
  );
}

export function GlobalHeader() {
  const pathname = usePathname() ?? "/";
  const {
    site,
    openSearch,
    openAuth,
    toggleMobileMenu,
    closeMobileMenu,
    mobileMenuOpen,
  } = useShell();

  return (
    <header className={styles.header} data-region="global-header">
      <div className="container">
        <div className={styles.header__inner}>
          <Link href="/" className={styles.logo}>
            <LogoMark />
            <span className={styles.logoText}>{site.brand.name}</span>
          </Link>

          <nav className={styles.nav} aria-label="Main navigation">
            {site.header.mainNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={isNavActive(pathname, link.href) ? styles.navLinkActive : undefined}
                aria-current={isNavActive(pathname, link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.header__actions}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => openSearch("header")}
              aria-label={site.header.searchLabel}
            >
              <SearchIcon className={styles.searchIcon} />
            </button>
            <button
              type="button"
              className={styles.authLink}
              onClick={() => openAuth("join")}
            >
              {site.header.auth.joinLabel}
            </button>
            <button
              type="button"
              className={styles.authLink}
              onClick={() => openAuth("signin")}
            >
              {site.header.auth.signInLabel}
            </button>
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.menuBtn}`}
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-drawer"
              aria-label="Open navigation menu"
              data-nav="mobile-drawer"
            >
              <span className={styles.menuIcon} aria-hidden />
            </button>
          </div>
        </div>

        <nav
          className={styles.shortcuts}
          aria-label="Store and category shortcuts"
        >
          {site.header.shortcutNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                isNavActive(pathname, link.href) ? styles.shortcutActive : undefined
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div
        id="mobile-drawer"
        className={`${styles.drawer} ${mobileMenuOpen ? styles.drawerOpen : ""}`}
        role="dialog"
        aria-modal={mobileMenuOpen}
        aria-label="Mobile menu"
        hidden={!mobileMenuOpen}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={closeMobileMenu}
          aria-label="Close menu"
        >
          ×
        </button>
        <nav aria-label="Mobile navigation">
          {site.header.mobileMenu.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              onClick={closeMobileMenu}
              className={
                isNavActive(pathname, link.href) ? styles.drawerLinkActive : undefined
              }
              aria-current={isNavActive(pathname, link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      {mobileMenuOpen ? (
        <div
          className="overlay-backdrop"
          onClick={closeMobileMenu}
          aria-hidden
        />
      ) : null}
    </header>
  );
}
