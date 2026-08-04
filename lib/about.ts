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

/** Placeholder wordmarks until Josh supplies logo files. */
export const clients: string[] = [
  "The Guardian",
  "Walker Books",
  "Sour Cherry",
  "Morningside",
  "Brixton Village",
  "Dynasty Foods",
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
