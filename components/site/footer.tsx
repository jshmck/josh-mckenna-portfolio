import Link from "next/link";

import { footerLinks, siteConfig } from "@/lib/site";

/**
 * Footer utilities row — identical on all six pages per the wireframes.
 * The CTA band above it is page-specific and lives with each page.
 */
export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-frame flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-gutter">
        <p className="type-label text-ink-muted">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>

        <ul className="flex flex-wrap items-center gap-x-7 gap-y-2">
          <li>
            <a
              href={`mailto:${siteConfig.email}`}
              className="type-label text-ink-muted transition-colors hover:text-accent"
            >
              {siteConfig.email}
            </a>
          </li>
          {footerLinks.map((link) => {
            const external = link.href.startsWith("http");
            return (
              <li key={link.href}>
                {external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="type-label text-ink-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className="type-label text-ink-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </footer>
  );
}
