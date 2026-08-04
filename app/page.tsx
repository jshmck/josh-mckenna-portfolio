import Link from "next/link";

import { DriftingHero } from "@/components/home/drifting-hero";
import { CtaBand } from "@/components/site/cta-band";
import { Marquee } from "@/components/site/marquee";
import { Parallax } from "@/components/ui/parallax";
import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { ProjectCard } from "@/components/work/project-card";
import { getFeaturedProjects } from "@/lib/projects";

export default function HomePage() {
  const featured = getFeaturedProjects(3);

  return (
    <>
      <DriftingHero />

      {/* 01 — Who Josh is */}
      <section className="border-b border-hairline">
        <div className="mx-auto grid max-w-frame gap-14 px-6 py-24 md:grid-cols-2 md:items-center md:px-gutter">
          <Reveal>
            <p className="type-label text-ink-muted">01 — Who</p>
            <h2 className="type-heading mt-6 text-ink">
              Josh has been drawing loud, friendly, slightly queer characters
              for a decade.
            </h2>
            <p className="type-lede mt-6 max-w-lg text-ink-muted">
              Mostly for magazines and record labels, occasionally for a cereal
              box, once for a tattoo that is still — he insists — negotiable.
              The brief changes; the characters don&apos;t.
            </p>
            <Link
              href="/about"
              className="type-label mt-8 inline-block border-b border-ink pb-1 text-ink transition-colors hover:border-accent hover:text-accent"
            >
              More about Josh →
            </Link>
          </Reveal>

          <Parallax speed={0.85}>
            <Plate
              image={{ ratio: "5/4", alt: "Signature illustration" }}
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </Parallax>
        </div>
      </section>

      {/* Selected work */}
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-frame px-6 py-24 md:px-gutter">
          <div className="flex items-baseline justify-between gap-6">
            <h2 className="type-heading text-ink">Selected work</h2>
            <Link
              href="/work"
              className="type-label shrink-0 border-b border-ink pb-1 text-ink transition-colors hover:border-accent hover:text-accent"
            >
              View all work →
            </Link>
          </div>

          <ul className="mt-12 grid gap-8 md:grid-cols-3">
            {featured.map((project, index) => (
              <li key={project.slug}>
                <Reveal delay={index * 90}>
                  <ProjectCard
                    project={project}
                    ratio="4/5"
                    priority={index === 0}
                  />
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
