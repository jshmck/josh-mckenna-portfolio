"use client";

import { useEffect, useRef, useState } from "react";

/** Resting distance from the viewport bottom, px — matches Tailwind's bottom-8. */
const RESTING_OFFSET = 32;

/**
 * Floating "back to top" pill for long, unpaginated grids (Work). Now
 * carries the same nav-pill treatment as the header (nav.tsx) rather than
 * the filter chips' Waldeck styling it used before: centred in the
 * viewport instead of pinned to the right edge, font-body instead of
 * Waldeck uppercase (matching the header's own Work/Shop/Info/Contact
 * words), sized to match the main pill (px-8/12 py-5/6, text-[17px]/[22px])
 * rather than its own small chip scale, the blue hairline outline the main
 * pill wears once frosted (not the black neutral outline this used to have
 * — BackToTop is only ever visible well past the frost threshold, so it
 * can just wear that state permanently instead of transitioning into it),
 * and the real nav-pill-hover squash-and-stretch keyframe (globals.css) on
 * hover/tap instead of a plain hover:scale-105 — "the same gloopy bounce,"
 * per Josh. Frosted-glass surface (bg-canvas/15 + backdrop-blur-md)
 * carries over unchanged.
 *
 * `translate` and `scale` are listed explicitly in the transition, not
 * `transform` — the hover keyframe animates `transform` directly, and
 * Tailwind v4's translate/scale/rotate are independent CSS properties from
 * `transform` itself, so the mount pop-in/out (which only ever touches
 * translate/scale) and the hover bounce (which only ever touches
 * transform) never fight for the same property.
 *
 * Appears once the page has scrolled past one viewport height and smooth-
 * scrolls to top on click. Omits an explicit `behavior` from `scrollTo` so
 * the global `scroll-behavior` CSS rule (and its reduced-motion override)
 * decides smooth vs instant, rather than duplicating that logic here.
 *
 * Pops in rather than just fading — scale + a small rise. The global
 * prefers-reduced-motion rule in globals.css (transition-duration:
 * 0.01ms !important) neutralises both the pop-in and the hover keyframe
 * automatically, no extra guard needed here.
 *
 * Fixed to the viewport at rest, but docks 32px above the footer's top edge
 * once the footer scrolls into view, rather than sitting on top of it. That
 * offset changes on every scroll frame while the footer is entering, so it's
 * written straight to the DOM via a ref rather than through React state —
 * the same reasoning as the orbit loop and Parallax elsewhere in this repo.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    let queued = false;

    const update = () => {
      queued = false;
      setVisible(window.scrollY > window.innerHeight);

      const button = buttonRef.current;
      const footer = document.querySelector("footer");
      if (!button || !footer) return;

      const footerVisible = Math.max(0, window.innerHeight - footer.getBoundingClientRect().top);
      button.style.bottom = `${Math.max(RESTING_OFFSET, footerVisible + RESTING_OFFSET)}px`;
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-full border border-hairline bg-canvas/15 px-8 py-5 font-body text-[17px] text-ink backdrop-blur-md transition-[color,background-color,translate,scale,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:animate-[nav-pill-hover_650ms_ease-in-out] hover:text-brand active:animate-[nav-pill-hover_650ms_ease-in-out] active:bg-brand active:text-canvas md:px-12 md:py-6 md:text-[22px] ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-50 opacity-0"
      }`}
    >
      Back to Top
    </button>
  );
}
