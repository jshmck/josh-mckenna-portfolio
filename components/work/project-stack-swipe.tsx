"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { HomeBelowHero } from "@/components/home/below-hero";
import { ProjectContent } from "@/components/work/project-content";
import { WorkGallery, type Filter } from "@/components/work/work-gallery";
import { propagateBackTarget, readBackTarget, type BackPeekTarget } from "@/lib/back-peek";
import { PROJECT_CATEGORIES, getAllProjects, type Project } from "@/lib/projects";

/** The persistent nav (nav.tsx: `min-h-[88px]`, sticky, shared across
 *  every route from the root layout) is never duplicated inside the
 *  peek — it's already on screen throughout the swipe, right where it
 *  always is. The real page's own content sits in normal flow *below*
 *  it, but the peek is `position: fixed`, so without this offset its
 *  content started filling from true y=0 instead — "the next project is
 *  higher up than the current project so when it fully slides in it
 *  creates a jump," per Josh. Reserving the same height here is what
 *  makes the peek's content land exactly where the same content lands
 *  once real navigation completes and it's back in normal flow under
 *  the nav. 88 is the fallback/initial value only (SSR-safe, matches
 *  the nav's own base height) — the real value is measured live off the
 *  header once mounted (see the effect below), since nav.tsx's own
 *  env(safe-area-inset-top) padding makes its rendered height taller
 *  than 88 on a notched/Dynamic-Island phone specifically. A stale
 *  hardcoded 88 there would reproduce the exact jump this constant was
 *  introduced to fix, just on that one class of device. */
const NAV_HEIGHT_FALLBACK = 88;

/** Minimum resisted travel, px, before a released drag counts as a
 *  completed swipe rather than springing back. */
const COMPLETE_DISTANCE = 96;

/** The horizontal delta must beat the vertical delta by this factor before
 *  a touch is captured as a horizontal drag at all — same dominance test
 *  as the lightbox's own swipe (lightbox-overlay.tsx), so a vertical
 *  scroll that drifts sideways a little never gets mistaken for this. */
const DOMINANCE = 1.5;

/** Raw finger travel, px, before the dominance test even runs. */
const ACTIVATION_DISTANCE = 10;

/** Touches starting this close to the screen edge are left alone — iOS's
 *  own edge-swipe back/forward gesture lives there, and fighting it for
 *  the same gesture reads as broken rather than deliberate. Narrow
 *  (was 24) — "closer to the screen edge please," per Josh — a thin
 *  enough sliver that it still leaves the OS's own edge gesture some
 *  room without eating into the swipe's own usable width. */
const EDGE_GUARD = 8;

/** First STICK_DISTANCE px of resisted travel move the slab at STICK_RATE
 *  — "can the pages be slightly stuck and you can pull them?" per Josh.
 *  Past that the drag "gives" and tracks the finger much more directly
 *  (FREE_RATE) for the rest of the gesture. Two-segment rather than a
 *  smooth curve (classic rubber-banding) because Josh's own description
 *  was a discrete two-part feel — stuck, then free — not a continuous
 *  taper. A rAF-driven spring-follow on top of this (easing the
 *  *displayed* position toward the resisted target rather than painting
 *  it directly) was tried and reverted — "let's drop the elasticity,
 *  something faster and simple will work best here (similar to
 *  lightbox)," per Josh: direct 1:1 tracking reads as more responsive,
 *  especially on a quick flick, than the extra catch-up lag did. */
const STICK_DISTANCE = 28;
const STICK_RATE = 0.25;
const FREE_RATE = 0.9;

/** How far the revealed neighbour trails the front slab's own travel —
 *  iOS's own interactive-pop parallax factor is in this range. Below 1 so
 *  the incoming page visibly "catches up" as the front page finishes
 *  leaving, rather than moving in lockstep with it. */
const PARALLAX_RATIO = 0.35;

function resist(delta: number): number {
  const sign = Math.sign(delta);
  const magnitude = Math.abs(delta);
  if (magnitude <= STICK_DISTANCE) return sign * magnitude * STICK_RATE;
  return sign * (STICK_DISTANCE * STICK_RATE + (magnitude - STICK_DISTANCE) * FREE_RATE);
}

type ProjectStackSwipeProps = {
  /** Current page's own slug — locates this project in getAllProjects()
   *  for the floating dot strip's window/active position. */
  slug: string;
  previous?: Project | null;
  next?: Project | null;
  children: ReactNode;
};

/** Geometry of the floating dot strip, shared between the static markup
 *  and the drag handler that animates the accent dot across it. Pitch =
 *  one dot (5.5px) plus the gap-1.5 (6px) between dots. */
const DOT_WINDOW = 5;
const DOT_PITCH = 11.5;
/** The gap-1.5 between dots, px — the shrink collapse eats one of these
 *  per hidden dot via negative margin (see applyDotShrink). */
const DOT_GAP = 6;

/** Renders the neighbour project through ProjectContent — the exact same
 *  component the real `/work/[slug]` page renders — clipped to one
 *  viewport height via `overflow: hidden` rather than trying to know it's
 *  a preview. "the page underneath (next project) needs to mirror exactly
 *  what will appear... has to mirror exactly what the next project looks
 *  like," per Josh, after a first cut (a hand-rolled title + single hero
 *  image) visibly mismatched real pages using heroPair, poster-grid,
 *  square corners, or anything else beyond the plain single-hero case.
 *  Sharing the literal component makes drift impossible rather than just
 *  unlikely — it's also why the peek automatically picked up the mobile
 *  "card" look (rounded corners, inset margin, shadow — see
 *  ProjectContent's own doc comment) the moment that shipped, with no
 *  changes needed here at all. `aria-hidden` — this is a second,
 *  non-interactive copy of page content that shouldn't register with
 *  assistive tech, on top of already being `pointer-events-none` for
 *  sighted/mouse interaction. */
function StackPeek({ project }: { project: Project }) {
  return (
    <div aria-hidden="true" className="pointer-events-none h-full w-full overflow-hidden bg-canvas">
      <article>
        <ProjectContent project={project} />
      </article>
    </div>
  );
}

/**
 * What's genuinely behind this project page — rendered behind the "back"
 * (pull-down) drag instead of bare canvas, so lifting the card away
 * reveals a faithful mirror of the gallery, Home, or the previous project
 * as it was actually left, not just a guess. See lib/back-peek.ts for
 * where `target` comes from and why it can't be re-derived from the
 * current page alone.
 *
 * Unlike StackPeek (previous/next), this needs no drag-driven transform
 * of its own — the horizontal peeks simulate a new page sliding in from
 * off-screen, but "back" is the opposite geometry: what's behind is
 * already sitting exactly where it belongs, and the falling slab just
 * uncovers progressively more of it as it drags away, the way lifting
 * the top sheet off a stack of paper reveals the one underneath without
 * the underneath one moving at all. So this only ever needs a single,
 * precomputed position (see the translate below) and a plain opacity
 * toggle — no per-frame updates in the touchmove handler.
 *
 * The one motion the content DOES carry is a static translateY baked in
 * from `target.scrollY` and `anchorTop` — see BackPeekTarget's own doc
 * comment for the geometry. Without it every peek would render its
 * content starting at scroll position 0, which is only ever correct for
 * a genuinely fresh page load, not "wherever the visitor happened to
 * leave the gallery."
 *
 * Always the gallery or Home, never an intermediate project someone
 * swiped through to get here — propagateBackTarget (lib/back-peek.ts)
 * forwards the ROOT of the chain to every project reached from another
 * one, specifically so this never has to render a project at all. "I
 * want it to always show the gallery, even after swiping to the next
 * project," per Josh, after confirming the immediate-predecessor version
 * worked exactly as designed — showing the gallery instead means a
 * completed drag has to jump the whole chain in one go rather than a
 * plain one-step back(); see `target.steps` in settle() below.
 */
function BackTargetPeek({ target }: { target: BackPeekTarget }) {
  const allProjects = getAllProjects();
  const content =
    target.context === "home" ? (
      <HomeBelowHero
        projects={allProjects}
        categories={[...PROJECT_CATEGORIES]}
        peek={{ category: target.category, query: target.query }}
      />
    ) : (
      <div className="mx-auto max-w-frame px-6 pb-32 pt-8 md:px-gutter">
        <h1 className="sr-only">Work</h1>
        <WorkGallery
          projects={allProjects}
          categories={[...PROJECT_CATEGORIES]}
          interactive={false}
          initialFilter={target.category as Filter}
          initialQuery={target.query}
        />
      </div>
    );

  return (
    <div aria-hidden="true" className="pointer-events-none h-full w-full overflow-hidden bg-canvas">
      <div style={{ transform: `translate3d(0, ${-(target.scrollY - target.anchorTop)}px, 0)` }}>
        {content}
      </div>
    </div>
  );
}

/**
 * Swipe-to-navigate between project pages — "I want the projects to be
 * swipable from one to another... kind of like a stack of paper and
 * you're swiping the top one away," per Josh, replacing the first cut
 * (ProjectSwipeNav, since removed: release-only, no visual feedback
 * during the drag). This version tracks the finger directly: the current
 * page's content ("the slab", `children` below) translates with the
 * touch, and a lightweight preview of the neighbour project (StackPeek)
 * sits behind it, parallax-revealed as the slab moves off — the same
 * front/back relationship a native push/pop screen transition uses,
 * approximated here since there's no real second page mounted to reveal.
 *
 * The slab itself carries no visual presentation of its own any more —
 * no shadow, no rounded corners, nothing keyed to whether a drag is in
 * progress. Both of those used to live here (a separate `fixed inset-0`
 * shadow element kept in lockstep with the slab's own transform, and a
 * rounded-frame class toggled on right as a drag was captured, off again
 * once a spring-back settled) as reactive fixes for a page that only
 * ever looked like a "card" while being dragged — chasing where the
 * shadow should stop bleeding, whether it should reach the nav, what
 * colour it should be. "i just thought the shadow and swipe and dynamic
 * island cut off isnt really working, so i am thinking on mobile when
 * you open a project it opens up a 'card' with curved corners, (very
 * apple) this makes it swipe a lot cleaner," per Josh. Once the card
 * look (rounded corners, inset margin, shadow) is part of
 * ProjectContent's own permanent mobile presentation instead of
 * something this component switches on, the slab, both peeks, and the
 * real page all render that same card automatically — nothing here has
 * to know or care that a shadow exists at all.
 *
 * The chevron circles' own "beckon" nudge (back-to-top.tsx) exists to
 * advertise this same gesture, so the two ship together.
 *
 * A drag used to dispatch `stackswipe:start`/`stackswipe:end` on
 * `window`, with nav.tsx listening and forcing its frosted-pill state
 * for the duration — asked for when project pages still ran
 * edge-to-edge and the plain resting nav read as disconnected from the
 * page sliding underneath it. Removed per Josh after the card redesign:
 * "when swiping across (next/previous) the blue bubble doesnt need to
 * appear, the header doesnt need to bounce or anything. only the moves
 * on the nav bar should be active when it touches the card" — the card
 * sits inset on its own background now, so at scrollY 0 there's nothing
 * under the nav for a frost to reveal, and the forced frost just added
 * a bounce and a blue wash out of nowhere. The nav's frost is purely
 * scroll-driven again; a swipe that starts mid-scroll keeps whatever
 * frost state scroll already earned (preventDefault on the drag means
 * scrollY never moves during one).
 *
 * Everything here writes transforms straight to the DOM inside touch
 * handlers rather than through React state, the same rule every other
 * motion primitive in this repo follows (Parallax, the hero drift loop)
 * — a drag has to feel 1:1 with the finger, and re-rendering React on
 * every touchmove can't guarantee that.
 *
 * Reduced motion drops the whole drag-follow/peek apparatus and falls
 * back to ProjectSwipeNav's original behaviour: a plain release-distance
 * check that navigates immediately with no visual tracking — motion is
 * the entire point of this component, so there's nothing worth keeping
 * once it's turned off, unlike a decorative loop that can just freeze in
 * place.
 */
export function ProjectStackSwipe({ slug, previous, next, children }: ProjectStackSwipeProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const slabRef = useRef<HTMLDivElement>(null);
  const previousPeekRef = useRef<HTMLDivElement>(null);
  const nextPeekRef = useRef<HTMLDivElement>(null);
  const backPeekRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const accentDotRef = useRef<HTMLSpanElement>(null);
  const dotChromeRef = useRef<HTMLSpanElement>(null);
  const [navHeight, setNavHeight] = useState(NAV_HEIGHT_FALLBACK);
  // What's behind this page, for the pull-down peek — resolved in an
  // effect (not a lazy useState initializer) so the server-rendered
  // markup and the first client render agree (null, no peek) before
  // sessionStorage can be read; see lib/back-peek.ts. Read once per
  // mount: the record a swipe/click wrote just before landing here
  // doesn't change for the lifetime of this page view.
  const [backTarget, setBackTarget] = useState<BackPeekTarget | null>(null);
  useEffect(() => {
    // One-time sessionStorage read after mount, not a subscription — same
    // "browser API unavailable during SSR" shape as the navHeight effect
    // just above, which this rule doesn't flag only because that one
    // routes through a named function it also happens to pass to
    // addEventListener. There's no ongoing external event to subscribe to
    // here (sessionStorage's own `storage` event doesn't fire same-tab or
    // for sessionStorage at all in most browsers), so a single post-mount
    // read is the correct shape, not a workaround for one.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBackTarget(readBackTarget(slug));
  }, [slug]);

  // The floating dot strip's window into the full project list — same
  // Instagram-style clamped 5-dot window the breadcrumb-zone version
  // used before it moved here ("the dots have to hover and have an
  // animation as we swipe between projects," per Josh — inside the card
  // they translated away with the page mid-swipe, exactly when they
  // were supposed to be doing their job). Deterministic from the slug,
  // so SSR markup and hydration agree.
  const orderedProjects = getAllProjects();
  const projectIndex = orderedProjects.findIndex((p) => p.slug === slug);
  const projectCount = orderedProjects.length;
  const dotStart = Math.max(0, Math.min(projectIndex - 2, projectCount - DOT_WINDOW));
  const dots = Array.from(
    { length: Math.min(DOT_WINDOW, projectCount) },
    (_, offset) => {
      const index = dotStart + offset;
      const isEdge =
        (offset === 0 && dotStart > 0) ||
        (offset === DOT_WINDOW - 1 && dotStart + DOT_WINDOW < projectCount);
      return { index, small: isEdge };
    },
  );
  // The accent "you are here" dot is a separate element overlaid on the
  // gray row (see the markup) so the drag handler can slide it from the
  // active dot toward the neighbour's without touching the row itself.
  // Its resting offset is the active dot's distance from the row centre.
  const accentRestOffset = (projectIndex - dotStart - (dots.length - 1) / 2) * DOT_PITCH;

  // The pill's compact state -- "it should shrink (to three dots) when
  // scrolling down, but same size as is when you start to press as if
  // going left or right," per Josh: reading mode gets a quieter
  // three-dot pill; the moment a drag is captured it expands back to
  // the full window so the accent handoff has the whole strip to play
  // across. Which two dots collapse is chosen so the active dot always
  // keeps a neighbour each side (shifting the kept trio at the list's
  // ends rather than hiding the active dot itself), and the accent's
  // own centre-offset is recomputed for the three-dot layout since
  // collapsing dots re-centres the row inside the pill. All of this is
  // driven by direct DOM writes from the scroll/touch handlers below,
  // never React state -- a re-render mid-gesture would re-apply the
  // accent's inline style prop and clobber the drag handler's transform
  // mid-swipe.
  const activeDotPos = projectIndex - dotStart;
  const shrinkKeepStart = Math.max(0, Math.min(activeDotPos - 1, dots.length - 3));
  const accentShrunkOffset = (activeDotPos - (shrinkKeepStart + 1)) * DOT_PITCH;
  const dotShrinkState = useRef({ scrolled: false, dragging: false, overPlain: false, revealed: false });
  const applyDotShrink = useCallback(() => {
    const strip = dotsRef.current;
    const accent = accentDotRef.current;
    if (!strip || !accent) return;
    const state = dotShrinkState.current;
    const shrunk = state.scrolled && !state.dragging;
    // Hidden outright until the hero image and its caption/paragraph have
    // scrolled past — "the dots can't appear on or near images, it's
    // confusing, you think it's going to swipe the image like a
    // carousel," per Josh: floating right over the opening hero, the dot
    // strip reads as an image-carousel indicator rather than project-to-
    // project navigation. Bypassed during an active drag regardless (see
    // `dragging` below) — the dots are live feedback for the gesture
    // that's already in progress, so hiding them mid-swipe would defeat
    // the one moment they're actually informative.
    strip.style.opacity = !state.revealed && !state.dragging ? "0" : "1";
    // The frosted surround fades out entirely once the strip floats
    // over the card's empty bottom zone -- "as soon as you've scrolled
    // past the last image or text and you're on plain white bg of the
    // project card, the surround of the three dots disappears, but
    // function the same," per Josh: the chrome exists for contrast over
    // artwork, and over bare canvas it's just a box. It comes back for
    // the duration of a drag regardless -- the incoming project's
    // artwork slides under the dots mid-swipe, exactly when contrast
    // matters again. The chrome is its own absolutely-positioned layer
    // behind the dots so this is a single opacity fade, not a pile of
    // background/shadow/filter properties trying to transition in sync.
    if (dotChromeRef.current) {
      dotChromeRef.current.style.opacity = state.overPlain && !state.dragging ? "0" : "";
    }
    strip.querySelectorAll<HTMLElement>("[data-dot-hide]").forEach((el) => {
      el.style.width = shrunk ? "0px" : "";
      el.style.opacity = shrunk ? "0" : "";
      // Collapsing width alone leaves the flex gap where the dot stood;
      // a matching negative margin eats it -- on the side that faces
      // the surviving trio, since an outermost dot has no outer gap.
      if (el.dataset.dotHide === "left") el.style.marginRight = shrunk ? `-${DOT_GAP}px` : "";
      else el.style.marginLeft = shrunk ? `-${DOT_GAP}px` : "";
    });
    // The accent re-targets whichever layout is current -- but never
    // mid-drag: the touchmove handler owns its transform then, and a
    // completed swipe deliberately leaves it on the neighbour's dot.
    if (!state.dragging) {
      accent.style.transition = "transform 500ms var(--ease-bounce)";
      accent.style.transform = `translate(-50%, -50%) translateX(${shrunk ? accentShrunkOffset : accentRestOffset}px)`;
    }
  }, [accentRestOffset, accentShrunkOffset]);

  useEffect(() => {
    if (previous) router.prefetch(`/work/${previous.slug}`);
    if (next) router.prefetch(`/work/${next.slug}`);
  }, [previous, next, router]);

  // Measures the real nav (a sibling in the root layout, not a descendant
  // here) rather than trusting NAV_HEIGHT_FALLBACK -- see that constant's
  // own doc comment for why a stale hardcoded value would reintroduce the
  // exact peek-jump bug it was written to fix, specifically on notched
  // devices. Resize-driven, not just mount-once: env(safe-area-inset-top)
  // can change on rotation (the safe area moves to the *side* in
  // landscape on a Dynamic Island phone), which changes the header's own
  // rendered height too.
  useEffect(() => {
    const header = document.querySelector("header.sticky");
    if (!header) return;
    const update = () => setNavHeight(header.getBoundingClientRect().height);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Docks the floating dot strip to the card's bottom edge once the
  // footer's curtain reveal starts -- "when you hit the bottom of a
  // project and see the footer, the dots are to remain at the bottom of
  // the project card," per Josh (replacing a first cut that faded them
  // out there instead). Same continuous-offset docking the old
  // BackToTop pill used above the footer, just anchored to the card:
  // the strip rests 20px off the viewport bottom, and once the card's
  // own bottom edge scrolls up past that line the strip rides up with
  // it, always sitting DOCK_INSET above the card's edge. Written
  // straight to the DOM per scroll frame (rAF-throttled), not through
  // React state -- the offset changes continuously while the footer
  // reveals. Runs under reduced motion too: this tracks scroll
  // position 1:1, it doesn't animate anything on its own. Measures the
  // card (the slab's first child, ProjectContent's shadow wrapper)
  // rather than the footer or document end, so it stays correct if the
  // card's bottom margin or the footer's height ever change.
  useEffect(() => {
    const strip = dotsRef.current;
    const slab = slabRef.current;
    if (!strip || !slab) return;
    const RESTING_BOTTOM = 20; // bottom-5, the strip's own class
    const DOCK_INSET = 20; // gap kept above the card's bottom edge when docked
    // Shrink-on-scroll thresholds, with the same hysteresis idea as the
    // nav's own frost so rubber-banding near the boundary can't flicker
    // the pill's size.
    const SHRINK_ENTER = 120;
    const SHRINK_EXIT = 60;
    let raf = 0;
    let queued = false;
    const update = () => {
      queued = false;
      const card = slab.firstElementChild;
      if (!card) return;
      const cardBottom = card.getBoundingClientRect().bottom;
      const docked = window.innerHeight - cardBottom + DOCK_INSET;
      const stripBottom = Math.max(RESTING_BOTTOM, docked);
      strip.style.bottom = `${stripBottom}px`;

      // Where the card's real content ends -- the bottom-most visible
      // text/image/video inside the card, found by rect rather than
      // document order so it doesn't depend on which layout (stack,
      // grid, poster, outro video) a given project uses. Elements
      // hidden at this breakpoint (the md-only end-of-project nav)
      // measure zero-height and drop out on their own. Re-queried per
      // frame rather than cached at mount: images loading in shift
      // layout, and this only ever runs on the rAF-throttled scroll
      // tick, not at 60fps free-run.
      let lastContentBottom = -Infinity;
      card.querySelectorAll("figure, img, video, p, dl").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.height > 0 && rect.bottom > lastContentBottom) lastContentBottom = rect.bottom;
      });
      const stripTop = window.innerHeight - stripBottom - strip.offsetHeight;

      // "Revealed" once the nav bar passes the title -- "the nav dots
      // need to initiate sooner, just after the nav bar goes over the
      // last of the title," per Josh, the third and earliest cut of this
      // timing (hero image -> CLIENT/YEAR breadline -> the title's own
      // bottom edge). data-project-title marks the page's h1 (see
      // project-title.tsx) -- like the meta row before it, every layout
      // renders it in the same spot, poster-grid and heroHiddenOnPage
      // projects included, so there's no fallback case to carry.
      // Measured fresh off the real header each frame, same as the
      // peek-jump fix's own nav-height effect above, rather than
      // trusting React state here — this closure only re-runs when
      // applyDotShrink's identity changes, so a stale header height
      // would survive a rotation untouched.
      const headerHeight = document.querySelector("header.sticky")?.getBoundingClientRect().height ?? NAV_HEIGHT_FALLBACK;
      const revealAnchorBottom = card.querySelector("[data-project-title]")?.getBoundingClientRect().bottom;
      // A vanishingly short project could in principle run out of page
      // before the title ever reaches the header — there just isn't
      // enough scroll room. Once the user has reached the actual bottom
      // of the page they've seen everything there is to see, so the dots
      // reveal regardless of where the anchor landed.
      const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
      const nearBottom = maxScrollY > 0 && window.scrollY >= maxScrollY - 2;

      const state = dotShrinkState.current;
      const wasScrolled = state.scrolled;
      const wasOverPlain = state.overPlain;
      const wasRevealed = state.revealed;
      state.scrolled = wasScrolled ? window.scrollY > SHRINK_EXIT : window.scrollY > SHRINK_ENTER;
      state.overPlain = lastContentBottom !== -Infinity && lastContentBottom < stripTop;
      state.revealed = nearBottom || (revealAnchorBottom !== undefined && revealAnchorBottom <= headerHeight);
      if (state.scrolled !== wasScrolled || state.overPlain !== wasOverPlain || state.revealed !== wasRevealed) {
        applyDotShrink();
      }

      // The peeks stop at the revealed footer's edge -- "the same way
      // you've done the sides and the top, apply to the bottom... the
      // white is covering the t&c and footer bar," per Josh: the peeks
      // are fixed, full-height, opaque layers, so during a swipe at the
      // page's end the incoming one slid in OVER the footer the curtain
      // reveal had just uncovered, whiting out the copyright bar. Their
      // bottom now tracks how much footer is actually revealed (the
      // viewport below <main>'s own bottom edge -- measured off main,
      // NOT the footer's rect, which sits sticky-pinned at the viewport
      // bottom from the first frame; see the strip-fade lesson above),
      // so mid-swipe the footer band stays visible below both cards,
      // the same persistent chrome the header is at the top. Written
      // here, per scroll frame, because a drag preventDefault()s all
      // scrolling -- the value can't change mid-gesture, so the last
      // scroll tick's write is always current when a swipe starts.
      const mainBottom = document.querySelector("main")?.getBoundingClientRect().bottom;
      if (mainBottom !== undefined) {
        const reveal = `${Math.max(0, window.innerHeight - mainBottom)}px`;
        if (previousPeekRef.current) previousPeekRef.current.style.bottom = reveal;
        if (nextPeekRef.current) nextPeekRef.current.style.bottom = reveal;
      }
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [applyDotShrink]);

  useEffect(() => {
    const container = containerRef.current;
    const slab = slabRef.current;
    if (!container || !slab || (!previous && !next)) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Jumps all the way back to this page's own recorded root (the
    // gallery/Home) in one native navigation when one's on record —
    // `history.go(-steps)` for however many project-to-project hops
    // separate here from there, letting the browser restore that entry's
    // real scroll position itself, same as a plain back() already did
    // for a single step. Falls back to a plain back() when there's no
    // record (a direct link deep into a chain) — one step is still the
    // best guess, and matches this gesture's behaviour before back-peek
    // existed at all. Read fresh from storage rather than the `backTarget`
    // state this component also keeps for rendering the peek -- that
    // state can lag a tick behind a mount-time effect, where this needs
    // to be correct the instant a drag can possibly complete.
    const navigateToRoot = () => {
      const target = readBackTarget(slug);
      if (target) {
        window.history.go(-target.steps);
      } else {
        router.back();
      }
    };

    // Reduced motion: the original ProjectSwipeNav behaviour, no drag
    // visuals at all — see the doc comment above for why this doesn't
    // try to keep a stripped-down version of the motion instead.
    if (reduced) {
      let startX = 0;
      let startY = 0;
      let startScrollY = 0;
      let tracking = false;

      const onTouchStart = (event: TouchEvent) => {
        tracking = false;
        if (event.touches.length !== 1) return;
        const target = event.target instanceof Element ? event.target : null;
        if (target?.closest('[aria-modal="true"], video')) return;
        tracking = true;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        startScrollY = window.scrollY;
      };

      const onTouchEnd = (event: TouchEvent) => {
        if (!tracking) return;
        tracking = false;
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        // Pull-down-to-go-back, only from the very top of the page — same
        // eligibility rule as the animated version below, just without any
        // drag-follow to show for it under reduced motion.
        if (deltaY >= COMPLETE_DISTANCE && Math.abs(deltaY) > Math.abs(deltaX) * DOMINANCE && startScrollY <= 0) {
          navigateToRoot();
          return;
        }
        if (Math.abs(deltaX) < COMPLETE_DISTANCE) return;
        if (Math.abs(deltaX) < Math.abs(deltaY) * DOMINANCE) return;
        // neighbourSlug, not `slug` -- this scope also closes over the
        // component's own `slug` prop (the CURRENT project), which
        // propagateBackTarget needs kept distinct from the destination
        // being navigated to.
        const neighbourSlug = deltaX < 0 ? next?.slug : previous?.slug;
        if (neighbourSlug) {
          propagateBackTarget(slug, neighbourSlug);
          router.push(`/work/${neighbourSlug}`);
        }
      };

      const onTouchCancel = () => {
        tracking = false;
      };

      container.addEventListener("touchstart", onTouchStart, { passive: true });
      container.addEventListener("touchend", onTouchEnd, { passive: true });
      container.addEventListener("touchcancel", onTouchCancel, { passive: true });
      return () => {
        container.removeEventListener("touchstart", onTouchStart);
        container.removeEventListener("touchend", onTouchEnd);
        container.removeEventListener("touchcancel", onTouchCancel);
      };
    }

    let startX = 0;
    let startY = 0;
    let startScrollY = 0;
    let tracking = false; // a touch is down and eligible to become a drag
    let captured = false; // dominance test passed — this touch IS a drag
    let activeDirection: "previous" | "next" | "back" | null = null;
    let lastResisted = 0;

    const setPeekTransform = (el: HTMLDivElement | null, resisted: number, direction: "previous" | "next") => {
      if (!el) return;
      const viewportWidth = window.innerWidth;
      const sign = direction === "previous" ? 1 : -1;
      const translate = (resisted - sign * viewportWidth) * PARALLAX_RATIO;
      const progress = Math.min(1, Math.abs(resisted) / viewportWidth);
      const scale = 0.94 + 0.06 * progress;
      const lift = 10 * (1 - progress);
      el.style.transform = `translate3d(${translate}px, ${lift}px, 0) scale(${scale})`;
      el.style.opacity = "1";
    };
    // The peek containers below carry `origin-top` for this scale() call
    // specifically — CSS's default transform-origin is the element's own
    // *centre*, so scaling a peek from 0.94 toward 1 was pulling its top
    // edge downward by (1-scale)/2 of its own height (~20px at rest) on
    // top of any of the numbers above, independent of `lift`. That read
    // as "the next project is higher up than the current project so when
    // it fully slides in it creates a jump," per Josh — confirmed
    // directly (getComputedStyle(peek).transformOrigin was reporting the
    // container's literal centre point). Anchoring the origin to the top
    // edge instead means scaling never moves that edge at all, so the
    // peek's content lands at exactly its final position throughout the
    // reveal, not just once scale reaches 1.

    const resetPeek = (el: HTMLDivElement | null, direction: "previous" | "next", animate: boolean) => {
      if (!el) return;
      const sign = direction === "previous" ? -1 : 1;
      el.style.transition = animate
        ? "transform 500ms var(--ease-bounce), opacity 500ms var(--ease-bounce)"
        : "";
      el.style.transform = `translate3d(${sign * 100}%, 0, 0) scale(0.94)`;
      el.style.opacity = "0";
    };

    const onTouchStart = (event: TouchEvent) => {
      tracking = false;
      captured = false;
      activeDirection = null;
      if (event.touches.length !== 1) return;
      const touchTarget = event.target instanceof Element ? event.target : null;
      if (touchTarget?.closest('[aria-modal="true"], video')) return;
      const x = event.touches[0].clientX;
      if (x < EDGE_GUARD || x > window.innerWidth - EDGE_GUARD) return;
      tracking = true;
      startX = x;
      startY = event.touches[0].clientY;
      startScrollY = window.scrollY;
      lastResisted = 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!tracking) return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      if (!captured) {
        if (Math.abs(deltaX) < ACTIVATION_DISTANCE && Math.abs(deltaY) < ACTIVATION_DISTANCE) return;

        if (Math.abs(deltaY) > Math.abs(deltaX) * DOMINANCE) {
          // Vertical-dominant — only claims the gesture as "pull down to
          // go back" when it's actually downward AND the page hasn't
          // scrolled at all yet ("only at scroll top," per Josh, so this
          // can never be confused with a normal downward scroll further
          // into the page). Anything else here reads as a plain scroll.
          if (deltaY <= 0 || startScrollY > 0) {
            tracking = false;
            return;
          }
          captured = true;
          activeDirection = "back";
          slab.style.transition = "";
          // Instant, no fade -- see BackTargetPeek's own doc comment for
          // why this needs no drag-linked animation of its own: it's
          // already sitting at its final position, just waiting to be
          // uncovered as the slab (falling away below) exposes it.
          if (backPeekRef.current) {
            backPeekRef.current.style.transition = "";
            backPeekRef.current.style.opacity = "1";
          }
        } else {
          if (Math.abs(deltaX) < ACTIVATION_DISTANCE) return;
          captured = true;
          activeDirection = deltaX < 0 ? "next" : "previous";
          if (
            (activeDirection === "next" && !next) ||
            (activeDirection === "previous" && !previous)
          ) {
            // No neighbour that direction — nothing to reveal, so don't
            // drag the slab away from a page it can't come back from
            // without wrapping. getProjectNeighbours wraps at both ends in
            // practice, so this only matters if a caller ever passes null.
            tracking = false;
            captured = false;
            return;
          }
          slab.style.transition = "";
          // Expand the dot pill back to its full window the instant the
          // press reads as a left/right drag -- "same size as is when
          // you start to press as if going left or right," per Josh.
          dotShrinkState.current.dragging = true;
          applyDotShrink();
        }
      }

      if (!captured || !activeDirection) return;
      event.preventDefault();

      if (activeDirection === "back") {
        const resisted = resist(deltaY);
        lastResisted = resisted;
        // Scales down slightly as it's pulled, on top of the translate,
        // rather than just a flat drag -- same "falling away" read as
        // the lightbox's own pull-to-close. No opacity fade during the
        // live drag any more, though: that used to fade the slab toward
        // transparent the same way the lightbox does, which was
        // invisible before this gesture had anything real behind it to
        // show through (just matching-colour canvas). Now that
        // BackTargetPeek renders the actual gallery/project behind it,
        // even a partial fade let its own colours ghost through the
        // "opaque" card mid-drag -- confirmed live, an unrelated-looking
        // image bleeding through the card's own text. The reveal already
        // reads correctly from the translate alone (a solid card lifting
        // to uncover what's under it), so the fade was pure liability
        // once there was something behind worth NOT x-raying.
        const progress = Math.min(1, resisted / COMPLETE_DISTANCE);
        slab.style.transform = `translate3d(0, ${resisted}px, 0) scale(${1 - progress * 0.04})`;
        return;
      }

      const resisted = resist(deltaX);
      lastResisted = resisted;
      slab.style.transform = `translate3d(${resisted}px, 0, 0)`;
      const peekRef = activeDirection === "previous" ? previousPeekRef : nextPeekRef;
      setPeekTransform(peekRef.current, resisted, activeDirection);

      // The accent dot slides from the active dot toward the incoming
      // neighbour's in step with the drag, hitting the neighbour exactly
      // at COMPLETE_DISTANCE -- so a fully handed-off dot doubles as
      // "release now and it navigates" feedback, not just decoration.
      // Direction: dragging left (resisted < 0) goes to `next`, whose
      // dot sits to the right, so the accent moves opposite the drag.
      if (accentDotRef.current) {
        const progress = Math.min(1, Math.abs(resisted) / COMPLETE_DISTANCE);
        const shift = -Math.sign(resisted) * DOT_PITCH * progress;
        accentDotRef.current.style.transition = "";
        accentDotRef.current.style.transform = `translate(-50%, -50%) translateX(${accentRestOffset + shift}px)`;
      }
    };

    const settle = () => {
      if (!captured || !activeDirection) {
        tracking = false;
        return;
      }

      if (activeDirection === "back") {
        if (lastResisted >= COMPLETE_DISTANCE) {
          // Committed — finish the fall away and hand off to the
          // browser's own back navigation (navigateToRoot, which is a
          // plain back() one step for a direct-link arrival, or a
          // multi-step history.go() when this chain reaches back to a
          // recorded gallery/Home root) — that's what restores the exact
          // scroll position left behind, wherever this chain started.
          slab.style.transition = "transform 260ms ease-in, opacity 260ms ease-in";
          slab.style.transform = `translate3d(0, ${lastResisted + 160}px, 0) scale(0.9)`;
          slab.style.opacity = "0";
          // Left visible, no fade-out -- the slab keeps falling away over
          // it for the remainder of this animation and the component
          // unmounts with the route change moments later anyway.
          window.setTimeout(navigateToRoot, 260);
        } else {
          slab.style.transition = "transform 420ms var(--ease-bounce), opacity 420ms var(--ease-bounce)";
          slab.style.transform = "";
          slab.style.opacity = "";
          if (backPeekRef.current) {
            backPeekRef.current.style.transition = "opacity 420ms var(--ease-bounce)";
            backPeekRef.current.style.opacity = "0";
          }
        }
        tracking = false;
        captured = false;
        activeDirection = null;
        return;
      }

      const peekRef = activeDirection === "previous" ? previousPeekRef : nextPeekRef;
      const neighbourSlug = activeDirection === "previous" ? previous?.slug : next?.slug;
      const viewportWidth = window.innerWidth;
      const sign = activeDirection === "previous" ? 1 : -1;

      if (Math.abs(lastResisted) >= COMPLETE_DISTANCE && neighbourSlug) {
        slab.style.transition = "transform 420ms var(--ease-bounce)";
        slab.style.transform = `translate3d(${sign * viewportWidth}px, 0, 0)`;
        if (peekRef.current) {
          peekRef.current.style.transition = "transform 420ms var(--ease-bounce)";
          peekRef.current.style.transform = "translate3d(0, 0, 0) scale(1)";
        }
        // dragging stays true through the exit animation on a completed
        // swipe -- applyDotShrink would otherwise re-target the accent,
        // which deliberately stays on the neighbour's dot (that's
        // exactly where the destination page renders its own resting
        // accent, so leaving it means no visible jump across the
        // navigation). The whole component unmounts with the route
        // change anyway.
        // Forwards this page's own recorded root on to the neighbour --
        // see propagateBackTarget's doc comment for why a pull-down
        // there should reveal the gallery/Home this chain started from,
        // not this page itself.
        propagateBackTarget(slug, neighbourSlug);
        router.push(`/work/${neighbourSlug}`);
      } else {
        // Cleared to "" (falls back to no transform at all), not set to
        // an explicit identity translate3d(0,0,0) -- *any* specified
        // transform value, including a no-op one, makes this element the
        // containing block for `position: fixed` descendants (see the
        // bug this caused, in the doc comment above). The transition
        // still animates smoothly toward the resulting `none`; only once
        // it actually finishes does the lightbox (a descendant, since it
        // mounts inside `children`) get its real viewport-relative fixed
        // positioning back.
        slab.style.transition = "transform 500ms var(--ease-bounce)";
        slab.style.transform = "";
        resetPeek(peekRef.current, activeDirection, true);
        // Drag over: let applyDotShrink spring the accent home and
        // re-collapse the pill if scroll had it shrunk -- one call
        // owns both, on the same bounce curve as the slab's own
        // spring-back.
        dotShrinkState.current.dragging = false;
        applyDotShrink();
      }

      tracking = false;
      captured = false;
      activeDirection = null;
    };

    const onTouchEnd = () => settle();
    const onTouchCancel = () => settle();

    resetPeek(previousPeekRef.current, "previous", false);
    resetPeek(nextPeekRef.current, "next", false);

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    container.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [slug, previous, next, router, accentRestOffset, applyDotShrink]);

  return (
    // overflow-x-clip, NOT overflow-x-hidden -- per CSS, a hidden x-axis
    // forces overflow-y from visible to auto, quietly making this a
    // vertical scroll container. That was harmless while the card had a
    // bottom margin (the shadow's downward throw fit inside the
    // container's own height), but once main was trimmed to end exactly
    // at the card's edge, the implied overflow-y:auto CLIPPED the card's
    // bottom shadow -- "the drop shadow seems to be covered by the
    // footer's white... need to have the shadow there covering the
    // footer," per Josh. `clip` clips the horizontal swipe travel
    // identically but never creates a scroll container, so the y-axis
    // stays genuinely visible and the shadow falls past the container
    // onto the revealed footer beneath.
    <div ref={containerRef} className="relative overflow-x-clip">
      {/* Floating dot strip, mobile only -- "something like the
          Instagram dots (in a carousel) so it lets the user know there
          are more pages to swipe through," then "the dots have to hover
          and have an animation as we swipe between projects," per Josh:
          fixed over the page (so it holds still while both cards slide
          underneath) with the gray windowed row static and the accent
          dot animating across it in step with the drag (see the
          touchmove handler). pointer-events-none + aria-hidden -- it's
          feedback, not a control; the breadcrumb arrows and the swipe
          itself are the navigation. z-20: over the slab (z-10), under
          the header (z-40) and lightbox (z-50). The dots sit in a small
          frosted pill -- "i think they might need a small pill
          surrounding them?" per Josh, once the bare dots were floating
          over live artwork where the gray ones could vanish against a
          busy image. Same glass recipe as the header's frostClass
          (nav.tsx), just at dot scale, so the one piece of floating
          chrome left outside the header still speaks the header's own
          material language rather than inventing a third surface. */}
      {projectCount > 1 && (
        <div
          ref={dotsRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 bottom-5 z-20 flex justify-center transition-opacity duration-300 md:hidden"
          // Baked hidden by default (mirrors the peeks' own baked resting
          // styles below, and for the same reason) — revealed is JS-only
          // state, so without this the strip would flash visible on first
          // paint before the scroll effect's first `update()` call hides
          // it over the hero.
          style={{ opacity: 0 }}
        >
          <div className="relative flex items-center gap-1.5 px-3.5 py-2.5">
            {/* The frosted surround, its own layer behind the dots so
                applyDotShrink can fade the whole surface with a single
                opacity write (see its comment on the plain-canvas
                zone). The header frostClass's glass recipe with one
                deviation: the brand wash's inset blur drops from 22px
                to 5px -- "make the bubble look less blue, only on the
                edges," per Josh. At the header pill's size a 22px
                inset blur reads as a rim tint, but at this pill's
                ~24px height it flooded the whole surface blue; a tight
                blur keeps the same tint hugging the rim only,
                canvas-clear in the middle. */}
            <span
              ref={dotChromeRef}
              className="absolute inset-0 rounded-full border border-transparent bg-canvas/15 shadow-[inset_0_1px_8px_rgba(255,255,255,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3),inset_0_0_5px_color-mix(in_srgb,var(--color-brand)_35%,transparent)] backdrop-blur-md backdrop-saturate-150 transition-opacity duration-300"
            />
            {dots.map((dot, offset) => {
              // Which side of the surviving trio this dot sits on, for
              // the shrink collapse (see applyDotShrink) -- unset for
              // the three that stay. `relative` so the gray dots paint
              // above the absolutely-positioned chrome layer -- a
              // positioned sibling otherwise wins the paint order over
              // static ones regardless of DOM order.
              const hideSide =
                offset < shrinkKeepStart
                  ? "left"
                  : offset > shrinkKeepStart + 2
                    ? "right"
                    : undefined;
              return (
                <span
                  key={dot.index}
                  data-dot-hide={hideSide}
                  className={`relative rounded-full bg-ink/20 transition-[width,margin,opacity] duration-300 ease-drift ${
                    dot.small ? "h-[4px] w-[4px]" : "h-[5.5px] w-[5.5px]"
                  }`}
                />
              );
            })}
            <span
              ref={accentDotRef}
              // bg-brand, not bg-accent -- "make the dot blue instead
              // of purple," per Josh, breaking from the active-nav
              // purple the first cut borrowed.
              className="absolute left-1/2 top-1/2 h-[7px] w-[7px] rounded-full bg-brand"
              style={{ transform: `translate(-50%, -50%) translateX(${accentRestOffset}px)` }}
            />
          </div>
        </div>
      )}
      {/* The peeks' resting transform/opacity are baked into the SSR
          markup as inline styles (identical values to what resetPeek
          writes at mount), not left for JS to apply -- they became
          load-bearing once the slab below went transparent under md:
          the 12px margin gaps around the card used to be backed by the
          slab's own opaque background, but now show straight through to
          whatever's behind, so an unstyled peek would be visible in
          those strips both in the gap between SSR paint and the
          effect's first resetPeek, and *permanently* under reduced
          motion, whose branch never touches peek styles at all. */}
      {previous && (
        <div
          ref={previousPeekRef}
          data-stack-peek="previous"
          className="fixed inset-x-0 bottom-0 z-0 origin-top will-change-transform"
          style={{ top: navHeight, transform: "translate3d(-100%, 0, 0) scale(0.94)", opacity: 0 }}
        >
          <StackPeek project={previous} />
        </div>
      )}
      {next && (
        <div
          ref={nextPeekRef}
          data-stack-peek="next"
          className="fixed inset-x-0 bottom-0 z-0 origin-top will-change-transform"
          style={{ top: navHeight, transform: "translate3d(100%, 0, 0) scale(0.94)", opacity: 0 }}
        >
          <StackPeek project={next} />
        </div>
      )}
      {/* The "back" peek — what a pull-down-to-go-back reveals. Only
          rendered once backTarget resolves (client-only, sessionStorage
          — see the effect above), so there's no SSR/hydration flash to
          bake a resting style against the way the previous/next peeks
          need to. No horizontal offset or scale of its own: unlike a
          sideways swipe, which simulates a whole new page sliding in
          from off-screen, "back" just uncovers a page that was already
          sitting exactly where it belongs the entire time — see
          BackTargetPeek's own doc comment. */}
      {backTarget && (
        <div
          ref={backPeekRef}
          data-stack-peek="back"
          className="fixed inset-x-0 bottom-0 z-0 will-change-transform"
          style={{ top: navHeight, opacity: 0 }}
        >
          <BackTargetPeek target={backTarget} />
        </div>
      )}
      {/* will-change-transform is back on the slab and both peeks (it
          used to be deliberately absent here -- see git history) --
          "the shadow under the project is still white? it needs to be
          shadow as i swipe," per Josh, on a real device: the card's
          shadow (project-content.tsx, already split onto its own
          non-clipping element to dodge a separate Safari box-shadow/
          overflow-hidden trap) was still rendering wrong specifically
          *during* the live drag, not at rest. A shadow glitching or
          flattening only while its ancestor is mid-transform-animation
          is a known Safari compositing issue -- without a layer-
          promotion hint, Safari can fail to correctly re-rasterize a
          shadow as its transformed ancestor updates every touchmove
          frame, instead of painting it once as a stable GPU layer that
          just translates/scales as a unit.

          This was left off deliberately in an earlier pass because
          will-change: transform makes an element the containing block
          for any `position: fixed` descendant, same as a real transform
          does -- the lightbox dialog used to mount inline inside
          `children`, so this was pinning it to *this div's* box instead
          of the real viewport ("something is up with the lightbox on
          mobile... seems to have dropped off screen," per Josh, at the
          time). That constraint no longer applies: LightboxOverlay now
          renders via createPortal(..., document.body) (see its own doc
          comment), so it's not a descendant of the slab or either peek
          in the DOM at all, regardless of what containing-block any of
          them establish. Safe to promote all three now that the one
          thing this used to break can't be broken by it anymore.

          bg-canvas is md-only now, not unconditional. The slab used to
          paint an opaque full-width background at every size, which put
          a square-edged 12px white strip -- the card's own mx-3 margin,
          backed by the slab behind it -- riding alongside the card's
          rounded corners during a drag, covering the revealed neighbour
          with a hard vertical edge that chopped straight through its
          title: "the white is cutting over the lettering of the project
          underneath," per Josh, with a screenshot that finally made the
          mechanism unambiguous (two earlier fixes -- splitting the
          card's shadow onto a non-clipping element, restoring
          will-change -- were aimed at Safari shadow-compositing bugs
          this was repeatedly mistaken for; the square white block was
          never the shadow at all). Below md the card inside
          (ProjectContent's own wrapper) is the opaque surface instead,
          so the margin gaps around it show what's genuinely behind:
          body canvas at rest -- visually identical, same colour -- and
          the incoming project mid-swipe, with only the card's
          translucent shadow crossing it. That's the actual
          stacked-cards read the permanent card was adopted for. From md
          up the card wrapper is unstyled/transparent, so the slab keeps
          being the opaque page surface there -- an md-width touch
          device (iPad portrait) mid-swipe would otherwise show the peek
          bleeding through the page's own unpainted regions. */}
      {/* data-stack-slab mirrors the peeks' own data-stack-peek: a
          stable hook for tests/tooling to find the real page's slab --
          the old approach of matching its utility classes broke the
          moment those classes changed (bg-canvas going md-only above),
          and a class-based selector was already one ambiguity away from
          grabbing a peek's copy of the same content instead. */}
      <div ref={slabRef} data-stack-slab className="relative z-10 will-change-transform md:bg-canvas">
        {children}
      </div>
    </div>
  );
}
