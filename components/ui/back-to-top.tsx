"use client";

import { useEffect, useRef, useState } from "react";

/** Resting distance from the viewport bottom, px — matches Tailwind's bottom-8. */
const RESTING_OFFSET = 32;

/**
 * Floating "back to top" pill for long, unpaginated grids (Work). Same
 * Waldeck font and pill shape as the filter chips, and now the same
 * rest/hover/active colour progression too (black outline -> brand
 * outline+text on hover -> filled brand/canvas on active) — but with a
 * frosted-glass surface (bg-canvas/15 + backdrop-blur-md) matching the nav
 * header instead of the chip's flat canvas fill. Tried a plain
 * shadow-lg/bg-ink pill first, but it was the only shadow anywhere on the
 * site (everything else is flat colour/outline), so it came off in favour
 * of this. Black border, not the blue hairline token, so it reads as a
 * neutral outline at rest rather than pre-empting the brand-blue active
 * state. Plain CSS `uppercase`, not toWaldeckCase() -- tried the
 * lowercase quirk here too, but at this scale it read as a mistake
 * rather than a deliberate brand detail, same call already made for the
 * filter chips and the project prev/next nav.
 *
 * Appears once the page has scrolled past one viewport height and smooth-
 * scrolls to top on click. Omits an explicit `behavior` from `scrollTo` so
 * the global `scroll-behavior` CSS rule (and its reduced-motion override)
 * decides smooth vs instant, rather than duplicating that logic here.
 *
 * Pops in rather than just fading — scale + a small rise, eased with the
 * same overshoot/bounce curve the jM logo's hover/tap bounce uses
 * (nav.tsx), so it reads as an established site motion rather than a
 * one-off. The global
 * prefers-reduced-motion rule in globals.css (transition-duration:
 * 0.01ms !important) neutralises the bounce automatically, no extra guard
 * needed here.
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
      className={`font-display fixed bottom-8 right-8 z-30 rounded-full border border-ink bg-canvas/15 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.02em] text-ink backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:border-brand hover:text-brand active:border-brand active:bg-brand active:text-canvas ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-50 opacity-0"
      }`}
    >
      Back to top
    </button>
  );
}
