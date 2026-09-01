import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackToTop } from "@/components/ui/back-to-top";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { GalleryGrid } from "@/components/work/gallery-grid";
import { HeroLightbox } from "@/components/work/hero-lightbox";
import { ProjectVideo } from "@/components/work/project-video";
import { ImageStack } from "@/components/work/image-stack";
import { PosterGrid } from "@/components/work/poster-grid";
import { ProjectLightboxProvider } from "@/components/work/project-lightbox-context";
import { getProject, getProjectNeighbours, projects, type Project, type ProjectImage } from "@/lib/projects";
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

  // The exact set of images HeroLightbox renders below, computed once so it
  // can double as the front slice of ProjectLightboxProvider's combined
  // cycle — see the render logic beneath for how each case (heroThird,
  // heroPair, heroVideo "pair", spot, hidden) picks its own images prop;
  // this mirrors that same set of cases so the two can never drift apart.
  const heroPairIsVideo = project.heroVideo?.position === "pair";
  const heroLightboxImages: ProjectImage[] = project.heroHiddenOnPage
    ? []
    : project.heroSize === "spot"
      ? [project.hero]
      : heroPairIsVideo
        ? [project.hero]
        : project.heroPair
          ? project.heroThird
            ? [project.hero, project.heroPair, project.heroThird]
            : [project.hero, project.heroPair]
          : project.heroVideo
            ? []
            : [project.hero];

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
                  className="absolute left-1/2 top-1/2 hidden w-32 animate-[orbit-loop_18s_linear_infinite] md:block lg:w-44"
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

      {/* Hero — heroPair renders it as a two-up instead of one full-width
          Plate. Every hero image opens in the same click-to-enlarge
          lightbox as the gallery below it, via HeroLightbox; `hero`'s
          caption is `heroCaption`, `heroPair`'s is its own `alt` (they
          aren't the same string on every project — see Sound of Driving).
          "poster-grid" (Beefbar only for now) skips the hero entirely and
          opens straight into every image as a grid instead — see
          PosterGrid. */}
      {project.galleryLayout === "poster-grid" ? (
        <PosterGrid
          images={[project.hero, ...project.gallery]}
          columns={project.posterGridColumns}
        />
      ) : (
        <ProjectLightboxProvider images={[...heroLightboxImages, ...project.gallery]}>
          {project.videoRow && (
            // Same grid-cols-3 recipe as a 3-count gallerySpans row (see
            // ImageStack) — same outer max-w-frame/gutter container, same
            // gap-8 — so the video frames land at the same width as the
            // packaging photos below them, not an arbitrary smaller cap.
            // Sits above `hero` — see Project.videoRow.
            <div className="mx-auto max-w-frame px-6 pt-12 md:px-gutter">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                {project.videoRow.map((video) => (
                  <div key={video.src}>
                    <ProjectVideo video={video} sound={video.sound} ratio="1/1" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.heroSize !== "spot" && !project.heroHiddenOnPage && (
            <div
              className="mx-auto max-w-frame px-6 pt-12 md:px-gutter"
              // Read by nav.tsx — see Project.navContrastLight's doc comment.
              data-nav-contrast={project.navContrastLight ? "light" : undefined}
            >
              {/* Video position: "top" (default, Nomad Wheels) is the main
                  showcase leading the page; "bottom" (Pato) is supplementary,
                  under the artwork it's showing off; "pair" (Last Call) sits
                  beside the still, inside the same two-up grid heroPair
                  would otherwise occupy; "outro" (Jimny) renders after the
                  write-up instead — see the block below WriteUp. */}
              {project.heroVideo &&
                project.heroVideo.position !== "bottom" &&
                project.heroVideo.position !== "pair" &&
                project.heroVideo.position !== "outro" && (
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
                project.heroVideo?.position === "pair" ? (
                  <div className="grid gap-8 md:grid-cols-2">
                    <div>
                      <HeroLightbox
                        images={heroLightboxImages}
                        captions={[project.heroCaption]}
                        hideCaptions={project.hideHeroCaptions}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div>
                      <ProjectVideo
                        video={{
                          ...project.heroVideo,
                          poster: project.heroVideo.poster,
                        }}
                        sound={project.heroVideo.sound}
                        ratio={project.heroVideo.ratio}
                      />
                    </div>
                  </div>
                ) : (
                  project.heroPair &&
                  (project.heroThird ? (
                    <HeroLightbox
                      images={heroLightboxImages}
                      captions={[
                        project.heroCaption,
                        project.heroPair.caption === false ? "" : project.heroPair.alt,
                        project.heroThird.caption === false ? "" : project.heroThird.alt,
                      ]}
                      hideCaptions={project.hideHeroCaptions}
                    />
                  ) : (
                    <HeroLightbox
                      images={heroLightboxImages}
                      captions={[
                        project.heroCaption,
                        project.heroPair.caption === false ? "" : project.heroPair.alt,
                      ]}
                      hideCaptions={project.hideHeroCaptions}
                    />
                  ))
                )
              ) : !project.heroVideo ? (
                <HeroLightbox
                  images={heroLightboxImages}
                  captions={[project.heroCaption]}
                  hideCaptions={project.hideHeroCaptions}
                />
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

          {project.heroSize === "spot" && !project.heroHiddenOnPage && (
            // Leads the page same as every other project's key art, per
            // Josh — moved above the write-up (was below) so single-image
            // projects read the same order as LA Pride etc. Still capped
            // to a modest width and uncaptioned: a piece drawn to run at
            // a few centimetres next to magazine text looks wrong blown
            // up to full frame width with a label under it. Click-to-
            // enlarge via HeroLightbox, same as every other hero image on
            // the site — captions stay off (captions=[""]) since this slot
            // was always meant to read uncaptioned.
            <div
              className="mx-auto max-w-frame px-6 pt-12 md:px-gutter"
              data-nav-contrast={project.navContrastLight ? "light" : undefined}
            >
              <div className="mx-auto max-w-lg">
                <HeroLightbox
                  images={heroLightboxImages}
                  captions={[""]}
                  sizes="(max-width: 768px) 100vw, 512px"
                />
              </div>
            </div>
          )}

          <WriteUp project={project} />

          {project.heroVideo?.position === "outro" && (
            // Closes the page instead of opening it — see the "outro"
            // case in Project.heroVideo's position doc comment.
            <div className="mx-auto max-w-frame px-6 pb-12 md:px-gutter">
              <ProjectVideo
                video={{
                  ...project.heroVideo,
                  poster: project.heroVideo.poster ?? project.hero.src,
                }}
                sound={project.heroVideo.sound}
                ratio={project.heroVideo.ratio}
              />
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
            <div className="mx-auto max-w-frame px-6 pb-40 md:px-gutter">
              <GalleryGrid
                leadImages={[firstImage, secondImage].filter((image): image is NonNullable<typeof image> => Boolean(image))}
                images={restImages}
                indexOffset={heroLightboxImages.length}
              />
            </div>
          ) : (
            <ImageStack
              images={project.gallery}
              indexOffset={heroLightboxImages.length}
              galleryVideo={project.galleryVideo}
              galleryGif={project.galleryGif}
              gallerySpans={project.gallerySpans}
            />
          )}
        </ProjectLightboxProvider>
      )}

      {/* The old Previous/All Work/Next footer nav is gone -- Back to Top
          now covers Previous/Next (reachable without scrolling past the
          whole gallery first, unlike this nav ever was), and "ALL WORK"
          was a second copy of the header's own "Work" link that ended up
          sitting in the exact same docked spot as the pill below, getting
          covered by it. "The new back to top covers the all work text
          anyway," per Josh -- rather than move it, it came out entirely.
          See BackToTop's own doc comment for the rest of this history. */}
      <BackToTop previous={previous} next={next} />
    </article>
  );
}
