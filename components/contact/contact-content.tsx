import { EnquiryForm } from "@/components/contact/enquiry-form";
import { SOCIAL_ICON_SIZE, socialLinks } from "@/components/site/social-links";
import { Reveal } from "@/components/ui/reveal";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { siteConfig } from "@/lib/site";

/**
 * The actual Contact page body — intro, direct/agency emails,
 * illustration and the enquiry form. Used by app/contact/page.tsx. Kept
 * as its own component (rather than folded into the page) since it used
 * to also be embedded at the end of Info — that merge was removed per
 * Josh, but the split is still a reasonable seam if a similar embed is
 * wanted again later. The caller owns its own page-level heading
 * (sr-only or otherwise) — this component starts at the intro paragraph.
 *
 * The full-size social icon row that used to live here was removed as a
 * duplicate of the sitewide footer's. What remains is a mobile-only row
 * (md:hidden) between the intro paragraph and the email addresses —
 * "on mobile i want the social media icons from the footer just under
 * the paragraph and above the emails," per Josh — drawing from the same
 * shared list as the footer (components/site/social-links.ts) so the
 * two can't drift apart again. No envelope icon in it, per the same
 * request: the addresses themselves sit directly below.
 */
export function ContactContent() {
  return (
    <div className="mx-auto grid max-w-frame items-start gap-14 px-6 md:grid-cols-2 md:px-gutter">
      <div>
        {/* Same fade + rise as Info's intro paragraph -- was missing here,
            so this text just appeared instantly instead of springing up
            like the rest of the site. Covers the intro through the agency
            email -- everything in this column that's text/links, not just
            the paragraph -- as one group rather than each piece firing on
            its own. */}
        <Reveal>
          <p className="type-lede max-w-md text-ink-muted">
            Commissions, collaborations, editorial deadlines that are
            already late — all welcome. Josh reads everything himself and
            replies within two working days.
          </p>

          {/* Mobile-only: the footer's social set, minus the envelope
              (the addresses are right below). Same hover recipe as the
              footer's row. md+ keeps relying on the sitewide footer. */}
          <ul className="mt-8 flex items-center gap-4 md:hidden">
            {socialLinks.map(({ label, href, Icon, size = SOCIAL_ICON_SIZE }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="inline-block text-ink-muted transition-[color,transform] duration-200 ease-in-out hover:scale-110 hover:text-accent hover:duration-300 hover:ease-drift"
                >
                  <Icon size={size} />
                </a>
              </li>
            ))}
          </ul>

          {/* Moved here from the old sitewide footer — same treatment,
              same text size/format. */}
          <div className="mt-12 max-md:mt-10">
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
