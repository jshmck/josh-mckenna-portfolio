"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { ProjectContent } from "@/components/work/project-content";
import type { Project } from "@/lib/projects";

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
  previous?: Project | null;
  next?: Project | null;
  children: ReactNode;
};

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
export function ProjectStackSwipe({ previous, next, children }: ProjectStackSwipeProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const slabRef = useRef<HTMLDivElement>(null);
  const previousPeekRef = useRef<HTMLDivElement>(null);
  const nextPeekRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState(NAV_HEIGHT_FALLBACK);

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

  useEffect(() => {
    const container = containerRef.current;
    const slab = slabRef.current;
    if (!container || !slab || (!previous && !next)) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reduced motion: the original ProjectSwipeNav behaviour, no drag
    // visuals at all — see the doc comment above for why this doesn't
    // try to keep a stripped-down version of the motion instead.
    if (reduced) {
      let startX = 0;
      let startY = 0;
      let tracking = false;

      const onTouchStart = (event: TouchEvent) => {
        tracking = false;
        if (event.touches.length !== 1) return;
        const target = event.target instanceof Element ? event.target : null;
        if (target?.closest('[aria-modal="true"], video')) return;
        tracking = true;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
      };

      const onTouchEnd = (event: TouchEvent) => {
        if (!tracking) return;
        tracking = false;
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        if (Math.abs(deltaX) < COMPLETE_DISTANCE) return;
        if (Math.abs(deltaX) < Math.abs(deltaY) * DOMINANCE) return;
        const slug = deltaX < 0 ? next?.slug : previous?.slug;
        if (slug) router.push(`/work/${slug}`);
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
    let tracking = false; // a touch is down and eligible to become a drag
    let captured = false; // dominance test passed — this touch IS a drag
    let activeDirection: "previous" | "next" | null = null;
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
      lastResisted = 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!tracking) return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      if (!captured) {
        if (Math.abs(deltaX) < ACTIVATION_DISTANCE) return;
        if (Math.abs(deltaX) < Math.abs(deltaY) * DOMINANCE) {
          tracking = false; // reads as a scroll — stop watching this touch
          return;
        }
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
      }

      if (!captured || !activeDirection) return;
      event.preventDefault();
      const resisted = resist(deltaX);
      lastResisted = resisted;
      slab.style.transform = `translate3d(${resisted}px, 0, 0)`;
      const peekRef = activeDirection === "previous" ? previousPeekRef : nextPeekRef;
      setPeekTransform(peekRef.current, resisted, activeDirection);
    };

    const settle = () => {
      if (!captured || !activeDirection) {
        tracking = false;
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
  }, [previous, next, router]);

  return (
    <div ref={containerRef} className="relative overflow-x-hidden">
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
