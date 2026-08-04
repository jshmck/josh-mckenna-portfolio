"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navLinks, siteConfig } from "@/lib/site";

/**
 * Sticky 88px nav with a hairline rule, matching the wireframe on every page.
 * Client-side only for `usePathname` — the active-link underline is the one
 * piece of state here.
 */
export function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/90 backdrop-blur-sm">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[88px] max-w-frame items-center justify-between px-6 md:px-gutter"
      >
        <Link
          href="/"
          className="type-label text-ink transition-colors hover:text-accent"
        >
          {siteConfig.shortName}
        </Link>

        <div className="flex items-center gap-6 md:gap-9">
          <ul className="flex items-center gap-5 md:gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`type-label border-b pb-0.5 transition-colors ${
                    isActive(link.href)
                      ? "border-ink text-ink"
                      : "border-transparent text-ink-muted hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/contact"
            className="type-label rounded-full bg-accent px-4 py-2 text-canvas transition-transform duration-200 hover:scale-[1.04]"
          >
            Contact
          </Link>
        </div>
      </nav>
    </header>
  );
}
