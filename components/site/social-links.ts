import {
  BehanceIcon,
  FigmaIcon,
  InstagramIcon,
  LinkedInIcon,
  ThreadsIcon,
  XIcon,
} from "@/components/ui/social-icons";

import { siteConfig } from "@/lib/site";

/** The canonical social set/order, shared by the footer and the Contact
 *  page's mobile-only row so the two can't drift apart (the footer and
 *  contact-content.tsx each keeping their own copy is how Behance went
 *  missing from one of them once). Email is deliberately not in here —
 *  the footer prepends its own mailto entry, and Contact shows the
 *  addresses themselves. */
export const SOCIAL_ICON_SIZE = 18;

type SocialLink = {
  label: string;
  href: string;
  Icon: typeof InstagramIcon;
  /** Per-icon override of SOCIAL_ICON_SIZE. */
  size?: number;
};

export const socialLinks: SocialLink[] = [
  { label: "Instagram", href: siteConfig.instagram.url, Icon: InstagramIcon },
  { label: "Threads", href: siteConfig.threads.url, Icon: ThreadsIcon },
  { label: "X", href: siteConfig.x.url, Icon: XIcon },
  { label: "LinkedIn", href: siteConfig.linkedin.url, Icon: LinkedInIcon },
  // Behance's mark is naturally wider than the others (its own proportions,
  // not a square glyph like the rest) — sized down a touch so it doesn't
  // read heavier than its neighbours at the same height.
  { label: "Behance", href: siteConfig.behance.url, Icon: BehanceIcon, size: 14 },
  { label: "Figma", href: siteConfig.figma.url, Icon: FigmaIcon },
];
