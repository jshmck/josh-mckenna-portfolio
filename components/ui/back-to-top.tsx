"use client";

import { useEffect, useRef, useState } from "react";

/** Resting distance from the viewport bottom, px — matches Tailwind's bottom-8. */
const RESTING_OFFSET = 32;

/**
 * Floating "back to top" pill for long, unpaginated grids (Work). Styled to
 * match the active filter chip — same Waldeck font, same pill — so it reads
 * as part of the same control family, not a bolted-on widget.
 *
 * Appears once the page has scrolled past one viewport height and smooth-
 * scrolls to top on click. Omits an explicit `behavior` from `scrollTo` so
 * the global `scroll-behavior` CSS rule (and its reduced-motion override)
 * decides smooth vs instant, rather than duplicating that logic here.
 *
 * Pops in rather than just fading — scale + a small rise, eased with the
 * same overshoot/bounce curve the compact nav header uses (nav.tsx), so it
 * reads as an established site motion rather than a one-off. The global
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
      className={`font-display fixed bottom-8 right-8 z-30 rounded-full bg-ink px-4 py-2 text-[11px] font-medium uppercase tracking-[0.02em] text-canvas shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:opacity-80 ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-50 opacity-0"
      }`}
    >
      Back to top
    </button>
  );
}
