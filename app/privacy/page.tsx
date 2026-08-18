import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Josh McKenna collects, uses and stores your data.",
};

/**
 * Structure follows the standard Shopify-generated policy shape (the
 * same one used on hattiestewart.com/policies/privacy-policy) at
 * Josh's request, but every sentence describes this site's own setup
 * — not copied from hers. Shop/Shopify/cookies sections describe what
 * will be true once Shop launches (commerce channel is still an open
 * decision, see DESIGN.md); update the bracketed placeholders once
 * Shopify, the analytics provider and the host are actually wired in.
 * Not reviewed by a solicitor — see GH #6. Plain font-body throughout
 * (bold headings, regular body), no display/accent treatment —
 * deliberately formal, no decoration.
 */

const H2 = "font-body text-base font-bold text-ink";
const H3 = "font-body text-[13px] font-bold text-ink";
const P = "font-body mt-3 text-[13px] leading-relaxed text-ink";

export default function PrivacyPage() {
  return (
    <section>
      <div className="mx-auto max-w-frame px-6 pb-28 pt-16 md:px-gutter">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-body text-xl font-bold text-ink">
            Privacy Policy.
          </h1>
          <p className="font-body mt-2 text-[12px] text-ink-muted">
            Last updated: [date to be confirmed at launch]
          </p>

          <p className="font-body mt-8 text-[13px] leading-relaxed text-ink">
            This policy explains what personal information{" "}
            {siteConfig.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects
            through this website, how it is used and shared, the legal
            basis for processing it, and the rights available to you,
            including under the UK and EU General Data Protection
            Regulation (GDPR) and the California Consumer Privacy Act
            (CCPA).
          </p>

          <div className="mt-14 space-y-10">
            <div>
              <h2 className={H2}>1. Personal information we collect</h2>
              <p className={P}>
                <span className={H3}>Enquiry information.</span> When you
                use the contact form, we collect your name, email address
                and the content of your message.
              </p>
              <p className={P}>
                <span className={H3}>Waitlist information.</span> When you
                join the shop waitlist, we collect your email address.
              </p>
              <p className={P}>
                <span className={H3}>Order information.</span> Once the
                shop is live, if you purchase a print, we — through our
                shop platform, Shopify — collect your name, billing and
                shipping address, email address, and payment information,
                in order to fulfil your order.
              </p>
              <p className={P}>
                <span className={H3}>Device and usage information.</span>{" "}
                We automatically collect certain information about the
                device you use to visit this website, including your
                browser type, IP address, time zone, and how you interact
                with the site, using cookies and our analytics provider.
                See <span className="italic">Cookies</span> below.
              </p>
            </div>

            <div>
              <h2 className={H2}>2. How we use your information</h2>
              <p className={P}>
                We use enquiry and waitlist information to respond to
                your message and, for the waitlist, to notify you when
                the shop opens. We use order information to fulfil
                purchases, process payment, and communicate with you
                about your order. We use device and usage information to
                understand which work people look at, to improve this
                website, and to detect and prevent fraud.
              </p>
            </div>

            <div>
              <h2 className={H2}>3. Sharing your information</h2>
              <p className={P}>
                We share personal information with service providers who
                help us run this website and business, and only to the
                extent needed for them to perform that service:
              </p>
              <ul className="font-body mt-3 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-ink">
                <li>Resend, which delivers contact and waitlist messages;</li>
                <li>
                  Shopify, which processes shop orders and payment once
                  the shop is live;
                </li>
                <li>[analytics provider], which processes usage data;</li>
                <li>[hosting provider], which hosts this website.</li>
              </ul>
              <p className={P}>
                We may also disclose personal information to comply with
                applicable law, to enforce our terms, or to protect the
                rights, property or safety of {siteConfig.name}, our
                customers, or others. We do not sell personal information.
              </p>
            </div>

            <div>
              <h2 className={H2}>4. Lawful basis for processing (UK/EU GDPR)</h2>
              <p className={P}>
                Where the UK or EU GDPR applies, we rely on the following
                legal bases to process your personal information:
              </p>
              <ul className="font-body mt-3 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-ink">
                <li>
                  <span className={H3}>Contract</span> — to fulfil an
                  order or respond to a request you have made;
                </li>
                <li>
                  <span className={H3}>Consent</span> — where you have
                  given it, such as joining the waitlist;
                </li>
                <li>
                  <span className={H3}>Legitimate interests</span> — to
                  operate, secure and improve this website, provided this
                  does not override your rights;
                </li>
                <li>
                  <span className={H3}>Legal obligation</span> — where we
                  must retain or disclose information to comply with the
                  law.
                </li>
              </ul>
            </div>

            <div>
              <h2 className={H2}>5. Your rights</h2>
              <p className={P}>
                If the UK or EU GDPR applies to you, you have the right
                to access, correct, delete or export your personal
                information, to object to or restrict certain processing,
                and to withdraw consent at any time. If you are a
                California resident, the CCPA gives you the right to know
                what personal information we hold about you and to
                request its deletion; we do not sell personal information,
                so there is no sale to opt out of. To exercise any of
                these rights, contact us using the details below.
              </p>
            </div>

            <div>
              <h2 className={H2}>6. Cookies</h2>
              <p className={P}>
                <span className={H3}>Necessary cookies.</span> Once the
                shop is live, Shopify sets cookies that are required for
                the shop to function — for example, to keep items in your
                cart and to keep you signed in during checkout. These
                cannot be switched off.
              </p>
              <p className={P}>
                <span className={H3}>Analytics cookies.</span> We use
                [analytics provider] to understand how visitors use this
                website, such as which pages and projects are viewed. You
                can control or block these through your browser settings.
              </p>
            </div>

            <div>
              <h2 className={H2}>7. Do Not Track</h2>
              <p className={P}>
                Some browsers offer a &ldquo;Do Not Track&rdquo; signal.
                Because there is no accepted standard for how sites
                should respond, this website does not currently respond
                to Do Not Track signals.
              </p>
            </div>

            <div>
              <h2 className={H2}>8. Data retention</h2>
              <p className={P}>
                Enquiry and waitlist information is kept for as long as
                needed to respond to your message or run the waitlist,
                and is deleted once it is no longer needed for that
                purpose. Order information is kept for as long as
                required for accounting, tax and consumer-protection
                obligations. Analytics data is retained according to
                [analytics provider]&rsquo;s default retention period.
              </p>
            </div>

            <div>
              <h2 className={H2}>9. Changes to this policy</h2>
              <p className={P}>
                We may update this policy from time to time, for example
                to reflect changes to the services we use. The date at
                the top of this page shows when it was last updated.
              </p>
            </div>

            <div>
              <h2 className={H2}>10. Contact</h2>
              <p className={P}>
                For any question about this policy, or to exercise any of
                the rights described above, email{" "}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="underline underline-offset-2"
                >
                  {siteConfig.email}
                </a>
                . If you are in the UK or EU and remain unsatisfied with
                our response, you have the right to complain to your
                local data protection authority — in the UK, the
                Information Commissioner&rsquo;s Office (ico.org.uk).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
