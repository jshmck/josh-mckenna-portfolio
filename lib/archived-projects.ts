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
  {
    slug: "coca-cola-moments",
    title: "Coca-Cola Moments",
    client: "Coca-Cola",
    // TRIAL: "Moments" is the deliverable series name, reads fine alone
    // — see Project.cardTitle.
    cardTitle: "Moments",
    year: 2022,
    discipline: "Illustration",
    deliverables: "5 Icons",
    categories: ["Icons"],
    summary: "Five everyday-moment icons for Coca-Cola.",
    heroCaption: "One of five \"everyday moments\" icons made for Coca-Cola, 2022.",
    // No visible captions on this one -- "Poolside" turned out to be a
    // wrong guess at what one of these actually shows, and rather than
    // fix the wording, Josh asked to just drop captions here entirely.
    // alt text stays for accessibility.
    hideHeroCaptions: true,
    brief: [
      "Commissioned via Momentum for Coca-Cola: a set of everyday moments.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Agency", name: "Momentum" },
      { role: "Client", name: "Coca-Cola" },
    ],
    // Every source image here is a true 1/1 square — pin the /work card to
    // match instead of leaving it to RATIO_CYCLE's alternation, which can
    // land it on 4/5 depending on array position (see the same fix on
    // monocle-spot-illo).
    cardRatio: "1/1",
    // Source files were only recovered at web resolution (1276x1276) --
    // capped to the same max-w-lg small path Instagram Sticker's Vogue
    // takeover uses, sitewide, rather than let them run full-frame and
    // betray it. "Low-res so make them all smaller," per Josh.
    hero: {
      ratio: "1/1",
      alt: "The bottle",
      src: "/work/coca-cola-moments/02-02.webp",
      small: true,
    },
    gallery: [
      {
        ratio: "1/1",
        alt: "A hot dog and a Coca-Cola Zero Sugar, on a napkin",
        src: "/work/coca-cola-moments/01-01.webp",
        small: true,
        caption: false,
      },
      {
        ratio: "1/1",
        alt: "Mid-sip",
        src: "/work/coca-cola-moments/03-03.webp",
        small: true,
        caption: false,
      },
      {
        ratio: "1/1",
        alt: "A sunny afternoon",
        src: "/work/coca-cola-moments/04-04.webp",
        small: true,
        caption: false,
      },
      {
        ratio: "1/1",
        alt: "Pizza night",
        src: "/work/coca-cola-moments/05-05.webp",
        small: true,
        caption: false,
      },
    ],
  },
];
