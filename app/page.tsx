import Link from "next/link";

import { DriftingHero } from "@/components/home/drifting-hero";
import { CtaBand } from "@/components/site/cta-band";
import { Marquee } from "@/components/site/marquee";
import { Parallax } from "@/components/ui/parallax";
import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import type { ImageRatio } from "@/lib/projects";

type SelectedPiece = {
  title: string;
  meta: string;
  href: string;
  image: { ratio: ImageRatio; alt: string; src: string };
};

/* The three pieces Josh features on the home page (Figma node 85:472). Kept
   inline until they become full project entries with detail pages (Phase 3). */
const selectedWork: SelectedPiece[] = [
  {
    title: "YETI — Figma Draw Series",
    meta: "Personal · 2025",
    href: "/work",
    image: {
      ratio: "4/3",
      alt: "A yeti climbing out of a toolbox, drawn in Figma",
      src: "/illustrations/card-yeti.png",
    },
  },
  {
    title: "‘Living Regeneratively’ Editorial",
    meta: "The Rooted Journal · 2025",
    href: "/work",
    image: {
      ratio: "4/3",
      alt: "A figure watering plants in a regenerative garden",
      src: "/illustrations/card-living-regeneratively.png",
    },
  },
  {
    title: "3D Bum Selfie",
    meta: "Personal · 2026",
    href: "/work",
    image: {
      ratio: "4/3",
      alt: "A 3D character bending over to take a phone selfie",
      src: "/illustrations/card-bum-selfie.png",
    },
  },
];

export default function HomePage() {
  return (
    <>
      <DriftingHero />

      {/* 01 — Who Josh is */}
      <section className="border-b border-hairline">
        <div className="mx-auto grid max-w-frame gap-14 px-6 py-24 md:grid-cols-2 md:items-center md:px-gutter">
          <Reveal>
            <p className="type-label text-ink-muted">01 — Who</p>
            <h2 className="type-heading mt-6 text-ink">
              London-based illustrator working across character design, LGBTQ+
              themes, brand campaigns, and automotive art.
            </h2>
            <p className="type-lede mt-6 max-w-lg text-ink-muted">
              He&apos;s drawn for Apple, Meta, Coca-Cola, and for himself just as
              often — same loud, friendly, queer characters either way, always a
              mix of people. 2D mostly, 3D increasingly. Restaurant posters are
              his bread and butter. Cars are the thing he draws for free.
            </p>
            <Link
              href="/about"
              className="type-link mt-8 inline-flex items-center gap-2 whitespace-nowrap text-accent transition-opacity hover:opacity-70"
            >
              MORE ABOUT josh
              <span aria-hidden="true" className="font-body text-base font-normal md:text-lg">
                →
              </span>
            </Link>
          </Reveal>

          <Parallax speed={0.85}>
            <Plate
              image={{
                ratio: "4/3",
                alt: "Josh's signature crowd illustration — a Pride march",
                src: "/illustrations/signature-pride.png",
              }}
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </Parallax>
        </div>
      </section>

      {/* Selected work */}
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-frame px-6 py-24 md:px-gutter">
          <div className="flex items-baseline justify-between gap-6">
            <h2 className="type-title text-accent">SELECTED WORK</h2>
            <Link
              href="/work"
              className="type-label shrink-0 border-b border-ink pb-1 text-ink transition-colors hover:border-accent hover:text-accent"
            >
              View all work →
            </Link>
          </div>

          <ul className="mt-12 grid gap-8 md:grid-cols-3">
            {selectedWork.map((piece, index) => (
              <li key={piece.title}>
                <Reveal delay={index * 90}>
                  <Link
                    href={piece.href}
                    className="group block transition-transform duration-300 ease-drift hover:-translate-y-1.5 focus-visible:-translate-y-1.5"
                  >
                    <Plate
                      image={piece.image}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      priority={index === 0}
                    />
                    <div className="mt-3 flex items-baseline justify-between gap-4">
                      <h3 className="font-body text-[15px] font-medium text-ink transition-colors group-hover:text-accent">
                        {piece.title}
                      </h3>
                      <p className="type-label shrink-0 text-ink-muted">
                        {piece.meta}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Marquee />

      <CtaBand
        heading="Got something that needs drawing?"
        action="Start a commission"
      />
    </>
  );
}
