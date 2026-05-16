"use client";

import { useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/analytics";
import styles from "./home.module.css";

export function HomeNewsletterForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();

    if (!email) {
      setStatus("error");
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, placement: "home-newsletter" }),
      });

      if (!response.ok) throw new Error("Newsletter signup failed");

      trackEvent("newsletter_signup", {
        placement: "home-newsletter",
      });
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className={styles.newsletterForm}
      onSubmit={submitNewsletter}
      aria-label="Newsletter signup"
    >
      <label htmlFor="home-email" className="sr-only">
        Email address
      </label>
      <input
        id="home-email"
        type="email"
        name="email"
        required
        placeholder="you@email.com"
        className={styles.newsletterInput}
        aria-required="true"
      />
      <button
        type="submit"
        className="btn btn--accent btn--lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Subscribing..." : "Subscribe"}
      </button>
      <span className={styles.newsletterStatus} aria-live="polite">
        {status === "success" && "You're on the list."}
        {status === "error" && "Please enter a valid email and try again."}
      </span>
    </form>
  );
}
