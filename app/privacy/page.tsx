import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Josh McKenna collects, uses and stores your data.",
};

/**
 * Drafted from Josh's own notes (data collected, purpose, third
 * parties, retention, deletion), not independently researched — this
 * has not been reviewed by a solicitor and should be before launch
 * (see GitHub issue #6). "Our analytics provider" and "our hosting
 * provider" are left unnamed until those are chosen; update once
 * they're wired in. Plain font-body throughout (bold headings,
 * regular body) rather than the display/accent treatment used
 * elsewhere on the site — deliberately formal, no decoration.
 */
export default function PrivacyPage() {
  return (
    <section>
      <div className="mx-auto max-w-frame px-6 pb-28 pt-16 md:px-gutter">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-body text-2xl font-bold text-ink">
            Privacy Policy
          </h1>
          <p className="font-body mt-2 text-[13px] text-ink-muted">
            Last updated: [date to be confirmed at launch]
          </p>

          <p className="font-body mt-8 text-[15px] leading-relaxed text-ink">
            This policy explains what personal data {siteConfig.name}{" "}
            collects through this website, why it is collected, who else
            may see it, how long it is kept, and how to request its
            deletion.
          </p>

          <div className="mt-14 space-y-10">
            <div>
              <h2 className="font-body text-lg font-bold text-ink">
                1. What we collect
              </h2>
              <p className="font-body mt-3 text-[15px] leading-relaxed text-ink">
                When you use the contact form, we collect your name,
                email address and the content of your message.
              </p>
              <p className="font-body mt-3 text-[15px] leading-relaxed text-ink">
                When you join the shop waitlist, we collect your email
                address.
              </p>
              <p className="font-body mt-3 text-[15px] leading-relaxed text-ink">
                When you browse this website, we collect analytics data,
                such as which pages and projects are viewed.
              </p>
            </div>

            <div>
              <h2 className="font-body text-lg font-bold text-ink">
                2. Why we collect it
              </h2>
              <p className="font-body mt-3 text-[15px] leading-relaxed text-ink">
                Contact form and waitlist data is used to reply to your
                enquiry and, for the waitlist, to notify you when the
                shop opens. Analytics data is used to understand which
                work people look at and to improve the website.
              </p>
            </div>

            <div>
              <h2 className="font-body text-lg font-bold text-ink">
                3. Who else sees it
              </h2>
              <p className="font-body mt-3 text-[15px] leading-relaxed text-ink">
                Contact and waitlist submissions are processed by our
                email delivery provider, Resend. Analytics data is
                processed by our analytics provider. This website is
                hosted by our hosting provider. We do not sell your
                data, and we do not share it with anyone else.
              </p>
            </div>

            <div>
              <h2 className="font-body text-lg font-bold text-ink">
                4. How long we keep it
              </h2>
              <p className="font-body mt-3 text-[15px] leading-relaxed text-ink">
                Contact form and waitlist data is kept for as long as
                needed to respond to your enquiry or to run the
                waitlist, and is deleted once it is no longer needed
                for that purpose. Analytics data is retained according
                to our analytics provider&rsquo;s default retention
                period.
              </p>
            </div>

            <div>
              <h2 className="font-body text-lg font-bold text-ink">
                5. Requesting deletion
              </h2>
              <p className="font-body mt-3 text-[15px] leading-relaxed text-ink">
                To request that your data be deleted, or to ask what
                data we hold about you, email{" "}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="underline underline-offset-2"
                >
                  {siteConfig.email}
                </a>
                . We will respond within a reasonable time.
              </p>
            </div>

            <div>
              <h2 className="font-body text-lg font-bold text-ink">
                6. Contact
              </h2>
              <p className="font-body mt-3 text-[15px] leading-relaxed text-ink">
                Questions about this policy can be sent to{" "}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="underline underline-offset-2"
                >
                  {siteConfig.email}
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
