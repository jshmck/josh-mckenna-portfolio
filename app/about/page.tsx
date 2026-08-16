import type { Metadata } from "next";

import { DecomposeSequence } from "@/components/about/decompose-sequence";
import { CtaBand } from "@/components/site/cta-band";
import { Marquee } from "@/components/site/marquee";
import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { features, pressQuotes } from "@/lib/about";

export const metadata: Metadata = {
  title: "About",
  description:
    "Ten years of drawing for magazines, record sleeves, cereal boxes and one negotiable tattoo.",
};

const PHOTOS = [
  { ratio: "3/4" as const, alt: "Josh in the studio" },
  { ratio: "3/4" as const, alt: "Work in progress on the desk" },
  { ratio: "3/4" as const, alt: "Painting the Brixton wall" },
  { ratio: "3/4" as const, alt: "Ink tests" },
];

export default function AboutPage() {
  return (
    <>
      <header>
        <div className="mx-auto max-w-frame px-6 py-20 md:px-gutter">
          <h1 className="type-display text-accent">ABOUT</h1>
          <p className="type-lede mt-8 max-w-2xl text-ink-muted">
            Ten years of drawing for magazines, record sleeves, cereal boxes and
            one negotiable tattoo.
          </p>
        </div>
      </header>

      <DecomposeSequence />

      {/* The person */}
      <section>
        <div className="mx-auto max-w-frame px-6 py-24 md:px-gutter">
          <Reveal className="max-w-2xl">
            <h2 className="type-heading text-ink">This is Josh.</h2>
            <p className="type-lede mt-6 text-ink-muted">
              He studied illustration in Bristol, moved to London for a job he
              left after eight months, and has been freelance since 2019. He
              draws by hand first, every time, and colours flat.
            </p>
            <p className="type-lede mt-5 text-ink-muted">
              He works out of a shared studio in Peckham, takes on roughly
              twenty commissions a year, and is unreasonably competitive about
              five-a-side.
            </p>
          </Reveal>

          <ul className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-4">
            {PHOTOS.map((photo, index) => (
              <li key={photo.alt}>
                <Reveal delay={index * 80}>
                  <Plate
                    image={photo}
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Press — the footer already carries the client list and the talks
          list on every page including this one, so this section is
          deliberately not another list: real quoted excerpts instead,
          the one thing the footer doesn't show. */}
      <section>
        <div className="mx-auto max-w-frame px-6 py-16 md:px-gutter">
          <h2 className="type-heading text-ink">Selected press</h2>
          <ul className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
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

      {/* Talks & features — the rich version of the footer's compact talks
          list, with a media slot and write-up per event. Real event names,
          placeholder photos/video and captions until Josh sends the real
          assets over (same "visible until real content lands" pattern
          Plate uses everywhere else on the site). */}
      <section>
        <div className="mx-auto max-w-frame px-6 py-16 md:px-gutter">
          <h2 className="type-heading text-ink">Selected talks &amp; features</h2>
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

      <Marquee />

      <CtaBand heading="Want him to draw something?" action="Get in touch" />
    </>
  );
}
