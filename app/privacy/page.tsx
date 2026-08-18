import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Josh McKenna collects, uses and stores your data.",
};

/**
 * Placeholder copy only — pending review by a qualified person before
 * launch (see GitHub issue #6). Real data flows on this site today:
 * the Contact form and Shop waitlist form both send name/email/message
 * to Resend (components/contact/enquiry-form.tsx,
 * components/shop/waitlist-form.tsx, app/api/contact,
 * app/api/waitlist); there is no analytics provider wired in yet.
 * Whoever drafts the real policy should confirm that list is still
 * accurate and add retention periods + a deletion-request process.
 */
export default function PrivacyPage() {
  return (
    <section>
      <div className="mx-auto max-w-frame px-6 pb-28 pt-16 md:px-gutter">
        <div className="mx-auto max-w-2xl">
          <h1 className="type-display text-ink">PRIVACY POLICY</h1>
          <p className="type-lede mt-6 text-ink-muted">
            This page is a placeholder. The final policy has not yet been
            reviewed by a qualified person and should not be relied on.
          </p>

          <div className="mt-16 space-y-12">
            <div>
              <h2 className="type-heading text-accent">
                Data we collect
              </h2>
              <p className="font-body mt-3 text-[15px] text-ink-muted">
                Placeholder — to be confirmed. Currently the Contact form
                and Shop waitlist form collect a name, email address and
                message when submitted.
              </p>
            </div>

            <div>
              <h2 className="type-heading text-accent">
                Why we collect it
              </h2>
              <p className="font-body mt-3 text-[15px] text-ink-muted">
                Placeholder — to be confirmed. Used to respond to
                enquiries and to notify the waitlist when Shop opens.
              </p>
            </div>

            <div>
              <h2 className="type-heading text-accent">
                Who has access
              </h2>
              <p className="font-body mt-3 text-[15px] text-ink-muted">
                Placeholder — to be confirmed. Form submissions are
                processed by Resend and the hosting provider.
              </p>
            </div>

            <div>
              <h2 className="type-heading text-accent">
                How long we keep it
              </h2>
              <p className="font-body mt-3 text-[15px] text-ink-muted">
                Placeholder — retention period to be confirmed.
              </p>
            </div>

            <div>
              <h2 className="type-heading text-accent">
                Requesting deletion
              </h2>
              <p className="font-body mt-3 text-[15px] text-ink-muted">
                Placeholder — contact process to be confirmed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
