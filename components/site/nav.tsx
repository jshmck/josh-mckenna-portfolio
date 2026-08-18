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
 * hysteresis so it doesn't flicker at the boundary). Text stays the same
 * size, only the bar's height and padding shrink. Shrinking uses a slight
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
// highlight from Home to the embedded Work section on "/", and from Info
// to the embedded Contact section on "/about". Two thresholds, not one —
// mirrors the compact-header hysteresis below; a single threshold flickers
// when the section's top edge hovers right at the boundary (trackpad
// rubber-banding, a stray scroll tick).
const MERGE_ENTER = 96; // just past the expanded 88px header
const MERGE_EXIT = 160;

export function Nav() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [homeWorkActive, setHomeWorkActive] = useState(false);
  const [infoContactActive, setInfoContactActive] = useState(false);

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
        const section = document.getElementById("info-contact");
        const top = section?.getBoundingClientRect().top ?? Infinity;
        setInfoContactActive((current) =>
          current ? top < MERGE_EXIT : top <= MERGE_ENTER,
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
          snaps instantly with `compact` (no transition) — a single reflow
          on state change, not one per animation frame. */}
      <div aria-hidden="true" style={{ height: compact ? 40 : 88 }} />

      {/* Trial: a hairline bottom border, same border-hairline token as the
          footer, but only once the header has shrunk to its compact
          state — expanded, it sits over the hero/page content with
          nothing to visually separate from yet, so the line only earns
          its place once there's a scrolled page underneath it. */}
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b bg-canvas/15 backdrop-blur-md transition-colors duration-300 ${
          compact ? "border-hairline" : "border-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className={`mx-auto flex max-w-frame items-center justify-between px-6 transition-[height] duration-300 will-change-[height] md:px-gutter ${
            compact
              ? "h-10 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              : "h-[88px] ease-drift"
          }`}
        >
          <div className="flex items-center gap-6 md:gap-10">
            {/* Home link. Small enough to not reintroduce the wordiness
                "Home" was cut for, brand-blue per the wordmark colour rule,
                real lowercase j (not font-variant-caps) matching the hero's
                "jOSH" — see the file doc comment above. Tried a bespoke
                scale+tilt bounce first, but Josh wanted it to match the
                pills/chips/buttons instead -- same BackToTop-family
                recipe now (duration-500 ease-[cubic-bezier(0.34,1.56,
                0.64,1)] hover:scale-105) as every other filled/outlined
                pill on the site, no rotate. */}
            <Link
              href="/"
              aria-label="Josh McKenna — home"
              className="font-display text-lg font-black text-brand transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105"
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
                    className={`inline-block font-body text-[11px] transition-[color,font-weight,transform] duration-200 ease-in-out hover:scale-105 hover:duration-300 hover:ease-drift ${
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
                className={`inline-block font-body text-[11px] transition-[color,font-weight,transform] duration-200 ease-in-out hover:scale-105 hover:duration-300 hover:ease-drift ${
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
