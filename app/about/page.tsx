import type { Metadata } from "next";

import { DecomposeSequence } from "@/components/about/decompose-sequence";
import { CtaBand } from "@/components/site/cta-band";
import { Marquee } from "@/components/site/marquee";
import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { clients, timeline } from "@/lib/about";

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
          <h1 className="type-heading text-ink">About</h1>
          <p className="type-lede mt-5 max-w-2xl text-ink-muted">
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

      {/* How he got here */}
      <section>
        <div className="mx-auto max-w-frame px-6 py-24 md:px-gutter">
          <h2 className="type-heading text-ink">How he got here</h2>

          <ol className="mt-12">
            {timeline.map((entry, index) => (
              <li key={entry.year}>
                <Reveal delay={index * 60}>
                  <div className="flex flex-wrap items-baseline gap-x-10 gap-y-1 py-6">
                    <p className="type-label w-14 shrink-0 text-accent">
                      {entry.year}
                    </p>
                    <p className="font-body text-[15px] font-medium text-ink">
                      {entry.event}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Clients */}
      <section>
        <div className="mx-auto max-w-frame px-6 py-16 md:px-gutter">
          <h2 className="type-label text-ink-muted">
            Selected clients &amp; publications
          </h2>
          <ul className="mt-8 flex flex-wrap items-center gap-x-12 gap-y-6">
            {clients.map((client) => (
              <li
                key={client}
                className="font-body text-lg font-medium text-ink-muted"
              >
                {client}
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
