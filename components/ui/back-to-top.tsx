"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Resting distance from the viewport bottom, px — matches Tailwind's
 * bottom-11. Chosen so the docked gap above the button (last grid image to
 * button top) and below it (button bottom to the footer's top edge) come
 * out equal, not just "some room" — "can the gap between project and the
 * gap between the footer bar be equal," per Josh. That symmetry only holds
 * at one specific button height, since the space between the grid's own
 * bottom padding and the footer is fixed regardless of the button's size:
 * (that fixed space − button height) / 2. Recompute this if the pill's
 * padding/text size or the grid's own bottom padding (pb-32, /work and the
 * home-embedded gallery) ever change again.
 */
const RESTING_OFFSET = 44;

/**
 * Floating "back to top" pill for long, unpaginated grids (Work). Now
 * carries the same nav-pill treatment as the header (nav.tsx) rather than
 * the filter chips' Waldeck styling it used before: centred in the
 * viewport instead of pinned to the right edge, font-body instead of
 * Waldeck uppercase (matching the header's own Work/Shop/Info/Contact
 * words), sized to match the main pill (px-8/12 py-5/6, text-[17px]/[22px])
 * rather than its own small chip scale, and the real nav-pill-hover
 * squash-and-stretch keyframe (globals.css) on hover/tap instead of a plain
 * hover:scale-105 — "the same gloopy bounce," per Josh. Frosted-glass
 * surface (bg-canvas/15 + backdrop-blur-md) carries over unchanged. Waldeck
 * Black/uppercase was tried in place of font-body (matching the site's
 * other pill chips instead of the nav) and reverted — "for continuity,
 * back to top has to be in Helvetica to match the nav bar," per Josh.
 *
 * The edge itself went through two tries. First a flat border colour
 * (black, then the blue hairline token once frosted), then a blend-mode
 * ring meant to react to whatever's behind it — reverted, it just read as
 * a plain thin outline, "not quite a cooler highlight or glassy reflective
 * state." Now an asymmetric inset shadow instead of a border at all
 * (bright along the top inner edge, faint at the bottom, the standard
 * glassmorphism light-catching-the-rim technique) plus
 * backdrop-saturate-150 so the blurred colour underneath reads richer
 * rather than just softened — same treatment as nav.tsx's frostClass, kept
 * in sync with it.
 *
 * `translate` and `scale` are listed explicitly in the transition, not
 * `transform` — the keyframe bounces below animate `transform` directly,
 * and Tailwind v4's translate/scale/rotate are independent CSS properties
 * from `transform` itself, so the mount pop-in/out (which only ever
 * touches translate/scale) and the keyframe bounces (which only ever
 * touch transform) never fight for the same property.
 *
 * Three separate moments now play the nav pill's own squash-and-stretch
 * bounce (nav-pill-pop/-landing/-hover, globals.css), not just hover —
 * "it is lacking some of the stick and bounce on hover, when it hits the
 * end of the page or first appears," per Josh:
 *   - First appearing (scrolled past one viewport) — nav-pill-pop.
 *   - Docking above the footer (the "stuck" moment, mirroring nav.tsx's
 *     own "stuck, then unstuck" read of hitting the top of the page) —
 *     nav-pill-landing.
 *   - Hover/tap — nav-pill-hover, unconditional so it always retriggers
 *     regardless of which of the two states above is current.
 * `bounceClass` below picks exactly one of the first two per render (never
 * both at once) — docked implies visible, so it takes priority. Two
 * distinctly-named keyframes, not one reused: an animation only replays
 * when the browser sees animation-name actually change value, so
 * alternating names across appear/dock/undock/hide is what makes this
 * retrigger every single time, in every direction, indefinitely — the
 * exact reasoning nav.tsx's own doc comment on nav-pill-landing walks
 * through. hover:/active: nav-pill-hover stays a separate, unconditional
 * declaration outside bounceClass, same as jM/Cart in nav.tsx, so it always
 * differs from whatever bounceClass is currently playing (none, pop, or
 * landing) and retriggers on every fresh hover regardless of scroll state.
 *
 * Appears once the page has scrolled past one viewport height and smooth-
 * scrolls to top on click. Omits an explicit `behavior` from `scrollTo` so
 * the global `scroll-behavior` CSS rule (and its reduced-motion override)
 * decides smooth vs instant, rather than duplicating that logic here.
 *
 * Pops in rather than just fading — scale + a small rise, plus the
 * nav-pill-pop bounce above. The global prefers-reduced-motion rule in
 * globals.css (transition-duration/animation-duration: 0.01ms !important)
 * neutralises the pop-in transition and every keyframe here automatically,
 * no extra guard needed.
 *
 * Fixed to the viewport at rest, but docks 32px above the footer's top edge
 * once the footer scrolls into view, rather than sitting on top of it. That
 * offset changes on every scroll frame while the footer is entering, so it's
 * written straight to the DOM via a ref rather than through React state —
 * the same reasoning as the orbit loop and Parallax elsewhere in this repo.
 * Whether it's docked *at all* is separate boolean state, though (`docked`)
 * — unlike the continuous px offset, that's a discrete on/off the bounce
 * keys off, so it has to be state React can render a class from.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [docked, setDocked] = useState(false);
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
      setDocked(footerVisible > 0);
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

  // Exactly one of these, never both — docked implies visible, so it wins.
  // See the doc comment above for why this has to be two distinctly-named
  // keyframes rather than one reused.
  const bounceClass = docked
    ? "animate-[nav-pill-landing_650ms_ease-in-out]"
    : visible
      ? "animate-[nav-pill-pop_650ms_ease-in-out]"
      : "";

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-11 left-1/2 z-30 -translate-x-1/2 rounded-full border border-transparent bg-canvas/15 px-6 py-4 font-body text-[15px] text-ink shadow-[inset_0_1px_8px_rgba(255,255,255,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)] backdrop-blur-md backdrop-saturate-150 transition-[color,background-color,translate,scale,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:animate-[nav-pill-hover_650ms_ease-in-out] hover:text-brand active:animate-[nav-pill-hover_650ms_ease-in-out] active:bg-brand active:text-canvas md:px-8 md:py-5 md:text-[18px] ${bounceClass} ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-50 opacity-0"
      }`}
    >
      Back to Top
    </button>
  );
}
