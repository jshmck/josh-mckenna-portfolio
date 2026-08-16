import type { Metadata } from "next";

import { EnquiryForm } from "@/components/contact/enquiry-form";
import { Plate } from "@/components/ui/plate";
import {
  InstagramIcon,
  LinkedInIcon,
  ThreadsIcon,
  XIcon,
} from "@/components/ui/social-icons";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Commissions, collaborations, editorial deadlines and unsolicited opinions about typefaces.",
};

const socials = [
  { label: "Instagram", href: siteConfig.instagram.url, Icon: InstagramIcon },
  { label: "Threads", href: siteConfig.threads.url, Icon: ThreadsIcon },
  { label: "X", href: siteConfig.x.url, Icon: XIcon },
  { label: "LinkedIn", href: siteConfig.linkedin.url, Icon: LinkedInIcon },
];

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-frame gap-14 px-6 py-20 md:grid-cols-2 md:px-gutter">
      <div>
        <h1 className="type-title font-medium text-accent">SAY HELLO</h1>
        <p className="type-lede mt-5 max-w-md text-ink-muted">
          Commissions, collaborations, editorial deadlines and unsolicited
          opinions about typefaces — all welcome. Josh replies to everything,
          eventually.
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

        <div className="mt-14 max-w-xs">
          <Plate
            image={{ ratio: "1/1", alt: "A drawing, for the sake of it" }}
            sizes="(max-width: 768px) 60vw, 20vw"
          />
        </div>
      </div>

      <EnquiryForm />
    </div>
  );
}
