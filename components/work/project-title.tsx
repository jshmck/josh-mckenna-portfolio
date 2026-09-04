"use client";

import { useEffect, useRef } from "react";

type ProjectTitleProps = {
  /** Every word except the last — "" for a single-word title. */
  head: string;
  /** The final word, always rendered. */
  last: string;
  className?: string;
};

/**
 * The project detail page's big display h1 — split out from page.tsx into
 * its own client component purely because shrinking to fit needs a DOM
 * measurement, which a server component can't do.
 *
 * type-heading's font-size is a `clamp()` that only tracks viewport width,
 * not the actual rendered text — so a long unbroken word ("REGENeRATIVELY")
 * at the clamp's own floor can still be wider than the phone showing it,
 * pushing the whole page into horizontal scroll. "titles ... cause the
 * screen to be too wide and need swiping across, lets change the font size
 * when this happens," per Josh (surfaced by "Living Regeneratively", since
 * renamed to "Rooted Journal" — but the fit logic stays sitewide since any
 * future long title can hit the same wall).
 *
 * Self-limiting rather than mobile-scoped: it measures real overflow
 * (`scrollWidth` vs `clientWidth`) at whatever viewport it's running at, so
 * it only ever shrinks when the title actually doesn't fit — a no-op at
 * desktop widths, where max-w-4xl and the clamp's own upper range already
 * leave headroom. Below md the last word breaks onto its own line already
 * (see page.tsx's displayTitleHead/-Last split) — scrollWidth still
 * reflects whichever of the two lines is wider, so one measurement covers
 * both.
 *
 * Reset-then-remeasure on every check: the inline override from a
 * *previous* check is cleared first, so each pass measures the title at
 * its true CSS-clamp size for the *current* viewport, not against an
 * already-shrunk one — otherwise repeated resizes would only ever ratchet
 * the size down, never back up when the viewport grows again. A plain
 * mount + resize effect, not a rAF scroll loop — this sets font-size once
 * per layout change, not every frame, so it doesn't fall under the
 * animate-through-rAF-not-React-state rule elsewhere in this repo (that
 * rule is about 60fps motion; this is a one-shot layout snap).
 */
export function ProjectTitle({ head, last, className = "" }: ProjectTitleProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let raf = 0;

    const fit = () => {
      const el = ref.current;
      if (!el) return;

      // Clear any previous shrink before measuring, so `natural` always
      // reflects the clamp's real size at the current viewport.
      el.style.fontSize = "";
      const available = el.clientWidth;
      const natural = el.scrollWidth;

      if (natural > available && natural > 0) {
        const naturalPx = parseFloat(getComputedStyle(el).fontSize);
        // 2% under the exact ratio so the shrunk line doesn't sit flush
        // against the container's edge.
        el.style.fontSize = `${(naturalPx * available * 0.98) / natural}px`;
      }
    };

    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };

    fit();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
    // Re-measure whenever the words themselves change (client-side route
    // change between two project pages never remounts this component the
    // way a full page load would).
  }, [head, last]);

  return (
    // data-project-title: ProjectStackSwipe's dot-strip reveal anchors on
    // this h1's bottom edge crossing under the sticky header — see its
    // comment for the timing rule.
    <h1 ref={ref} data-project-title className={className}>
      {head ? (
        <>
          {head} <br className="md:hidden" />
          {last}
        </>
      ) : (
        last
      )}
    </h1>
  );
}
