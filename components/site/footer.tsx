import { EmailIcon } from "@/components/ui/social-icons";
import Link from "next/link";

import { SOCIAL_ICON_SIZE, socialLinks } from "@/components/site/social-links";
import { legalLinks, siteConfig } from "@/lib/site";

/** Small, far right — a quiet way to reach Josh from any page. Email
 *  first (not a new tab), then the shared social set from
 *  social-links.ts (also rendered by Contact's mobile-only row). */
const links = [
  { label: "Email", href: `mailto:${siteConfig.email}`, Icon: EmailIcon, external: false },
  ...socialLinks.map((link) => ({ ...link, external: true })),
];

/**
 * Footer — copyright line plus a small social/email row. The client list,
 * talks/features list, and full contact details that used to live here
 * moved into the Info and Contact pages' own content (see
 * app/about/page.tsx and app/contact/page.tsx) — Josh wanted them as real
 * page content, not footer chrome. Lives in the root layout so it's on
 * every page — Privacy Policy and Terms of Service need to be reachable
 * wherever a visitor lands, and the icon row exists for the same reason:
 * a way to reach Josh from any page, not just Contact. The AI-training
 * notice that used to sit here moved into Terms of Service itself (see
 * app/terms/page.tsx) — it's a term of using the site, not footer chrome.
 */
export function Footer() {
  return (
    // max-md:sticky bottom-0 -- the mobile "curtain reveal": the footer
    // pins itself at the viewport's bottom edge for the whole scroll,
    // sitting *behind* <main> (which carries max-md:relative z-10 +
    // an opaque bg-canvas in layout.tsx specifically so it covers this),
    // and the page's last stretch of scroll slides the card up off it
    // like a curtain -- "can it have a dynamic scroll too so it appears
    // closer the further down?" per Josh, choosing the curtain-reveal
    // reading. Pure scroll geometry (position: sticky), no animation or
    // JS, so there's nothing for reduced-motion to guard -- the footer
    // never moves relative to the viewport at all; only the content
    // over it does, at exactly scroll speed. md+ keeps the plain
    // in-flow footer untouched.
    //
    // No hairline below md any more -- "remove the footer line
    // completely and just have the pages end with curve and shadow,"
    // per Josh, once every page got its own rounded-bottom-corner-plus-
    // shadow ending (see PageEndCard). The line read as a second,
    // competing edge once the page itself already announces where it
    // stops; the shadow alone now carries that job, the same way it
    // does on the project card. md+ keeps the border on the footer
    // element itself, exactly as it was.
    <footer className="border-hairline max-md:sticky max-md:bottom-0 max-md:pt-3 md:border-t">
      <div className="mx-auto flex max-w-frame flex-wrap items-center justify-between gap-6 px-6 py-10 md:px-gutter">
        {/* max-md:order-1 flips the stack on mobile only -- "on mobile
            can you swap the social icons above the Copyright text," per
            Josh. The two blocks wrap onto separate rows below md
            (flex-wrap), so ordering is what decides which reads first;
            desktop keeps them side by side, copyright left, icons
            right, untouched. */}
        <div className="max-md:order-1">
          <p className="font-body text-[13px] text-ink-muted">
            Copyright © {new Date().getFullYear()} {siteConfig.name}. All
            rights reserved.{" "}
            {legalLinks.map(({ label, href }, index) => (
              <span key={label}>
                {index > 0 && " "}
                <Link
                  href={href}
                  className="underline-offset-2 transition-colors hover:text-accent hover:underline"
                >
                  {label}
                </Link>
              </span>
            ))}
          </p>
        </div>

        <ul className="flex items-center gap-4">
          {links.map(({ label, href, Icon, external, size = SOCIAL_ICON_SIZE }) => (
            <li key={label}>
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                aria-label={label}
                className="inline-block text-ink-muted transition-[color,transform] duration-200 ease-in-out hover:scale-110 hover:text-accent hover:duration-300 hover:ease-drift"
              >
                <Icon size={size} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
