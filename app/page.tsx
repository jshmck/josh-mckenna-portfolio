import Link from "next/link";

import { DriftingHero } from "@/components/home/drifting-hero";
import { ClientLogos } from "@/components/site/client-logos";
import { BackToTop } from "@/components/ui/back-to-top";
import { Parallax } from "@/components/ui/parallax";
import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { WorkGallery } from "@/components/work/work-gallery";
import { PROJECT_CATEGORIES, getAllProjects } from "@/lib/projects";

export default function HomePage() {
  const projects = getAllProjects();

  return (
    <>
      <DriftingHero />

      {/* Who Josh is */}
      <section>
        <div className="mx-auto grid max-w-frame gap-16 px-6 pb-16 pt-16 md:grid-cols-2 md:items-center md:px-gutter">
          <Reveal>
            <h2 className="type-heading text-ink">
              London-based illustrator working across character design, LGBTQ+
              themes, brand campaigns and automotive art.
            </h2>
            <p className="type-lede mt-6 max-w-lg text-ink-muted">
              He&apos;s drawn for the likes of Apple — loud, friendly, queer
              characters, always diverse. 2D mostly, 3D lately. Restaurant
              posters are his bread and butter. Cars are the thing he draws
              for free.
            </p>
            <Link
              href="/about"
              className="type-label mt-8 inline-flex items-center gap-2 whitespace-nowrap text-ink transition-[color,transform] duration-200 ease-in-out hover:scale-105 hover:text-accent hover:duration-300 hover:ease-drift"
            >
              <span>More about Josh</span>
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

      {/* Clients — moved here from the Info page per Josh, directly below
          Who. Same title treatment as every other section header on the
          site. */}
      <section>
        <div className="mx-auto max-w-frame px-6 pb-16 md:px-gutter">
          <h2 className="type-title text-accent">SeLeCteD CLieNtS</h2>
          <div className="mt-12">
            <ClientLogos />
          </div>
        </div>
      </section>

      {/* Work — the same gallery as /work, embedded so the page just keeps
          scrolling into it rather than navigating there. No title — Josh
          wants the gallery itself to be the section, not a labelled one.
          The id is the landmark Nav's scroll-spy reads to hand the active
          highlight from Home to Work — see components/site/nav.tsx. */}
      <section id="home-work">
        <div className="mx-auto max-w-frame px-6 pb-32 pt-16 md:px-gutter">
          {/* showIllustrations=false -- the Twingo/iPad row is /work's
              own top-of-page illustration, not something that should
              duplicate into Home's embedded gallery. */}
          <WorkGallery
            projects={projects}
            categories={[...PROJECT_CATEGORIES]}
            showIllustrations={false}
          />
        </div>
      </section>

      <BackToTop />
    </>
  );
}
