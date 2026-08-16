/** Content for the About page. Kept beside the site config so Josh can edit
 *  copy without opening a component. */

/** Shared with the footer's "Selected Clients" list — one source, both places. */
export const clients: string[] = [
  "Apple",
  "Google",
  "Meta",
  "WhatsApp",
  "British Airways",
  "Wall Street Journal",
  "Kiehl's",
  "Piper-Heidsieck",
  "Coca-Cola",
  "Vogue",
  "UAL",
  "Mr Porter",
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
];
