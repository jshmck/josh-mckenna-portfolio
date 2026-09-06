"use client";

import { useEffect, useRef, useState } from "react";

import { siteConfig } from "@/lib/site";

/**
 * Commission enquiry form.
 *
 * Used to hand off to the visitor's own mail client via a `mailto:` link —
 * genuinely functional with zero backend, but it meant the visitor still had
 * to manually hit send in their own mail app, which read as a confusing
 * extra step ("did this actually send?"). Now POSTs to /api/contact, which
 * sends the email server-side via Resend — a submission lands in Josh's
 * inbox directly, no action needed from the visitor.
 */

type Errors = Partial<Record<"name" | "email" | "message", string>>;

// text-[16px] on mobile, not text-[15px] -- iOS Safari auto-zooms the whole
// page on focus for any input under 16px, which reads as the form being
// broken on a phone even though nothing is visually wrong. md: restores the
// original 15px now that desktop has no such threshold.
//
// No focus:outline-none anymore (a11y audit 2026-09-06): suppressing the
// outline left the blue border swap as the only focus indicator, and
// brand-on-canvas measures 2.13:1 (WCAG 1.4.11 wants 3:1). The global
// ink :focus-visible ring (globals.css) now shows alongside the border
// swap — browsers apply :focus-visible to text fields on any focus, so
// mouse users see it too; that's the standard trade for fields.
const FIELD =
  "mt-2 w-full rounded-md border border-ink bg-canvas px-3 py-2.5 font-body text-[16px] text-ink transition-colors placeholder:text-ink-muted focus:border-brand md:text-[15px]";

export function EnquiryForm() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Focused when the success panel replaces the form (a11y audit
  // 2026-09-06, WCAG 4.1.3): the swap otherwise dropped keyboard focus to
  // <body> and announced nothing — a screen-reader user pressed HOWDY and
  // heard silence. Focusing the panel (tabIndex={-1}) announces its
  // content and puts the keyboard somewhere real.
  const sentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (sent) sentRef.current?.focus();
  }, [sent]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();

    const found: Errors = {};
    if (!name) found.name = "What's your name?";
    // Deliberately permissive: the only thing worth rejecting here is an
    // address that obviously cannot receive a reply.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      found.email = "That doesn't look like a valid email address.";
    if (message.length < 10)
      found.message = "A sentence or two, if you can.";

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong sending that.");
      }

      setSent(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong sending that.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div ref={sentRef} tabIndex={-1} className="rounded-frame border border-ink p-8">
        <h2 className="type-heading text-ink">Got it!</h2>
        <p className="type-lede mt-4 text-ink-muted">
          Thanks for getting in touch.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="relative rounded-frame border border-ink p-6 md:p-8"
    >
      {/* "SAy HeLLO" is the Waldeck brand-casing quirk (e/j/k/g/t/y stay
          lowercase), pre-transformed here per the literal-constant
          convention from the retired lib/waldeck-case.ts — not a typo. */}
      <h2 className="type-heading-waldeck text-brand">SAy HeLLO</h2>

      {/* Honeypot — hidden from sighted and screen-reader visitors alike;
          bots that fill every field trip the server-side check in
          app/api/contact/route.ts. Off-screen, not display:none, since
          some bots skip fields hidden that way. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <label htmlFor="name" className="type-label text-ink-muted">
            Name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={FIELD}
          />
          {errors.name && (
            <p id="name-error" role="alert" className="type-label mt-2 text-accent">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="type-label text-ink-muted">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={FIELD}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="type-label mt-2 text-accent">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="type-label text-ink-muted">
            What&apos;s Up
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
            className={`${FIELD} resize-y`}
          />
          {errors.message && (
            <p id="message-error" role="alert" className="type-label mt-2 text-accent">
              {errors.message}
            </p>
          )}
        </div>
      </div>

      {/* Server-side messages (route.ts) describe the specific problem only
          — this is the single place the "email directly" fallback gets
          added, so it's never duplicated regardless of which error fired. */}
      {submitError && (
        <p role="alert" className="type-label mt-4 text-accent">
          {submitError} Email{" "}
          <a href={`mailto:${siteConfig.email}`} className="underline">
            {siteConfig.email}
          </a>{" "}
          directly for now.
        </p>
      )}

      {/* Styled like the Work page's filter chips, not the shared Button
          component — same rest/hover treatment (ink outline -> brand
          outline), plus a filled brand/canvas look on :active mirroring a
          chip's selected state (the closest equivalent for a submit button,
          which has no persistent "selected" identity of its own). */}
      <button
        type="submit"
        disabled={submitting}
        className="font-grotesque mt-8 rounded-full border border-ink px-4 py-[9.5px] text-[11px] leading-none font-semibold uppercase tracking-[0.02em] text-ink-muted text-trim-caps transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:border-brand hover:text-brand active:border-brand active:bg-brand active:text-canvas disabled:pointer-events-none disabled:opacity-50"
      >
        {submitting ? "SENDING" : "HOWDY"}
      </button>
    </form>
  );
}
