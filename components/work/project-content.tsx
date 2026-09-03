import Image from "next/image";
import Link from "next/link";

import { BackToTopLink } from "@/components/ui/back-to-top-link";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { GalleryGrid } from "@/components/work/gallery-grid";
import { HeroLightbox } from "@/components/work/hero-lightbox";
import { ProjectVideo } from "@/components/work/project-video";
import { ImageStack } from "@/components/work/image-stack";
import { PosterGrid } from "@/components/work/poster-grid";
import { ProjectLightboxProvider } from "@/components/work/project-lightbox-context";
import { ProjectTitle } from "@/components/work/project-title";
import { getProjectNeighbours, type Project, type ProjectImage } from "@/lib/projects";

/** Splits a brief paragraph on a single `[label](/href)` cross-link — the
 *  only markdown this field supports, for pointing between related project
 *  pages (e.g. a 3D piece referencing the flat illustration it's based on). */
function renderBriefParagraph(paragraph: string) {
  const match = paragraph.match(/^([\s\S]*)\[(.+?)\]\((\/[^)]+)\)([\s\S]*)$/);
  if (!match) return paragraph;
  const [, before, label, href, after] = match;
  return (
    <>
      {before}
      <Link
        href={href}
        className="underline underline-offset-2 hover:text-accent"
      >
        {label}
      </Link>
      {after}
    </>
  );
}

/** The brief + sticky credits sidebar. Shared between the default layout
 *  (after the hero) and "grid" layout (before the gallery) so the two
 *  placements can't drift out of sync. */
function WriteUp({ project, leads = false }: { project: Project; leads?: boolean }) {
  return (
    // max-md:py-10 — the write-up's 80px of breathing room above and
    // below reads right on desktop but as a hole between sections on a
    // phone ("the spacing on mobile between the sections and the top of
    // the imagery," per Josh) — halved below md, desktop untouched.
    // `leads` (the poster-grid placement, where this text opens the page
    // instead of the hero): mobile top padding drops to 0 so the text
    // sits on the header's own 32px seam, same as an image would —
    // "on the occasion that the project has text before image (Rooted
    // journal, beefbar etc) the text could be tighter," per Josh.
    <div
      className={`mx-auto grid max-w-frame gap-14 px-6 py-20 max-md:py-10 md:grid-cols-[1fr_260px] md:px-gutter ${leads ? "max-md:pt-0" : ""}`}
    >
      <div className="max-w-2xl">
        {project.brief.map((paragraph, index) => (
          <p
            key={index}
            className={`type-lede text-ink-muted ${index > 0 ? "mt-6" : ""}`}
          >
            {renderBriefParagraph(paragraph)}
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

  // Prev/next derived here rather than passed in as props --
  // ProjectContent is also rendered by ProjectStackSwipe's StackPeek,
  // and computing them from the project itself means the peek's
  // breadcrumb arrows mirror the destination page's exactly with no
  // prop plumbing to keep in sync. Part of the floating-chrome
  // teardown: "I dont want the bubbly frost nav bars to live anywhere
  // but the header... the arrows for previous/next project need to live
  // more like the CLIENT, YEAR caption theme... along the same line as
  // WORK / WAGAMAMA PRIDE," per Josh -- these replace BackToTop's
  // frosted chevron circles as the project-to-project navigation.
  // (The mobile swipe dots used to render here too, in the breadcrumb
  // zone -- moved to ProjectStackSwipe as a floating overlay, "the dots
  // have to hover and have an animation as we swipe between projects,"
  // per Josh: inside the card they translated away with the page
  // mid-swipe, exactly when they were supposed to be doing their job.)
  const { previous, next } = getProjectNeighbours(project.slug);

  const meta = [
    { label: "Client", value: project.client },
    { label: "Year", value: project.yearLabel ?? String(project.year) },
    { label: "Discipline", value: project.discipline },
    { label: "Deliverables", value: project.deliverables },
  ];

  // The h1 renders project.title as stored — natural casing ("Wagamama
  // Pride"), the sitewide universal title rule.
  // Below md, a multi-word title breaks before its last word — at the
  // title's mobile floor a short two-word title ("Alphabet Soup") can
  // just squeeze onto one cramped line, while longer ones wrap anyway,
  // so titles read inconsistently phone to phone. "The project name
  // needs to be on two lines," per Josh. Breaking before the last word
  // (not one-word-per-line) keeps three-word titles ("The Gay Divide")
  // to exactly two lines as well. The split is computed here but
  // rendered by ProjectTitle (a client component — see its own doc
  // comment), which also shrinks the font if either resulting line is
  // still too wide for the viewport.
  const displayTitleWords = project.title.split(" ");
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
        ? project.heroPair
          ? [project.hero, project.heroPair]
          : [project.hero]
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
    // Two-layer shadow, tuned to stay inside the 12px mt-3 margin without
    // vanishing there. "the top of the card's shadow interferes with the
    // header," per Josh, first fixed by swapping to Tailwind's shadow-xl
    // -- but its negative spread pushes upward reach to exactly zero, so
    // the card had no shadow at all right where the header meets it,
    // reading as flush with the header rather than floating below it:
    // "without the top shadow it doesn't read as a card." Both ends need
    // to be true at once -- visible in the gap, invisible past it -- so
    // this is a custom pair, not a stock utility: a tight "contact"
    // layer (2px offset, 6px blur) reaches only 4px above the card's own
    // top edge, and a softer "ambient" layer (8px offset, 18px blur)
    // reaches 10px -- both comfortably inside the 12px margin (blur -
    // offset, same reach math as shadow-xl's own technique), so neither
    // touches the header's own 88px band regardless of scroll or swipe
    // state, while the card still reads as elevated on every edge,
    // including the top.
    //
    // Shadow and overflow-hidden are on two different elements now, not
    // one -- "the drop shadow is solid white? still square, needs to be
    // a shadow that you can see through," per Josh, seen live during a
    // swipe. box-shadow and overflow-hidden together on the exact same
    // rounded element is a known Safari compositing trap: Safari can
    // paint the shadow as an opaque solid block with hard corners
    // instead of a soft translucent gradient once that element is also
    // inside an animating/transformed ancestor (here, the swipe slab's
    // live transform), rather than reliably clipping-then-shadowing in
    // the right order. The outer div below owns only the shadow, margin
    // and rounding (no overflow-hidden, so nothing about painting the
    // shadow can interact with clipping); the inner div owns only the
    // clipping (overflow-hidden + the same rounding, so a full-bleed
    // image still respects the corner) and the canvas fill. Structurally
    // immune to the bug rather than chasing which specific combination
    // of properties triggers it.
    // No bottom margin, deliberately -- the card's shadowed edge IS the
    // curtain's edge. A bottom gap went through four passes (0 -> 12 ->
    // 24 -> 40px, each per Josh while the footer still sat statically
    // below the card), but once the footer became the curtain reveal, a
    // margin here turned into a bug: main's opaque background paints
    // under a child's margin too, so the gap rode along below the card
    // as a card-coloured white apron -- invisible over canvas, but
    // squarely covering the footer's icons mid-reveal, right under the
    // card's shadow ("bottom of a project card hovering over the social
    // icons in the footer and a white block under the shadow of the
    // card is covering the icons," per Josh, after two earlier reports
    // circled the same block: "the white is covering the t&c" and
    // "still solid under the shadow"). With the margin gone, main ends
    // exactly at the card's edge, the reveal starts at the rounded
    // corner, and the only thing cast over the footer is the shadow --
    // the same layered read as the card sliding under the nav at the
    // top. Air between the card's corner and the footer's content now
    // comes from the footer's own top padding, not from an apron on
    // this side of the curtain.
    <div className="max-md:mx-3 max-md:mt-3 max-md:rounded-frame max-md:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_8px_18px_rgba(0,0,0,0.10)]">
      <div className="max-md:overflow-hidden max-md:rounded-frame max-md:bg-canvas">
        {/* max-md:pb-8 — the header's 64px bottom padding stacked on the
            imagery block's own 48px top padding put ~112px of dead air
            between the meta labels and the first image on a phone ("the
            spacing on mobile between the sections and the top of the
            imagery," per Josh). 32px here + 0 on the imagery containers
            below closes that to one clean gap; desktop untouched. */}
        <header className="py-16 max-md:pb-8 md:py-[60px]">
          <div className="mx-auto max-w-frame px-6 md:px-gutter">
            {/* Breadcrumb left, prev/next arrows right -- one line, one
                caption language, on every breakpoint. The glyphs sit
                larger than type-label's 11px (mono </> glyphs render
                visibly small for their em box, same reason the lightbox
                sized its chevrons up past the word scale) with padding +
                matching negative margins growing the tap target well
                past the glyph without moving anything visually -- the
                same enlarged-hit-box trick as the header's nav words.
                active: mirrors hover: since a tap never fires hover. */}
            <div className="flex items-center justify-between gap-4">
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
              {(previous || next) && (
                <p className="flex shrink-0 items-center font-mono text-[16px] text-ink">
                  {previous && (
                    <Link
                      href={`/work/${previous.slug}`}
                      aria-label="Previous project"
                      className="-m-3 inline-block p-3 transition-[font-weight,transform] duration-200 ease-in-out hover:scale-110 hover:font-bold hover:duration-300 hover:ease-drift active:scale-110 active:font-bold"
                    >
                      {"<"}
                    </Link>
                  )}
                  {previous && next && <span className="w-5" aria-hidden="true" />}
                  {next && (
                    <Link
                      href={`/work/${next.slug}`}
                      aria-label="Next project"
                      className="-m-3 inline-block p-3 transition-[font-weight,transform] duration-200 ease-in-out hover:scale-110 hover:font-bold hover:duration-300 hover:ease-drift active:scale-110 active:font-bold"
                    >
                      {">"}
                    </Link>
                  )}
                </p>
              )}
            </div>

            <div className="mt-6 flex items-end gap-2">
              <div className="relative shrink-0">
                <ProjectTitle
                  head={displayTitleHead}
                  last={displayTitleLast}
                  className="type-heading max-w-4xl text-ink"
                />

              </div>

              {/* Currently unused — la-pride trialled this (its shield +
                  plate pair next to the title), got shrunk from 72% to
                  54%, then removed outright per Josh. The hook stays for
                  a future project's header art, same unhooked-not-deleted
                  treatment as the marquee: sat on the title's baseline,
                  anchored left after the title, width split evenly across
                  the pieces (54% total, small gap). */}
              {headerIllustrations && (
                <div className="hidden min-w-0 flex-1 items-end gap-2 md:flex">
                  {headerIllustrations.map(({ src, aspect }) => (
                    <div
                      key={src}
                      className="relative shrink-0"
                      style={{
                        aspectRatio: aspect,
                        width: `${54 / headerIllustrations.length}%`,
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
          <WriteUp project={project} leads />
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
              <div className="mx-auto max-w-frame px-6 pt-12 max-md:pt-0 md:px-gutter">
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
                // Mobile pt: 0 normally (the header's own max-md:pb-8 is
                // the whole gap now), but when a videoRow leads the page
                // this container sits under it, not the header — keep the
                // inter-image gap-6 rhythm there instead.
                className={`mx-auto max-w-frame px-6 pt-12 md:px-gutter ${project.videoRow ? "max-md:pt-6" : "max-md:pt-0"}`}
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
                    project.heroPair ? (
                      // Three across — hero and heroPair share the same
                      // lightbox two-up HeroLightbox already renders for a
                      // pair, wrapped to take two of three grid columns so
                      // it lands the same width as the video's own column.
                      // Bum Selfie only for now: the turnaround clip reads
                      // as a third render, not a supplementary full-width
                      // clip below two renders that are already full width.
                      <div className="grid gap-6 md:grid-cols-3 md:gap-8">
                        <div className="md:col-span-2">
                          <HeroLightbox
                            images={heroLightboxImages}
                            captions={[
                              project.heroCaption,
                              project.heroPair.caption === false ? "" : project.heroPair.alt,
                            ]}
                            hideCaptions={project.hideHeroCaptions}
                            sizes="(max-width: 768px) 100vw, 33vw"
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
                    )
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
                      ratio={project.heroVideo.ratio}
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
                className="mx-auto max-w-frame px-6 pt-12 max-md:pt-0 md:px-gutter"
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
              <div className="mx-auto max-w-frame px-6 pb-40 max-md:pb-24 md:px-gutter">
                <GalleryGrid
                  leadImages={[firstImage, secondImage].filter((image): image is NonNullable<typeof image> => Boolean(image))}
                  images={restImages}
                  indexOffset={heroLightboxImages.length}
                />
              </div>
            ) : project.gallery.length > 0 || project.galleryVideo || project.galleryGif ? (
              // Gated on actually having something to show -- an empty
              // ImageStack still rendered its wrapper's full bottom
              // padding, so projects that end in text (Ford Bronco: hero
              // + brief, no gallery) carried ~duplicate bottom spacing:
              // the write-up's own padding plus a phantom gallery's.
              // Surfaced by "the spacing from last image or text to
              // bottom of project card is a bit too large," per Josh.
              <ImageStack
                images={project.gallery}
                indexOffset={heroLightboxImages.length}
                galleryVideo={project.galleryVideo}
                galleryGif={project.galleryGif}
                gallerySpans={project.gallerySpans}
              />
            ) : null}
          </ProjectLightboxProvider>
        )}

        {/* End-of-project nav, desktop only, all in normal flow -- the
            answer to "i need help deciding how to switch to next project
            when you're on it - on web," with "all inline, nothing
            fixed" as the chosen shape. Hidden below md -- mobile
            navigates by swipe (advertised by ProjectStackSwipe's
            floating dot strip) and
            iOS's status-bar tap covers scroll-to-top, per Josh.

            Plain caption words only. The first cut paired the NEXT
            PROJECT eyebrow with the destination's title in big Waldeck
            type-title + a hover-nudging arrow (the classic portfolio
            end-of-page teaser) -- "drop the project name and arrow,
            introduce previous project wording too but the small text is
            good," per Josh: the whole row runs at type-label now, both
            directions offered, everything in the same caption voice as
            BACK TO TOP on the left. Hover is the breadcrumb Work link's
            own scale + bold, kept identical across all three so the
            row reads as one family. */}
        <div className="mx-auto hidden max-w-frame items-center justify-between gap-8 px-6 pb-20 md:flex md:px-gutter">
          <BackToTopLink />
          <div className="flex items-center gap-10">
            {previous && (
              <Link
                href={`/work/${previous.slug}`}
                className="type-label inline-block text-ink transition-[font-weight,transform] duration-200 ease-in-out hover:scale-105 hover:font-bold hover:duration-300 hover:ease-drift"
              >
                Previous project
              </Link>
            )}
            {next && (
              <Link
                href={`/work/${next.slug}`}
                className="type-label inline-block text-ink transition-[font-weight,transform] duration-200 ease-in-out hover:scale-105 hover:font-bold hover:duration-300 hover:ease-drift"
              >
                Next project
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
