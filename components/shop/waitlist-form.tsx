"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

/**
 * Waitlist capture for the unopened shop.
 *
 * No list provider is chosen yet, so this does not pretend to store anything —
 * it hands off to the visitor's mail client. When a provider is picked, replace
 * the body of `submit()` with the POST; the states below stay.
 */
export function WaitlistForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = String(
      new FormData(event.currentTarget).get("email") ?? "",
    ).trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That address doesn't look quite right.");
      return;
    }

    setError(null);
    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
      "Shop waitlist",
    )}&body=${encodeURIComponent(`Add me to the shop waitlist: ${email}`)}`;
    setSent(true);
  }

  if (sent) {
    return (
      <p className="type-lede text-ink">
        You&apos;re on the list — send the email your mail client just opened and
        that&apos;s it.
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
        <label htmlFor="waitlist-email" className="sr-only">
          Email address
        </label>
        <input
          id="waitlist-email"
          name="email"
          type="email"
          placeholder="your@email.com"
          autoComplete="email"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "waitlist-error" : undefined}
          className="w-full rounded-full border border-hairline bg-canvas px-5 py-3 font-body text-[15px] text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none sm:w-72"
        />
        <Button type="submit" variant="quiet" className="shrink-0">
          Notify me
        </Button>
      </div>
      {error && (
        <p id="waitlist-error" className="type-label mt-3 text-accent">
          {error}
        </p>
      )}
    </form>
  );
}
