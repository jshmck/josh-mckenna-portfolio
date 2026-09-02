import {
  BehanceIcon,
  EmailIcon,
  FigmaIcon,
  InstagramIcon,
  LinkedInIcon,
  ThreadsIcon,
  XIcon,
} from "@/components/ui/social-icons";
import Link from "next/link";

import { legalLinks, siteConfig } from "@/lib/site";

/** Small, far right — a quiet way to reach Josh from any page, not a
 *  repeat of Contact's own full-size icon row. Email first (not a new
 *  tab), then the same social set/order as contact-content.tsx
 *  (Behance included — this list had drifted out of sync with it). */
const ICON_SIZE = 18;
const links = [
  { label: "Email", href: `mailto:${siteConfig.email}`, Icon: EmailIcon, external: false },
  { label: "Instagram", href: siteConfig.instagram.url, Icon: InstagramIcon, external: true },
  { label: "Threads", href: siteConfig.threads.url, Icon: ThreadsIcon, external: true },
  { label: "X", href: siteConfig.x.url, Icon: XIcon, external: true },
  { label: "LinkedIn", href: siteConfig.linkedin.url, Icon: LinkedInIcon, external: true },
  // Behance's mark is naturally wider than the others (its own proportions,
  // not a square glyph like the rest) — sized down a touch so it doesn't
  // read heavier than its neighbours at the same height.
  { label: "Behance", href: siteConfig.behance.url, Icon: BehanceIcon, external: true, size: 14 },
  { label: "Figma", href: siteConfig.figma.url, Icon: FigmaIcon, external: true },
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
    // The hairline moves onto the inner div below md, with 12px of
    // transparent padding above it -- "the bottom edge is too close to
    // footer line, i want you to add whatever treatment you have added
    // to top and sides of the project card, to the bottom," per Josh:
    // the card's mt-3/mx-3 inset, mirrored. It cannot be a margin on
    // the card itself -- main's opaque background paints under a
    // child's margin, so a card-side gap rides along as a white apron
    // covering the footer's own content mid-reveal (the bug removed the
    // commit before this one). Living here, on the footer's side of the
    // curtain, the 12px is static background: at full scroll the card's
    // rounded corner floats 12px above the hairline, and mid-reveal
    // nothing but the card's shadow ever crosses the footer. md+ keeps
    // the border on the footer element itself, exactly as it was.
    <footer className="border-hairline max-md:sticky max-md:bottom-0 max-md:pt-3 md:border-t">
      <div className="border-hairline max-md:border-t mx-auto flex max-w-frame flex-wrap items-center justify-between gap-6 px-6 py-10 md:px-gutter">
        <div>
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
          {links.map(({ label, href, Icon, external, size }) => (
            <li key={label}>
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                aria-label={label}
                className="inline-block text-ink-muted transition-[color,transform] duration-200 ease-in-out hover:scale-110 hover:text-accent hover:duration-300 hover:ease-drift"
              >
                <Icon size={size ?? ICON_SIZE} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
