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
   *  every other framed image. Every Talks & Features card is 16/9 now
   *  (Josh: "make sure all frames are 16/9"), so sources are either
   *  natively 16:9 or close enough to cover-crop. `fit: "contain"`
   *  remains for any future piece whose ratio is far off. */
  image?: { src: string; fit?: "cover" | "contain" };
  /** Several photos in one slot — a swipeable in-card gallery
   *  (components/about/feature-gallery.tsx), no lightbox. */
  images?: { src: string; alt: string }[];
  /** Real film. The files in public/about/ are 960×540 H.264 re-encodes
   *  of Josh's masters (the originals are 120–240 MB each — far too heavy
   *  to ship); the poster is a frame from the film so the card reads
   *  before anyone presses play. */
  video?: { src: string; poster: string };
  /** A talk whose recording lives on someone else's YouTube channel
   *  (Figma's, It's Nice That's) — embedded click-to-load via
   *  components/about/youtube-embed.tsx rather than re-hosted. The
   *  poster is a local copy of the video's thumbnail. */
  youtube?: { id: string; poster: string };
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
    // The promo master is natively 1920x1080, so at the 16/9 card ratio
    // it goes in untouched. (An earlier 16/10 grid needed a version with
    // its flat bands extended — gone now the frames match the asset.)
    image: { src: "/about/sxsw-panelpicker-169.jpg" },
  },
  {
    title: "Speaker — Config 2026",
    description:
      "‘Dimensional shift: sculpting in Figma Draw’ — Josh's talk at Config, Figma's annual design conference.",
    alt: "Config 2026 talk — Dimensional shift: sculpting in Figma Draw",
    youtube: { id: "0ZoW_ym83JQ", poster: "/about/config-2026-poster.jpg" },
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
      "Josh's spread in ‘Mr Hudson Explores: The Gay Man's Travel Companion’, published by Gestalten in 2019.",
    alt: "Gestalten's Mr Hudson Explores — the cover beside Josh's London spread",
    // Josh's own product shot (Mr-Hudson-Explores-Cover.png), natively
    // 16:9 — cover and open spread together.
    image: { src: "/about/gestalten-mr-hudson-cover.jpg" },
  },
  {
    title: "Art Lab & Apple Today — Apple",
    description:
      "Two sessions at Apple in 2019: ‘Art Lab: Portraits Beyond Labels’ — part workshop, part interview — and an Apple Today iPad illustration workshop.",
    alt: "Photos from Josh's Today at Apple Art Lab workshops",
    images: [
      {
        src: "/about/apple-today/01.jpg",
        alt: "Josh on stage under the Art Lab session card, his We Are Proud artwork on the store's screen",
      },
      {
        src: "/about/apple-today/02.jpg",
        alt: "Josh talking through his character work on the store's big screen",
      },
      {
        src: "/about/apple-today/03.jpg",
        alt: "Josh in conversation in front of the audience at the workshop",
      },
      {
        src: "/about/apple-today/04.jpg",
        alt: "Workshop attendees drawing on iPads with Apple Pencils",
      },
      {
        src: "/about/apple-today/05.jpg",
        alt: "An Apple team member demonstrating Procreate layers on screen",
      },
    ],
  },
  {
    title: "Speaker — Nicer Tuesdays 2017",
    description:
      "Josh spoke at Nicer Tuesdays, It's Nice That's monthly talks night in London, in the year of the Instagram Pride sticker.",
    alt: "Nicer Tuesdays: Josh McKenna — It's Nice That's talk video",
    youtube: { id: "b7zTmfXE8ic", poster: "/about/nicer-tuesdays-poster.jpg" },
  },
  {
    title: "Feature — Bombay Sapphire",
    description:
      "‘Testhouse Punch’ — Hypebeast's film with Josh, covering Bombay Sapphire's Stir Creativity campaign.",
    alt: "Bombay Sapphire Stir Creativity — Hypebeast's film featuring Josh McKenna",
    video: {
      src: "/about/bombay-sapphire.mp4",
      // The 0:05 frame, per Josh — the film's own 'Testhouse Punch'
      // title card.
      poster: "/about/bombay-sapphire-poster-5s.jpg",
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
