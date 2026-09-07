import type { Metadata } from "next";

import { ShopGrid } from "@/components/shop/shop-grid";
import { WaitlistForm } from "@/components/shop/waitlist-form";
import { PageEndCard } from "@/components/ui/page-end-card";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Prints, stickers and other small things. Not open yet — leave an email and you'll hear first.",
};

/**
 * Commerce channel is Big Cartel (see DESIGN.md → Open decisions) — but the
 * shop isn't open to real orders yet (Josh is still finalising shipping,
 * payment and legal details), so the page keeps the waitlist front and
 * centre rather than presenting a fully live storefront. ShopGrid renders
 * whatever's actually listed in Big Cartel underneath it — right now
 * that's real products marked "coming soon", not placeholder ghosts, so
 * the page already reflects the real catalogue as it fills in.
 */

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

        <ShopGrid />
      </div>
    </PageEndCard>
  );
}
