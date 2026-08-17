import type { Metadata } from "next";
import Image from "next/image";

import { ClientLogos } from "@/components/site/client-logos";
import { CtaBand } from "@/components/site/cta-band";
import { Footer } from "@/components/site/footer";
import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { features, pressQuotes } from "@/lib/about";

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
        <div className="mx-auto max-w-frame px-6 pb-28 pt-8 md:px-gutter">
          {/* A transparent PNG, not a framed photo -- same treatment as the
              Contact page illustration: next/image directly, object-contain,
              no Plate frame or background surface. Same bearded character
              as one of the homepage hero objects, copied to its own path
              here so the two stay independent. */}
          <div className="relative aspect-[977/929] w-full max-w-[110px]">
            <Image
              src="/illustrations/bearded.png"
              alt=""
              fill
              sizes="110px"
              className="object-contain"
            />
          </div>

          <Reveal className="mt-10 max-w-2xl">
            <p className="type-lede text-ink-muted">
              Josh McKenna is a London-based illustrator with over a decade
              of experience moving between digital products and physical
              spaces. He studied illustration at Falmouth University before
              going freelance in 2014, working with brands from Apple to the
              Wall Street Journal. From the iconic Instagram Pride sticker to
              murals for Facebook, his work uses simple vector shapes to
              evolve 2D characters into 3D forms.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Press — short third-party credibility, right after the intro
          paragraph rather than after the heavier Talks & Features grid;
          eases from personal copy into a bigger visual section instead of
          jumping straight there. */}
      <section>
        <div className="mx-auto max-w-frame px-6 pb-28 md:px-gutter">
          {/* items-stretch (grid's default) makes each <li> match the row's
              tallest quote; the Reveal wrapper below fills that height as a
              flex column so the attribution lands on a shared baseline
              across the row instead of trailing right under its own quote. */}
          <ul className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
            {pressQuotes.map((press, index) => (
              <li key={press.source}>
                <Reveal
                  delay={index * 60}
                  className="flex h-full flex-col justify-between"
                >
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

      {/* Talks & features — one merged list now, not a compact text list
          plus a separate rich-card version of the same events. Real event
          names, placeholder photos/video and captions until Josh sends the
          real assets over (same "visible until real content lands"
          pattern Plate uses everywhere else on the site). */}
      <section>
        <div className="mx-auto max-w-frame px-6 pb-28 md:px-gutter">
          <h2 className="type-title font-medium text-accent">
            TALKS AND FEATURES
          </h2>
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

      {/* Clients — moved below Press per Josh, titled like every other
          section title on the site. */}
      <section>
        <div className="mx-auto max-w-frame px-6 pb-16 md:px-gutter">
          <h2 className="type-title font-medium text-accent">
            SELECTED CLIENTS
          </h2>
          <div className="mt-12">
            <ClientLogos />
          </div>
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
