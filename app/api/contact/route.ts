import { Resend } from "resend";
import { NextResponse } from "next/server";

import { siteConfig } from "@/lib/site";

/**
 * Server-side contact form handler. Replaces the old mailto: hand-off (see
 * git history on components/contact/enquiry-form.tsx) — that required the
 * visitor to manually hit send in their own mail client, which read as a
 * confusing extra step. This sends the email directly via Resend, so a
 * submission lands in Josh's inbox with no action needed from the visitor.
 *
 * "From" stays on Resend's shared sandbox sender until joshmckenna.com is
 * verified in the Resend dashboard (Domains → Add Domain, then the DNS
 * records it gives you). Sandbox mode can only deliver to the email address
 * the Resend account itself is registered under — swap FROM_ADDRESS to
 * something on the verified domain (e.g. "Josh McKenna <hello@joshmckenna.com>")
 * once that's done, and delivery opens up to any recipient.
 */
const FROM_ADDRESS = "Portfolio Contact <onboarding@resend.dev>";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  /** Honeypot — real visitors never see or fill this field, bots do. */
  company?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return NextResponse.json(
      { error: "The contact form isn't configured yet." },
      { status: 500 },
    );
  }

  let payload: ContactPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, email, message, company } = payload;

  // Bots fill every field including the honeypot; report success without
  // sending so they don't learn to leave it blank.
  if (isNonEmptyString(company)) {
    return NextResponse.json({ ok: true });
  }

  if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(message)) {
    return NextResponse.json({ error: "Name, email and message are all required." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: siteConfig.email,
    replyTo: email,
    subject: `New enquiry from ${name}`,
    text: `${message}\n\n—\n${name}\n${email}`,
  });

  if (error) {
    console.error("Resend send failed:", error);
    return NextResponse.json({ error: "Couldn't send that." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
