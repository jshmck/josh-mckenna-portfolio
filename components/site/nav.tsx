"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { navLinks } from "@/lib/site";
import { CartIcon } from "@/components/ui/social-icons";

/**
 * Floating nav, three separate shapes sharing one frost/goo treatment: a
 * jM circle (home link) on the left, the Work/Shop/Info/Contact pill in
 * the middle, a Cart circle (placeholder icon, see CartIcon) on the
 * right, mirroring jM. Client-side only for `usePathname` and the
 * scroll-driven frost state; the active link (purple, bold) is the other
 * piece of state here.
 *
 * This went through three shapes before landing here, each change driven
 * by Josh watching the previous one live:
 *   1. One long pill, scrolled-only — resting state kept the old
 *      edge-to-edge/justify-between bar.
 *   2. Resting state reworked to match the pill's centered layout and
 *      larger type too — position/size/layout became identical in both
 *      states, `scrolled` only toggling frost chrome.
 *   3. (current) A single centered jM broke the "logo sits top-left"
 *      convention, so it split into three shapes — jM gets its own
 *      identity as a distinct clickable circle instead of blending into
 *      a row of nav links, without literally relocating to the page
 *      corner (Josh's call: he preferred keeping it centered over
 *      anchoring it top-left).
 *
 * `position: sticky`, not `fixed` — sits in normal document flow, so a
 * spacer div is no longer needed to reserve its space. This used to be
 * `fixed` specifically to avoid a `sticky` header's height-change forcing
 * a reflow on every frame of an animated resize -- but the header no
 * longer resizes at all, so that concern doesn't apply and `sticky` is
 * simpler. It does NOT, on its own, stop content from scrolling
 * underneath it: a sticky element only stays in-flow while scrollY is
 * less than its own offset from the top of the document, which for the
 * very first element on the page is 0 -- it's effectively pinned from the
 * first pixel of scroll, same as `fixed` was. What actually fixed the
 * header-over-content smudge was the frost threshold below.
 *
 * The <header> itself is always 88px, never shrinks, and never carries a
 * border or background — that's all on the three shapes now, sharing one
 * `frostClass` string so they never drift out of sync with each other.
 * `items-start` on <header> plus `mt-5` on <nav> sits the row a bit below
 * the very top of the 88px band rather than dead-centered — "bring it
 * lower a little," per Josh. Each shape's `border` is present at rest too,
 * colour transparent — same width always, so frost never causes a layout
 * shift when it toggles on.
 *
 * What scrolling still changes: past 24px of scroll (back below 4px to
 * undo — hysteresis, so it doesn't flicker at the boundary on trackpad
 * rubber-banding), all three shapes pick up border-hairline, bg-canvas/15
 * and backdrop-blur-md (the same colourless frosted-glass treatment as
 * the hero's floating-object hover cards) plus a quick overshoot-scale pop
 * (`nav-pill-pop` keyframe, globals.css, var(--ease-bounce)). The pop
 * only plays going in; reverting to resting has no animation, matching
 * the lightbox arrow-hint's asymmetric-in-only pattern. Because only
 * these shapes ever carry the frost, content behind the header is
 * blurred directly behind them and reads completely normally everywhere
 * else across the 88px band. Small fixed px scroll thresholds, not
 * viewport-relative — Josh wants the frost on the first scroll gesture,
 * not once you're meaningfully deep into the page. A mid-range threshold
 * (120px, tried previously) happened to land exactly where Work's
 * illustration row sits (~120-235px), so frost switching on coincided
 * visually with that row passing under the header. Near-zero doesn't have
 * that problem — frost is already on well before any near-top content
 * reaches the header.
 *
 * jM and Cart also share a second, independent animation: a one-shot
 * "gloop" on mount (`nav-gloop-left`/`nav-gloop-right`, globals.css),
 * pulling each circle in from overlapping the main pill out to its
 * resting spot, rendered through an SVG goo filter (`#nav-goo`, defined
 * inline just above <nav>) that fuses nearby rounded shapes into one
 * blob and lets them separate cleanly — "gloop outwards from the main
 * pill," per Josh. This is the least battle-tested piece of the whole
 * component: the goo filter's blur/contrast values are the standard
 * starting point for this effect, not tuned against the real thing, and
 * no browser was available to see it move before shipping this pass.
 *
 * Link text 15/17px, jM 24/28px, in both states — up from an original
 * 14px/22px that only applied at rest before an earlier pass unified
 * them.
 *
 * On "/" only, the active highlight is also scroll-position-driven: the
 * homepage embeds the real Work gallery inline (see app/page.tsx's
 * #home-work section), so scrolling past Home's own content flows
 * straight into Work with no navigation. Once that section has scrolled
 * under the header, "Work" borrows the active highlight from "Home" — the
 * URL never changes, only the nav's read of where you are. Every other
 * route's active-state stays pure pathname-matching, untouched by this.
 * Info used to merge into Contact the same way; that embed was removed
 * per Josh, so "/about" is back to plain pathname-matching too.
 */

// getBoundingClientRect().top thresholds, px, for handing the nav's active
// highlight from Home to the embedded Work section on "/". Two thresholds,
// not one — mirrors the frost hysteresis below; a single threshold
// flickers when the section's top edge hovers right at the boundary
// (trackpad rubber-banding, a stray scroll tick).
const MERGE_ENTER = 96; // just past the 88px header
const MERGE_EXIT = 160;

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [homeWorkActive, setHomeWorkActive] = useState(false);

  // Nav never unmounts across a client-side route change (it lives in the
  // root layout), so `scrolled` could otherwise keep carrying the
  // scrolled-down state from whichever page you clicked away from. A
  // fresh navigation always lands at the top of the new page, so reset
  // here the moment `pathname` changes -- React's documented pattern for
  // adjusting state during render rather than in an effect (which would
  // trail a frame behind and risk a one-frame flash of frost on the new
  // page). Bypasses the update()/scroll-listener path below entirely, so
  // there's no dependency on a 'scroll' event actually firing to correct
  // it.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setScrolled(false);
  }

  useEffect(() => {
    let raf = 0;
    let queued = false;

    // Hysteresis: frosted past FROST_ENTER, clear again only below
    // FROST_EXIT -- a single threshold flickers on trackpad rubber-banding
    // at the very top. Small fixed px values, not viewport-relative: Josh
    // wants the frost as soon as the first scroll gesture, not once you're
    // meaningfully deep into the page. A mid-range threshold (120px, tried
    // previously) landed exactly where Work's illustration row sits
    // (~120-235px), so frost switching on coincided with that row passing
    // under the header and looked like a glitch. A near-zero threshold
    // doesn't have that problem -- frost is already on well before any
    // near-top content reaches the header.
    const FROST_ENTER = 24;
    const FROST_EXIT = 4;
    const update = () => {
      queued = false;
      setScrolled((current) => {
        if (current) return window.scrollY > FROST_EXIT;
        return window.scrollY > FROST_ENTER;
      });

      // The embedded Work gallery on "/" has no route of its own, so its
      // nav highlight is scroll-position-driven instead of
      // usePathname()-driven. Gated to its own route — every other
      // route's isActive() below stays pure route-matching, untouched by
      // this.
      if (pathname === "/") {
        const section = document.getElementById("home-work");
        const top = section?.getBoundingClientRect().top ?? Infinity;
        setHomeWorkActive((current) =>
          current ? top < MERGE_EXIT : top <= MERGE_ENTER,
        );
      } else {
        setHomeWorkActive(false);
      }
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
    // Nav lives in the root layout and persists across client-side
    // navigations, so this must re-run per pathname — a []-scoped closure
    // would freeze whatever pathname was true at first mount and never see
    // route changes again. Re-subscribing once per navigation (not per
    // scroll frame) doesn't reintroduce a layout-thrash problem — nothing
    // here animates a layout property every frame, only a background/
    // border colour.
  }, [pathname]);

  // On "/", only Work can ever be active (once the embedded gallery has
  // scrolled under the header) — the wordmark isn't in navLinks, so there's
  // no "Home" case to handle here any more.
  // Same Next.js quirk as jM below: a <Link> to the route you're already on
  // triggers no route change, so Next's own navigation-scroll-restoration
  // never fires -- clicking Work again while scrolled down on /work did
  // nothing without this. window.scrollTo(0, 0) alone is enough to pick up
  // the sitewide scroll-behavior: smooth (and its prefers-reduced-motion:
  // auto override) from globals.css. Unrelated to the data-scroll-behavior
  // fix on <html> -- that only governs Next's own router-triggered scroll,
  // not a manual scrollTo() outside of a route change.
  const scrollToTopIfCurrent = (href: string) => {
    if (pathname === href) window.scrollTo(0, 0);
  };

  const isActive = (href: string) => {
    if (pathname === "/") {
      return href === "/work" && homeWorkActive;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Third pass at the "floating pill" idea (see memory/project notes).
  // Josh's next reaction after the unified single pill: a single centered
  // jM broke the near-universal "logo sits top-left, click for home"
  // convention. Split into three separate shapes instead of one long pill
  // -- jM in its own circle on the left, the nav links in the main pill,
  // Cart (a placeholder icon for now, Josh is drawing the real one) in a
  // mirrored circle on the right. jM is still centered rather than
  // anchored to the true page corner -- Josh chose this over the
  // logo-in-the-corner alternative -- but it now at least reads as its
  // own distinct, clickable mark instead of being absorbed into a row of
  // nav links.
  //
  // frostClass is shared across all three shapes so the frost (border
  // colour, background, blur, the one-shot pop) stays byte-identical
  // between them -- previously one pill, now three, but still exactly the
  // same frost logic and thresholds as every earlier pass.
  const frostClass = scrolled
    ? "animate-[nav-pill-pop_500ms_var(--ease-bounce)] border-hairline bg-canvas/15 backdrop-blur-md"
    : "border-transparent bg-transparent";

  return (
    <>
      <header className="sticky top-0 z-40 flex h-[88px] items-start justify-center">
        {/* Hidden goo filter, defined once and referenced by the wrapper
            below via [filter:url(#nav-goo)] -- the classic "gooey" SVG
            recipe (heavy blur, then a contrast-boosting colour matrix that
            crushes the blur's soft alpha gradient back to a hard edge).
            Two shapes rendered under this filter read as one fused blob
            wherever they overlap or sit close enough for their blur
            radii to touch, and as two ordinary rounded shapes once they're
            far enough apart -- which is what makes the entrance animation
            below ("gloop outwards," Josh's words) actually look like a
            liquid split rather than two circles just sliding into place.
            stdDeviation/matrix values are the standard starting point for
            this effect, not yet tuned against the real thing -- no
            browser available this session to see it move. */}
        <svg aria-hidden="true" className="absolute h-0 w-0">
          <defs>
            <filter id="nav-goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -8"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
        </svg>

        <nav
          aria-label="Primary"
          className="mx-auto mt-5 flex w-fit max-w-[calc(100%-2rem)] items-center gap-10 md:gap-20 [filter:url(#nav-goo)]"
        >
          {/* jM circle -- gloops in from the right (toward the main pill)
              on mount, once, per Josh: "make the two circles kind of
              gloop outwards from the main pill." Plain settle after that,
              same asymmetric-in-only pattern as the frost pop and the
              lightbox arrow hint elsewhere in the codebase -- this isn't
              a repeating idle animation. */}
          <Link
            href="/"
            aria-label="Josh McKenna — home"
            onClick={() => scrollToTopIfCurrent("/")}
            className={`flex h-14 w-14 shrink-0 animate-[nav-gloop-left_700ms_var(--ease-bounce)] items-center justify-center rounded-full border transition-[background-color,border-color,backdrop-filter] duration-300 ease-in-out md:h-16 md:w-16 ${frostClass}`}
          >
            {/* Home link -- always routes to "/", every page, every state.
                Small enough to not reintroduce the wordiness "Home" was cut
                for, brand-blue per the wordmark colour rule, real lowercase
                j (not font-variant-caps) matching the hero's "jOSH" — see
                the file doc comment above. Same BackToTop-family easing as
                every pill/chip/button on the site (duration-500
                ease-[cubic-bezier(0.34,1.56,0.64,1)]), but bigger and with a
                tilt -- jM is the one brand mark, not a utility pill, so it
                gets a more pronounced version of the same bounce rather
                than the exact scale-105. active: mirrors hover: exactly --
                touch devices never trigger Tailwind's hover: variant (it's
                scoped to @media (hover: hover) precisely so a tap doesn't
                leave a stuck hover state), so without this a tap here would
                have no visible feedback at all, just the navigation.

                The explicit scroll-to-top (scrollToTopIfCurrent below)
                handles a Next.js quirk: a <Link> to the route you're
                already on doesn't trigger Next's own navigation-scroll-
                restoration (no route change actually happens), so clicking
                jM while already on "/" did nothing if you'd scrolled down.
                Every primary nav link gets the same treatment now. */}
            <span className="font-display text-[24px] font-waldeck-black text-brand transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-rotate-6 hover:scale-125 active:-rotate-6 active:scale-125 md:text-[28px]">
              jM
            </span>
          </Link>

          {/* Main pill -- unchanged from the previous pass other than no
              longer also carrying jM. */}
          <div
            className={`flex items-center gap-6 rounded-full border px-6 py-2.5 transition-[background-color,border-color,backdrop-filter] duration-300 ease-in-out md:gap-10 md:px-10 md:py-3 ${frostClass}`}
          >
            <ul className="flex items-center gap-6 md:gap-10">
              {navLinks.map((link) => (
                <li key={link.href}>
                  {/* Scale bounce on top of the existing bold+purple --
                      same asymmetric easing as jM/project-nav: smooth
                      ease-drift growing into the hover, cleaner
                      ease-in-out reverting. inline-block so the scale
                      transform actually renders (inline elements can
                      ignore it in some browsers). */}
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    onClick={() => scrollToTopIfCurrent(link.href)}
                    className={`inline-block font-body text-[15px] transition-[color,font-weight,transform] duration-200 ease-in-out hover:scale-105 hover:duration-300 hover:ease-drift md:text-[17px] ${
                      isActive(link.href)
                        ? "font-bold text-accent"
                        : "text-ink-muted hover:font-bold hover:text-accent"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cart circle -- mirrors jM: same size, same frost, gloops in
              from the left (toward the main pill) on mount. Placeholder
              bag icon, not final art -- Josh is drawing the real one;
              swap CartIcon's <path> for his artwork when it's ready,
              nothing else here should need to change. */}
          <Link
            href="/shop"
            aria-current={isActive("/shop") ? "page" : undefined}
            aria-label="Cart"
            onClick={() => scrollToTopIfCurrent("/shop")}
            className={`flex h-14 w-14 shrink-0 animate-[nav-gloop-right_700ms_var(--ease-bounce)] items-center justify-center rounded-full border transition-[background-color,border-color,backdrop-filter] duration-300 ease-in-out md:h-16 md:w-16 ${frostClass}`}
          >
            <CartIcon
              className={`h-5 w-5 transition-colors duration-200 ease-in-out md:h-6 md:w-6 ${
                isActive("/shop") ? "text-accent" : "text-ink"
              }`}
            />
          </Link>
        </nav>
      </header>
    </>
  );
}
