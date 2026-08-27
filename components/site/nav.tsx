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
 * the scroll-driven frost state; the active link (purple, bold) is the
 * other piece of state here.
 *
 * `position: sticky`, not `fixed` — sits in normal document flow, so a
 * spacer div is no longer needed to reserve its space (removed). This
 * used to be `fixed` specifically to avoid a `sticky` header's height-
 * change forcing a reflow on every frame of an animated resize -- but the
 * header no longer resizes at all (below), so that concern doesn't apply
 * and `sticky` is simpler. It does NOT, on its own, stop content from
 * scrolling underneath it: a sticky element only stays in-flow while
 * scrollY is less than its own offset from the top of the document, which
 * for the very first element on the page is 0 -- it's effectively pinned
 * from the first pixel of scroll, same as `fixed` was. What actually
 * fixed the header-over-content smudge was the frost threshold below.
 *
 * The <header> itself is always 88px and never shrinks, and never carries
 * a border or background any more — that's all on <nav> now (below). A
 * compact header height used to kick in past 120px of scroll, but chasing
 * the visual side effects of animating a fixed-position element's height
 * kept surfacing new bugs for one motion detail Josh wasn't attached to
 * keeping.
 *
 * What scrolling changes: past 24px of scroll (back below 4px to undo —
 * hysteresis, so it doesn't flicker at the boundary on trackpad
 * rubber-banding), <nav> — not <header> — picks up a full border-hairline,
 * bg-canvas/15 and backdrop-blur-md (the same colourless frosted-glass
 * treatment as the hero's floating-object hover cards), and reshapes from
 * the resting edge-to-edge bar into a centered, content-hugging,
 * rounded-full pill (first pass at the "floating pill" idea Josh wants to
 * keep exploring — see the project memory). Because only the pill itself
 * carries the frost now, content behind the header is blurred directly
 * behind the pill and reads completely normally everywhere else across
 * the 88px band — nothing else about the frost logic changed, same
 * thresholds, same hysteresis, same trigger. Unscrolled, <nav> is fully
 * transparent, no border, no background, exactly as it always was. Small
 * fixed px values, not viewport-relative — Josh wants the frost on the
 * first scroll gesture, not once you're meaningfully deep into the page. A
 * mid-range threshold (120px, tried previously) happened to land exactly
 * where Work's illustration row sits (~120-235px), so frost switching on
 * coincided visually with that row passing under the header. Near-zero
 * doesn't have that problem — frost is already on well before any
 * near-top content reaches the header.
 *
 * Link text is 14px resting, jM 22px — both bumped further (15/17px links,
 * 24/28px jM) in the scrolled/pill state, part of the pill idea itself:
 * Josh wants the pill's type to read larger than the resting bar's, not
 * just reshaped. Resting sizes bumped up in two earlier passes from an
 * original 11px/text-lg that read too small on larger screens, since
 * max-w-frame caps the bar's width but nothing scaled the type up to fill
 * more of it.
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

  // First pass at the "floating pill" idea (see memory/project notes) --
  // unscrolled is untouched, byte-for-byte the same edge-to-edge
  // transparent bar as before. Only the scrolled/frosted state's shape
  // changes: instead of that same bar gaining a bottom border + blur, it
  // shrinks to a centered, content-hugging pill with the same border-
  // hairline + bg-canvas/15 backdrop-blur-md treatment, just on a rounded
  // shape instead of a full-width one. No second/extra state -- the frost
  // toggle (scrolled true/false) is exactly the same logic as before, only
  // the classes attached to it changed shape. The header itself now only
  // reserves layout height and centers its child; it never carries a
  // border or background of its own any more, so content behind it is only
  // ever obscured directly behind the pill, not across the full width.
  return (
    <>
      <header className="sticky top-0 z-40 flex h-[88px] items-center justify-center">
        <nav
          aria-label="Primary"
          className={`mx-auto flex items-center transition-all duration-300 ease-in-out ${
            scrolled
              ? "w-fit max-w-[calc(100%-2rem)] justify-center gap-6 rounded-full border border-hairline bg-canvas/15 px-6 py-2.5 backdrop-blur-md md:gap-12 md:px-10 md:py-3"
              : "h-full w-full max-w-frame justify-between px-6 md:px-gutter"
          }`}
        >
          <div
            className={`flex items-center ${scrolled ? "gap-6 md:gap-12" : "gap-6 md:gap-10"}`}
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
                Every primary nav link gets the same treatment now.

                Bigger in the scrolled/pill state (24/28px vs the resting
                22px) -- part of the pill idea itself, not a side effect. */}
            <Link
              href="/"
              aria-label="Josh McKenna — home"
              onClick={() => scrollToTopIfCurrent("/")}
              className={`font-display font-waldeck-black text-brand transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-rotate-6 hover:scale-125 active:-rotate-6 active:scale-125 ${
                scrolled ? "text-[24px] md:text-[28px]" : "text-[22px]"
              }`}
            >
              jM
            </Link>

            <ul
              className={`flex items-center ${scrolled ? "gap-6 md:gap-10" : "gap-5 md:gap-8"}`}
            >
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
                    className={`inline-block font-body transition-[color,font-weight,transform] duration-200 ease-in-out hover:scale-105 hover:duration-300 hover:ease-drift ${
                      scrolled ? "text-[15px] md:text-[17px]" : "text-[14px]"
                    } ${
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

          <ul
            className={`flex shrink-0 items-center gap-5 md:gap-8 ${scrolled ? "" : "ml-5 md:ml-8"}`}
          >
            <li>
              <Link
                href="/shop"
                aria-current={isActive("/shop") ? "page" : undefined}
                onClick={() => scrollToTopIfCurrent("/shop")}
                className={`inline-block font-body transition-[color,font-weight,transform] duration-200 ease-in-out hover:scale-105 hover:duration-300 hover:ease-drift ${
                  scrolled ? "text-[15px] md:text-[17px]" : "text-[14px]"
                } ${
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
