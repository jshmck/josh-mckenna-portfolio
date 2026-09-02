import type { Metadata } from "next";

import { WaitlistForm } from "@/components/shop/waitlist-form";
import { PageEndCard } from "@/components/ui/page-end-card";
import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Prints, stickers and other small things. Not open yet — leave an email and you'll hear first.",
};

/**
 * Placeholder shop.
 *
 * The commerce channel is still undecided (see DESIGN.md → Open decisions), and
 * that choice changes this page structurally — a Shopify or Stripe build is a
 * different information architecture, not a restyle. So this ships as an honest
 * waitlist rather than a fake storefront, and the ghosted cards below set the
 * expectation without pretending to be buyable.
 */

const GHOSTED = [
  { title: "Print title", detail: "£00 · A3 giclée" },
  { title: "Print title", detail: "£00 · A3 giclée" },
  { title: "Print title", detail: "£00 · A3 giclée" },
];

export default function ShopPage() {
  return (
    <PageEndCard>
      <div className="mx-auto max-w-frame px-6 pb-20 pt-8 md:px-gutter">
        <div className="mx-auto max-w-xl text-center">
          {/* Same fade + rise as Info's intro paragraph -- was missing here
              (and on Contact), so this text just appeared instantly instead
              of springing up like the rest of the site. Covers the waitlist
              form too (the email box and Notify Me button), not just the
              heading/paragraph, so the whole thing springs up as one group. */}
          <Reveal>
            <h1 className="type-heading text-ink">
              Prints, stickers and other small things
            </h1>
            <p className="type-lede mt-5 text-ink-muted">
              Not open yet. Leave an email and you&apos;ll hear the moment it
              is.
            </p>

            <div className="mt-10">
              <WaitlistForm />
            </div>
          </Reveal>
        </div>

        <ul
          aria-hidden="true"
          className="mt-24 grid gap-8 opacity-40 md:grid-cols-3"
        >
          {GHOSTED.map((item, index) => (
            <li key={index}>
              <Plate
                image={{ ratio: "4/5", alt: item.title }}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="mt-3 flex items-baseline justify-between gap-4">
                <p className="font-body text-[15px] font-medium text-ink">
                  {item.title}
                </p>
                <p className="type-label text-ink-muted">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PageEndCard>
  );
}
