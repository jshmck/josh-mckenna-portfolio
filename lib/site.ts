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
  behance: {
    url: "https://www.behance.net/joshmckennna",
  },
  /** Used for absolute OG image + canonical URLs. */
  url: "https://joshmckenna.com",
} as const;

/* Deviates from the original Figma nav (node 85:420, HOME · WORK · INFO ·
   CONTACT on the left with SHOP + CART on the far right) — Josh moved Shop
   into the left-hand group. Placed between Work and Info rather than
   Home/Work or Info/Contact specifically because those two pairs merge on
   scroll (see nav.tsx's MERGE_ENTER/EXIT — Home flows into Work, Info flows
   into Contact with no click), so Shop sits in the one slot that doesn't
   split either pairing. Cart stays alone on the far right. INFO points at
   /about — the "info" label, same page. */
export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Shop", href: "/shop" },
  { label: "Info", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/** Marquee words for the homepage band. Repeated in-component to loop. */
export const marqueeWords = ["ALWAYS DRAWING", "NEVER STILL"] as const;
