import type { Metadata } from "next";

import { CtaBand } from "@/components/site/cta-band";
import { Footer } from "@/components/site/footer";
import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { clients, features, pressQuotes } from "@/lib/about";
import { talksAndFeatures } from "@/lib/site";

export const metadata: Metadata = {
  title: "Info",
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
          <h1 className="type-display text-accent">INFO</h1>
        </div>
      </header>

      {/* The person — moved to the top, no title, no lede; just the copy
          and photos. */}
      <section>
        <div className="mx-auto max-w-frame px-6 pb-24 md:px-gutter">
          <Reveal className="max-w-2xl">
            <p className="type-lede text-ink-muted">
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

      {/* Clients + the compact talks list — moved here from the old
          sitewide footer, same text size/format, just living in the page
          body instead of a footer now. */}
      <section>
        <div className="mx-auto grid max-w-frame gap-10 px-6 pb-16 md:grid-cols-2 md:gap-12 md:px-gutter">
          <div>
            <p className="font-body text-[15px] font-bold text-ink">
              Selected Clients
            </p>
            <p className="font-body mt-6 text-[15px] text-ink-muted">
              {clients.join(", ")}
            </p>
          </div>

          <div>
            <p className="font-body text-[15px] font-bold text-ink">
              Selected Talks and Features
            </p>
            <ul className="mt-6 space-y-1">
              {talksAndFeatures.map((talk) => (
                <li key={talk} className="font-body text-[15px] text-ink-muted">
                  {talk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Talks & features — the rich version of the compact talks list
          above, with a media slot and write-up per event. Real event names,
          placeholder photos/video and captions until Josh sends the real
          assets over (same "visible until real content lands" pattern
          Plate uses everywhere else on the site). */}
      <section>
        <div className="mx-auto max-w-frame px-6 py-16 md:px-gutter">
          <h2 className="type-heading text-ink">Talks &amp; features</h2>
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

      {/* Press — the section above already carries the client list and the
          talks list, so this one is deliberately not another list: real
          quoted excerpts instead, the one thing neither of those show. */}
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
