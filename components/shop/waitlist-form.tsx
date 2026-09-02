"use client";

import { useState } from "react";

/**
 * Waitlist capture for the unopened shop.
 *
 * POSTs to /api/waitlist, which adds the address as a Resend contact in the
 * shop-signups segment — no visitor action needed beyond hitting submit.
 * Replaced the old mailto: hand-off (see git history) once a list provider
 * was picked.
 */
export function WaitlistForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That address doesn't look quite right.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company }),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error ?? "Something went wrong signing you up.");
      }

      setSent(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong signing you up.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <p className="type-lede text-ink">
        You&apos;re on the list — we&apos;ll email you the moment the shop opens.
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="relative">
      {/* Honeypot — hidden from sighted and screen-reader visitors alike;
          bots that fill every field trip the server-side check in
          app/api/waitlist/route.ts. Off-screen, not display:none, since
          some bots skip fields hidden that way. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="waitlist-company">Company</label>
        <input
          id="waitlist-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

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
          className="w-full rounded-full border border-ink bg-canvas px-5 py-3 font-body text-[15px] text-ink transition-colors placeholder:text-ink-muted focus:border-brand focus:outline-none sm:w-72"
        />
        {/* Styled like the Work page's filter chips / the contact form's
            HOWDY button, not the shared Button component — same rest/hover
            treatment (ink outline -> brand outline), plus a filled
            brand/canvas :active look mirroring a chip's selected state. */}
        <button
          type="submit"
          disabled={submitting}
          className="font-grotesque shrink-0 rounded-full border border-ink px-4 py-[9.5px] text-[11px] leading-none font-semibold uppercase tracking-[0.02em] text-ink-muted text-trim-caps transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:border-brand hover:text-brand active:border-brand active:bg-brand active:text-canvas disabled:pointer-events-none disabled:opacity-50"
        >
          {submitting ? "SIGNING UP" : "NOTIFY ME"}
        </button>
      </div>
      {error && (
        <p id="waitlist-error" className="type-label mt-3 text-accent">
          {error}
        </p>
      )}
    </form>
  );
}
