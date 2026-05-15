"use client";

import Link from "next/link";
import { useShell } from "@/components/providers/ShellProvider";
import styles from "./layout.module.css";

export function GlobalHeader() {
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
            {site.brand.name}
          </Link>

          <nav className={styles.nav} aria-label="Main navigation">
            {site.header.mainNav.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
            <Link href={site.header.aboutLink.href}>
              {site.header.aboutLink.label}
            </Link>
          </nav>

          <div className={styles.header__actions}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => openSearch("header")}
              aria-label={site.header.searchLabel}
            >
              {site.header.searchLabel}
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
              aria-label="Open menu"
              data-nav="mobile-drawer"
            >
              <span className={styles.menuIcon} aria-hidden />
            </button>
          </div>
        </div>

        <nav className={styles.shortcuts} aria-label="Category shortcuts">
          {site.header.shortcutNav.map((link) => (
            <Link key={link.href} href={link.href}>
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
        <nav>
          {site.header.mobileMenu.map((link) => (
            <Link key={link.href} href={link.href} onClick={closeMobileMenu}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      {mobileMenuOpen && (
        <div
          className="overlay-backdrop"
          onClick={closeMobileMenu}
          aria-hidden
        />
      )}
    </header>
  );
}
