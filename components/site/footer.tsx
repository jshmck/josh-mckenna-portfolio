import {
  EmailIcon,
  InstagramIcon,
  LinkedInIcon,
  ThreadsIcon,
  XIcon,
} from "@/components/ui/social-icons";
import { siteConfig } from "@/lib/site";

/** Small, far right — a quiet way to reach Josh from any page, not a
 *  repeat of Contact's own full-size icon row. Email first (not a new
 *  tab), then the same social set/order as contact-content.tsx. */
const ICON_SIZE = 14;
const links = [
  { label: "Email", href: `mailto:${siteConfig.email}`, Icon: EmailIcon, external: false },
  { label: "Instagram", href: siteConfig.instagram.url, Icon: InstagramIcon, external: true },
  { label: "Threads", href: siteConfig.threads.url, Icon: ThreadsIcon, external: true },
  { label: "X", href: siteConfig.x.url, Icon: XIcon, external: true },
  { label: "LinkedIn", href: siteConfig.linkedin.url, Icon: LinkedInIcon, external: true },
];

/**
 * Footer — copyright line plus a small social/email row. The client list,
 * talks/features list, and full contact details that used to live here
 * moved into the Info and Contact pages' own content (see
 * app/about/page.tsx and app/contact/page.tsx) — Josh wanted them as real
 * page content, not footer chrome. Lives in the root layout so it's on
 * every page — the AI-training notice needs to be visible wherever a
 * visitor lands, and the icon row exists for the same reason: a way to
 * reach Josh from any page, not just Contact.
 */
export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-frame flex-wrap items-center justify-between gap-6 px-6 py-10 md:px-gutter">
        <div>
          {/* Two explicit paragraphs, not one long run-on string — this
              sentence is too long to fit type-label's mono/uppercase
              treatment on one line at any readable size, so it drops to
              font-body at a small size instead. Splitting here guarantees
              the line break lands right after "All rights reserved."
              instead of wherever the browser happens to wrap. */}
          <p className="font-body text-[11px] text-ink-muted">
            Copyright © {new Date().getFullYear()} {siteConfig.name}. All
            rights reserved.
          </p>
          <p className="font-body mt-1 text-[11px] text-ink-muted">
            No content on this site may be used to train, fine-tune or
            otherwise develop any artificial intelligence or machine
            learning model without prior written permission.
          </p>
        </div>

        <ul className="flex items-center gap-4">
          {links.map(({ label, href, Icon, external }) => (
            <li key={label}>
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                aria-label={label}
                className="block text-ink-muted transition-colors hover:text-accent"
              >
                <Icon size={ICON_SIZE} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
