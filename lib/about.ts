/** Content for the About page. Kept beside the site config so Josh can edit
 *  copy without opening a component. */

export type Client = {
  name: string;
  /** Path under /public/logos. Omitted clients render as text (no logo
   *  file with a clear, reusable license was found for them). */
  logo?: string;
  /** `icon` marks squarish/compact logomarks (Apple, Meta...) — at the
   *  standard row height they'd sit far smaller than the wide wordmarks
   *  around them, so they're bumped up to read as equally prominent.
   *  `lg` is the same fix for a wordmark whose own detail (small text,
   *  decorative borders) reads poorly at the standard height. */
  size?: "icon" | "lg" | "xl";
};

/** Shared with the footer's "Selected Clients" list — one source, both
 *  places. Order is deliberate, not alphabetical or by category: the
 *  biggest names lead (Apple, Google, Meta, British Airways...), and
 *  icon-shaped marks and wordmarks mix in loose, varied runs (2-3 icons,
 *  then a word, sometimes two words together) rather than a strict
 *  alternation — a rigid pattern read as mechanical. The one hard rule is
 *  never stacking two very wide wordmarks back to back (that's what
 *  originally left a ragged gap on the right — British Airways directly
 *  into Wall Street Journal ate a whole row on its own). */
export const clients: Client[] = [
  { name: "Apple", logo: "/logos/apple.svg", size: "icon" },
  { name: "Google", logo: "/logos/google.svg", size: "icon" },
  { name: "Meta", logo: "/logos/meta.svg", size: "icon" },
  { name: "British Airways", logo: "/logos/british-airways.svg" },
  { name: "WhatsApp", logo: "/logos/whatsapp.svg", size: "icon" },
  { name: "Instagram", logo: "/logos/instagram.svg", size: "icon" },
  { name: "Vogue", logo: "/logos/vogue.svg" },
  { name: "Piper-Heidsieck", logo: "/logos/piper-heidsieck.png", size: "lg" },
  { name: "Coca-Cola", logo: "/logos/coca-cola.svg" },
  { name: "Mr Porter", logo: "/logos/mr-porter.png" },
  { name: "Bombay Sapphire", logo: "/logos/bombay-sapphire.png", size: "lg" },
  { name: "Monocle Magazine", logo: "/logos/monocle.svg" },
  { name: "Wagamama", logo: "/logos/wagamama.svg" },
  { name: "Wired Magazine", logo: "/logos/wired.svg" },
  { name: "Kiehl's", logo: "/logos/kiehls.svg" },
  { name: "UAL", logo: "/logos/ual.svg", size: "xl" },
  { name: "Vodafone", logo: "/logos/vodafone.svg" },
  { name: "Levi's", logo: "/logos/levis.svg" },
  { name: "Converse", logo: "/logos/converse.svg", size: "icon" },
  { name: "GQ", logo: "/logos/gq.svg" },
  { name: "Wall Street Journal", logo: "/logos/wsj.svg" },
  { name: "Crocs", logo: "/logos/crocs.svg" },
  { name: "HP", logo: "/logos/hp.svg", size: "icon" },
  { name: "Boots", logo: "/logos/boots.png", size: "icon" },
  { name: "Unilever", logo: "/logos/unilever.svg" },
  { name: "The Body Shop", logo: "/logos/body-shop.png", size: "xl" },
  { name: "Soho House", logo: "/logos/soho-house.png", size: "xl" },
  { name: "V&A", logo: "/logos/va-museum.svg" },
  { name: "Three", logo: "/logos/three.svg", size: "icon" },
  { name: "MTV", logo: "/logos/mtv.svg", size: "icon" },
  { name: "The Guardian", logo: "/logos/guardian.svg" },
  { name: "The Times", logo: "/logos/the-times.svg" },
  { name: "Condé Nast", logo: "/logos/conde-nast.svg" },
];

export type PressQuote = {
  quote: string;
  source: string;
};

/** Real press excerpts — About page's pull-quote section. */
export const pressQuotes: PressQuote[] = [
  {
    quote:
      "Devoted Instagram users will no doubt recognise the sassy red-heeled character in the mural, which appeared in the Pride-themed Stories sticker pack Instagram released in May.",
    source: "Vogue Magazine (2017)",
  },
  {
    quote:
      "His work has become an intrinsic part of our lives on social media, which has now filtered out into the real world in the form of celebratory posters, floats, and artworks.",
    source: "Gestalten (2019)",
  },
  {
    quote:
      "Josh McKenna's celebratory illustrations of 'what it's like to be gay' for Pride have been one of the most shareable hits of 2017.",
    source: "It's Nice That (2017)",
  },
];

export type FeatureItem = {
  title: string;
  description: string;
  alt: string;
};

/**
 * The rich version of the footer's "Selected Talks and Features" list —
 * same real events, expanded with a photo/video slot and a write-up.
 * Placeholder copy and media until Josh sends the real assets over.
 */
export const features: FeatureItem[] = [
  {
    title: "Application Accepted — SXSW 2027",
    description:
      "Placeholder write-up — swap in the real caption once Josh sends it over.",
    alt: "Photo placeholder — SXSW 2027",
  },
  {
    title: "Speaker — Config 2026",
    description:
      "Placeholder write-up — swap in the real caption once Josh sends it over.",
    alt: "Photo placeholder — Config 2026 talk",
  },
  {
    title: "A Minute With — Josh McKenna",
    description:
      "Placeholder write-up — swap in the real caption once Josh sends it over.",
    alt: "Video placeholder — A Minute With interview",
  },
  {
    title: "Book Feature — Gestalten",
    description:
      "Placeholder write-up — swap in the real caption once Josh sends it over.",
    alt: "Photo placeholder — Gestalten book feature",
  },
  {
    title: "Workshop — Apple",
    description:
      "Placeholder write-up — swap in the real caption once Josh sends it over.",
    alt: "Photo placeholder — Apple workshop",
  },
  {
    title: "Speaker — Nicer Tuesdays 2017",
    description:
      "Placeholder write-up — swap in the real caption once Josh sends it over.",
    alt: "Video placeholder — Nicer Tuesdays talk",
  },
  {
    title: "Feature — Bombay Sapphire",
    description:
      "Placeholder write-up — swap in the real caption once Josh sends it over.",
    alt: "Photo placeholder — Bombay Sapphire feature",
  },
  {
    title: "Feature — Bombay Sapphire",
    description:
      "Placeholder write-up — swap in the real caption once Josh sends it over.",
    alt: "Photo placeholder — Bombay Sapphire feature 2",
  },
];

/**
 * The four states of the pinned "decomposing illustration" sequence.
 * Progress is a 0–1 fraction of the way through the pinned section.
 */
export const sequenceStates = [
  {
    label: "Intact",
    caption: "One complete illustration, holding itself together.",
  },
  {
    label: "Separating",
    caption: "The layers begin to pull apart on independent paths.",
  },
  {
    label: "Scattering",
    caption: "Pieces drift out of frame. The whole stops being a whole.",
  },
  {
    label: "Handoff",
    caption: "The illustration is gone. What's left is the person who drew it.",
  },
] as const;
