"use client";

import Link from "next/link";
import { useShell } from "@/components/providers/ShellProvider";
import { trackEvent } from "@/lib/analytics";
import type { NavLink } from "@/lib/types";
import styles from "./layout.module.css";

function linkRel(href: string): string | undefined {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return "noopener noreferrer";
  }
  return undefined;
}

export function Footer() {
  const { site } = useShell();
  const nl = site.footer.newsletter;
  const browseLinks: NavLink[] = site.footer.browseLinks ?? [];
  const socialLinks: NavLink[] = site.footer.socialLinks ?? [];

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
          <div className={styles.footer__colBrand}>
            <p className={styles.footer__brand}>{site.brand.name}</p>
            <p className={styles.footer__tagline}>{site.brand.tagline}</p>
            <p className={styles.footer__blurb}>{site.footer.brandBlurb}</p>
            <p className={styles.footer__legal}>{site.brand.legalLine}</p>
          </div>

          {browseLinks.length > 0 ? (
            <div>
              <h3 className={styles.footer__heading}>Browse</h3>
              <ul className={styles.footer__links}>
                {browseLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} rel={linkRel(link.href)}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <h3 className={styles.footer__heading}>Policies</h3>
            <ul className={styles.footer__links}>
              {site.footer.usefulLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} rel={linkRel(link.href)}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div
            data-placement="footer-newsletter"
            className={styles.footer__colNewsletter}
          >
            <h3 className={styles.footer__heading}>{nl.title}</h3>
            <p className={styles.footer__newsletterDesc}>{nl.description}</p>
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

        {socialLinks.length > 0 ? (
          <div className={styles.footer__socialWrap}>
            <h3 className={styles.footer__socialHeading}>Follow &amp; explore</h3>
            <ul className={styles.footer__social}>
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    rel={linkRel(link.href)}
                    aria-label={link.label}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className={styles.disclosure}>{site.footer.affiliateDisclosure}</p>
        <p className={styles.copyright}>{site.footer.copyright}</p>
      </div>
    </footer>
  );
}
