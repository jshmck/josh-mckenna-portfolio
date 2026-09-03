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
  // .png, not .svg like its neighbours — the original file was an SVG
  // wrapper around two embedded raster PNGs composited via an SVG
  // <mask> (a luminance mask providing the "3" shape, applied to a
  // solid-black fill layer). That mask composition is what iOS Safari
  // was rasterizing at a fixed, lower-than-display resolution — "three
  // logo is pixelated on mobile," per Josh, invisible on desktop
  // because Chrome/Firefox rasterize the same mask at actual output
  // size. Flattened the mask + fill into one real RGBA PNG (the mask's
  // own luminance became the alpha channel directly, at its full
  // 1665x2160 native resolution) so there's no live SVG masking left to
  // rasterize badly — same pixels, no more Safari-only bug.
  { name: "Three", logo: "/logos/three.png", size: "icon" },
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
  /** Real photo/artwork, once one exists — rendered through Plate like
   *  every other framed image. `fit: "contain"` for artwork whose ratio
   *  is far from the grid's 16/10 card (the Ad Age SXSW banner is 3.6:1 —
   *  cover-cropping it would show less than half the piece). */
  image?: { src: string; fit?: "cover" | "contain" };
  /** Real film. The files in public/about/ are 960×540 H.264 re-encodes
   *  of Josh's masters (the originals are 120–240 MB each — far too heavy
   *  to ship); the poster is a frame from the film so the card reads
   *  before anyone presses play. */
  video?: { src: string; poster: string };
};

/**
 * The rich version of the footer's "Selected Talks and Features" list —
 * same real events, expanded with a photo/video slot and a write-up.
 * Slots without `image`/`video` still render Plate's labelled placeholder
 * until Josh sends the asset over.
 */
export const features: FeatureItem[] = [
  {
    title: "Application Accepted — SXSW 2027",
    description:
      "Josh's PanelPicker proposal was voted through — SXSW 2027 runs 15–21 March in Austin, Texas.",
    alt: "SXSW 2027 PanelPicker voting card for Josh's proposal",
    // The 1920x1080 promo master is extended to exactly 16/10 by growing
    // its flat purple/pink bands (scratchpad job, no content scaled or
    // cropped) — contain-letterboxing the 16:9 original left this the
    // only square-cornered card on the page, and cover would clip the
    // SXSW logo off its left edge.
    image: { src: "/about/sxsw-panelpicker-card.jpg" },
  },
  {
    title: "Speaker — Config 2026",
    description: "A talk at Config, Figma's annual design conference.",
    alt: "Photo placeholder — Config 2026 talk",
  },
  {
    title: "A Minute With — Josh McKenna",
    description:
      "Sixty seconds on the practice — a one-minute filmed interview with Josh for his agency, B&A.",
    alt: "A Minute With — a one-minute filmed interview with Josh McKenna",
    video: {
      src: "/about/a-minute-with.mp4",
      // The 0:28 frame, per Josh — him drawing on the iPad, captioned
      // "my process is all digital these days."
      poster: "/about/a-minute-with-poster-28s.jpg",
    },
  },
  {
    title: "Book Feature — Gestalten",
    description:
      "Josh's work appears in a 2019 title from Berlin publisher Gestalten.",
    alt: "Photo placeholder — Gestalten book feature",
  },
  {
    title: "Workshop — Apple",
    description: "An illustration workshop led with Apple.",
    alt: "Photo placeholder — Apple workshop",
  },
  {
    title: "Speaker — Nicer Tuesdays 2017",
    description:
      "Josh spoke at Nicer Tuesdays, It's Nice That's monthly talks night in London, in the year of the Instagram Pride sticker.",
    alt: "Video placeholder — Nicer Tuesdays talk",
  },
  {
    title: "Feature — Bombay Sapphire",
    description:
      "A film made with Bombay Sapphire for their Stir Creativity campaign.",
    alt: "Bombay Sapphire Stir Creativity — a short film featuring Josh McKenna",
    video: {
      src: "/about/bombay-sapphire.mp4",
      poster: "/about/bombay-sapphire-poster.jpg",
    },
  },
  {
    title: "Campaign Film — HP",
    description:
      "After The George, Dublin's landmark gay bar, was defaced with hate speech, HP printed Josh's artwork at building scale on their Latex presses to cover it.",
    alt: "HP campaign film — The George in Dublin wrapped in Josh's printed artwork",
    video: {
      src: "/about/hp-latex.mp4",
      poster: "/about/hp-latex-poster.jpg",
    },
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
