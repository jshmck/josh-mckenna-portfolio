"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Minimum horizontal travel, px, before a touch counts as a swipe — long
 *  enough that a sloppy tap or a diagonal scroll flick never navigates. */
const SWIPE_DISTANCE = 64;

/** The horizontal delta must beat the vertical delta by this factor, so a
 *  mostly-vertical scroll that drifts sideways stays a scroll. */
const SWIPE_DOMINANCE = 1.5;

type ProjectSwipeNavProps = {
  previousSlug?: string;
  nextSlug?: string;
};

/**
 * Swipe-to-navigate between project pages — "I want the projects to be
 * swipable from one to another," per Josh, alongside the Previous/Next
 * chevron circles landing on mobile (whose beckon nudge, see
 * back-to-top.tsx, exists to advertise exactly this gesture). Swiping
 * left goes to the next project, right to the previous — matching the
 * chevrons' own directions. Renders nothing; just page-level touch
 * listeners, so it works over the whole article, not one strip of it.
 *
 * Deliberately dumb: navigate on release, no drag-follow carousel. The
 * decision happens on touchend from start/end coordinates alone — no
 * per-frame work, so there's nothing here for the reduced-motion rAF
 * rule to guard (navigation is a user-initiated action, not decorative
 * motion; the page transition itself is instant).
 *
 * Two starting surfaces are excluded:
 * - Inside the lightbox ([aria-modal="true"] covers the full viewport
 *   while open) — it has its own Previous/Next paging through the
 *   images; a swipe there changing the whole page underneath it would
 *   be disorienting.
 * - On a <video> — sound-on clips carry native controls, and their
 *   scrub bar is itself a horizontal drag.
 *
 * Listeners are passive: the gesture never calls preventDefault, so
 * scrolling stays on the compositor thread. touchcancel (the browser
 * claiming the gesture — e.g. an edge-swipe history navigation) drops
 * the tracked touch rather than letting a later touchend misread it.
 */
export function ProjectSwipeNav({ previousSlug, nextSlug }: ProjectSwipeNavProps) {
  const router = useRouter();

  useEffect(() => {
    if (!previousSlug && !nextSlug) return;

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
      if (Math.abs(deltaX) < SWIPE_DISTANCE) return;
      if (Math.abs(deltaX) < Math.abs(deltaY) * SWIPE_DOMINANCE) return;
      const slug = deltaX < 0 ? nextSlug : previousSlug;
      if (slug) router.push(`/work/${slug}`);
    };

    const onTouchCancel = () => {
      tracking = false;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [router, previousSlug, nextSlug]);

  return null;
}
