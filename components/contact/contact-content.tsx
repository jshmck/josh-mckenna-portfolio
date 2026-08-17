import Image from "next/image";

import { EnquiryForm } from "@/components/contact/enquiry-form";
import {
  InstagramIcon,
  LinkedInIcon,
  ThreadsIcon,
  XIcon,
} from "@/components/ui/social-icons";
import { siteConfig } from "@/lib/site";

const socials = [
  { label: "Instagram", href: siteConfig.instagram.url, Icon: InstagramIcon },
  { label: "Threads", href: siteConfig.threads.url, Icon: ThreadsIcon },
  { label: "X", href: siteConfig.x.url, Icon: XIcon },
  { label: "LinkedIn", href: siteConfig.linkedin.url, Icon: LinkedInIcon },
];

/**
 * The actual Contact page body — intro, direct/agency emails, socials,
 * illustration and the enquiry form. Shared between app/contact/page.tsx
 * (its own route) and Info's closing section (app/about/page.tsx embeds
 * this directly, mirroring the Home -> Work merge: Info flows straight
 * into the real Contact content instead of just linking to it). Each
 * caller owns its own page-level heading (sr-only or otherwise) — this
 * component starts at the intro paragraph.
 */
export function ContactContent() {
  return (
    <div className="mx-auto grid max-w-frame items-start gap-14 px-6 md:grid-cols-2 md:px-gutter">
      <div>
        <p className="type-lede max-w-md text-ink-muted">
          Commissions, collaborations, editorial deadlines that are already
          late — all welcome. Josh reads everything himself and replies
          within two working days.
        </p>

        {/* Moved here from the old sitewide footer — same treatment,
            same text size/format. */}
        <div className="mt-12">
          <p className="type-label text-ink-muted">Direct Commissions</p>
          <a
            href={`mailto:${siteConfig.email}`}
            className="font-body text-[15px] text-ink-muted underline transition-colors hover:text-accent"
          >
            {siteConfig.email}
          </a>
        </div>

        <div className="mt-5">
          <p className="type-label text-ink-muted">Agency Contact</p>
          <a
            href={`mailto:${siteConfig.agencyEmail}`}
            className="font-body text-[15px] text-ink-muted underline transition-colors hover:text-accent"
          >
            {siteConfig.agencyEmail}
          </a>
        </div>

        <ul className="mt-6 flex items-center gap-4">
          {socials.map(({ label, href, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="block text-ink transition-colors hover:text-accent"
              >
                <Icon />
              </a>
            </li>
          ))}
        </ul>

        {/* A transparent PNG, not a framed photo -- goes straight through
            next/image with object-contain, no Plate frame or background
            surface, same exception the drifting-hero cut-outs use. Plate
            always paints a background behind its image slot, which never
            mattered before since every other real image on the site is an
            opaque photo. */}
        <div className="relative mt-8 aspect-[1255/1338] max-w-[280px]">
          <Image
            src="/illustrations/last-call.png"
            alt="A drawing, for the sake of it"
            fill
            sizes="(max-width: 768px) 60vw, 20vw"
            className="object-contain"
          />
        </div>
      </div>

      <EnquiryForm />
    </div>
  );
}
