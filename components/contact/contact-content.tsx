import { EnquiryForm } from "@/components/contact/enquiry-form";
import { Reveal } from "@/components/ui/reveal";
import {
  BehanceIcon,
  FigmaIcon,
  InstagramIcon,
  LinkedInIcon,
  ThreadsIcon,
  XIcon,
} from "@/components/ui/social-icons";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { siteConfig } from "@/lib/site";

const DEFAULT_ICON_SIZE = 20;

const socials = [
  { label: "Instagram", href: siteConfig.instagram.url, Icon: InstagramIcon },
  { label: "Threads", href: siteConfig.threads.url, Icon: ThreadsIcon },
  { label: "X", href: siteConfig.x.url, Icon: XIcon },
  { label: "LinkedIn", href: siteConfig.linkedin.url, Icon: LinkedInIcon },
  // Behance's mark is naturally wider than the others (its own proportions,
  // not a square glyph like the rest) — sized down a touch so it doesn't
  // read heavier than its neighbours at the same height.
  { label: "Behance", href: siteConfig.behance.url, Icon: BehanceIcon, size: 16 },
  { label: "Figma", href: siteConfig.figma.url, Icon: FigmaIcon },
];

/**
 * The actual Contact page body — intro, direct/agency emails, socials,
 * illustration and the enquiry form. Used by app/contact/page.tsx. Kept
 * as its own component (rather than folded into the page) since it used
 * to also be embedded at the end of Info — that merge was removed per
 * Josh, but the split is still a reasonable seam if a similar embed is
 * wanted again later. The caller owns its own page-level heading
 * (sr-only or otherwise) — this component starts at the intro paragraph.
 */
export function ContactContent() {
  return (
    <div className="mx-auto grid max-w-frame items-start gap-14 px-6 md:grid-cols-2 md:px-gutter">
      <div>
        {/* Same fade + rise as Info's intro paragraph -- was missing here,
            so this text just appeared instantly instead of springing up
            like the rest of the site. Covers the intro through the social
            icons -- everything in this column that's text/links, not just
            the paragraph -- as one group rather than each piece firing on
            its own. */}
        <Reveal>
          <p className="type-lede max-w-md text-ink-muted">
            Commissions, collaborations, editorial deadlines that are
            already late — all welcome. Josh reads everything himself and
            replies within two working days.
          </p>

          {/* Moved here from the old sitewide footer — same treatment,
              same text size/format. */}
          <div className="mt-12">
            <p className="type-label text-ink-muted">Direct Commissions</p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-block font-body text-[15px] text-ink-muted underline transition-[color,transform] duration-200 ease-in-out hover:scale-105 hover:text-accent hover:duration-300 hover:ease-drift"
            >
              {siteConfig.email}
            </a>
          </div>

          <div className="mt-5">
            <p className="type-label text-ink-muted">Agency Contact</p>
            <a
              href={`mailto:${siteConfig.agencyEmail}`}
              className="inline-block font-body text-[15px] text-ink-muted underline transition-[color,transform] duration-200 ease-in-out hover:scale-105 hover:text-accent hover:duration-300 hover:ease-drift"
            >
              {siteConfig.agencyEmail}
            </a>
          </div>

          <ul className="mt-6 flex items-center gap-4">
            {socials.map(({ label, href, Icon, size }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="inline-block text-ink transition-[color,transform] duration-200 ease-in-out hover:scale-110 hover:text-accent hover:duration-300 hover:ease-drift"
                >
                  <Icon size={size ?? DEFAULT_ICON_SIZE} />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Same treatment as Work/Info's illustrations -- next/image
            direct, object-contain, no Plate frame or background surface,
            plus the same cursor-follow tilt on hover
            (components/ui/tilt-illustration.tsx). Height chosen to match
            the old max-w-[280px] footprint at this aspect ratio. */}
        <div className="mt-8">
          <TiltIllustration
            src="/illustrations/last-call.png"
            alt="A drawing, for the sake of it"
            aspect="1255/1338"
            height={298}
          />
        </div>
      </div>

      <EnquiryForm />
    </div>
  );
}
