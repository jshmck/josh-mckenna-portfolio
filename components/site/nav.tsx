"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { navLinks } from "@/lib/site";

/**
 * Sticky nav — the five links on the left, a CART on the right, matching
 * Josh's v2 (Figma node 85:420). Client-side only for `usePathname` and the
 * scroll-driven compact state; the active link (purple, bold) is the other
 * piece of state here.
 *
 * Starts at 88px and shrinks to a compact 40px once the page scrolls past
 * the very top — text stays the same size, only the bar's height and
 * padding shrink. Background is the same frosted-glass treatment as the
 * hero's floating-object hover cards (bg-brand/15 + backdrop-blur-md), so
 * content scrolling underneath stays partly visible through the blur.
 */
export function Nav() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let raf = 0;
    let queued = false;

    const update = () => {
      queued = false;
      setCompact(window.scrollY > 8);
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
    <header className="sticky top-0 z-40 bg-canvas/15 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className={`mx-auto flex max-w-frame items-center justify-between px-6 transition-[height] duration-300 ease-drift md:px-gutter ${
          compact ? "h-10" : "h-[88px]"
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
  );
}
