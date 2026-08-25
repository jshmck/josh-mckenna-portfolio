"use client";

import { useMemo, useState } from "react";

import { ProjectCard } from "@/components/work/project-card";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { getCardHoverImage } from "@/lib/projects";
import type { ImageRatio, Project, ProjectCategory } from "@/lib/projects";

type WorkGalleryProps = {
  projects: Project[];
  categories: ProjectCategory[];
  /** Only the standalone /work page wants the top illustration row --
   *  Home embeds this same component for its "#home-work" section, and
   *  that row isn't meant to duplicate there. Defaults true since /work
   *  is the more common caller; Home explicitly opts out. */
  showIllustrations?: boolean;
};

type Filter = ProjectCategory | "All";

/**
 * Ratio rhythm for the masonry columns. Cycling a fixed sequence rather than
 * randomising keeps the grid's staggered look identical between server and
 * client renders — random heights would hydrate mismatched.
 */
const RATIO_CYCLE: ImageRatio[] = ["4/5", "3/4", "1/1", "5/4", "3/4", "4/5"];

/** Top-of-page illustration row, /work only (see showIllustrations
 *  above). Lives here rather than in app/work/page.tsx because it used
 *  to react to the active filter category -- that per-category logic
 *  was tried and reverted, but the row stayed here since this is still
 *  the natural place to key it off `filter` once real per-category art
 *  exists. Same pair regardless of filter for now.
 *
 *  height is a clamp(), not a flat 115 -- at a flat height the pair's
 *  combined width (twingo ~236px + ipad ~168px + the row's gap) doesn't
 *  fit a phone-width container and wraps to two lines. clamp's preferred
 *  value (20vw) only drops below its 115px ceiling under ~575px of
 *  viewport width, so every breakpoint this project treats as "desktop"
 *  renders at exactly 115px, identical to before -- only phones shrink,
 *  continuously rather than snapping at a breakpoint. */
const ILLUSTRATIONS = [
  {
    src: "/illustrations/twingo-green-final.png",
    aspect: "1350/656",
    height: "clamp(60px, 20vw, 115px)",
  },
  {
    src: "/illustrations/ipad.png",
    aspect: "961/655",
    height: "clamp(60px, 20vw, 115px)",
  },
];

/** Rainbow fill, top to bottom — bright/saturated to match Josh's mockup
 *  rather than the deeper "official" flag hex values. */
const PRIDE_STRIPES = [
  "#F04C3B",
  "#F7941D",
  "#FDE94B",
  "#6DDB4E",
  "#57B8F2",
  "#A98FE5",
];

/** Concentric rings around the pill, outermost first — pink, then light
 *  blue, then white, echoing the trans flag before the rainbow fill
 *  starts. Each is a full rounded-pill layer inset a bit further than
 *  the last, so the layer beneath shows through as a ring. */
const PRIDE_RINGS = ["#F7A0C4", "#7DD3F0", "#FFFFFF"];

const prideStripeGradient = `linear-gradient(to bottom, ${PRIDE_STRIPES.map(
  (color, i) =>
    `${color} ${(i / PRIDE_STRIPES.length) * 100}% ${((i + 1) / PRIDE_STRIPES.length) * 100}%`,
).join(", ")})`;

/**
 * The "Pride" filter pill only — everywhere else in the row is the plain
 * bordered/filled button below. On hover it reveals a pride-flag treatment
 * underneath the label (pink/light-blue/white rings around a rainbow
 * fill), pure CSS, no image asset. Idle and active states otherwise match
 * every other pill so it doesn't stand out until you touch it. Hover
 * bounce (scale-105, duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)])
 * matches BackToTop's exact recipe, not the simpler asymmetric-easing
 * scale used on plain text links — this is a filled/outlined pill like
 * that button, not a bare link.
 *
 * The rainbow fill pans while hovered (rainbow-pan keyframes, globals.css)
 * — the same background-position-over-background-size trick shadcn/Magic
 * UI's rainbow-button uses, adapted to this pill's existing vertical
 * stripe gradient rather than porting their border-clip layering. A
 * shift of exactly one background-size length (200%) loops seamlessly
 * regardless of the gradient's own stops, so it needs no manual
 * duplicate-stop authoring. Plain CSS `animation`, so the sitewide
 * prefers-reduced-motion rule already neutralises it — no JS guard
 * needed here, unlike the hero/marquee's rAF-driven motion.
 *
 * Plain CSS `uppercase`, not toWaldeckCase() — tried the lowercase quirk
 * here too, but at chip scale it read as a mistake rather than a
 * deliberate brand detail. Same exemption as the project prev/next nav.
 *
 * Border stays border-ink on hover rather than going transparent (only
 * active drops it, matching the other chips). It used to disappear on
 * hover to let the ring reveal show through, but that meant the pill's
 * silhouette had nothing crisp to visibly scale during the hover bounce
 * — measured it, the box and text were both scaling by the correct
 * 1.05x, but with no stable edge the growth just wasn't legible, so it
 * read as "only the text moves." The rings sit at inset 0/2/4/6px inside
 * the border, so a visible outline doesn't clash with them. Hover border
 * colour is the outer ring's own pink (#F7A0C4), not border-ink -- solid
 * black read as a harsh line cutting across the rainbow reveal; the pink
 * reads as part of the flag treatment instead.
 *
 * The reveal is pure hover:, which is invisible on touch -- Tailwind's
 * hover: variant compiles to @media (hover: hover), deliberately excluding
 * coarse-pointer devices so a tap never leaves a stuck hover state. That
 * meant the flag never showed at all on mobile, and a filter pill has no
 * natural "hover to discover" moment on touch anyway. Fix: on
 * pointer-coarse devices (real @media (pointer: coarse), unrelated to
 * hover), the rings + panning rainbow fill play once automatically a
 * moment after the page loads (pride-intro/rainbow-pan-intro keyframes,
 * globals.css) instead of waiting on interaction, then settle back to the
 * plain resting pill — a one-shot "there's more here" preview rather than
 * a permanently-different mobile state. Fine-pointer devices are
 * untouched: pointer-coarse: never matches a mouse, so desktop's
 * hover-only behaviour is unchanged.
 */
function PrideFilterButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`font-display group relative overflow-hidden rounded-full border px-4 py-2 text-[11px] font-waldeck-medium uppercase tracking-[0.02em] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 ${
        active
          ? "border-transparent bg-brand text-canvas"
          : "border-ink text-ink-muted hover:border-[#F7A0C4] hover:text-ink pointer-coarse:animate-[pride-border-intro_2.4s_ease-in-out_500ms_1]"
      }`}
    >
      {PRIDE_RINGS.map((color, i) => (
        <span
          key={color}
          aria-hidden="true"
          className="absolute rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-coarse:animate-[pride-intro_2.4s_ease-in-out_500ms_1]"
          style={{ inset: `${i * 2}px`, backgroundColor: color }}
        />
      ))}
      <span
        aria-hidden="true"
        className="absolute rounded-full opacity-0 transition-opacity duration-300 group-hover:animate-[rainbow-pan_1.5s_linear_infinite] group-hover:opacity-100 pointer-coarse:animate-[rainbow-pan-intro_2.4s_ease-in-out_500ms_1]"
        style={{
          inset: `${PRIDE_RINGS.length * 2}px`,
          background: prideStripeGradient,
          backgroundSize: "100% 200%",
        }}
      />
      <span className="relative z-10 transition-colors duration-300 group-hover:text-black">
        Pride
      </span>
    </button>
  );
}

/** One masonry card, sized off RATIO_CYCLE unless the project overrides it —
 *  shared between the plain masonry blocks and the bento row's narrow cell
 *  so both stay in sync with the same cardImage/hoverImage/priority logic.
 *  `sizes` defaults to a normal third-width card; the bento row's wide cell
 *  passes its own — it renders at roughly double that width (spans 2 of 3
 *  columns), and requesting the narrow card's smaller source there is what
 *  made the wide crop look soft/pixelated. */
function MasonryCard({
  project,
  index,
  sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  project: Project;
  index: number;
  sizes?: string;
}) {
  return (
    <ProjectCard
      project={project}
      // cardImage lets a project override its lead image (la-pride);
      // hoverImage crossfades to another image from the same
      // project wherever one's available (getCardHoverImage).
      image={project.cardImage}
      ratio={project.cardRatio ?? RATIO_CYCLE[index % RATIO_CYCLE.length]}
      caption="hover"
      motion="quiet"
      parallax
      hoverImage={getCardHoverImage(project)}
      sizes={sizes}
      priority={index < 3}
    />
  );
}

export function WorkGallery({
  projects,
  categories,
  showIllustrations = true,
}: WorkGalleryProps) {
  const [filter, setFilter] = useState<Filter>("All");

  const visible = useMemo(
    () =>
      filter === "All"
        ? projects
        : projects.filter((project) => project.categories.includes(filter)),
    [filter, projects],
  );

  /**
   * A `cardSpan: 2` project breaks the masonry into three segments: the
   * normal column flow up to that card, a dedicated 2-column bento row for
   * it plus whichever project follows, then normal column flow resumes.
   * Index stays global across all three segments (not reset per-segment) so
   * RATIO_CYCLE's rhythm and the first-3 `priority` preload are unaffected
   * by the carve-out. Falls back to a single segment when no visible
   * project (or the active filter cuts it) carries cardSpan.
   */
  const indexed = visible.map((project, index) => ({ project, index }));
  const wideIndex = indexed.findIndex(({ project }) => project.cardSpan === 2);
  const hasWide = wideIndex !== -1;
  const pairIndex = hasWide && wideIndex + 1 < indexed.length ? wideIndex + 1 : -1;

  const before = hasWide ? indexed.slice(0, wideIndex) : indexed;
  const wide = hasWide ? indexed[wideIndex] : null;
  const pairAfter = pairIndex !== -1 ? indexed[pairIndex] : null;
  const after = hasWide ? indexed.slice(pairIndex !== -1 ? pairIndex + 1 : wideIndex + 1) : [];

  const filters: Filter[] = ["All", ...categories];

  return (
    <>
      {/* Static -- no orbit, no drift -- but each leans toward the cursor
          on hover, same tilt math as the homepage hero's floating
          objects. See components/ui/tilt-illustration.tsx. Same pair on
          every filter for now -- tried hiding it / swapping to a
          Pride-specific piece per category, but Josh wants to build
          real per-category illustrations later rather than have this
          guess at it. /work only (showIllustrations) -- moving this row
          into WorkGallery made it start showing up on Home's embedded
          gallery too, which it never did before. */}
      {showIllustrations && (
        <div className="mb-10 flex flex-nowrap items-end gap-4 sm:gap-6">
          {ILLUSTRATIONS.map(({ src, aspect, height }) => (
            <TiltIllustration key={src} src={src} aspect={aspect} height={height} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter work by discipline">
        {filters.map((option) => {
          const active = filter === option;

          if (option === "Pride") {
            return (
              <PrideFilterButton
                key={option}
                active={active}
                onClick={() => setFilter(option)}
              />
            );
          }

          return (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              aria-pressed={active}
              className={`font-display rounded-full px-4 py-2 text-[11px] font-waldeck-medium uppercase tracking-[0.02em] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 ${
                active
                  ? "bg-brand text-canvas"
                  : "border border-ink text-ink-muted hover:border-brand hover:text-brand"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* CSS multi-column gives true masonry flow and reflows cleanly when the
          filter changes — no measuring, no layout JS. A cardSpan project
          splits this into up to three stacked segments (see `before` /
          `wide` / `after` above) rather than trying to make one container
          do both true column-masonry AND bento spanning — CSS multi-column
          has no partial cross-column span, only column-span: all (which
          breaks a card out full-width, not the 2-of-3 bento look Josh
          wanted), so the spanning card gets pulled into its own CSS Grid
          row instead. */}
      <div className="mt-12 space-y-8">
        {before.length > 0 && (
          <div className="gap-8 [column-fill:balance] columns-1 md:columns-2 lg:columns-3">
            {before.map(({ project, index }) => (
              <div key={project.slug} className="mb-8 break-inside-avoid">
                <MasonryCard project={project} index={index} />
              </div>
            ))}
          </div>
        )}

        {wide && (
          // items-start, not the grid default (stretch) — stretching would
          // force the shorter of the two cards to distort past its own
          // aspect-ratio to fill the taller one's row height. Left as-is,
          // each card just keeps its own natural height even if that means
          // the shorter one doesn't fill the row.
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2">
              <MasonryCard
                project={wide.project}
                index={wide.index}
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </div>
            {pairAfter && <MasonryCard project={pairAfter.project} index={pairAfter.index} />}
          </div>
        )}

        {after.length > 0 && (
          <div className="gap-8 [column-fill:balance] columns-1 md:columns-2 lg:columns-3">
            {after.map(({ project, index }) => (
              <div key={project.slug} className="mb-8 break-inside-avoid">
                <MasonryCard project={project} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Not visible — announces the filtered count to screen readers only.
          Sighted users see the grid change; there's no visual equivalent of
          that for a screen reader, so this fills the gap without cluttering
          the page. */}
      <p aria-live="polite" className="sr-only">
        {visible.length} {visible.length === 1 ? "piece" : "pieces"}
        {filter !== "All" ? ` in ${filter}` : ""}
      </p>
    </>
  );
}
