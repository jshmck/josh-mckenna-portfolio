"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { navLinks } from "@/lib/site";

/**
 * Fixed nav — a small "jM" wordmark (the home link) then Work/Shop/Info/
 * Contact on the left, Cart alone on the far right. The wordmark reuses
 * the same lowercase-j quirk as the homepage hero's "jOSH" (see
 * drifting-hero.tsx) rather than getting its own pattern invented — it's
 * always brand-blue and doesn't participate in isActive() below, since a
 * logo mark reads as "go home," not as a page-state indicator the way the
 * text links do. Client-side only for `usePathname` and
 * the scroll-driven compact state; the active link (purple, bold) is the
 * other piece of state here.
 *
 * `position: fixed`, not `sticky` — a spacer div reserves its layout space
 * instead. A sticky header is still part of document flow, so animating its
 * height forces the browser to reflow every element below it on every frame
 * of the transition, which fights the compositor thread mid-scroll and reads
 * as the whole page pausing then catching up. A fixed element's size changes
 * are isolated to its own box, so the bounce can't touch scroll performance.
 * The spacer's height snaps instantly (no transition) alongside `compact`,
 * so the one-time reflow it causes is a single frame, not eighteen of them.
 *
 * Starts at 88px and shrinks to a compact 40px past 120px of scroll (back
 * below 60px re-expands it — the gap between the two is deliberate
 * hysteresis so it doesn't flicker at the boundary). Link text is 14px,
 * jM is 22px — bumped up in two passes from an original 11px/text-lg that
 * read too small on larger screens, since max-w-frame caps the bar's width
 * but nothing scaled the type up to fill more of it. Text stays the same
 * size across the compact/expanded states, only the bar's height and
 * padding shrink. Shrinking uses a slight
 * overshoot easing so the header settles with a small bounce; expanding
 * eases back out smoothly instead. Background is the same colourless
 * frosted-glass treatment as the hero's floating-object hover cards
 * (bg-canvas/15 + backdrop-blur-md), so content scrolling underneath stays
 * partly visible through the blur.
 *
 * On "/" and "/about" only, the active highlight is also
 * scroll-position-driven: the homepage embeds the real Work gallery inline
 * (see app/page.tsx's #home-work section) and Info embeds the real Contact
 * content inline (see app/about/page.tsx's #info-contact section), so
 * scrolling past either page's own content flows straight into the next
 * one with no navigation. Once that section has scrolled under the header,
 * "Work"/"Contact" borrows the active highlight from "Home"/"Info" — the
 * URL never changes, only the nav's read of where you are. Every other
 * route's active-state stays pure pathname-matching, untouched by this.
 */

// getBoundingClientRect().top thresholds, px, for handing the nav's active
// highlight from Home to the embedded Work section on "/". Two thresholds,
// not one — mirrors the compact-header hysteresis below; a single
// threshold flickers when the section's top edge hovers right at the
// boundary (trackpad rubber-banding, a stray scroll tick).
const MERGE_ENTER = 96; // just past the expanded 88px header
const MERGE_EXIT = 160;

// Info -> Contact used the same section-top approach as Home -> Work
// until Josh asked for it to hand off sooner — specifically the moment
// the HOWDY button (id="howdy-button", enquiry-form.tsx) is visible,
// not just whenever the embedded section's top edge reaches the header.
// Thresholds are against window.innerHeight instead of a fixed px value
// since "visible" is relative to viewport height, which varies by
// device. Same hysteresis shape as MERGE_ENTER/EXIT above, just a
// bigger gap (64px) since this fires much further down the page where
// scroll deltas per frame are larger.
const HOWDY_VISIBLE_BUFFER = 64;

/** Matches the header's own shrink transition (duration-300 below) --
 *  see the spacerCompact effect for why. */
const HEADER_SHRINK_MS = 300;

export function Nav() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [homeWorkActive, setHomeWorkActive] = useState(false);
  const [infoContactActive, setInfoContactActive] = useState(false);

  // The header is `position: fixed`, so its own height animates over
  // duration-300 without the page reflowing every frame (see the fixed-vs-
  // sticky doc comment below) -- but the spacer that reserves its layout
  // space used to snap to the new height the instant `compact` flipped
  // true. That meant the layout below jumped up to the smaller gap
  // immediately while the header was still visually mid-shrink (something
  // between 88px and 40px), so the header briefly overlapped whatever
  // content had just moved into that space -- most visible scrolling to
  // the bottom of a page, where content sits right against the viewport
  // edge. Delaying only the shrink (not the expand -- growing back to 88px
  // instantly just leaves a harmless closing gap under the header, never
  // an overlap) by the same 300ms the header takes to visually finish
  // fixes it without reintroducing a smoothly-animated (many-reflow)
  // spacer.
  const [spacerCompact, setSpacerCompact] = useState(false);
  useEffect(() => {
    // 0ms for the expand direction -- still deferred to a callback (as the
    // lint rule below wants), not truly synchronous, but with no
    // meaningful delay.
    const timeout = setTimeout(
      () => setSpacerCompact(compact),
      compact ? HEADER_SHRINK_MS : 0,
    );
    return () => clearTimeout(timeout);
  }, [compact]);

  // Nav never unmounts across a client-side route change (it lives in the
  // root layout), so `compact`/`spacerCompact` could otherwise keep
  // carrying the scrolled-down state from whichever page you clicked away
  // from. A fresh navigation always lands at the top of the new page, so
  // reset both here the moment `pathname` changes -- React's documented
  // pattern for adjusting state during render rather than in an effect
  // (which would trail a frame behind and risks a flash of the wrong
  // header height). Bypasses the update()/scroll-listener path below
  // entirely, so there's no dependency on a 'scroll' event actually firing
  // to correct it. spacerCompact resets in the same render as compact
  // (not through its own delayed effect above) -- otherwise the header
  // itself would already be expanding back to 88px while the spacer, one
  // render behind, was still only reserving the compact 40px, so the
  // taller header would overlap the top of the new page's content for a
  // frame.
  //
  // skipHeaderTransition suppresses the header's own height transition for
  // that one reset render: without it, the header still visually animates
  // from 40px up to 88px over duration-300 even though both state values
  // already jumped straight to expanded, since the CSS transition doesn't
  // know this change came from a reset rather than a scroll -- for that
  // ~300ms the still-short header sits on top of the new page's content,
  // which is exactly what a fresh navigation should never show. Cleared on
  // the next frame so ordinary scroll-driven compact/expand keeps its
  // animation.
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [skipHeaderTransition, setSkipHeaderTransition] = useState(false);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setCompact(false);
    setSpacerCompact(false);
    setSkipHeaderTransition(true);
  }

  useEffect(() => {
    if (!skipHeaderTransition) return;
    const raf = requestAnimationFrame(() => setSkipHeaderTransition(false));
    return () => cancelAnimationFrame(raf);
  }, [skipHeaderTransition]);

  useEffect(() => {
    let raf = 0;
    let queued = false;

    // Hysteresis: compact past 120px, expand again only below 60px. A single
    // threshold flickers on trackpad rubber-banding and made the shrink fire
    // the instant a scroll gesture began, which read as twitchy rather than
    // a deliberate response to actually scrolling down the page.
    const update = () => {
      queued = false;
      setCompact((current) => {
        if (current) return window.scrollY > 60;
        return window.scrollY > 120;
      });

      // The embedded Work gallery on "/" and the embedded Contact content
      // on "/about" have no route of their own, so their nav highlight is
      // scroll-position-driven instead of usePathname()-driven. Gated to
      // their own route each — every other route's isActive() below stays
      // pure route-matching, untouched by this.
      if (pathname === "/") {
        const section = document.getElementById("home-work");
        const top = section?.getBoundingClientRect().top ?? Infinity;
        setHomeWorkActive((current) =>
          current ? top < MERGE_EXIT : top <= MERGE_ENTER,
        );
      } else {
        setHomeWorkActive(false);
      }

      if (pathname === "/about") {
        const howdy = document.getElementById("howdy-button");
        const top = howdy?.getBoundingClientRect().top ?? Infinity;
        setInfoContactActive((current) =>
          current
            ? top < window.innerHeight + HOWDY_VISIBLE_BUFFER
            : top <= window.innerHeight,
        );
      } else {
        setInfoContactActive(false);
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
    // scroll frame) doesn't reintroduce the layout-thrash problem the
    // fixed-positioning doc comment above warns about — that was about
    // animating a layout property every frame, not re-adding a listener.
  }, [pathname]);

  // On "/", only Work can ever be active (once the embedded gallery has
  // scrolled under the header) — the wordmark isn't in navLinks, so there's
  // no "Home" case to handle here any more. Same shape on "/about": only
  // Info or Contact can be active there.
  const isActive = (href: string) => {
    if (pathname === "/") {
      return href === "/work" && homeWorkActive;
    }
    if (pathname === "/about") {
      if (href === "/contact") return infoContactActive;
      if (href === "/about") return !infoContactActive;
      return false;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Reserves the header's layout space in the document flow. Height
          still snaps instantly (no transition) — a single reflow on state
          change, not one per animation frame — but keyed off
          spacerCompact, not compact directly: see that effect above for
          why the shrink is delayed to match the header's own visual
          animation. */}
      <div aria-hidden="true" style={{ height: spacerCompact ? 40 : 88 }} />

      {/* Trial: a hairline bottom border, same border-hairline token as the
          footer, but only once the header has shrunk to its compact
          state — expanded, it sits over the hero/page content with
          nothing to visually separate from yet, so the line only earns
          its place once there's a scrolled page underneath it. Frosted
          background (bg-canvas/15 + backdrop-blur-md) is the same --
          compact-only. Expanded, it's fully transparent: it sits directly
          over a page's own top content (a hero, an illustration row) at
          full 88px height, and a blur there was smudging saturated colour
          right beneath it. Compact only ever sits over already-scrolled
          content, which is what the frosted look was actually meant for. */}
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300 ${
          compact
            ? "border-hairline bg-canvas/15 backdrop-blur-md"
            : "border-transparent bg-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className={`mx-auto flex max-w-frame items-center justify-between px-6 will-change-[height] md:px-gutter ${
            skipHeaderTransition ? "" : "transition-[height] duration-300"
          } ${
            compact
              ? "h-10 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              : "h-[88px] ease-drift"
          }`}
        >
          <div className="flex items-center gap-6 md:gap-10">
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

                The explicit scroll-to-top handles a Next.js quirk: a <Link>
                to the route you're already on doesn't trigger Next's own
                navigation-scroll-restoration (no route change actually
                happens), so clicking jM while already on "/" did nothing
                if you'd scrolled down. window.scrollTo(0, 0) alone is
                enough to pick up the sitewide scroll-behavior: smooth (and
                its prefers-reduced-motion: auto override) from
                globals.css — no behavior option needed here. */}
            <Link
              href="/"
              aria-label="Josh McKenna — home"
              onClick={() => {
                if (pathname === "/") window.scrollTo(0, 0);
              }}
              className="font-display text-[22px] font-black text-brand transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-rotate-6 hover:scale-125 active:-rotate-6 active:scale-125"
            >
              jM
            </Link>

            <ul className="flex items-center gap-5 md:gap-8">
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
                    className={`inline-block font-body text-[14px] transition-[color,font-weight,transform] duration-200 ease-in-out hover:scale-105 hover:duration-300 hover:ease-drift ${
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

          <ul className="ml-5 flex shrink-0 items-center gap-5 md:ml-8 md:gap-8">
            <li>
              <Link
                href="/shop"
                aria-current={isActive("/shop") ? "page" : undefined}
                className={`inline-block font-body text-[14px] transition-[color,font-weight,transform] duration-200 ease-in-out hover:scale-105 hover:duration-300 hover:ease-drift ${
                  isActive("/shop")
                    ? "font-bold text-accent"
                    : "text-ink hover:font-bold hover:text-accent"
                }`}
              >
                Cart
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
