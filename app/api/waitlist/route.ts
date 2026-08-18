import { Resend } from "resend";
import { NextResponse } from "next/server";

/**
 * Server-side shop waitlist handler. Replaces the old mailto: hand-off (see
 * git history on components/shop/waitlist-form.tsx) with a real signup:
 * the address is added as a contact in the Resend Audience identified by
 * RESEND_AUDIENCE_ID (Resend dashboard → Audiences → the list Josh wants
 * shop signups in → the id is in the URL, or the "</>" code snippet next
 * to "+ Add contacts").
 */
type WaitlistPayload = {
  email?: unknown;
  /** Honeypot — real visitors never see or fill this field, bots do. */
  company?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    console.error("RESEND_API_KEY or RESEND_AUDIENCE_ID is not set");
    return NextResponse.json(
      { error: "The waitlist isn't configured yet." },
      { status: 500 },
    );
  }

  let payload: WaitlistPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { email, company } = payload;

  // Bots fill every field including the honeypot; report success without
  // signing up so they don't learn to leave it blank.
  if (isNonEmptyString(company)) {
    return NextResponse.json({ ok: true });
  }

  if (!isNonEmptyString(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.contacts.create({
    email,
    audienceId,
  });

  if (error) {
    console.error("Resend contact create failed:", error);
    return NextResponse.json({ error: "Couldn't add you to the list." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
