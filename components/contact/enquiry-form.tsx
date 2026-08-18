"use client";

import { useState } from "react";

import { siteConfig } from "@/lib/site";
import { toWaldeckCase } from "@/lib/waldeck-case";

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

const FIELD =
  "mt-2 w-full rounded-md border border-ink bg-canvas px-3 py-2.5 font-body text-[15px] text-ink transition-colors placeholder:text-ink-muted focus:border-brand focus:outline-none";

export function EnquiryForm() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

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
        body: JSON.stringify({ name, email, message }),
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
      <div className="rounded-3xl border border-ink p-8">
        <h2 className="type-title text-accent">gOt it</h2>
        <p className="type-lede mt-4 text-ink-muted">
          That&apos;s landed straight in Josh&apos;s inbox — he&apos;ll come
          back to you within a few days.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-3xl border border-ink p-6 md:p-8"
    >
      <h2 className="type-title text-accent">SAy HeLLO</h2>

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
            <p id="name-error" className="type-label mt-2 text-accent">
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
            <p id="email-error" className="type-label mt-2 text-accent">
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
            <p id="message-error" className="type-label mt-2 text-accent">
              {errors.message}
            </p>
          )}
        </div>
      </div>

      {/* Server-side messages (route.ts) describe the specific problem only
          — this is the single place the "email directly" fallback gets
          added, so it's never duplicated regardless of which error fired. */}
      {submitError && (
        <p className="type-label mt-4 text-accent">
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
      {/* id targeted by nav.tsx's scroll-spy on /about -- the Info->Contact
          nav highlight hands off the moment this button enters the
          viewport, not when the embedded section merely starts. */}
      <button
        id="howdy-button"
        type="submit"
        disabled={submitting}
        className="font-display mt-8 rounded-full border border-ink px-4 py-2 text-[11px] font-medium tracking-[0.02em] text-ink-muted transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:border-brand hover:text-brand active:border-brand active:bg-brand active:text-canvas disabled:pointer-events-none disabled:opacity-50"
      >
        {submitting ? toWaldeckCase("SENDING") : toWaldeckCase("HOWDY")}
      </button>
    </form>
  );
}
