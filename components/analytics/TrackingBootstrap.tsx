"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureAttribution } from "@/lib/analytics";

function templateFromPath(pathname: string): string | undefined {
  if (pathname.startsWith("/products")) return "products-page";
  if (pathname.startsWith("/store/")) return "store-page";
  return undefined;
}

/**
 * Captures UTM / click ids on every navigation and syncs body[data-template] for placement tracking.
 */
export function TrackingBootstrap() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.toString();
    const query = search ? `?${search}` : "";
    captureAttribution(query);

    const template = templateFromPath(pathname);
    if (template) {
      document.body.dataset.template = template;
    } else {
      delete document.body.dataset.template;
    }
  }, [pathname, searchParams]);

  return null;
}
