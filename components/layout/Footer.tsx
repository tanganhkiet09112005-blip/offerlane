"use client";

import Link from "next/link";
import { useShell } from "@/components/providers/ShellProvider";
import { trackEvent } from "@/lib/analytics";
import styles from "./layout.module.css";

export function Footer() {
  const { site } = useShell();
  const nl = site.footer.newsletter;

  const handleNewsletter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    trackEvent("newsletter_signup", {
      placement: "footer-newsletter",
      page_type: document.body.dataset.template ?? "unknown",
    });
    await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, placement: "footer-newsletter" }),
    });
    e.currentTarget.reset();
  };

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footer__grid}>
          <div>
            <p className={styles.footer__brand}>{site.brand.name}</p>
            <p>{site.footer.brandBlurb}</p>
            <p style={{ fontSize: "0.85rem", marginTop: "0.75rem" }}>
              {site.brand.legalLine}
            </p>
          </div>
          <div>
            <h3 className={styles.footer__heading}>Useful Links</h3>
            <ul className={styles.footer__links}>
              {site.footer.usefulLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div data-placement="footer-newsletter">
            <h3 className={styles.footer__heading}>{nl.title}</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
              {nl.description}
            </p>
            <form className={styles.newsletterForm} onSubmit={handleNewsletter}>
              <input
                type="email"
                name="email"
                required
                placeholder={nl.placeholder}
                aria-label="Email for newsletter"
              />
              <button type="submit" className="btn btn--primary">
                {nl.buttonLabel}
              </button>
            </form>
          </div>
        </div>
        <p className={styles.disclosure}>{site.footer.affiliateDisclosure}</p>
        <p className={styles.copyright}>{site.footer.copyright}</p>
      </div>
    </footer>
  );
}
