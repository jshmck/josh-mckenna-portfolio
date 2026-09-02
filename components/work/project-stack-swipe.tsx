"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

import { ProjectContent } from "@/components/work/project-content";
import type { Project } from "@/lib/projects";

/** Minimum resisted travel, px, before a released drag counts as a
 *  completed swipe rather than springing back. */
const COMPLETE_DISTANCE = 96;

/** The persistent nav (nav.tsx: `h-[88px]`, sticky, shared across every
 *  route from the root layout) is never duplicated inside the peek — it's
 *  already on screen throughout the swipe, right where it always is. The
 *  real page's own content sits in normal flow *below* it, but the peek
 *  is `position: fixed`, so without this offset its content started
 *  filling from true y=0 instead — "the next project is higher up than
 *  the current project so when it fully slides in it creates a jump,"
 *  per Josh. Reserving the same 88px here is what makes the peek's
 *  content land exactly where the same content lands once real
 *  navigation completes and it's back in normal flow under the nav. */
const NAV_HEIGHT = 88;

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
 *  unlikely. `aria-hidden` — this is a second, non-interactive copy of
 *  page content that shouldn't register with assistive tech, on top of
 *  already being `pointer-events-none` for sighted/mouse interaction. */
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
 * The chevron circles' own "beckon" nudge (back-to-top.tsx) exists to
 * advertise this same gesture, so the two ship together.
 *
 * Dispatches `stackswipe:start`/`stackswipe:end` on `window` for the
 * duration of a captured drag — nav.tsx listens and forces its own
 * frosted-pill state while one's in progress, regardless of scroll
 * position. "when swiping projects can the nav bar at the top be the
 * frosted pill state so you see the movement underneath. at the moment
 * it's permanently there looks strange," per Josh: at scrollY 0 (the
 * common case — most swipes happen right after landing on a page, not
 * after scrolling into the gallery) the nav's own resting state is a
 * plain, opaque bar with nothing sliding-glass about it, which read as
 * static and disconnected from the page moving underneath it. A plain
 * custom DOM event, not prop-drilling or a shared context — the two
 * components live in entirely different parts of the tree (nav.tsx in
 * the root layout, this one deep inside a single route's page), and
 * nav.tsx already reads external page state the same loosely-coupled
 * way (querying `[data-nav-contrast="light"]` elsewhere in the DOM)
 * rather than through props passed down from a common ancestor.
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
  const shadowRef = useRef<HTMLDivElement>(null);
  const previousPeekRef = useRef<HTMLDivElement>(null);
  const nextPeekRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previous) router.prefetch(`/work/${previous.slug}`);
    if (next) router.prefetch(`/work/${next.slug}`);
  }, [previous, next, router]);

  useEffect(() => {
    const container = containerRef.current;
    const slab = slabRef.current;
    const shadow = shadowRef.current;
    if (!container || !slab || !shadow || (!previous && !next)) return;

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
        shadow.style.transition = "";
        window.dispatchEvent(new Event("stackswipe:start"));
      }

      if (!captured || !activeDirection) return;
      event.preventDefault();
      const resisted = resist(deltaX);
      lastResisted = resisted;
      const translate = `translate3d(${resisted}px, 0, 0)`;
      slab.style.transform = translate;
      shadow.style.transform = translate;
      const peekRef = activeDirection === "previous" ? previousPeekRef : nextPeekRef;
      setPeekTransform(peekRef.current, resisted, activeDirection);
    };

    const settle = () => {
      if (!captured || !activeDirection) {
        tracking = false;
        return;
      }

      window.dispatchEvent(new Event("stackswipe:end"));

      const peekRef = activeDirection === "previous" ? previousPeekRef : nextPeekRef;
      const neighbourSlug = activeDirection === "previous" ? previous?.slug : next?.slug;
      const viewportWidth = window.innerWidth;
      const sign = activeDirection === "previous" ? 1 : -1;

      if (Math.abs(lastResisted) >= COMPLETE_DISTANCE && neighbourSlug) {
        slab.style.transition = "transform 420ms var(--ease-bounce)";
        slab.style.transform = `translate3d(${sign * viewportWidth}px, 0, 0)`;
        shadow.style.transition = "transform 420ms var(--ease-bounce)";
        shadow.style.transform = `translate3d(${sign * viewportWidth}px, 0, 0)`;
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
        // positioning back. shadow has no descendants of its own to worry
        // about, but clearing it the same way keeps both elements' resting
        // state expressed identically.
        slab.style.transition = "transform 500ms var(--ease-bounce)";
        slab.style.transform = "";
        shadow.style.transition = "transform 500ms var(--ease-bounce)";
        shadow.style.transform = "";
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
      {previous && (
        <div
          ref={previousPeekRef}
          data-stack-peek="previous"
          className="fixed inset-x-0 bottom-0 z-0 origin-top"
          style={{ top: NAV_HEIGHT }}
        >
          <StackPeek project={previous} />
        </div>
      )}
      {next && (
        <div
          ref={nextPeekRef}
          data-stack-peek="next"
          className="fixed inset-x-0 bottom-0 z-0 origin-top"
          style={{ top: NAV_HEIGHT }}
        >
          <StackPeek project={next} />
        </div>
      )}
      {/* The shadow lives on its own element now, not on the slab --
          "i think it's because the project page has a top... maybe we
          need to make the project page the full height of the browser?
          either that or curve the edge?" per Josh. The slab is a normal-
          flow element that only starts at y=88 (wherever document flow
          puts it, right after the sticky nav reserves its own space),
          so a box-shadow applied directly to it wrapped around all four
          of *its* edges, including a visible horizontal line right
          under the nav where the slab's own top edge sits -- reading as
          "the page has a top" instead of a seamless card sliding past
          the nav. Rather than fight the slab's real document-flow
          height with negative margins (fragile -- margin collapsing
          through however many ancestors sit between this and <body>
          isn't something to reason about with confidence), this is a
          second, empty, `fixed inset-0` element with no background of
          its own -- genuinely full viewport height regardless of where
          the slab's real content starts, so its own top edge sits
          behind the nav instead of just under it. Kept in lockstep with
          the slab's own transform at every step (touchmove and both
          settle() branches) rather than being a child of it, so it
          reads as one shadow, not two. z-[5], between the peeks (z-0)
          and the slab (z-10) -- doesn't need to be above the slab (the
          shadow was never meant to paint over the real content) and
          shouldn't be above the nav (z-40) either. */}
      <div
        ref={shadowRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[5] shadow-[0_0_50px_10px_rgba(0,0,0,0.35)]"
      />
      {/* No will-change-transform here (unlike Parallax's own slab) --
          will-change: transform makes an element the containing block
          for any `position: fixed` descendant, same as an actual
          transform does, and the lightbox dialog (LightboxOverlay,
          `fixed inset-0`) mounts inside `children` -- it was pinning
          itself to *this div's* box instead of the real viewport,
          "something is up with the lightbox on mobile... seems to have
          dropped off screen," per Josh, on every project. Skipping the
          perf hint is the fix: the first real `transform` write already
          happens synchronously in the touchmove handler, well before any
          paint, so there's nothing will-change would have preloaded in
          time to matter anyway. */}
      <div ref={slabRef} className="relative z-10 bg-canvas">
        {children}
      </div>
    </div>
  );
}
