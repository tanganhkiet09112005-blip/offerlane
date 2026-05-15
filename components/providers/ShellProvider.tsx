"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { trackEvent } from "@/lib/analytics";
import type { SiteConfig } from "@/lib/types";

type ShellContextValue = {
  site: SiteConfig;
  searchOpen: boolean;
  authOpen: boolean;
  mobileMenuOpen: boolean;
  openSearch: (source?: string) => void;
  closeSearch: () => void;
  openAuth: (source?: string) => void;
  closeAuth: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within ShellProvider");
  return ctx;
}

export function ShellProvider({
  site,
  children,
}: {
  site: SiteConfig;
  children: ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openSearch = useCallback((source = "header") => {
    setSearchOpen(true);
    trackEvent("search_open", { source });
  }, []);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const openAuth = useCallback((source = "header") => {
    setAuthOpen(true);
    trackEvent("auth_modal_open", {
      source,
      page_type:
        typeof document !== "undefined"
          ? document.body.dataset.template ?? "unknown"
          : "unknown",
    });
  }, []);

  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const toggleMobileMenu = useCallback(
    () => setMobileMenuOpen((v) => !v),
    []
  );

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  const modalActive = searchOpen || authOpen || mobileMenuOpen;

  useEffect(() => {
    if (!modalActive) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setAuthOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalActive]);

  useEffect(() => {
    document.body.style.overflow = modalActive ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalActive]);

  const value = useMemo(
    () => ({
      site,
      searchOpen,
      authOpen,
      mobileMenuOpen,
      openSearch,
      closeSearch,
      openAuth,
      closeAuth,
      toggleMobileMenu,
      closeMobileMenu,
    }),
    [
      site,
      searchOpen,
      authOpen,
      mobileMenuOpen,
      openSearch,
      closeSearch,
      openAuth,
      closeAuth,
      toggleMobileMenu,
      closeMobileMenu,
    ]
  );

  return (
    <ShellContext.Provider value={value}>
      {children}
    </ShellContext.Provider>
  );
}
