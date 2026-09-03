import type { Project } from "./projects";

/**
 * Projects pulled from display but kept intact for later reinstatement —
 * "remove LGBT centre project (archive it somewhere but don't want it
 * displayed rn)," per Josh. Nothing imports this file, so nothing here
 * renders, prerenders a route, or appears in the /work grid; restoring a
 * project is moving its entry back into the `projects` array in
 * lib/projects.ts (watch the /work grid's RATIO_CYCLE parity around the
 * insertion point, same as any hand edit there). Artwork stays put in
 * public/work/<slug>/ so a restore needs no asset work.
 */
export const archivedProjects: Project[] = [
  {
    slug: "london-lgbtq-centre",
    title: "LGBTQ Centre",
    client: "London LGBTQ+ Community Centre",
    year: 2019,
    discipline: "Illustration",
    deliverables: "Brand Mark",
    categories: ["LGBTQ+"],
    summary: "Four couples in a wreath, holding the wordmark together.",
    heroCaption: "A brand mark for the London LGBTQ+ Community Centre, 2019.",
    brief: [
      "The London LGBTQ+ Community Centre needed a mark that put people, not just a symbol, at the centre of the identity — four couples drawn in a loose wreath around the wordmark.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Client", name: "London LGBTQ+ Community Centre" },
    ],
    // The card falls back to this purple hero now that the white colourway
    // (which used to lead the card specifically to sidestep this) is gone —
    // same nav-purple collision as Atlanta Magazine's card, same fix.
    navContrastLight: true,
    cardRatio: "1/1",
    // A small brand mark, not a full illustration — same "runs small"
    // treatment as Sumo and Downward Trend, rather than the usual
    // full-bleed hero scale.
    heroSize: "spot",
    hero: {
      ratio: "1/1",
      alt: "The brand mark, four couples in a wreath around the wordmark",
      src: "/work/london-lgbtq-centre/01-purple.webp",
    },
    gallery: [],
  },
];
