"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Resting distance from the viewport bottom, px — matches Tailwind's
 * bottom-11. Chosen so the docked gap above the button (last grid image to
 * button top) and below it (button bottom to the footer's top edge) come
 * out equal, not just "some room" — "can the gap between project and the
 * gap between the footer bar be equal," per Josh. That symmetry only holds
 * at one specific pill height, since the space between the grid's own
 * bottom padding and the footer is fixed regardless of the pill's size:
 * (that fixed space − pill height) / 2. Recompute this if the pill's
 * padding/text size or the grid's own bottom padding (pb-32, /work and the
 * home-embedded gallery) ever change again. Previous/Next share the same
 * py as the centre button (see SEGMENT below) specifically so adding them
 * doesn't change the pill's height and silently invalidate this constant.
 */
const RESTING_OFFSET = 44;

type ProjectNeighbour = {
  slug: string;
};

type BackToTopProps = {
  /**
   * Previous/next project, project pages only — getProjectNeighbours()
   * wraps at both ends, so on a project page these are effectively always
   * both present. Home/Work/Info pass neither, which renders the original
   * single "Back to top" pill unchanged.
   */
  previous?: ProjectNeighbour | null;
  next?: ProjectNeighbour | null;
};

/**
 * Floating "back to top" pill for long, unpaginated grids (Work), now also
 * doing double duty as project-to-project navigation on /work/[slug] —
 * "let's try it in the back to top nav bar - next and previous," per Josh,
 * after the footer's own Previous/All Work/Next nav (same page) turned out
 * to be too far down a long gallery (17 images on Beefbar) to reach without
 * a lot of scrolling. Carries the same nav-pill treatment as the header
 * (nav.tsx) rather than the filter chips' Waldeck styling it used before:
 * centred in the viewport instead of pinned to the right edge, font-body
 * instead of Waldeck uppercase (matching the header's own Work/Shop/Info/
 * Contact words), sized to match the main pill (px-8/12 py-5/6,
 * text-[17px]/[22px]) rather than its own small chip scale, and the real
 * nav-pill-hover squash-and-stretch keyframe (globals.css) on hover/tap
 * instead of a plain hover:scale-105 — "the same gloopy bounce," per Josh.
 * Frosted-glass surface (bg-canvas/15 + backdrop-blur-md) carries over
 * unchanged. Waldeck Black/uppercase was tried in place of font-body
 * (matching the site's other pill chips instead of the nav) and reverted —
 * "for continuity, back to top has to be in Helvetica to match the nav
 * bar," per Josh.
 *
 * Previous/Next render as plain "<"/">" characters, not the footer nav's
 * unicode arrows — "I prefer < > over arrows," per Josh, once he'd seen
 * both side by side. Each is its own `<Link>` with an aria-label carrying
 * the real meaning ("Previous project"/"Next project") since the glyph
 * alone says nothing to a screen reader. All three segments (Previous,
 * the centre button, Next) sit inside one shared frosted pill rather than
 * three separate pills-within-a-pill — same structure as nav.tsx's centre
 * pill (jM/Cart are their own circles, but Work/Shop/Info/Contact share
 * one pill as plain text), and each segment gets its own hover/active
 * nav-pill-hover bounce independently, same reasoning as nav.tsx's links:
 * a shared bounce on the whole pill would fire from a hover anywhere in
 * it, not just the segment actually under the cursor.
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
 * in sync with it (nav.tsx has no equivalent need for the glow below,
 * since it always sits over page content, never bare canvas).
 *
 * A third shadow layer adds a brand-blue wash *inside* the pill (inset, not
 * an outer glow -- tried outer first, then accent-purple and very faint,
 * "try it on the inside of the pill very faint," before landing here --
 * "a bit more obvious... try blue" per Josh once he'd seen both) so the
 * glass treatment reads as tinted rather than colourless even when there's
 * no colourful artwork behind it to pick up, "doesn't stand out" against a
 * plain canvas-coloured section otherwise. Hover text and the :active fill
 * both went brand too, matching this wash -- back-to-top briefly tried
 * accent (purple) for both, matching the rest of the site's hover/active
 * convention, but Josh asked for blue everywhere on this one control once
 * he saw the blue wash next to purple text. color-mix(...) against
 * var(--color-brand) rather than a raw rgba hex, so it always tracks the
 * real brand token if it ever changes. Always on, not just hover/active --
 * the whole point is making the resting state findable on a light
 * background.
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
 *   - Hover/tap on any one segment — nav-pill-hover, unconditional so it
 *     always retriggers regardless of which of the two states above is
 *     current.
 * `bounceClass` below picks exactly one of the first two per render (never
 * both at once) — docked implies visible, so it takes priority. Two
 * distinctly-named keyframes, not one reused: an animation only replays
 * when the browser sees animation-name actually change value, so
 * alternating names across appear/dock/undock/hide is what makes this
 * retrigger every single time, in every direction, indefinitely — the
 * exact reasoning nav.tsx's own doc comment on nav-pill-landing walks
 * through. hover:/active: nav-pill-hover stays a separate, unconditional
 * declaration on each segment, same as jM/Cart/the centre links in
 * nav.tsx, so it always differs from whatever bounceClass is currently
 * playing on the pill (none, pop, or landing) and retriggers on every
 * fresh hover regardless of scroll state.
 *
 * Appears once the page has scrolled past one viewport height. The centre
 * button smooth-scrolls to top on click; Previous/Next just navigate.
 * Omits an explicit `behavior` from `scrollTo` so the global
 * `scroll-behavior` CSS rule (and its reduced-motion override) decides
 * smooth vs instant, rather than duplicating that logic here.
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
export function BackToTop({ previous, next }: BackToTopProps = {}) {
  const [visible, setVisible] = useState(false);
  const [docked, setDocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    let queued = false;

    const update = () => {
      queued = false;
      setVisible(window.scrollY > window.innerHeight);

      const container = containerRef.current;
      const footer = document.querySelector("footer");
      if (!container || !footer) return;

      const footerVisible = Math.max(0, window.innerHeight - footer.getBoundingClientRect().top);
      setDocked(footerVisible > 0);
      container.style.bottom = `${Math.max(RESTING_OFFSET, footerVisible + RESTING_OFFSET)}px`;
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

  const visibility = visible
    ? "translate-y-0 scale-100 opacity-100"
    : "pointer-events-none translate-y-4 scale-50 opacity-0";

  // Every segment (Previous, the centre button, Next) shares this — same
  // hover/active bounce and colour shift as nav.tsx's centre links, fired
  // per-segment rather than on the pill as a whole.
  const SEGMENT =
    "rounded-full font-body text-ink transition-[color] duration-200 ease-in-out hover:animate-[nav-pill-hover_650ms_ease-in-out] hover:text-brand active:animate-[nav-pill-hover_650ms_ease-in-out] active:text-brand";

  if (!previous && !next) {
    return (
      <button
        ref={containerRef as unknown as React.RefObject<HTMLButtonElement>}
        type="button"
        onClick={() => window.scrollTo({ top: 0 })}
        aria-label="Back to top"
        tabIndex={visible ? 0 : -1}
        className={`fixed bottom-11 left-1/2 z-30 -translate-x-1/2 rounded-full border border-transparent bg-canvas/15 px-6 py-4 font-body text-[15px] text-ink shadow-[inset_0_1px_8px_rgba(255,255,255,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3),inset_0_0_22px_color-mix(in_srgb,var(--color-brand)_32%,transparent)] backdrop-blur-md backdrop-saturate-150 transition-[color,background-color,translate,scale,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:animate-[nav-pill-hover_650ms_ease-in-out] hover:text-brand active:animate-[nav-pill-hover_650ms_ease-in-out] active:bg-brand active:text-canvas md:px-8 md:py-5 md:text-[18px] ${bounceClass} ${visibility}`}
      >
        Back to top
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`fixed bottom-11 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-transparent bg-canvas/15 px-2 py-1.5 shadow-[inset_0_1px_8px_rgba(255,255,255,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3),inset_0_0_22px_color-mix(in_srgb,var(--color-brand)_32%,transparent)] backdrop-blur-md backdrop-saturate-150 transition-[background-color,translate,scale,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] md:gap-3 md:px-4 md:py-2.5 ${bounceClass} ${visibility}`}
    >
      {previous ? (
        <Link
          href={`/work/${previous.slug}`}
          aria-label="Previous project"
          tabIndex={visible ? 0 : -1}
          className={`${SEGMENT} px-2 py-2 text-[13px] md:px-5 md:py-4 md:text-[18px]`}
        >
          {"<"}
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0 })}
        aria-label="Back to top"
        tabIndex={visible ? 0 : -1}
        className={`${SEGMENT} whitespace-nowrap px-3 py-2 text-[13px] md:px-6 md:py-4 md:text-[18px]`}
      >
        Back to top
      </button>

      {next ? (
        <Link
          href={`/work/${next.slug}`}
          aria-label="Next project"
          tabIndex={visible ? 0 : -1}
          className={`${SEGMENT} px-2 py-2 text-[13px] md:px-5 md:py-4 md:text-[18px]`}
        >
          {">"}
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </div>
  );
}
