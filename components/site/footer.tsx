import { clients } from "@/lib/about";
import { footerTalks, siteConfig } from "@/lib/site";

/** Minimal single-colour glyphs, sized to inherit currentColor so the
 *  hover:text-accent treatment on their parent link applies to them too. */
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.24 2H21l-6.53 7.47L22 22h-6.68l-5.23-6.84L4.03 22H1.27l7-8.01L2 2h6.84l4.73 6.25L18.24 2Zm-1.17 18h1.85L7.02 4H5.06l12.01 16Z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7.2" cy="7.8" r="1.3" fill="currentColor" />
      <rect x="6.2" y="10.8" width="2" height="7.4" fill="currentColor" />
      <path
        fill="currentColor"
        d="M10.6 10.8h2v1.2c.55-.85 1.5-1.4 2.6-1.4 2 0 3.1 1.3 3.1 3.8v4.8h-2v-4.4c0-1.2-.45-2-1.6-2-.9 0-1.5.6-1.75 1.2-.09.22-.11.5-.11.8v4.4h-2z"
      />
    </svg>
  );
}

function ThreadsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M12 2.5c4.5 0 7 2.7 7 7.3 0 3.4-1.4 5.3-3.9 5.3-1.7 0-2.7-.9-2.7-2.2 0-1.4 1.1-2.2 2.7-2.2.9 0 1.7.2 2.3.6M12 2.5C7.5 2.5 5 5.4 5 10.3 5 16 8 21.5 12 21.5c3 0 5.1-1.6 5.9-4.3"
      />
    </svg>
  );
}

const socials = [
  { label: "Instagram", href: siteConfig.instagram.url, Icon: InstagramIcon },
  { label: "Threads", href: siteConfig.threads.url, Icon: ThreadsIcon },
  { label: "X", href: siteConfig.x.url, Icon: XIcon },
  { label: "LinkedIn", href: siteConfig.linkedin.url, Icon: LinkedInIcon },
];

/**
 * Three-column footer utilities row — about/clients, talks and features,
 * contact. Identical on all six pages per the wireframes. The CTA band
 * above it is page-specific and lives with each page.
 */
export function Footer() {
  return (
    <footer>
      <div className="mx-auto grid max-w-frame gap-10 px-6 py-16 md:grid-cols-3 md:gap-12 md:px-gutter">
        <div>
          <p className="font-body text-[15px] font-bold text-ink">
            Selected Clients
          </p>
          <p className="font-body mt-6 text-[15px] text-ink-muted">
            {clients.join(", ")}
          </p>
        </div>

        <div>
          <p className="font-body text-[15px] font-bold text-ink">
            Selected Talks and Features
          </p>
          <ul className="mt-6 space-y-1">
            {footerTalks.map((talk) => (
              <li key={talk} className="font-body text-[15px] text-ink-muted">
                {talk}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-body text-[15px] font-bold text-ink">Contact</p>

          <div className="mt-6">
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
        </div>
      </div>
    </footer>
  );
}
