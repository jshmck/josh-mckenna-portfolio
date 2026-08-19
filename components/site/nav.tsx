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
 * Always 88px, never shrinks — a compact height used to kick in past
 * 120px of scroll, but chasing the visual side effects of animating a
 * fixed-position element's height kept surfacing new bugs for one motion
 * detail Josh wasn't attached to keeping. What scrolling still changes:
 * past half a viewport of scroll (back below 35% to undo — hysteresis, so
 * it doesn't flicker at the boundary) the header picks up a hairline
 * bottom border and the same colourless frosted-glass treatment as the
 * hero's floating-object hover cards (bg-canvas/15 + backdrop-blur-md).
 * Unscrolled, it's fully transparent. Threshold is viewport-relative, not
 * a small fixed px value (120px originally) -- Work's illustration row
 * sits close enough to the top (~120-235px) that a 120px threshold put it
 * directly under the header at the exact moment frost switched on.
 * Scaling with viewport height instead (matching BackToTop's own
 * threshold) means frost only appears once you've scrolled meaningfully
 * deep into any page, comfortably clear of any near-top content on any
 * device size.
 *
 * Link text is 14px, jM is 22px — bumped up in two passes from an
 * original 11px/text-lg that read too small on larger screens, since
 * max-w-frame caps the bar's width but nothing scaled the type up to
 * fill more of it.
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
// not one — mirrors the frost hysteresis below; a single threshold
// flickers when the section's top edge hovers right at the boundary
// (trackpad rubber-banding, a stray scroll tick).
const MERGE_ENTER = 96; // just past the 88px header
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

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [homeWorkActive, setHomeWorkActive] = useState(false);
  const [infoContactActive, setInfoContactActive] = useState(false);

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

    // Hysteresis: frosted past half a viewport of scroll, clear again
    // only below 35% -- a single threshold flickers on trackpad
    // rubber-banding. Viewport-relative, not a small fixed px value
    // (120/60 originally): a sticky header only avoids overlapping
    // content while scrollY is less than its own offset from the top of
    // the document, which for the very first element on the page is 0 --
    // it's effectively pinned, with content scrolling underneath it, from
    // the first pixel of scroll onward, same as `fixed` was. Work's
    // illustration row sits close enough to the top (~120-235px) that a
    // 120px threshold put it directly under the header at the exact
    // moment frost switched on. Tying this to viewport height instead
    // (matching BackToTop's own threshold) means frost only appears once
    // you've scrolled meaningfully deep into any page, comfortably clear
    // of any near-top content regardless of device size.
    const update = () => {
      queued = false;
      setScrolled((current) => {
        if (current) return window.scrollY > window.innerHeight * 0.35;
        return window.scrollY > window.innerHeight * 0.5;
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
    // scroll frame) doesn't reintroduce a layout-thrash problem — nothing
    // here animates a layout property every frame, only a background/
    // border colour.
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
      <header
        className={`sticky top-0 z-40 h-[88px] border-b transition-colors duration-300 ${
          scrolled
            ? "border-hairline bg-canvas/15 backdrop-blur-md"
            : "border-transparent bg-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-full max-w-frame items-center justify-between px-6 md:px-gutter"
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
              className="font-display text-[22px] font-waldeck-black text-brand transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-rotate-6 hover:scale-125 active:-rotate-6 active:scale-125"
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
