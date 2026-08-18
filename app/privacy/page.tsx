import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Josh McKenna collects, uses and stores your data.",
};

/**
 * Placeholder copy only — pending review by a qualified person before
 * launch (see GitHub issue #6). Data flows at launch, per Josh: the
 * Contact form and Shop waitlist form both send name/email/message to
 * Resend (components/contact/enquiry-form.tsx,
 * components/shop/waitlist-form.tsx, app/api/contact,
 * app/api/waitlist), plus an analytics provider (not yet chosen/wired
 * in) tracking which work people look at. All three trigger UK/EU
 * GDPR once live. Whoever drafts the real policy should confirm this
 * list is still accurate and add retention periods + a
 * deletion-request process.
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
                Placeholder — to be confirmed. The Contact form and Shop
                waitlist form collect a name, email address and message
                when submitted; an analytics tool collects usage data
                such as which pages and projects are viewed.
              </p>
            </div>

            <div>
              <h2 className="type-heading text-accent">
                Why we collect it
              </h2>
              <p className="font-body mt-3 text-[15px] text-ink-muted">
                Placeholder — to be confirmed. Used to respond to
                enquiries, to notify the waitlist when Shop opens, and
                to understand which work people engage with.
              </p>
            </div>

            <div>
              <h2 className="type-heading text-accent">
                Who has access
              </h2>
              <p className="font-body mt-3 text-[15px] text-ink-muted">
                Placeholder — to be confirmed. Form submissions are
                processed by Resend; usage data is processed by an
                analytics provider; both plus this site are hosted by
                a hosting provider.
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
