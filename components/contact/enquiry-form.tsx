"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

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

const PROJECT_TYPES = [
  "Editorial illustration",
  "Character design",
  "Packaging",
  "Mural",
  "Something else",
];

const BUDGET_RANGES = [
  "Under £1,000",
  "£1,000 – £3,000",
  "£3,000 – £10,000",
  "£10,000+",
  "Not sure yet",
];

type Errors = Partial<Record<"name" | "email" | "message", string>>;

const FIELD =
  "mt-2 w-full rounded-md border border-hairline bg-canvas px-3 py-2.5 font-body text-[15px] text-ink transition-colors placeholder:text-ink-muted focus:border-ink focus:outline-none";

export function EnquiryForm() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const projectType = String(data.get("projectType") ?? "");
    const budget = String(data.get("budget") ?? "");

    const found: Errors = {};
    if (!name) found.name = "Josh would like to know who you are.";
    // Deliberately permissive: the only thing worth rejecting here is an
    // address that obviously cannot receive a reply.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      found.email = "That address doesn't look like it can receive a reply.";
    if (message.length < 10)
      found.message = "A sentence or two about the project, if you can.";

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      projectType ? `Project type: ${projectType}` : null,
      budget ? `Budget: ${budget}` : null,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
      `Commission enquiry — ${name}`,
    )}&body=${encodeURIComponent(body)}`;

    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-hairline p-8">
        <h2 className="type-heading text-ink">Nearly there.</h2>
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
      className="rounded-3xl border border-hairline p-6 md:p-8"
    >
      <h2 className="type-heading text-ink">Start a commission</h2>

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

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="projectType" className="type-label text-ink-muted">
              Project type
            </label>
            <select id="projectType" name="projectType" className={FIELD}>
              <option value="">Select…</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="budget" className="type-label text-ink-muted">
              Budget range
            </label>
            <select id="budget" name="budget" className={FIELD}>
              <option value="">Select…</option>
              {BUDGET_RANGES.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="type-label text-ink-muted">
            Tell Josh about it
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

      <Button type="submit" variant="quiet" className="mt-8">
        Send enquiry
      </Button>
    </form>
  );
}
