"use client";

import { useState } from "react";

import { siteConfig } from "@/lib/site";
import { toWaldeckCase } from "@/lib/waldeck-case";

/**
 * Commission enquiry form.
 *
 * The wireframe marks the handler as "BACKEND TBD". Rather than ship a form
 * that silently drops submissions, this validates in the browser and hands off
 * to the visitor's mail client with everything pre-filled — so the form is
 * genuinely functional today and nobody's enquiry disappears.
 *
 * To wire a real handler: replace the body of `submit()` with a POST (or a
 * Next.js server action) and drop the `mailto` branch. Validation, field state
 * and the success view all stay as they are.
 */

type Errors = Partial<Record<"name" | "email" | "message", string>>;

const FIELD =
  "mt-2 w-full rounded-md border border-ink bg-canvas px-3 py-2.5 font-body text-[15px] text-ink transition-colors placeholder:text-ink-muted focus:border-brand focus:outline-none";

export function EnquiryForm() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const found: Errors = {};
    if (!name) found.name = "Josh would like to know who you are.";
    // Deliberately permissive: the only thing worth rejecting here is an
    // address that obviously cannot receive a reply.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      found.email = "That address doesn't look like it can receive a reply.";
    if (message.length < 10)
      found.message = "A sentence or two, if you can.";

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const body = [`Name: ${name}`, `Email: ${email}`, "", message].join(
      "\n",
    );

    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
      `Commission enquiry — ${name}`,
    )}&body=${encodeURIComponent(body)}`;

    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-ink p-8">
        <h2 className="type-title text-accent">NeARLy tHeRe</h2>
        <p className="type-lede mt-4 text-ink-muted">
          Your mail client should have opened with the enquiry ready to go —
          hit send and Josh will come back to you within a few days. If nothing
          opened, email{" "}
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-accent underline"
          >
            {siteConfig.email}
          </a>{" "}
          directly.
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

      {/* Styled like the Work page's filter chips, not the shared Button
          component — same rest/hover treatment (ink outline -> brand
          outline), plus a filled brand/canvas look on :active mirroring a
          chip's selected state (the closest equivalent for a submit button,
          which has no persistent "selected" identity of its own). */}
      <button
        type="submit"
        className="font-display mt-8 rounded-full border border-ink px-4 py-2 text-[11px] font-medium tracking-[0.02em] text-ink-muted transition-colors hover:border-brand hover:text-brand active:border-brand active:bg-brand active:text-canvas"
      >
        {toWaldeckCase("HOWDY")}
      </button>
    </form>
  );
}
