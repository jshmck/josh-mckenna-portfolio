import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that apply to commissions and print purchases from Josh McKenna.",
};

/**
 * Two things bundled into one page, per Josh: commission terms (the
 * original ask in GH #5 — copyright/licensing, deposits, revisions,
 * cancellation, delivery, usage scope), and online store terms once
 * Shop is live via Shopify, in the same coverage shape as the
 * Shopify-generated terms on hattiestewart.com/policies/terms-of-service
 * — but Hattie's page has no commission section at all, since her site
 * is print-shop only. Every sentence describes this site's own setup,
 * not copied from hers. Store-terms content describes what will be
 * true once Shop actually launches (commerce channel is still an open
 * decision, see DESIGN.md). Not reviewed by a solicitor — see GH #5
 * and #6. Same plain, undecorated Helvetica Neue treatment as
 * /privacy (bold headings, regular body, small type scale).
 */

const H2 = "font-body text-base font-bold text-ink";
const H3 = "font-body text-[13px] font-bold text-ink";
const P = "font-body mt-3 text-[13px] leading-relaxed text-ink";

export default function TermsPage() {
  return (
    <section>
      <div className="mx-auto max-w-frame px-6 pb-28 pt-16 md:px-gutter">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-body text-xl font-bold text-ink">
            Terms.
          </h1>
          <p className="font-body mt-2 text-[12px] text-ink-muted">
            Last updated: [date to be confirmed at launch]
          </p>

          <p className="font-body mt-8 text-[13px] leading-relaxed text-ink">
            These terms apply when you commission illustration work from{" "}
            {siteConfig.name}, and when you purchase a print through the
            shop. By commissioning work or placing an order, you accept
            these terms in full.
          </p>

          <div className="mt-14 space-y-10">
            <div>
              <h2 className={H2}>1. Commissions</h2>
              <p className={P}>
                <span className={H3}>Payment.</span> Payment terms are
                agreed individually for each commission — some projects
                are paid upfront before work begins, others are invoiced
                on completion. The agreed terms are confirmed with you
                before work starts.
              </p>
              <p className={P}>
                <span className={H3}>Revisions.</span> Each commission
                includes a set number of revision rounds, agreed before
                work begins. Further revisions beyond that number may be
                charged at an additional rate.
              </p>
              <p className={P}>
                <span className={H3}>Cancellation.</span> If you cancel a
                commission after work has started, any amount already
                paid is non-refundable, and you may be invoiced for
                further work completed up to the point of cancellation.
              </p>
              <p className={P}>
                <span className={H3}>Delivery.</span> Delivery timelines
                are agreed on a per-commission basis and communicated
                before work begins. Timelines are estimates, not
                guarantees, and may shift for reasons outside our
                control.
              </p>
            </div>

            <div>
              <h2 className={H2}>2. Copyright and usage rights</h2>
              <p className={P}>
                {siteConfig.name} retains copyright and ownership of all
                artwork, including commissioned work, unless otherwise
                agreed in writing. Commissioning or purchasing artwork
                grants you a licence to use it for the purpose agreed —
                it does not transfer ownership of the underlying
                artwork or its copyright to you.
              </p>
              <p className={P}>
                The scope of that licence — territory, duration, and the
                media it covers (for example print, digital, packaging,
                or merchandise) — is agreed with each client individually
                before work begins. Any use outside the agreed scope
                requires a separate licence.
              </p>
              <p className={P}>
                <span className={H3}>AI and machine learning.</span> No
                content on this site, including artwork and commissioned
                work, may be used to train any AI or machine learning
                model without our prior written permission.
              </p>
            </div>

            <div>
              <h2 className={H2}>3. Online store</h2>
              <p className={P}>
                Once the shop is live, purchases are processed through
                our shop platform, Shopify. We reserve the right to
                refuse or limit any order, including orders that appear
                to be placed by resellers, and to limit quantities
                available per person, household, or order.
              </p>
              <p className={P}>
                Prices, availability, and product descriptions may
                change without notice. Colours shown on screen may vary
                from the printed product depending on your display.
                Prints are produced in limited or open editions as
                stated on the individual product listing.
              </p>
            </div>

            <div>
              <h2 className={H2}>4. Accuracy of information</h2>
              <p className={P}>
                We aim to keep the information on this site accurate and
                up to date, but do not guarantee that all content is
                complete, current, or error-free. We reserve the right
                to correct any error, inaccuracy, or omission, and to
                change or update information, without prior notice.
              </p>
            </div>

            <div>
              <h2 className={H2}>5. Prohibited use</h2>
              <p className={P}>
                You may not use this site for any unlawful purpose, to
                infringe our or any third party&rsquo;s intellectual
                property rights, to transmit malicious code, or to
                scrape or harvest content from the site without
                permission.
              </p>
            </div>

            <div>
              <h2 className={H2}>6. Disclaimer and liability</h2>
              <p className={P}>
                This site and its content are provided &ldquo;as
                is&rdquo;, without warranties of any kind. To the extent
                permitted by law, {siteConfig.name} is not liable for
                any indirect, incidental, or consequential damages
                arising from your use of this site or purchase of a
                commission or print, including loss of profits, revenue,
                or data.
              </p>
            </div>

            <div>
              <h2 className={H2}>7. Governing law</h2>
              <p className={P}>
                These terms are governed by the laws of England and
                Wales. Any dispute arising from these terms is subject
                to the exclusive jurisdiction of the courts of England
                and Wales.
              </p>
            </div>

            <div>
              <h2 className={H2}>8. Changes to these terms</h2>
              <p className={P}>
                We may update these terms from time to time, for example
                to reflect changes to how commissions or the shop work.
                The date at the top of this page shows when it was last
                updated. Continued use of this site after a change
                constitutes acceptance of the updated terms.
              </p>
            </div>

            <div>
              <h2 className={H2}>9. Contact</h2>
              <p className={P}>
                For any question about these terms, email{" "}
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
