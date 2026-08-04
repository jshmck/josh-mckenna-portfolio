/**
 * Single source of truth for site-wide chrome: navigation, contact details and
 * footer utilities. The nav and footer both read from here so a link is never
 * defined twice.
 */

export type NavLink = {
  label: string;
  href: string;
};

export const siteConfig = {
  name: "Josh McKenna",
  shortName: "Josh",
  role: "Illustrator",
  /** TODO(josh): confirm city before launch — placeholder in the wireframe. */
  location: "London",
  tagline: "Drawings that misbehave.",
  description:
    "Josh McKenna is an illustrator drawing loud, friendly, slightly queer characters for magazines, record sleeves and packaging.",
  email: "hello@joshmckenna.com",
  instagram: {
    handle: "@josh",
    url: "https://instagram.com/josh",
  },
  /** Empty string renders the field as "—" on the contact page. */
  representation: "",
  /** Used for absolute OG image + canonical URLs. */
  url: "https://joshmckenna.com",
} as const;

export const navLinks: NavLink[] = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Shop", href: "/shop" },
];

export const footerLinks: NavLink[] = [
  { label: "Instagram", href: siteConfig.instagram.url },
  { label: "Commercial enquiry", href: "/contact" },
  { label: "Terms", href: "/terms" },
];

/** Marquee words for the homepage band. Repeated in-component to loop. */
export const marqueeWords = ["Always drawing", "Never still"] as const;
