"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useSyncExternalStore } from "react";

import { MasonryGrid } from "@/components/work/masonry-grid";
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

const CATEGORY_PARAM = "category";

/** Fired after `setFilter` writes `?category=` via `router.replace` --
 *  `history.replaceState` (which the router calls under the hood) doesn't
 *  raise `popstate` on its own, so the external-store hook below has no
 *  other way to notice a write it made itself. */
const FILTER_CHANGE_EVENT = "worklist:filter";

/** Reads the active filter back out of `?category=`. Backs a
 *  `useSyncExternalStore` (below) rather than a post-mount effect --
 *  `useSearchParams` would force this whole gallery out of static
 *  prerendering unless wrapped in its own Suspense boundary, which would
 *  mean shipping a fallback instead of real HTML for the page's main
 *  content, and setting state straight from an effect body just to seed
 *  it from `window` trips the "don't setState synchronously in an
 *  effect" rule. External-store subscription is the sanctioned way to
 *  read a value React doesn't own and react to it changing. */
function filterFromSearch(search: string, categories: ProjectCategory[]): Filter {
  const value = new URLSearchParams(search).get(CATEGORY_PARAM);
  return value && (categories as string[]).includes(value) ? (value as Filter) : "All";
}

function subscribeFilterQuery(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(FILTER_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(FILTER_CHANGE_EVENT, onChange);
  };
}

/** Server and first-hydration render both report "All" (matching
 *  useIsDesktopGrid's own reasoning just above) -- the real value from
 *  `?category=` lands a tick later once the store's snapshot can read
 *  `window`. */
function useFilterFromQuery(categories: ProjectCategory[]): Filter {
  return useSyncExternalStore(
    subscribeFilterQuery,
    () => filterFromSearch(window.location.search, categories),
    () => "All",
  );
}

/**
 * Ratio rhythm for the masonry columns. Cycling a fixed sequence rather than
 * randomising keeps the grid's staggered look identical between server and
 * client renders — random heights would hydrate mismatched.
 *
 * Two variants, not one: the six-wide spread this used to cycle through
 * everywhere (4/5, 3/4, 1/1, 5/4, 3/4, 4/5, ranging a full 0.75-1.25) read
 * as uneven rather than intentionally staggered once mobile's single
 * column stacked those cards directly on top of each other, so it was
 * trimmed to just 4/5 and 1/1 there. But that trim applied sitewide, and
 * on desktop's 2-3 column grid the wide spread was never the problem —
 * cutting it there instead made every card near-uniform height, so the
 * rare 2-span landscape card or transparency-adjacency reorder stood out
 * as a jarring outlier against that flat baseline ("the grid in web is
 * tighter... and uneven in some spaces," per Josh — mobile was meant to
 * be closer, not desktop too). Desktop keeps the original wide rhythm;
 * mobile keeps the calmer one. Pieces with a genuine landscape or
 * tall-portrait shape keep cropping nothing — they set their own
 * cardRatio and skip this cycle entirely, same as before.
 */
const RATIO_CYCLE_MOBILE: ImageRatio[] = ["4/5", "1/1"];
const RATIO_CYCLE_DESKTOP: ImageRatio[] = ["4/5", "3/4", "1/1", "5/4", "3/4", "4/5"];

/** Matches MasonryGrid's own MD_BREAKPOINT — desktop here means "at least
 *  the 2-column layout," not just the 3-column one, since the wide ratio
 *  rhythm reads fine across both and only mobile's single stack needed
 *  the calmer cycle. */
const DESKTOP_QUERY = "(min-width: 768px)";

function subscribeDesktopQuery(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Server and first-hydration render report `false` (mobile's cycle) —
 *  MasonryGrid's own columnCount defaults to 1 for the same reason, so
 *  this stays consistent with the layout it's feeding ratios into rather
 *  than mismatching it for one frame. */
function useIsDesktopGrid(): boolean {
  return useSyncExternalStore(
    subscribeDesktopQuery,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

/**
 * Any card at or past this width/height spans two masonry columns instead
 * of one — a true landscape image forced into a single narrow column
 * (both RATIO_CYCLE variants top out at 5/4 = 1.25) would run either badly
 * cropped or absurdly tall. 1.3 sits comfortably above that ceiling, so
 * nothing in either cycle crosses it by accident; only a genuinely
 * landscape cardRatio (UAL Booklets 16/10 = 1.6, Bombay Sapphire 3/2 = 1.5,
 * Wagamama Brighton 1111/640 ≈ 1.74) does.
 */
const LANDSCAPE_SPAN_RATIO = 1.3;

/** Top-of-page illustration row, /work only (see showIllustrations
 *  above). Lives here rather than in app/work/page.tsx because it used
 *  to react to the active filter category -- that per-category logic
 *  was tried and reverted, but the row stayed here since this is still
 *  the natural place to key it off `filter` once real per-category art
 *  exists. Same regardless of filter for now.
 *
 *  Was a pair (green Twingo + iPad) -- Josh dropped the Twingo once the
 *  row moved to a centered layout to match the nav/filter pills; a single
 *  centered illustration reads cleaner there than a pair would.
 *
 *  height is a clamp(), not a flat 115 -- at a flat height ipad's width
 *  doesn't fit a phone-width container and wraps. clamp's preferred value
 *  (20vw) only drops below its 115px ceiling under ~575px of viewport
 *  width, so every breakpoint this project treats as "desktop" renders at
 *  exactly 115px, identical to before -- only phones shrink, continuously
 *  rather than snapping at a breakpoint. */
const ILLUSTRATIONS = [
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
 * fill), pure CSS, no image asset. Idle otherwise matches every other pill
 * so it doesn't stand out until you touch it; once selected, the rings and
 * panning rainbow fill stay showing for as long as the filter is active,
 * rather than only while hovered/pressed — the rainbow-pan animation itself
 * is unconditional on the layer, gated purely by opacity, so there's no
 * animation restart/jump when hover and active overlap. Hover
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
 * natural "hover to discover" moment on touch anyway. First fix: on
 * pointer-coarse devices, the rings + panning rainbow fill played once
 * automatically a moment after the page loaded (the old pride-intro/
 * rainbow-pan-intro/pride-border-intro keyframes, since removed from
 * globals.css) — reverted, "I think it needs to happen on press," per
 * Josh: playing on load read as a glitch/flash rather than a deliberate
 * reveal, and gave no way to see it again afterwards short of reloading.
 * Now `pointer-coarse:group-active:` (and the button's own
 * `pointer-coarse:active:` for the border) plays the exact same reveal
 * hover already does on a fine pointer, but keyed to a touch-and-hold
 * instead — press, see the flag; release, it's gone, repeatable any
 * number of times. Stacked with pointer-coarse: throughout so fine-
 * pointer devices are untouched: pointer-coarse: never matches a mouse,
 * and a mouse click-and-hold already shows the identical reveal via
 * hover: regardless, so nothing here changes desktop's behaviour.
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
      className={`font-grotesque group relative overflow-hidden rounded-full border px-4 py-[9.5px] text-[11px] leading-none font-semibold uppercase tracking-[0.02em] text-trim-caps transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 ${
        active
          ? "border-transparent bg-brand text-canvas"
          : "border-ink text-ink-muted hover:border-[#F7A0C4] hover:text-ink pointer-coarse:active:border-[#F7A0C4] pointer-coarse:active:text-ink"
      }`}
    >
      {PRIDE_RINGS.map((color, i) => (
        <span
          key={color}
          aria-hidden="true"
          className={`absolute rounded-full transition-opacity duration-300 group-hover:opacity-100 pointer-coarse:group-active:opacity-100 ${active ? "opacity-100" : "opacity-0"}`}
          style={{ inset: `${i * 2}px`, backgroundColor: color }}
        />
      ))}
      <span
        aria-hidden="true"
        className={`absolute rounded-full animate-[rainbow-pan_1.5s_linear_infinite] transition-opacity duration-300 group-hover:opacity-100 pointer-coarse:group-active:opacity-100 ${active ? "opacity-100" : "opacity-0"}`}
        style={{
          inset: `${PRIDE_RINGS.length * 2}px`,
          background: prideStripeGradient,
          backgroundSize: "100% 200%",
        }}
      />
      <span
        className={`relative z-10 transition-colors duration-300 group-hover:text-black pointer-coarse:group-active:text-black ${active ? "text-black" : ""}`}
      >
        Pride
      </span>
    </button>
  );
}

/** Same ratio a card actually renders at — shared with MasonryGrid's
 *  bin-packing below so the packed heights match the real cards exactly. */
function effectiveCardRatio(project: Project, index: number, cycle: ImageRatio[]): ImageRatio {
  return project.cardRatio ?? cycle[index % cycle.length];
}

function ratioToNumber(ratio: ImageRatio): number {
  const [w, h] = ratio.split("/").map(Number);
  return w / h;
}

/** True when the card's actual rendered image (same fallback ProjectCard
 *  itself uses: cardImage, else hero) is a Plate `fit: "contain"` letterbox
 *  — see MasonryGrid's transparency-adjacency rule for why this matters. */
function isCardTransparent(project: Project): boolean {
  const image = project.cardImage ?? project.hero;
  return image.fit === "contain";
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
  ratio,
  sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  project: Project;
  index: number;
  ratio: ImageRatio;
  sizes?: string;
}) {
  return (
    <ProjectCard
      project={project}
      // cardImage lets a project override its lead image (la-pride);
      // hoverImage crossfades to another image from the same
      // project wherever one's available (getCardHoverImage).
      image={project.cardImage}
      ratio={ratio}
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
  const router = useRouter();
  const pathname = usePathname();
  const filter = useFilterFromQuery(categories);
  const ratioCycle = useIsDesktopGrid() ? RATIO_CYCLE_DESKTOP : RATIO_CYCLE_MOBILE;

  /** Keeps the URL in sync with the picked filter so it survives a visit
   *  to a project page and back -- previously this was local state only,
   *  so the back button always landed on the unfiltered grid. `scroll:
   *  false` matches every other in-place interaction on this page. */
  function setFilter(next: Filter) {
    const params = new URLSearchParams(window.location.search);
    if (next === "All") {
      params.delete(CATEGORY_PARAM);
    } else {
      params.set(CATEGORY_PARAM, next);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    window.dispatchEvent(new Event(FILTER_CHANGE_EVENT));
  }

  const visible = useMemo(
    () =>
      filter === "All"
        ? projects
        : projects.filter((project) => project.categories.includes(filter)),
    [filter, projects],
  );

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
        <div className="mb-10 flex flex-nowrap items-end justify-center gap-4 sm:gap-6">
          {ILLUSTRATIONS.map(({ src, aspect, height }) => (
            <TiltIllustration key={src} src={src} aspect={aspect} height={height} />
          ))}
        </div>
      )}

      <div
        className="flex flex-wrap justify-center gap-2"
        role="group"
        aria-label="Filter work by discipline"
      >
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
              className={`font-grotesque rounded-full px-4 py-[9.5px] text-[11px] leading-none font-semibold uppercase tracking-[0.02em] text-trim-caps transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 ${
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

      {/* True masonry via MasonryGrid (bin-packed from each card's known
          ratio, see that component's doc comment) — replaced a CSS
          multi-column attempt that left occasional large gaps, since
          column-fill: balance estimates column heights before it knows
          any card's real size. Landscape cards (ratio ≥ LANDSCAPE_SPAN_RATIO)
          span two columns automatically — MasonryGrid's bin-packer handles
          spanning items natively, so this needed no separate bento-row
          carve-out the way the old cardSpan flag did. `transparent` feeds
          MasonryGrid's other hard rule: two fit:"contain" cards (real-alpha
          art letterboxed on canvas) never seat side by side, since both
          surfaces match the page background and the seam between them
          disappears. */}
      <div className="mt-12">
        <MasonryGrid
          items={visible.map((project, index) => {
            const cardRatio = effectiveCardRatio(project, index, ratioCycle);
            const ratio = ratioToNumber(cardRatio);
            const span = ratio >= LANDSCAPE_SPAN_RATIO ? 2 : 1;
            return {
              key: project.slug,
              ratio,
              span,
              transparent: isCardTransparent(project),
              node: (
                <MasonryCard
                  project={project}
                  index={index}
                  ratio={cardRatio}
                  sizes={
                    span === 2
                      ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 66vw"
                      : undefined
                  }
                />
              ),
            };
          })}
        />
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
