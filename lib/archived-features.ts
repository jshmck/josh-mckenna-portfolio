import type { FeatureItem } from "./about";

/**
 * Talks & Features entries pulled from display but kept intact for later
 * reinstatement — same pattern as lib/archived-projects.ts. Nothing
 * imports this file, so nothing here renders on /info; restoring an
 * entry is moving it back into the `features` array in lib/about.ts.
 * Assets stay put in public/about/ so a restore needs no asset work.
 */
export const archivedFeatures: FeatureItem[] = [
  {
    title: "A Minute With — Josh McKenna",
    description:
      "Sixty seconds on the practice — a one-minute filmed interview with Josh for his agency, B&A.",
    alt: "A Minute With — a one-minute filmed interview with Josh McKenna",
    video: {
      src: "/about/a-minute-with.mp4",
      // The ~1:02 frame, per Josh — the film's B&A endcard, fronted by
      // the dog. (Replaced the earlier 0:28 drawing frame.)
      poster: "/about/a-minute-with-poster-102.jpg",
    },
  },
];
