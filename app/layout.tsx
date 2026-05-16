import type { Metadata } from "next";
import { Suspense } from "react";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { TrackingBootstrap } from "@/components/analytics/TrackingBootstrap";
import { getSiteConfig } from "@/lib/data";
import { SiteShell } from "@/components/layout/SiteShell";
import "./globals.css";

const site = getSiteConfig();

export const metadata: Metadata = {
  title: {
    default: `${site.brand.name} - Deals & Affiliate Offers`,
    template: `%s | ${site.brand.name}`,
  },
  description: site.brand.tagline,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={
          {
            "--color-primary": site.theme.primary,
            "--color-accent": site.theme.accent,
            "--color-bg": site.theme.background,
            "--color-text": site.theme.text,
          } as React.CSSProperties
        }
      >
        <AnalyticsScripts />
        <Suspense fallback={null}>
          <TrackingBootstrap />
        </Suspense>
        <SiteShell site={site}>{children}</SiteShell>
      </body>
    </html>
  );
}
