import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Plate } from "@/components/ui/plate";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { GalleryGrid } from "@/components/work/gallery-grid";
import { ProjectVideo } from "@/components/work/project-video";
import { ImageStack } from "@/components/work/image-stack";
import { PosterGrid } from "@/components/work/poster-grid";
import { getProject, getProjectNeighbours, projects, type Project } from "@/lib/projects";
import { toWaldeckCase } from "@/lib/waldeck-case";

/**
 * project.title itself keeps normal casing for the breadcrumb, gallery
 * cards and metadata — only the big display h1 gets the Waldeck-casing
 * treatment (see lib/waldeck-case.ts for the rule and why).
 */
function toDisplayTitle(title: string) {
  return toWaldeckCase(title);
}

/** The brief + sticky credits sidebar. Shared between the default layout
 *  (after the hero) and "grid" layout (before the gallery) so the two
 *  placements can't drift out of sync. */
function WriteUp({ project }: { project: Project }) {
  return (
    <div className="mx-auto grid max-w-frame gap-14 px-6 py-20 md:grid-cols-[1fr_260px] md:px-gutter">
      <div className="max-w-2xl">
        {project.brief.map((paragraph, index) => (
          <p
            key={index}
            className={`type-lede text-ink-muted ${index > 0 ? "mt-6" : ""}`}
          >
            {paragraph}
          </p>
        ))}
      </div>

      {/* Pins while the write-up scrolls past, per the wireframe. */}
      <aside className="h-fit md:sticky md:top-[112px]">
        <dl className="space-y-4">
          {project.credits.map((credit) => (
            <div key={credit.role}>
              <dt className="type-label text-ink-muted">{credit.role}</dt>
              <dd className="mt-1 font-body text-[15px] font-medium text-ink">
                {credit.name}
              </dd>
            </div>
          ))}
        </dl>

        {/* Trial (la-pride only for now): small pieces stacked under the
            credits, same lean-toward-cursor hover as the /work page's
            top illustration row. */}
        {project.creditsIllustrations && (
          <div className="mt-8 flex flex-col items-start gap-6">
            {project.creditsIllustrations.map(({ src, aspect }) => (
              <TiltIllustration key={src} src={src} aspect={aspect} width={140} />
            ))}
          </div>
        )}
      </aside>
    </div>
  );
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
    description: `${project.summary} ${project.discipline} for ${project.client}, ${project.yearLabel ?? project.year}.`,
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
    { label: "Year", value: project.yearLabel ?? String(project.year) },
    { label: "Discipline", value: project.discipline },
    { label: "Deliverables", value: project.deliverables },
  ];

  const displayTitle = toDisplayTitle(project.title);
  const headerIllustrations = project.headerIllustrations;

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

          <div className="mt-6 flex items-end gap-2">
            <div className="relative shrink-0">
              <h1 className="type-display max-w-4xl leading-[1.1] text-accent">
                {displayTitle}
              </h1>

              {/* Trial (First 3D Character only for now): the same cut-out
                  that bobs in the homepage hero, circling the title like a
                  sticker looping a quote card. Hidden below md — no room
                  for `orbit-loop`'s swing once the header stacks tighter. */}
              {project.floatingObject && (
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 hidden w-32 animate-[orbit-loop_18s_ease-in-out_infinite] md:block lg:w-44"
                  style={{ aspectRatio: project.floatingObject.aspect }}
                >
                  <Image
                    src={project.floatingObject.src}
                    alt=""
                    fill
                    sizes="176px"
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            {/* Trial (la-pride only for now): sat on the title's own
                baseline, anchored left right after the title and reduced
                shy of the frame's right edge below — static, no hover
                movement, unlike the /work page's top illustration row.
                Width splits evenly across however many pieces are given
                (96% total, small gap) so a two-up like la-pride's shield
                + plate reads as a pair sitting close together rather than
                stranded at opposite ends of the row. */}
            {headerIllustrations && (
              <div className="hidden min-w-0 flex-1 items-end gap-2 md:flex">
                {headerIllustrations.map(({ src, aspect }) => (
                  <div
                    key={src}
                    className="relative shrink-0"
                    style={{
                      aspectRatio: aspect,
                      width: `${96 / headerIllustrations.length}%`,
                    }}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="(max-width: 1344px) 40vw, 560px"
                      className="object-contain object-left"
                    />
                  </div>
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

      {/* Write-up + sticky credits. In "poster-grid" mode (Beefbar only for
          now) this reads before the gallery instead of after — with a
          couple dozen posters, making people scroll past the whole grid to
          reach the write-up buries it; everywhere else the hero comes
          first, per the wireframe. */}
      {project.galleryLayout === "poster-grid" && (
        <WriteUp project={project} />
      )}

      {/* Hero — heroPair (sound-of-driving only for now) renders it as a
          two-up instead of one full-width Plate, each with its own caption
          from its own `alt`. "poster-grid" (Beefbar only for now) skips the
          hero entirely and opens straight into every image as a grid
          instead — see PosterGrid. */}
      {project.galleryLayout === "poster-grid" ? (
        <PosterGrid
          images={[project.hero, ...project.gallery]}
          columns={project.posterGridColumns}
        />
      ) : (
        <>
          {project.heroSize !== "spot" && (
            <div className="mx-auto max-w-frame px-6 pt-12 md:px-gutter">
              {/* Video position: "top" (default, Nomad Wheels) is the main
                  showcase leading the page; "bottom" (Pato) is supplementary,
                  under the artwork it's showing off; "pair" (Last Call) sits
                  beside the still, inside the same two-up grid heroPair
                  would otherwise occupy. Jimny (no heroPair) has no images
                  to sit above or below, so position is moot — the video is
                  the whole hero slot either way. */}
              {project.heroVideo &&
                project.heroVideo.position !== "bottom" &&
                project.heroVideo.position !== "pair" && (
                  <div className={project.heroPair ? "mb-8" : undefined}>
                    <ProjectVideo
                      video={{
                        ...project.heroVideo,
                        poster: project.heroVideo.poster ?? project.hero.src,
                      }}
                      sound={project.heroVideo.sound}
                    />
                  </div>
                )}
              {project.heroPair || project.heroVideo?.position === "pair" ? (
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <Plate
                      image={project.hero}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                    <p className="type-label mt-3 text-ink-muted">
                      {project.heroCaption}
                    </p>
                  </div>
                  <div>
                    {project.heroVideo?.position === "pair" ? (
                      <ProjectVideo
                        video={{
                          ...project.heroVideo,
                          poster: project.heroVideo.poster,
                        }}
                        sound={project.heroVideo.sound}
                        ratio={project.heroVideo.ratio}
                      />
                    ) : (
                      project.heroPair && (
                        <>
                          <Plate
                            image={project.heroPair}
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          <p className="type-label mt-3 text-ink-muted">
                            {project.heroPair.alt}
                          </p>
                        </>
                      )
                    )}
                  </div>
                </div>
              ) : !project.heroVideo ? (
                <>
                  <Plate
                    image={project.hero}
                    sizes="(max-width: 1344px) 100vw, 1344px"
                    priority
                  />
                  <p className="type-label mt-3 text-ink-muted">
                    {project.heroCaption}
                  </p>
                </>
              ) : null}
              {project.heroVideo && project.heroVideo.position === "bottom" && (
                <div className={project.heroPair ? "mt-8" : undefined}>
                  <ProjectVideo
                    video={{
                      ...project.heroVideo,
                      poster: project.heroVideo.poster ?? project.hero.src,
                    }}
                    sound={project.heroVideo.sound}
                  />
                </div>
              )}
            </div>
          )}

          <WriteUp project={project} />

          {project.heroSize === "spot" && (
            // Runs below the write-up instead of above it, capped at a
            // modest width, no caption — a piece drawn to run at a few
            // centimetres next to magazine text looks wrong leading the
            // page at full-bleed size with a label under it.
            <div className="mx-auto max-w-frame px-6 pb-4 md:px-gutter">
              <div className="mx-auto max-w-lg">
                <Plate
                  image={project.hero}
                  sizes="(max-width: 768px) 100vw, 512px"
                  priority
                />
              </div>
            </div>
          )}

          {/* Trial (la-pride only for now, `galleryLayout: "grid"`): the
              classic tall two-up leads (key art + flyposted lineup), then
              everything after flows into a uniform, clickable two-column
              grid — closer to how James Junk's own project page presents
              the same shoot — rather than the standard gallery below.
              Leads and grid share one lightbox/cycle via GalleryGrid's
              `leadImages`. Every other project gets ImageStack — first two
              as a two-up, the rest full width, every frame opening
              full-size in its own shared lightbox. */}
          {project.galleryLayout === "grid" ? (
            <div className="mx-auto max-w-frame px-6 pb-20 md:px-gutter">
              <GalleryGrid
                leadImages={[firstImage, secondImage].filter((image): image is NonNullable<typeof image> => Boolean(image))}
                images={restImages}
              />
            </div>
          ) : (
            <ImageStack images={project.gallery} />
          )}
        </>
      )}

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
