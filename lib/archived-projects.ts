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
  {
    slug: "bershka",
    title: "We Are Proud",
    client: "Bershka",
    // TRIAL: plain client label, title unchanged — see Project.cardTitle.
    cardLabel: "Bershka",
    year: 2018,
    discipline: "Illustration",
    deliverables: "1 Instagram Story animation",
    categories: ["LGBTQ+", "Motion"],
    summary: "A rainbow of dancers, animated for Bershka's Pride month Instagram Stories.",
    heroCaption: "A held frame from the animation, 2018.",
    brief: [
      "For Pride month 2018, Bershka commissioned a short Instagram Story animation — characters dancing across a rainbow as the words \"We Are Proud\" build up over the top.",
      "I drew the artwork; Bershka's in-house team animated it.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Animation", name: "Bershka" },
    ],
    // Per Josh: crop the /work card to 4/5 instead of the true 9/16 —
    // the project page itself still runs the full portrait frame below.
    cardRatio: "4/5",
    hero: {
      ratio: "9/16",
      alt: "We Are Proud animation, held frame",
      src: "/work/bershka/01-we-are-proud-hero.webp",
    },
    // No heroPair — the video is the only asset, so heroVideo's default
    // "top" position with no pair renders it alone; hero.src still supplies
    // the video poster, the /work card image and the OG image.
    heroVideo: {
      // Source has a real audio track, but Josh wants it playing ambiently
      // like the other silent hero clips rather than gated behind a click
      // — sound: false mutes it so ProjectVideo autoplays + loops it.
      src: "/work/bershka/02-we-are-proud.mp4",
      alt: "The We Are Proud animation",
      sound: false,
      ratio: "9/16",
    },
    gallery: [],
  },
];
