"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import type { SiteConfig } from "@/lib/types";
import { ShellProvider, useShell } from "@/components/providers/ShellProvider";
import { GlobalHeader } from "./GlobalHeader";
import { Footer } from "./Footer";

const SearchOverlay = dynamic(
  () => import("./SearchOverlay").then((mod) => mod.SearchOverlay),
  { ssr: false, loading: () => null }
);

const AuthModal = dynamic(
  () => import("./AuthModal").then((mod) => mod.AuthModal),
  { ssr: false, loading: () => null }
);

function DeferredOverlays() {
  const { searchOpen, authOpen } = useShell();

  return (
    <>
      {searchOpen ? <SearchOverlay /> : null}
      {authOpen ? <AuthModal /> : null}
    </>
  );
}

export function SiteShell({
  site,
  children,
}: {
  site: SiteConfig;
  children: ReactNode;
}) {
  return (
    <ShellProvider site={site}>
      <GlobalHeader />
      {children}
      <Footer />
      <DeferredOverlays />
    </ShellProvider>
  );
}
