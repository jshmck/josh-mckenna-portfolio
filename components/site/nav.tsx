"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { navLinks } from "@/lib/site";

/**
 * Sticky nav with a hairline rule — the five links on the left, a CART on
 * the right, matching Josh's v2 (Figma node 85:420). Client-side only for
 * `usePathname` and the scroll-driven compact state; the active link
 * (purple, bold) is the other piece of state here.
 *
 * Starts at 88px and shrinks to a compact 64px once the page scrolls past
 * the very top, so the bar takes less of the viewport while reading —
 * matches the fully-opaque, no-blur background (previously bg-canvas/90 +
 * backdrop-blur-sm) to the hero's solid, non-transparent illustrations.
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
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas">
      <nav
        aria-label="Primary"
        className={`mx-auto flex max-w-frame items-center justify-between px-6 transition-[height] duration-300 ease-drift md:px-gutter ${
          compact ? "h-16" : "h-[88px]"
        }`}
      >
        <ul className="flex items-center gap-5 md:gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`type-label transition-colors ${
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
          className={`type-label ml-5 shrink-0 transition-colors md:ml-8 ${
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
