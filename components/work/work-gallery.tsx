"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { MasonryGrid } from "@/components/work/masonry-grid";
import { ProjectCard } from "@/components/work/project-card";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { measureGalleryAnchorTop, projectSlugFromHref, recordBackTarget } from "@/lib/back-peek";
import { getCardHoverImage } from "@/lib/projects";
import type { ImageRatio, Project, ProjectCategory, ProjectImage } from "@/lib/projects";

export type Filter = ProjectCategory | "All";

type WorkGalleryProps = {
  projects: Project[];
  categories: ProjectCategory[];
  /** Only the standalone /work page wants the top illustration row --
   *  Home embeds this same component for its "#home-work" section, and
   *  that row isn't meant to duplicate there. Defaults true since /work
   *  is the more common caller; Home explicitly opts out. */
  showIllustrations?: boolean;
  /**
   * False renders a frozen, non-interactive snapshot instead of the live
   * gallery — used by the pull-down back peek (project-stack-swipe.tsx)
   * to mirror exactly what a project page's `router.back()` will land
   * on. Filter/search stop reading the live URL/local state (a project
   * page shares neither) and lock to `initialFilter`/`initialQuery`
   * instead; the entrance animation, search-sync listeners and the
   * click recorder below all no-op, since a peek is always rendered
   * inside a `pointer-events-none` ancestor anyway. Defaults true — the
   * two real pages (/work, Home) both want the live gallery.
   */
  interactive?: boolean;
  /** Frozen filter for a non-interactive peek. Ignored when interactive. */
  initialFilter?: Filter;
  /** Frozen search text for a non-interactive peek. Ignored when interactive. */
  initialQuery?: string;
  /**
   * Which page this live instance renders on — "work" for standalone
   * /work, "home" for Home's embedded section. Presence alone gates the
   * click recorder (see handleProjectLinkClick below): only a real,
   * interactive instance should ever write a back-peek record, so a
   * peek copy simply doesn't get this prop rather than needing its own
   * `interactive` check duplicated here.
   */
  recordContext?: "work" | "home";
};

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

/** Reserved height (px) for ProjectCard's mobile-only title strip —
 *  mt-2 (8px, deliberately tighter than MasonryGrid's 16px row gap so
 *  proximity ties the title to its own image, not the next card — see
 *  that gap's own comment) + a 15px/1.2-leading single truncated line
 *  (18px), plus a couple px of buffer against font-metric rounding. Every
 *  card here uses `caption="hover"`, so every one gains this strip at the
 *  single-column breakpoint (see MasonryGrid's mobileCaptionPx).
 *  Over-reserving by a couple px just leaves a hair more air below the
 *  shortest card in a row; under-reserving is the failure mode (captions
 *  overlapping the row beneath), so round up rather than measure exact. */
const MOBILE_CAPTION_RESERVE_PX = 28;

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
 * The "LGBTQ+" filter pill only — everywhere else in the row is the plain
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
        LGBTQ+
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
  image,
  hoverImage,
  sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  project: Project;
  index: number;
  ratio: ImageRatio;
  /** Lead-image override — WorkGallery passes the active filter's
   *  cardImageByCategory pick here so a filtered view can lead with a
   *  more on-topic image (see that field's doc comment). */
  image?: ProjectImage;
  /** Hover override, set alongside `image`: an overridden cover hovers
   *  back to the project's original lead ("the hover image has to be
   *  the original — LA when in murals will be the green logo mark, and
   *  wagamama the pink crowd," per Josh), instead of the usual
   *  getCardHoverImage pick. */
  hoverImage?: ProjectImage;
  sizes?: string;
}) {
  return (
    <ProjectCard
      project={project}
      // cardImage lets a project override its lead image (la-pride);
      // hoverImage crossfades to another image from the same
      // project wherever one's available (getCardHoverImage).
      image={image ?? project.cardImage}
      ratio={ratio}
      caption="hover"
      motion="shrink"
      // No scroll parallax on grid cards — the per-card drift moved
      // neighbouring edges by different amounts, so the fixed 32px
      // gutters read as uneven while scrolling ("it's the scrolling
      // movement you have set up," per Josh). Hover shrink and the
      // one-time reveal stay.
      hoverImage={hoverImage ?? getCardHoverImage(project)}
      sizes={sizes}
      priority={index < 3}
    />
  );
}

export function WorkGallery({
  projects,
  categories,
  showIllustrations = true,
  interactive = true,
  initialFilter,
  initialQuery,
  recordContext,
}: WorkGalleryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const urlFilter = useFilterFromQuery(categories);
  // A frozen peek never reads the live URL -- the project page it's
  // rendered on shares no `?category=` with the gallery it's mirroring
  // (see WorkGalleryProps.interactive's doc comment).
  const filter = interactive ? urlFilter : (initialFilter ?? "All");
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

  // Free-text search, local state only (unlike the category filter it
  // doesn't survive into the URL — a half-typed query isn't a view worth
  // bookmarking). ANDs with the category filter rather than replacing it.
  // A frozen peek seeds from initialQuery and never calls setQuery again.
  const [query, setQuery] = useState(interactive ? "" : (initialQuery ?? ""));
  // Collapsed to a bare mag-glass pill until focused — "no word for
  // SEARCH, just the mag glass in a small pill, then when you click an
  // x in a circle gloopy rolls to the right making space to type," per
  // Josh. Focus opens it (covers click and keyboard tab alike); blur
  // closes it again only when there's nothing typed.
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // The nav's Work drop-down carries its own search input on /work (see
  // nav.tsx) — it lives in a different tree, so it feeds this state via
  // a window event. A non-empty value also opens the in-page pill so
  // the active query is always visible somewhere once the menu closes.
  // Skipped entirely for a frozen peek — its input is inert (rendered
  // inside a pointer-events-none ancestor) and the nav's own search box
  // doesn't exist on a project page for this to listen for anyway.
  useEffect(() => {
    if (!interactive) return;
    const onSearch = (event: Event) => {
      const value = String((event as CustomEvent).detail ?? "");
      setQuery(value);
      setSearchOpen(!!value.trim());
      // Searching cancels the category outright (same rule as the
      // in-page input's onChange — see its comment).
      if (value.trim() && new URLSearchParams(window.location.search).get(CATEGORY_PARAM)) {
        setFilter("All");
      }
    };
    window.addEventListener("worklist:search", onSearch);
    return () => window.removeEventListener("worklist:search", onSearch);
    // Registered once — setFilter reads the live URL itself, so a stale
    // closure can't misread the active category.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive]);

  // The reverse rule: picking a real category ends the search ("should
  // using search cancel out category and it just searches ALL? i think
  // the latter makes more sense," per Josh — the two are exclusive
  // modes now, in both directions). Covers the in-page pills AND the
  // nav drop-down's links, which change the filter via the URL without
  // going through any click handler here. Watching `filter` rather than
  // hooking every call site is what keeps the two rules from fighting:
  // typing sets the filter to "All", which this effect deliberately
  // ignores. Skipped for a frozen peek — filter is a constant there, so
  // this would only ever fire once on mount and clobber initialQuery.
  useEffect(() => {
    if (!interactive) return;
    if (filter !== "All") {
      setQuery("");
      setSearchOpen(false);
    }
  }, [interactive, filter]);

  // One-shot entrance for the filter row — "when you click on Work in
  // the nav bar, the All pill drops down, and all the categories kind of
  // gloopy woosh out to the right... like a drop down menu but more
  // fun," per Josh. Keyed off first view (IntersectionObserver, same
  // once-only idea as Reveal) rather than literally the nav click, so it
  // also plays on a direct /work load and when Home's embedded gallery
  // scrolls in — every way of arriving gets the same entrance. The
  // stagger itself is per-pill animationDelay set inline below;
  // fill-mode backwards keeps each pill hidden until its own delay is
  // up. Reduced motion: the keyframes are pure CSS, so the sitewide
  // rule neutralises them and the row just appears once revealed.
  // A counter rather than a boolean so the entrance can REPLAY: hovering
  // Work in the nav fires "worklist:entrance" (see nav.tsx), each bump
  // remounts the row via key={entranceRun} below, and a fresh mount is
  // what makes the CSS animations run again — toggling a class on the
  // same elements wouldn't. 0 = not yet revealed (row hidden). A frozen
  // peek starts already-revealed (1) and skips the effect below entirely
  // — it's rendering a page the visitor already scrolled past this
  // entrance on, so replaying it from hidden would be a lie, not a
  // preview.
  const pillRowRef = useRef<HTMLDivElement>(null);
  const [entranceRun, setEntranceRun] = useState(interactive ? 0 : 1);
  const pillsRevealed = entranceRun > 0;
  useEffect(() => {
    if (!interactive) return;
    const replay = () => setEntranceRun((run) => run + 1);
    window.addEventListener("worklist:entrance", replay);
    const row = pillRowRef.current;
    if (!row) {
      return () => window.removeEventListener("worklist:entrance", replay);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntranceRun((run) => Math.max(run, 1));
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(row);
    return () => {
      window.removeEventListener("worklist:entrance", replay);
      observer.disconnect();
    };
  }, [interactive]);

  const visible = useMemo(() => {
    // Everyday words people actually type, mapped to the category they
    // mean — "the search needs to show LGBT when gay is used... auto,
    // automotive for car etc," per Josh. Prefix-matched both ways so
    // half-typed queries ("automo") and longer ones ("automotive
    // illustration" won't, but "gays" will) still land.
    const CATEGORY_ALIASES: Record<string, string[]> = {
      "LGBTQ+": [
        "lesbian",
        "gay",
        "bi",
        "bisexual",
        "trans",
        "transexual",
        "transsexual",
        "transgender",
        "queer",
        "intersex",
        "pride",
        "lgbt",
        "lgbtq",
        "rainbow",
      ],
      Cars: ["auto", "automotive", "car", "cars", "vehicle", "motor", "driving", "wheels"],
      Murals: ["mural", "wall", "painting", "painted"],
      Editorial: ["magazine", "press", "publication", "article", "journal"],
      Icons: ["icon", "sticker", "stickers", "emoji", "logo"],
      Motion: ["animation", "animated", "video", "moving", "gif"],
      "3D": ["render", "cgi", "three"],
    };
    const aliasHit = (category: string, q: string) =>
      q.length >= 2 &&
      (CATEGORY_ALIASES[category] ?? []).some(
        (alias) => alias.startsWith(q) || q.startsWith(alias),
      );
    // A live query searches EVERYTHING, ignoring whichever category pill
    // happens to be active — "the search function should search all
    // categories not just the pill thats selected," per Josh (it used to
    // AND the two, so searching from a filtered view silently missed
    // most of the portfolio). The category filter takes back over the
    // moment the query clears.
    const q = query.trim().toLowerCase();
    if (q) {
      return projects.filter(
        (project) =>
          [project.title, project.cardTitle, project.cardLabel, project.client, ...project.categories]
            .filter(Boolean)
            .some((field) => String(field).toLowerCase().includes(q)) ||
          project.categories.some((category) => aliasHit(category, q)),
      );
    }
    return filter === "All"
      ? projects
      : projects.filter((project) => project.categories.includes(filter));
  }, [filter, query, projects]);

  const filters: Filter[] = ["All", ...categories];

  /** Entrance wrapper per pill: index 0 (All) drops down, everything
   *  after wooshes out rightward on the same gloopy spring as the pills'
   *  own hover, ~55ms apart. Hidden (opacity-0) until the row's first
   *  view so nothing flashes at rest before the entrance plays. */
  const pillEntrance = (index: number) =>
    pillsRevealed
      ? {
          className:
            index === 0
              ? "animate-[pill-drop_500ms_var(--ease-bounce)_both]"
              : "animate-[pill-woosh_550ms_var(--ease-bounce)_both]",
          style: { animationDelay: `${index * 55}ms` },
        }
      : { className: "opacity-0", style: undefined };

  // Records what's behind a project page the instant a card is clicked,
  // so the pull-down-to-go-back gesture on that page (project-stack-swipe.tsx)
  // can mirror this exact scroll position/filter/search instead of bare
  // canvas — see lib/back-peek.ts. Delegated on the whole gallery rather
  // than threaded through ProjectCard/MasonryCard as an onClick prop: one
  // capture-phase listener here covers every card this instance renders
  // without touching a component used by both the live gallery and its
  // own frozen peek copy. recordContext is only set on the two real,
  // interactive instances (/work, Home) — a peek copy never gets it, so
  // this never fires from inside a peek even without checking
  // `interactive` separately.
  function handleGalleryLinkClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!recordContext) return;
    const anchor = (event.target as HTMLElement).closest("a");
    const slug = projectSlugFromHref(anchor?.getAttribute("href") ?? null);
    if (!slug) return;
    recordBackTarget(slug, {
      context: recordContext,
      scrollY: window.scrollY,
      anchorTop: measureGalleryAnchorTop(recordContext),
      category: filter,
      query,
      steps: 1,
    });
  }

  return (
    // display: contents -- a delegation point for handleGalleryLinkClick
    // that adds no box of its own, so it can't affect the grid/section
    // layout either page embeds this component into.
    <div className="contents" onClickCapture={handleGalleryLinkClick}>
      {/* Static -- no orbit, no drift -- but each leans toward the cursor
          on hover, same tilt math as the homepage hero's floating
          objects. See components/ui/tilt-illustration.tsx. Same pair on
          every filter for now -- tried hiding it / swapping to a
          Pride-specific piece per category, but Josh wants to build
          real per-category illustrations later rather than have this
          guess at it. /work only (showIllustrations) -- moving this row
          into WorkGallery made it start showing up on Home's embedded
          gallery too, which it never did before. */}
      <div
        // key: a fresh mount per entranceRun bump is what replays the
        // entrance animations — see entranceRun's own comment.
        key={entranceRun}
        ref={pillRowRef}
        // max-md:min-h-[102px] + content-start: below md this row wraps
        // to 2 lines closed, 3 open (the search pill's w-44 no longer
        // fits the second line) — with no reserved height, that third
        // line pushed the illustration row (and everything below it)
        // down the instant search was focused. "leave enough gap under
        // the categories so that when you click search the ipad
        // illustration doesn't have to move down," per Josh. 102px is
        // the row's own measured open-state height at this breakpoint
        // (live-measured, not derived from a formula — see the search
        // pill's own sizing comment for why these two elements don't
        // reduce to clean math); content-start keeps the two closed-
        // state lines packed at the top rather than the flex-wrap
        // default spreading them to fill the reserved height.
        className="flex flex-wrap content-start items-center justify-center gap-2 max-md:min-h-[102px]"
        role="group"
        aria-label="Filter work by discipline"
      >
        {filters.map((option, index) => {
          const active = filter === option;
          const entrance = pillEntrance(index);
          // ALL can't rely on the filter-change effect (typing sets the
          // filter to All too, so that effect must ignore it) — clearing
          // lives on the click itself instead: "after typing and
          // searching, clicking ALL again will clear the search," per
          // Josh. Harmless on the other pills, whose filter change would
          // clear it anyway.
          const pick = () => {
            setQuery("");
            setSearchOpen(false);
            setFilter(option);
          };

          return (
            <span key={option} className={entrance.className} style={entrance.style}>
              {option === "LGBTQ+" ? (
                <PrideFilterButton active={active} onClick={pick} />
              ) : (
                <button
                  type="button"
                  onClick={pick}
                  aria-pressed={active}
                  className={`font-grotesque rounded-full px-4 py-[9.5px] text-[11px] leading-none font-semibold uppercase tracking-[0.02em] text-trim-caps transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 ${
                    active
                      ? "bg-brand text-canvas"
                      : "border border-ink text-ink-muted hover:border-brand hover:text-brand"
                  }`}
                >
                  {option}
                </button>
              )}
            </span>
          );
        })}
        {/* Search rides the same woosh, last in the stagger — "at the
            very end i want there to be a search bar," per Josh. Styled
            as one more pill; grows a little on focus, same gloopy
            spring as the pills' own hover. */}
        <span
          className={`group/search relative inline-flex items-center ${pillEntrance(filters.length).className}`}
          style={pillEntrance(filters.length).style}
        >
          {/* Inline SVG glyphs, stroke currentColor — the site has no
              icon set beyond the masked-PNG socials, and these two are
              simple enough to not warrant new assets ("include a mag
              glass and an X in a circle in the search pill," per Josh,
              off an It's Nice That reference). */}
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            // Centred in the collapsed pill, docks to the left edge once
            // it opens — same gloopy spring as the width change so the
            // two read as one move.
            // group-hover: the glass goes brand with the border — "make
            // sure the mag glass is blue on hover like the rest of the
            // pills," per Josh. Position is transform-only off a fixed
            // left-0 (12px centres the 10px glyph in the closed 34px
            // pill, 14px is the old left-3.5 docked spot): the earlier
            // left-1/2 ↔ left-3.5 move animated `left` — a layout
            // property — against a width that was itself mid-transition,
            // and that compound path is what read as janky on collapse.
            // h-2.5 w-2.5, not h-3 w-3 -- "the mag glass is bigger than
            // the other pills," per Josh: at 12px the glyph (a ~7px
            // circle plus a diagonal handle reaching toward the corner)
            // read larger than the 11px pill text's own cap-height
            // sitting right next to it — 10px brings the two to the same
            // visual weight without touching the pill's own box model.
            // transition-[translate,...], not transform — Tailwind v4's
            // translate-x-* emits the standalone CSS `translate`
            // property (same trap ProjectCard's title notes), so
            // transitioning `transform` would snap instead of glide.
            className={`pointer-events-none absolute left-0 h-2.5 w-2.5 transition-[translate,color] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/search:text-brand ${
              searchOpen ? "translate-x-[14px] text-brand" : "translate-x-[12px] text-ink"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="6.5" cy="6.5" r="4.75" />
            <path d="m10.5 10.5 3.5 3.5" />
          </svg>
          <input
            ref={searchInputRef}
            type="search"
            value={query}
            // Typing snaps the pill highlight to ALL — the search
            // already looked across every category, but the old
            // category's pill staying lit while its filter did nothing
            // read as a lie. Guarded on the live URL param so an
            // already-ALL view doesn't churn router.replace per
            // keystroke.
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              if (value.trim() && new URLSearchParams(window.location.search).get(CATEGORY_PARAM)) {
                setFilter("All");
              }
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => {
              if (!query.trim()) setSearchOpen(false);
            }}
            aria-label="Search work"
            // No placeholder word — collapsed it's just the mag glass;
            // the input itself is what's clickable/tabbable in both
            // states, so the pill's height always matches its
            // neighbours' (same py/text metrics) with no second element
            // to keep in sync. [&::-webkit-search-cancel-button]:hidden
            // — the circled × below is the one clear affordance;
            // WebKit's native cancel button would double it up.
            // max-md: 16px type with the padding trimmed to match the
            // pills' own rendered height — anything under 16px makes iOS
            // Safari auto-zoom the whole page into a focused input, which
            // is what "pushes the screen to the right" on mobile (the
            // page wasn't overflowing, the viewport was zooming). Desktop
            // keeps the row's 11px, where the same py as the pills lands
            // on the same height with no trim needed. py-[5.8px], not a
            // rounder number: a `<button>` and a native `<input>` don't
            // render an identical box from identical padding/font-size
            // (confirmed by measuring both live) — "the search pill... is
            // bigger than the other pills," per Josh. This value is
            // reverse-engineered from that gap, not derived from a clean
            // formula; if the pills' own py/text ever changes, re-measure
            // rather than assume this scales with it.
            // group-has button:hover — hovering the clear-× grows the
            // bar itself, same gesture as the × (below), so the two
            // read as one move. Width, not `scale` — the × is a solid
            // fill with no stroke to distort, but this element has a
            // 1px border, and a transform-scale rasterises the box at
            // its base size before enlarging the bitmap, which softens
            // a hairline border into a visibly thinner, blurrier line
            // ("the outline stroke goes thinner," per Josh). A real
            // width change keeps the border literally 1px throughout.
            // Only width, not py — the pill's height has to keep
            // matching its neighbours' (see the py/text-metrics note
            // above), and growing padding on hover would break that.
            className={`font-grotesque rounded-full border bg-transparent py-[9.5px] text-[11px] leading-none font-semibold uppercase tracking-[0.02em] text-ink transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] outline-none group-has-[button:hover]/search:w-[184px] max-md:py-[5.8px] max-md:text-[16px] [&::-webkit-search-cancel-button]:hidden ${
              searchOpen
                ? "w-44 border-brand pr-9 pl-8"
                : "w-[34px] cursor-pointer border-ink px-0 hover:border-brand"
            }`}
          />
          {/* × in a brand-blue circle — rolls in along the pill to the
              right end as it expands (search-x-roll, globals.css), and
              both clears and collapses on tap. Present whenever the pill
              is open, not just once something's typed. onMouseDown
              preventDefault keeps the input's blur from unmounting this
              button under the very click aimed at it. */}
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setQuery("");
              setSearchOpen(false);
              // The onMouseDown preventDefault above keeps the input
              // focused through this click (so blur can't unmount the
              // button mid-press) — which left its caret blinking inside
              // the closed pill ("cursor stays inside the pill when
              // closed," per Josh). Closing is the one moment focus
              // should actually go.
              searchInputRef.current?.blur();
            }}
            aria-label="Clear search"
            aria-hidden={!searchOpen}
            tabIndex={searchOpen ? undefined : -1}
            // Always mounted, hidden by scale/opacity when closed — the
            // old conditional mount vanished the × in a single frame
            // while the pill was still mid-collapse, a hard cut inside
            // an otherwise springy move ("the movement is a bit janky,"
            // per Josh). The roll-in keyframe only rides along while
            // open, so closing transitions out instead of replaying it.
            // transition-[...,scale], not just transform — scale-* is
            // Tailwind v4's standalone `scale` property (same trap as
            // the glass's translate above), so without it the hover
            // grow and the close shrink both snapped instead of
            // springing. A keyframe animation was tried here for a
            // multi-stage wobble like the pill's jelly, but a
            // forwards-filled animation doesn't hand off to a
            // transition on removal — un-hover snapped straight back to
            // 1 instead of springing down. A plain transition reverses
            // cleanly in both directions and still overshoots, since
            // --ease-bounce's curve pushes past its endpoint before
            // settling — the same curve that already reads as gloopy on
            // the pills' own hover. A non-uniform scale target was tried
            // for more travel, but it stretched the circle into an egg
            // and read as a rendering glitch rather than gloop ("makes
            // the x look weird," per Josh) — scale-125 keeps it a
            // circle. hover:duration-500 slows just the grow so the
            // overshoot has time to read; un-hover falls back to the
            // base duration-300, a touch snappier on the way down.
            // active:scale-90 active:duration-100 — the press itself
            // needed its own feedback, not just the hover pop ("when
            // you click it i want it to have a satisfying feel," per
            // Josh). A fast compress on mousedown reads as a tactile
            // squish; releasing hands off into the existing clear/close
            // motion, so the click reads as press-then-release rather
            // than a flat tap.
            className={`absolute right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand font-mono text-[12px] leading-none text-canvas transition-[transform,opacity,scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              searchOpen
                ? "animate-[search-x-roll_550ms_var(--ease-bounce)_both] hover:duration-500 hover:scale-125 active:scale-90 active:duration-100"
                : "pointer-events-none scale-0 opacity-0"
            }`}
          >
            ×
          </button>
        </span>
      </div>

      {visible.length === 0 && (
        <p className="type-label mt-12 text-center text-ink-muted">
          Nothing matches — try another word.
        </p>
      )}

      {/* Below the pills, not above — "move the ipad illustration below
          the categories," per Josh (mt-10 replaces the old mb-10 now the
          row sits under what it used to sit over). Same tilt-toward-
          cursor pair as before, /work only (showIllustrations). */}
      {showIllustrations && (
        // Empty search result: the pair wobbles once ("i love the
        // 'nothing matches' screen with the ipad there, can you have the
        // ipad illustration wobble or gloopy at this moment," per Josh).
        // Class-only, no key — an earlier cut keyed this div on the
        // query to re-wobble per keystroke, but that remounts the
        // next/image inside every keypress, which is the mobile
        // "flicker when typing". Adding the class plays the keyframe
        // once per entry into the empty state; leaving and re-entering
        // it replays naturally.
        <div
          className={`mt-10 flex flex-nowrap items-end justify-center gap-4 sm:gap-6 ${
            visible.length === 0 ? "animate-[empty-wobble_800ms_ease-in-out]" : ""
          }`}
        >
          {ILLUSTRATIONS.map(({ src, aspect, height }) => (
            <TiltIllustration key={src} src={src} aspect={aspect} height={height} />
          ))}
        </div>
      )}

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
          // Filtered views repack densely — they're not the curated ALL
          // order, so levelling the columns wins ("when you click a
          // category, can the rules of the grid change?" per Josh).
          dense={filter !== "All"}
          items={visible.map((project, index) => {
            // Filtered views can lead with a category-specific cover; when
            // one applies, hover swaps back to the original lead instead
            // of the usual second-image pick, and the override's own ratio
            // becomes the card frame — a 16/9 spread override renders as a
            // full two-column spread rather than centre-cropped into the
            // project's usual frame (Weapons of Reason's double page, which
            // lost half its headline to the 1/1 crop). See
            // cardImageByCategory.
            const categoryImage =
              filter !== "All" ? project.cardImageByCategory?.[filter] : undefined;
            const cardRatio =
              categoryImage?.ratio ?? effectiveCardRatio(project, index, ratioCycle);
            const ratio = ratioToNumber(cardRatio);
            const span = ratio >= LANDSCAPE_SPAN_RATIO ? 2 : 1;
            return {
              key: project.slug,
              ratio,
              span,
              transparent: isCardTransparent(project),
              mobileCaptionPx: MOBILE_CAPTION_RESERVE_PX,
              node: (
                <MasonryCard
                  project={project}
                  index={index}
                  ratio={cardRatio}
                  image={categoryImage ?? project.cardImage}
                  hoverImage={
                    categoryImage ? (project.cardImage ?? project.hero) : undefined
                  }
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
    </div>
  );
}
