import Image from "next/image";
import Link from "next/link";

import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { GalleryGrid } from "@/components/work/gallery-grid";
import { HeroLightbox } from "@/components/work/hero-lightbox";
import { ProjectVideo } from "@/components/work/project-video";
import { ImageStack } from "@/components/work/image-stack";
import { PosterGrid } from "@/components/work/poster-grid";
import { ProjectLightboxProvider } from "@/components/work/project-lightbox-context";
import { ProjectTitle } from "@/components/work/project-title";
import type { Project, ProjectImage } from "@/lib/projects";
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

/**
 * Every pixel of a project detail page below the header chrome — header,
 * write-up, hero and gallery, in whatever order/combination this
 * project's fields select. The single source both `/work/[slug]`'s real
 * page AND ProjectStackSwipe's StackPeek render from, so the peek shown
 * mid-swipe is *literally* the destination page's own markup, not a
 * hand-rolled approximation of it — "the page underneath (next project)
 * needs to mirror exactly what will appear... has to mirror exactly what
 * the next project looks like," per Josh, after a first cut (a simplified
 * title + single hero image) visibly mismatched real pages that use
 * heroPair, poster-grid, square corners, or anything else beyond the
 * plain single-hero case. StackPeek clips this to one viewport height via
 * `overflow: hidden` on its own wrapper rather than this component trying
 * to know it's being previewed — same markup either way, just how much of
 * it ends up visible differs by context.
 */
export function ProjectContent({ project }: { project: Project }) {
  const [firstImage, secondImage, ...restImages] = project.gallery;

  const meta = [
    { label: "Client", value: project.client },
    { label: "Year", value: project.yearLabel ?? String(project.year) },
    { label: "Discipline", value: project.discipline },
    { label: "Deliverables", value: project.deliverables },
  ];

  const displayTitle = toDisplayTitle(project.title);
  // Below md, a multi-word title breaks before its last word — at
  // type-display's mobile floor a short two-word title ("ALPHABET SOUP")
  // can just squeeze onto one cramped line, while longer ones wrap
  // anyway, so titles read inconsistently phone to phone. "The project
  // name needs to be on two lines," per Josh. Breaking before the last
  // word (not one-word-per-line) keeps three-word titles ("The Gay
  // Divide") to exactly two lines as well. The split is computed here but
  // rendered by ProjectTitle (a client component — see its own doc
  // comment), which also shrinks the font if either resulting line is
  // still too wide for the viewport.
  const displayTitleWords = displayTitle.split(" ");
  const displayTitleHead = displayTitleWords.slice(0, -1).join(" ");
  const displayTitleLast = displayTitleWords[displayTitleWords.length - 1];
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
    // Mobile-only "card" presentation -- "on mobile when you open a
    // project it opens up a 'card' with curved corners, (very apple)
    // this makes it swipe a lot cleaner," per Josh, after the swipe's
    // own shadow/corner/safe-area patches (all reactive fixes chasing
    // symptoms of the page running edge-to-edge) weren't reading right
    // together. Making the card permanent -- part of the page's own
    // normal presentation, not something ProjectStackSwipe toggles on
    // only while dragging -- means the swipe inherits it for free: the
    // slab and both peeks all render this exact component, so the
    // rounding, margin and shadow are already correct and already
    // moving with the content before any drag-specific code has to
    // think about it. All max-md: scoped -- desktop keeps rendering
    // exactly as it always has, an invisible, unstyled wrapper at that
    // breakpoint. overflow-hidden is safe here despite genuinely
    // clipping content now (needed for the rounded corners to clip a
    // full-bleed image rather than just rounding the background behind
    // its square one): WriteUp's credits column below is only
    // `md:sticky`, so there's no sticky element in the DOM at any width
    // this wrapper actually applies overflow-hidden at. Shadow only,
    // no colour contrast, for the "floating" read -- both this and the
    // page underneath are bg-canvas, matching how iOS's own card
    // surfaces are frequently the same colour as what's behind them,
    // distinguished by elevation rather than a competing surface tone.
    <div className="max-md:mx-3 max-md:mt-3 max-md:overflow-hidden max-md:rounded-frame max-md:bg-canvas max-md:shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
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
              <ProjectTitle
                head={displayTitleHead}
                last={displayTitleLast}
                className="type-display max-w-4xl leading-[1.1] text-accent"
              />

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
                  <div className="grid gap-6 md:grid-cols-2 md:gap-8">
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
    </div>
  );
}
