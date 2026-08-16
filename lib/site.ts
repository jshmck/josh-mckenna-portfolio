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
  /** For enquiries that go through representation rather than direct. */
  agencyEmail: "info@ba-reps.com",
  instagram: {
    handle: "@jshmck",
    url: "https://www.instagram.com/jshmck/?hl=en",
  },
  x: {
    handle: "@jshmck",
    url: "https://x.com/jshmck",
  },
  linkedin: {
    url: "https://www.linkedin.com/in/joshmckennna/",
  },
  threads: {
    handle: "@jshmck",
    url: "https://www.threads.com/@jshmck",
  },
  /** Used for absolute OG image + canonical URLs. */
  url: "https://joshmckenna.com",
} as const;

/* Josh's v2 nav (Figma node 85:420): HOME · WORK · INFO · CONTACT on the
   left; SHOP and CART sit together on the far right (both rendered
   separately in the nav, for easier reach next to the cart). INFO points
   at /about — the "info" label, same page. */
export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Info", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/** "Selected Talks and Features" — Info page, newest/most notable first. */
export const talksAndFeatures: string[] = [
  "Application Accepted - SXSW 2027",
  "Speaker - Config 2026",
  "Book Feature - Gestalten",
  "Workshop - Apple",
  "Speaker - Nicer Tuesdays 2017",
];

/** Marquee words for the homepage band. Repeated in-component to loop. */
export const marqueeWords = ["ALWAYS DRAWING", "NEVER STILL"] as const;
