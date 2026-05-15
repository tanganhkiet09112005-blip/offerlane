"use client";

import Link from "next/link";
import { useShell } from "@/components/providers/ShellProvider";
import { trackEvent } from "@/lib/analytics";
import styles from "./layout.module.css";

export function AuthModal() {
  const { authOpen, closeAuth } = useShell();

  if (!authOpen) return null;

  return (
    <div
      className={styles.authModal}
      data-modal="auth"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
    >
      <div className="overlay-backdrop" onClick={closeAuth} aria-hidden />
      <section className={`modal-panel ${styles.authPanel}`}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={closeAuth}
          aria-label="Close sign in"
        >
          ×
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
            <input type="email" name="email" required autoComplete="email" />
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
