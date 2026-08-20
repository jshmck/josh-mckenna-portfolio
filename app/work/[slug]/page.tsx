import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { getProject, getProjectNeighbours, projects } from "@/lib/projects";
import { toWaldeckCase } from "@/lib/waldeck-case";

/**
 * project.title itself keeps normal casing for the breadcrumb, gallery
 * cards and metadata — only the big display h1 gets the Waldeck-casing
 * treatment (see lib/waldeck-case.ts for the rule and why).
 */
function toDisplayTitle(title: string) {
  return toWaldeckCase(title);
}

/** Every project is known at build time, so all detail pages prerender. */
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) return {};

  return {
    title: project.title,
    description: `${project.summary} ${project.discipline} for ${project.client}, ${project.year}.`,
    openGraph: {
      title: `${project.title} — Josh McKenna`,
      description: project.summary,
    },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  const { previous, next } = getProjectNeighbours(slug);
  const [firstImage, secondImage, ...restImages] = project.gallery;

  const meta = [
    { label: "Client", value: project.client },
    { label: "Year", value: String(project.year) },
    { label: "Discipline", value: project.discipline },
    { label: "Deliverables", value: project.deliverables },
  ];

  const displayTitle = toDisplayTitle(project.title);

  return (
    <article>
      <header className="py-16 md:py-[60px]">
        <div className="mx-auto max-w-frame px-6 md:px-gutter">
          <p className="type-label text-ink">
            <Link
              href="/work"
              className="inline-block transition-[font-weight,transform] duration-200 ease-in-out hover:scale-105 hover:font-bold hover:duration-300 hover:ease-drift"
            >
              Work
            </Link>
            {"  /  "}
            {project.title}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-6">
            <h1 className="type-display max-w-4xl leading-[1.1] text-accent">
              {displayTitle}
            </h1>

            {/* Trial (la-pride only for now): same lean-toward-cursor
                treatment as the /work page's top illustration row, sat on
                the title's own line rather than up by the breadcrumb.
                Hidden below md since the title needs the width there. */}
            {project.headerIllustrations && (
              <div className="hidden shrink-0 items-center gap-4 md:flex">
                {project.headerIllustrations.map(({ src, aspect }) => (
                  <TiltIllustration
                    key={src}
                    src={src}
                    aspect={aspect}
                    height="clamp(80px, 10vw, 140px)"
                  />
                ))}
              </div>
            )}
          </div>

          <dl className="mt-8 flex flex-wrap gap-x-16 gap-y-6">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="type-label text-ink/60">{item.label}</dt>
                <dd className="mt-1.5 font-body text-[15px] font-medium text-ink">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* Hero */}
      <div className="mx-auto max-w-frame px-6 pt-12 md:px-gutter">
        <Plate
          image={project.hero}
          sizes="(max-width: 1344px) 100vw, 1344px"
          priority
        />
        <p className="type-label mt-3 text-ink-muted">{project.heroCaption}</p>
      </div>

      {/* Write-up + sticky credits */}
      <div className="mx-auto grid max-w-frame gap-14 px-6 py-20 md:grid-cols-[1fr_260px] md:px-gutter">
        <div className="max-w-2xl">
          <h2 className="type-heading text-ink">
            The brief, in Josh&apos;s words.
          </h2>
          {project.brief.map((paragraph, index) => (
            <p key={index} className="type-lede mt-6 text-ink-muted">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Pins while the write-up scrolls past, per the wireframe. */}
        <aside className="h-fit md:sticky md:top-[112px]">
          <h3 className="type-label text-ink">Credits</h3>
          <dl className="mt-5 space-y-4">
            {project.credits.map((credit) => (
              <div key={credit.role}>
                <dt className="type-label text-ink-muted">{credit.role}</dt>
                <dd className="mt-1 font-body text-[15px] font-medium text-ink">
                  {credit.name}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      {/* Image stack — first two as a two-up, the rest full width. */}
      <div className="mx-auto max-w-frame space-y-8 px-6 pb-20 md:px-gutter">
        {(firstImage || secondImage) && (
          <div className="grid gap-8 md:grid-cols-2">
            {[firstImage, secondImage].filter(Boolean).map((image, index) => (
              <Reveal key={image.alt} delay={index * 110}>
                <Plate image={image} sizes="(max-width: 768px) 100vw, 50vw" />
                <p className="type-label mt-3 text-ink-muted">{image.alt}</p>
              </Reveal>
            ))}
          </div>
        )}

        {restImages.map((image) => (
          <Reveal key={image.alt}>
            <Plate image={image} sizes="(max-width: 1344px) 100vw, 1344px" />
            <p className="type-label mt-3 text-ink-muted">{image.alt}</p>
          </Reveal>
        ))}
      </div>

      {/* Previous / all / next — Waldeck Black + purple like the Info
          page's section titles (type-title text-accent), but at
          type-link's smaller scale: three of these sit in one row, and
          full type-title size (clamps up to 3.5rem) would dominate the
          footer and wrap badly on mobile. Generic labels instead of the
          neighbour's actual title -- the arrows plus "All Work" in the
          middle already establish these are project-to-project links, so
          "Project" on each side was redundant. type-link was already in
          globals.css for exactly this "smaller Waldeck link" role and
          had no callers yet. Plain full caps here, not the lowercase-
          letter quirk everywhere else on the site -- Josh's call, these
          three read better fully uppercase at this scale. font-waldeck-
          medium (180), not Black (340): tried Black
          here to match the headers and it closed up/read cramped at this
          much smaller size. Black suits a big headline; type-link's
          smaller scale needs the lighter cut to stay legible -- same
          Waldeck family, weight matched to size, not an inconsistency.
          Custom font-waldeck-medium/-black tokens (globals.css), not
          Tailwind's stock font-medium/font-black -- Waldeck's variable
          wght axis only spans 100-340, so 500 and 900 both clamp to the
          same 340 and stop being distinguishable (see app/layout.tsx). */}
      <nav aria-label="Project navigation">
        {/* Grid, not flex-wrap justify-between -- with three items of
            uneven width, flex-wrap can drop just the last one onto its
            own line at narrow widths instead of wrapping the whole row.
            A fixed 3-column grid guarantees each link its own slot. */}
        <div className="mx-auto grid max-w-frame grid-cols-3 items-center gap-4 px-6 py-10 md:px-gutter">
          {/* font-bold/text-lg arrows -- kept even after reverting the
              text to font-waldeck-medium, since Helvetica Bold next to
              Waldeck Medium still reads better than the original thin default.
              Plain unicode arrows, not
              Waldeck -- the font has no ← / → glyph at all (confirmed
              against its cmap, same gap as the missing '&'), so they'd
              silently fall back to a different font if left inside the
              type-link span; font-body here keeps them consistent
              regardless of what surrounds them. Went back to these after
              trying a custom fletched-arrow SVG (reverted) per Josh:
              preferred the plain arrows. Bumped to font-bold/text-lg since
              the heavier Waldeck neighbour text made the plain arrows look
              skinny by comparison; hover nudges AND scales them up
              (group-hover:scale-125) as the interactive cue. Text itself
              goes font-waldeck-medium -> hover:font-waldeck-black -- a real weight jump
              now that Black isn't the resting state, so it's available
              again as the "something happened" signal. Dropped the
              opacity fade this replaced: getting bolder AND fainter at
              once read as conflicting. Tracking opens up slightly on
              hover too (tracking-normal -> 0.02em) -- Black's heavier
              strokes crowd each other at type-link's small size, and a
              touch more letter-spacing gives them room to stay legible.
              Arrows get chunkier on hover to match the text's weight
              jump -- Helvetica Bold (700) is already the heaviest cut
              loaded for font-body, no heavier weight to hover into, so
              a 0.6px -webkit-text-stroke fakes the extra boldness
              instead, on top of the existing scale/nudge. Asymmetric
              transition on purpose: entering hover uses hover:duration-300
              hover:ease-drift (the site's reveal-animation curve, a
              strong deceleration that suits Chrome's font-weight
              synthesis growing into Black), but CSS reads whichever
              state you're transitioning INTO, so leaving hover falls
              back to the base duration-200 ease-in-out instead --
              ease-drift's long settle looked janky shrinking back down,
              a plain ease-in-out reverts cleaner. */}
          {previous ? (
            <Link
              href={`/work/${previous.slug}`}
              className="type-link group inline-flex items-center gap-2 font-waldeck-medium tracking-normal text-accent transition-[font-weight,letter-spacing] duration-200 ease-in-out hover:font-waldeck-black hover:tracking-[0.02em] hover:duration-300 hover:ease-drift"
            >
              <span className="font-body text-lg font-bold transition-transform [-webkit-text-stroke:0px] group-hover:-translate-x-2 group-hover:scale-125 group-hover:[-webkit-text-stroke:0.6px_currentColor]">
                ←
              </span>
              PREVIOUS
            </Link>
          ) : (
            <span />
          )}

          <Link
            href="/work"
            className="type-link text-center font-waldeck-medium tracking-normal text-accent transition-[font-weight,letter-spacing] duration-200 ease-in-out hover:font-waldeck-black hover:tracking-[0.02em] hover:duration-300 hover:ease-drift"
          >
            ALL WORK
          </Link>

          {next ? (
            <Link
              href={`/work/${next.slug}`}
              className="type-link group inline-flex items-center justify-end gap-2 font-waldeck-medium tracking-normal text-accent transition-[font-weight,letter-spacing] duration-200 ease-in-out hover:font-waldeck-black hover:tracking-[0.02em] hover:duration-300 hover:ease-drift"
            >
              NEXT
              <span className="font-body text-lg font-bold transition-transform [-webkit-text-stroke:0px] group-hover:translate-x-2 group-hover:scale-125 group-hover:[-webkit-text-stroke:0.6px_currentColor]">
                →
              </span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </nav>
    </article>
  );
}
