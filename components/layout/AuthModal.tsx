"use client";

import { useRef } from "react";
import Link from "next/link";
import { useShell } from "@/components/providers/ShellProvider";
import { trackEvent } from "@/lib/analytics";
import styles from "./layout.module.css";

export function AuthModal() {
  const { authOpen, closeAuth } = useShell();
  const panelRef = useRef<HTMLElement>(null);

  if (!authOpen) return null;

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
      className={styles.authModal}
      data-modal="auth"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
    >
      <div className="overlay-backdrop" onClick={closeAuth} aria-hidden />
      <section
        ref={panelRef}
        className={`modal-panel ${styles.authPanel}`}
        onKeyDown={trapFocus}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={closeAuth}
          aria-label="Close sign in"
        >
          x
        </button>
        <h2>Sign In</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            trackEvent("sign_in_start", { method: "email" });
          }}
        >
          <label>
            Email
            <input type="email" name="email" required autoComplete="email" autoFocus />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
            />
          </label>
          <label>
            <input type="checkbox" name="remember" /> Remember Me
          </label>
          <button type="submit" className="btn btn--primary" style={{ width: "100%" }}>
            Sign In
          </button>
        </form>
        <p>
          <Link href="/forgot-password">Forgot Password</Link>
        </p>
        <div className={styles.socialBtns}>
          <button type="button" className={styles.socialBtn}>
            Continue with Facebook
          </button>
          <button type="button" className={styles.socialBtn}>
            Continue with Google
          </button>
          <button type="button" className={styles.socialBtn}>
            Continue with Apple
          </button>
        </div>
        <p>
          <Link href="/join" onClick={closeAuth}>
            Join Now
          </Link>
        </p>
      </section>
    </div>
  );
}
