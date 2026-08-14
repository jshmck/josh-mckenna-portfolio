"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { navLinks } from "@/lib/site";

/**
 * Fixed nav — the five links on the left, a CART on the right, matching
 * Josh's v2 (Figma node 85:420). Client-side only for `usePathname` and the
 * scroll-driven compact state; the active link (purple, bold) is the other
 * piece of state here.
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
 */
export function Nav() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);

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
  }, []);

  // "/" would match every route under startsWith, so home is exact-match only.
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

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

          <Link
            href="/shop"
            aria-current={isActive("/shop") ? "page" : undefined}
            className={`font-body ml-5 shrink-0 text-[11px] transition-colors md:ml-8 ${
              isActive("/shop")
                ? "font-bold text-accent"
                : "text-ink hover:font-bold hover:text-accent"
            }`}
          >
            Cart
          </Link>
        </nav>
      </header>
    </>
  );
}
