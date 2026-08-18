import { Resend } from "resend";
import { NextResponse } from "next/server";

/**
 * Server-side shop waitlist handler. Replaces the old mailto: hand-off (see
 * git history on components/shop/waitlist-form.tsx) with a real signup:
 * the address is added as a contact in Resend, in the segment set by
 * RESEND_SEGMENT_ID (Resend's dashboard still labels this "Audience" in
 * places, but the SDK's create-contact call takes a segment id — get it
 * from Audiences/Segments → the list Josh wants shop signups in).
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
  const segmentId = process.env.RESEND_SEGMENT_ID;

  if (!apiKey || !segmentId) {
    console.error("RESEND_API_KEY or RESEND_SEGMENT_ID is not set");
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
    segments: [{ id: segmentId }],
  });

  if (error) {
    console.error("Resend contact create failed:", error);
    return NextResponse.json({ error: "Couldn't add you to the list." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
