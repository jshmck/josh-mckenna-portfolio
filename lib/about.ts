/** Content for the About page. Kept beside the site config so Josh can edit
 *  copy without opening a component. */

export type TimelineEntry = {
  year: number;
  event: string;
};

/** "How he got here" — newest first, as in the wireframe. */
export const timeline: TimelineEntry[] = [
  { year: 2026, event: "Cover for L.A. Pride, printed 2m wide on the main gate" },
  { year: 2024, event: "First picture-book series with Walker Books" },
  { year: 2021, event: "First solo show — Peckham Levels" },
  { year: 2019, event: "Went freelance" },
  { year: 2016, event: "Graduated — BA Illustration" },
];

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
    source: "Vogue Magazine",
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
  {
    quote:
      "Josh McKenna is a final year Illustration student at Falmouth University who's not only including waves in his work but making waves on the UK design scene.",
    source: "Creative Boom",
  },
  {
    quote:
      "East London-based designer and illustrator Josh McKenna wooed us with his lucid, playful pastel visions which feel at once retro and contemporary, minimal yet full of life.",
    source: "Crack Magazine",
  },
  {
    quote: "Josh McKenna is making waves in Cornwall with his tropical work.",
    source: "It's Nice That (2014)",
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
