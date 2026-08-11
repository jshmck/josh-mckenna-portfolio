"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navLinks } from "@/lib/site";

/**
 * Sticky 88px nav with a hairline rule — the five links on the left, a CART on
 * the right, matching Josh's v2 (Figma node 85:420). Client-side only for
 * `usePathname`; the active link (purple) is the one piece of state here.
 */
export function Nav() {
  const pathname = usePathname();

  // "/" would match every route under startsWith, so home is exact-match only.
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/90 backdrop-blur-sm">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[88px] max-w-frame items-center justify-between px-6 md:px-gutter"
      >
        <ul className="flex items-center gap-5 md:gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`type-label transition-colors ${
                  isActive(link.href)
                    ? "text-accent"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/shop"
          className="type-label text-ink transition-colors hover:text-brand"
        >
          Cart
        </Link>
      </nav>
    </header>
  );
}
