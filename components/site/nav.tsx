"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { navLinks } from "@/lib/site";

/**
 * Fixed nav — Home/Work/Info/Contact on the left, Shop and Cart together on
 * the far right for easier reach. Client-side only for `usePathname` and
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
 * On "/" only, the active highlight is also scroll-position-driven: the
 * homepage embeds the real Work gallery inline (see app/page.tsx's
 * #home-work section) so scrolling past "Who" flows straight into it with
 * no navigation. Once that section has scrolled under the header, "Work"
 * borrows the active highlight from "Home" — the URL never changes, only
 * the nav's read of where you are. Every other route's active-state stays
 * pure pathname-matching, untouched by this.
 */

// getBoundingClientRect().top thresholds, px, for handing the nav's active
// highlight from Home to the embedded Work section on "/". Two thresholds,
// not one — mirrors the compact-header hysteresis below; a single
// threshold flickers when the section's top edge hovers right at the
// boundary (trackpad rubber-banding, a stray scroll tick).
const HOME_WORK_ENTER = 96; // just past the expanded 88px header
const HOME_WORK_EXIT = 160;

export function Nav() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [homeWorkActive, setHomeWorkActive] = useState(false);

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

      // The embedded Work gallery on "/" has no route of its own, so its
      // nav highlight is scroll-position-driven instead of
      // usePathname()-driven. Gated to "/" — every other route's
      // isActive() below stays pure route-matching, untouched by this.
      if (pathname === "/") {
        const section = document.getElementById("home-work");
        const top = section?.getBoundingClientRect().top ?? Infinity;
        setHomeWorkActive((current) =>
          current ? top < HOME_WORK_EXIT : top <= HOME_WORK_ENTER,
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
    // scroll frame) doesn't reintroduce the layout-thrash problem the
    // fixed-positioning doc comment above warns about — that was about
    // animating a layout property every frame, not re-adding a listener.
  }, [pathname]);

  // "/" would match every route under startsWith, so home is exact-match
  // only. On "/", only Home or Work can ever be active — Work borrows the
  // highlight once the embedded gallery has scrolled under the header,
  // Home cedes it.
  const isActive = (href: string) => {
    if (pathname === "/") {
      if (href === "/work") return homeWorkActive;
      if (href === "/") return !homeWorkActive;
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

      <header className="fixed inset-x-0 top-0 z-40 bg-canvas/15 backdrop-blur-md">
        <nav
          aria-label="Primary"
          className={`mx-auto flex max-w-frame items-center justify-between px-6 transition-[height] duration-300 will-change-[height] md:px-gutter ${
            compact
              ? "h-10 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              : "h-[88px] ease-drift"
          }`}
        >
          <ul className="flex items-center gap-5 md:gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`font-body text-[11px] transition-colors ${
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

          {/* Shop sits next to Cart, not in the main left-hand group — both
              are one reach away on the right for easier navigation. */}
          <ul className="ml-5 flex shrink-0 items-center gap-5 md:ml-8 md:gap-8">
            <li>
              <Link
                href="/shop"
                aria-current={isActive("/shop") ? "page" : undefined}
                className={`font-body text-[11px] transition-colors ${
                  isActive("/shop")
                    ? "font-bold text-accent"
                    : "text-ink-muted hover:font-bold hover:text-accent"
                }`}
              >
                Shop
              </Link>
            </li>
            <li>
              <Link
                href="/shop"
                aria-current={isActive("/shop") ? "page" : undefined}
                className={`font-body text-[11px] transition-colors ${
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
