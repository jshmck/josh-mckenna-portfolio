import type { Metadata } from "next";

import { CtaBand } from "@/components/site/cta-band";
import { Footer } from "@/components/site/footer";
import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { clients, features, pressQuotes } from "@/lib/about";

export const metadata: Metadata = {
  title: "Info",
  description:
    "Ten years of drawing for magazines, record sleeves, cereal boxes and one negotiable tattoo.",
};

/**
 * No visible page title — Josh wants the content to open the page, not a
 * labelled header. A screen-reader-only h1 keeps the page's heading
 * structure intact; the browser tab title still says "Info" via metadata
 * above. Only Talks & Features and Selected Clients get visible titles —
 * Press doesn't, its quote-plus-attribution format already reads as press
 * on its own. Titles use type-heading + text-ink, matching the homepage
 * "WHO" section heading.
 */
export default function AboutPage() {
  return (
    <>
      <h1 className="sr-only">Info</h1>

      {/* The person — one short paragraph, no photos. */}
      <section>
        <div className="mx-auto max-w-frame px-6 pb-28 pt-20 md:px-gutter">
          <Reveal className="max-w-2xl">
            <p className="type-lede text-ink-muted">
              He studied illustration in Bristol, has been freelance since
              2019, and works out of a shared studio in Peckham — drawing by
              hand first, every time, and colouring flat. Roughly twenty
              commissions a year, and unreasonably competitive about
              five-a-side.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Talks & features — one merged list now, not a compact text list
          plus a separate rich-card version of the same events. Real event
          names, placeholder photos/video and captions until Josh sends the
          real assets over (same "visible until real content lands"
          pattern Plate uses everywhere else on the site). */}
      <section>
        <div className="mx-auto max-w-frame px-6 pb-28 md:px-gutter">
          <h2 className="type-heading text-ink">Talks &amp; Features</h2>
          <ul className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
            {features.map((feature, index) => (
              <li key={feature.alt}>
                <Reveal delay={index * 80}>
                  <Plate
                    image={{ ratio: "16/10", alt: feature.alt }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <h3 className="font-body mt-4 text-[15px] font-bold text-ink">
                    {feature.title}
                  </h3>
                  <p className="type-lede mt-1 text-ink-muted">
                    {feature.description}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Clients — moved below talks & features per Josh, titled like every
          other section title on the site. */}
      <section>
        <div className="mx-auto max-w-frame px-6 pb-28 md:px-gutter">
          <h2 className="type-heading text-ink">Selected Clients</h2>
          <p className="font-body mt-6 max-w-2xl text-[15px] text-ink-muted">
            {clients.join(", ")}
          </p>
        </div>
      </section>

      {/* Press */}
      <section>
        <div className="mx-auto max-w-frame px-6 pb-16 md:px-gutter">
          <ul className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
            {pressQuotes.map((press, index) => (
              <li key={press.source}>
                <Reveal delay={index * 60}>
                  <blockquote className="font-body text-[15px] text-ink">
                    &ldquo;{press.quote}&rdquo;
                  </blockquote>
                  <p className="type-label mt-4 text-ink-muted">
                    {press.source}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* DecomposeSequence (components/about/decompose-sequence.tsx) and
          Marquee (components/site/marquee.tsx) are deliberately not
          rendered here — Josh wants both off this page for now but plans
          to reuse them elsewhere, so neither component was deleted, just
          unhooked from this page. */}

      <CtaBand heading="Want him to draw something?" action="Get in touch" />

      {/* The footer now lives only here, not on every page — see
          app/layout.tsx. */}
      <Footer />
    </>
  );
}
