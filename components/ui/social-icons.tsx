type IconProps = {
  /** Defaults to the 20px these were originally built at (Contact page).
   *  The footer uses a smaller size without needing its own icon set. */
  size?: number;
};

/** Minimal single-colour glyphs, sized to inherit currentColor so a
 *  hover:text-accent treatment on the parent link applies to them too. */
export function InstagramIcon({ size = 20 }: IconProps = {}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function XIcon({ size = 20 }: IconProps = {}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.24 2H21l-6.53 7.47L22 22h-6.68l-5.23-6.84L4.03 22H1.27l7-8.01L2 2h6.84l4.73 6.25L18.24 2Zm-1.17 18h1.85L7.02 4H5.06l12.01 16Z"
      />
    </svg>
  );
}

export function LinkedInIcon({ size = 20 }: IconProps = {}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
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

export function ThreadsIcon({ size = 20 }: IconProps = {}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
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

/** A "b"/"e" pair, echoing Behance's lettermark and its signature
 *  protruding crossbar on the e — not a trace of the official glyph. */
export function BehanceIcon({ size = 20 }: IconProps = {}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M3 4v16"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d="M3 11.3c1-1.2 2.4-1.9 3.9-1.9 2.4 0 4.2 1.9 4.2 4.4S9.3 18.3 6.9 18.3c-1.5 0-2.9-.7-3.9-1.9"
      />
      <circle cx="17" cy="14.6" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path stroke="currentColor" strokeWidth="1.5" d="M13.1 14.1h7.8" />
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M14.5 8.6h5" />
    </svg>
  );
}

/** Simple envelope — the footer's "contact me directly" link, distinct
 *  from the social icons it sits beside. */
export function EmailIcon({ size = 20 }: IconProps = {}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 6.5 12 13l8.5-6.5"
      />
    </svg>
  );
}
