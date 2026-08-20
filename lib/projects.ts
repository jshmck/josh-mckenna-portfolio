/**
 * Project content layer.
 *
 * This is deliberately a plain typed array rather than a CMS. It keeps the
 * whole site statically renderable and lets Josh add a piece by copying an
 * object. When the list outgrows a single file, swap the module for a CMS
 * client and keep these exported function signatures — every page consumes
 * projects through the helpers at the bottom, never the array directly.
 */

export const PROJECT_CATEGORIES = [
  "Character",
  "Pride",
  "Editorial",
  "Mural",
  "Automotive",
  "3D",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

/** Aspect ratios available to gallery images, keyed to CSS aspect-ratio. */
export type ImageRatio = "1/1" | "2/3" | "4/5" | "3/4" | "4/3" | "5/4" | "16/10";

export type ProjectImage = {
  ratio: ImageRatio;
  /** Describes the artwork for screen readers and as the visible caption. */
  alt: string;
  /** Real artwork path under /public once Josh delivers files. */
  src?: string;
};

export type Credit = {
  role: string;
  name: string;
};

export type Project = {
  slug: string;
  title: string;
  client: string;
  year: number;
  discipline: string;
  deliverables: string;
  category: ProjectCategory;
  /** One line under the card title in grids. */
  summary: string;
  /** Caption printed under the hero image. */
  heroCaption: string;
  /** "The brief, in Josh's words." — one paragraph per entry. */
  brief: string[];
  credits: Credit[];
  hero: ProjectImage;
  /**
   * Trial: overrides the /work and home-embedded gallery card's lead image
   * when it should differ from `hero` (the big image atop the project's own
   * page) — la-pride only for now, see WorkGallery. Falls back to `hero`
   * when absent.
   */
  cardImage?: ProjectImage;
  /** Paired with `cardImage` — crossfades in over it on card hover/focus. */
  cardHoverImage?: ProjectImage;
  /** Gallery below the write-up. First two render as a two-up row. */
  gallery: ProjectImage[];
  /** Surfaced in the homepage "Selected work" band. */
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "la-pride",
    title: "L.A. Pride",
    client: "City of Los Angeles",
    year: 2024,
    discipline: "Festival Identity",
    deliverables: "Key Art · Stage · Wayfinding · Merch",
    category: "Pride",
    summary: "An L and an A, built out of people, stretched across a park.",
    heroCaption:
      "The main stage. The key art runs the full width of the header and repeats on both side panels.",
    brief: [
      "A festival identity has to survive every size there is — a stage header read from the back of a field, a wayfinding totem read at walking pace, and a badge on the front of a cap. I drew the L and the A as characters first and worked out afterwards whether they'd still hold together at 4cm.",
      "Everything is flat colour and a single line weight, because the same drawing had to go onto vinyl, through a screen print, and up on a wall as a paste-up without reading as three different jobs. James Junk and I split the character work.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Co-illustration", name: "James Junk" },
    ],
    hero: {
      ratio: "16/10",
      alt: "The LA Pride 2024 main stage, key art across the header and both side panels",
      src: "/work/la-pride/01-main-stage.webp",
    },
    cardImage: {
      ratio: "1/1",
      alt: "The key art lockup",
      src: "/work/la-pride/04-key-art-lockup.webp",
    },
    cardHoverImage: {
      ratio: "2/3",
      alt: "Billboard — Hollywood Blvd, Sunday June 9",
      src: "/work/la-pride/09-lamp-post-banner.webp",
    },
    /**
     * Not-landscape first, because the template pairs the first two into a
     * two-up row and runs everything after them full width. A 2/3 portrait
     * at 1344px wide is almost entirely wall — the key art lockup stays at
     * its true 1/1 rather than a cropped portrait ratio, since this export
     * runs edge-to-edge and a 4/5 crop clips "PRIDE" and "2024" at the sides.
     */
    gallery: [
      {
        ratio: "2/3",
        alt: "Flyposted lineup sheet and site map",
        src: "/work/la-pride/07-flyposted-lineup.webp",
      },
      {
        ratio: "1/1",
        alt: "The key art lockup",
        src: "/work/la-pride/04-key-art-lockup.webp",
      },
      {
        ratio: "16/10",
        alt: "Wayfinding totem — main stage and food village",
        src: "/work/la-pride/05-wayfinding-totem.webp",
      },
      {
        ratio: "16/10",
        alt: "Merch — hoodie, tee and cap",
        src: "/work/la-pride/06-merch-rail.webp",
      },
      {
        ratio: "16/10",
        alt: "Vehicle wrap — the box truck",
        src: "/work/la-pride/08-truck-wrap.webp",
      },
    ],
    featured: true,
  },
  {
    slug: "night-bus",
    title: "Night Bus",
    client: "Personal",
    year: 2025,
    discipline: "Character Series",
    deliverables: "12 Drawings",
    category: "Character",
    summary: "Twelve people who all missed the last train.",
    heroCaption:
      "Drawn from memory on the top deck of the N29 over about four months.",
    brief: [
      "A personal series with no client and no brief. Every drawing started as a sketch made on an actual night bus, then got redrawn properly the next morning while I could still remember the posture.",
      "It became the work that got me the most commissions, which I think says something about briefs.",
    ],
    credits: [{ role: "Everything", name: "Josh McKenna" }],
    hero: { ratio: "16/10", alt: "Night Bus series, installed as a grid" },
    gallery: [
      { ratio: "3/4", alt: "Night Bus — the sleeper" },
      { ratio: "3/4", alt: "Night Bus — the arguer" },
      { ratio: "16/10", alt: "The full twelve, hung at Peckham Levels" },
    ],
    featured: true,
  },
  {
    slug: "brixton-wall",
    title: "Brixton Wall",
    client: "Brixton Village",
    year: 2025,
    discipline: "Mural",
    deliverables: "1 Mural · 14m × 4m",
    category: "Mural",
    summary: "Fourteen metres of characters queueing for a bus that never comes.",
    heroCaption: "Photographed the morning after the last coat went on.",
    brief: [
      "The wall runs alongside a bus stop, so the composition had to work for someone standing still for eight minutes and for someone walking past in four seconds. I built it as a queue — one continuous line of characters that reads left to right at walking pace.",
      "Painted over nine days with two assistants. The line work is brush, the flats are roller.",
    ],
    credits: [
      { role: "Commissioned by", name: "Brixton Village" },
      { role: "Assistants", name: "Nia Ford · Tom Baptiste" },
      { role: "Photography", name: "Sam Ellery" },
    ],
    hero: { ratio: "16/10", alt: "The completed Brixton mural" },
    gallery: [
      { ratio: "4/5", alt: "Detail — the queue's front" },
      { ratio: "4/5", alt: "Detail — the queue's back" },
      { ratio: "16/10", alt: "The wall in use, mid-afternoon" },
    ],
  },
  {
    slug: "the-long-weekend",
    title: "The Long Weekend",
    client: "The Guardian Weekend",
    year: 2025,
    discipline: "Editorial Illustration",
    deliverables: "1 Cover · 4 Spots",
    category: "Editorial",
    summary: "A feature about doing nothing, illustrated enthusiastically.",
    heroCaption: "The cover, as it ran on 14 June.",
    brief: [
      "A 3,000-word feature about the collapse of the weekend. The commission came in on a Thursday for the following Wednesday, which felt like a joke the desk was making on purpose.",
      "One cover, four spots, drawn in two days. The looseness is not a style choice.",
    ],
    credits: [
      { role: "Art direction", name: "Priya Raman" },
      { role: "Words", name: "Alex Whitmore" },
    ],
    hero: { ratio: "16/10", alt: "The Long Weekend cover illustration" },
    gallery: [
      { ratio: "1/1", alt: "Spot — Saturday" },
      { ratio: "1/1", alt: "Spot — Sunday, 4pm" },
    ],
  },
  {
    slug: "gus-and-mabel",
    title: "Gus & Mabel",
    client: "Walker Books",
    year: 2024,
    discipline: "Character Design",
    deliverables: "2 Leads · 9 Supporting · Style Guide",
    category: "Character",
    summary: "Two dogs with a clear and escalating disagreement.",
    heroCaption: "Final turnarounds for both leads.",
    brief: [
      "A picture book needed two leads that could hold a whole series. The publisher wanted them likeable; I wanted them to look like they'd genuinely annoy each other. We landed somewhere useful.",
      "Delivered with a style guide so other illustrators could draw them consistently across the series.",
    ],
    credits: [
      { role: "Art direction", name: "Elinor Hastie" },
      { role: "Words", name: "R. J. Mbeki" },
    ],
    hero: { ratio: "16/10", alt: "Gus and Mabel character turnarounds" },
    gallery: [
      { ratio: "3/4", alt: "Gus — expression sheet" },
      { ratio: "3/4", alt: "Mabel — expression sheet" },
      { ratio: "5/4", alt: "Style guide spread" },
    ],
  },
  {
    slug: "cereal-monsters",
    title: "Cereal Monsters",
    client: "Morningside",
    year: 2023,
    discipline: "Character Design",
    deliverables: "3 Mascots · 6 Box Panels",
    category: "Character",
    summary: "Three mascots that had to survive a focus group.",
    heroCaption: "The three approved mascots, plus the one that didn't make it.",
    brief: [
      "Cereal mascots are one of the last places a character has to work at both 4cm and 4m. These were drawn at box scale first and tested small, which is the opposite of how I usually work.",
      "The fourth mascot tested badly with parents and brilliantly with children. It was cut.",
    ],
    credits: [
      { role: "Art direction", name: "Dee Halloran" },
      { role: "Printed by", name: "Morningside Pack" },
    ],
    hero: { ratio: "16/10", alt: "The Cereal Monsters mascot line-up" },
    gallery: [
      { ratio: "4/5", alt: "Front-of-box panel" },
      { ratio: "4/5", alt: "The rejected fourth mascot" },
    ],
  },
  {
    slug: "negotiable-tattoo",
    title: "One Negotiable Tattoo",
    client: "Personal",
    year: 2023,
    discipline: "Flash Sheet",
    deliverables: "24 Designs",
    category: "Character",
    summary: "A flash sheet drawn as a favour that got out of hand.",
    heroCaption: "The full sheet. Nine of these now exist on people.",
    brief: [
      "A friend asked for one tattoo design. I drew twenty-four and put them on a sheet, on the condition that anyone using one had to send me a photo afterwards.",
      "Nine photos so far. The healing ones are the best ones.",
    ],
    credits: [{ role: "Everything", name: "Josh McKenna" }],
    hero: { ratio: "16/10", alt: "The complete flash sheet" },
    gallery: [
      { ratio: "1/1", alt: "Row one, detail" },
      { ratio: "1/1", alt: "A healed piece, six months on" },
    ],
  },
  {
    slug: "personal-fleet",
    title: "The Personal Fleet",
    client: "Personal",
    year: 2025,
    discipline: "Automotive Illustration",
    deliverables: "Ongoing series",
    category: "Automotive",
    summary: "Cars he was never asked to draw, drawn anyway.",
    heroCaption: "Photo placeholder — swap in the real image once Josh sends it over.",
    brief: [
      "Placeholder write-up — swap in the real caption once Josh sends it over.",
    ],
    credits: [{ role: "Everything", name: "Josh McKenna" }],
    hero: { ratio: "16/10", alt: "Photo placeholder — The Personal Fleet" },
    gallery: [
      { ratio: "4/5", alt: "Photo placeholder — The Personal Fleet, piece 2" },
      { ratio: "4/5", alt: "Photo placeholder — The Personal Fleet, piece 3" },
    ],
  },
];

/* ==========================================================================
   Access helpers — pages should use these, never `projects` directly.
   ========================================================================== */

/** Newest first. */
export function getAllProjects(): Project[] {
  return [...projects].sort((a, b) => b.year - a.year);
}

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getFeaturedProjects(limit = 3): Project[] {
  return getAllProjects()
    .filter((project) => project.featured)
    .slice(0, limit);
}

/**
 * Previous / next for the project footer, wrapping at both ends so the
 * sequence never dead-ends.
 */
export function getProjectNeighbours(slug: string): {
  previous: Project | null;
  next: Project | null;
} {
  const ordered = getAllProjects();
  const index = ordered.findIndex((project) => project.slug === slug);

  if (index === -1) return { previous: null, next: null };

  return {
    previous: ordered[(index - 1 + ordered.length) % ordered.length] ?? null,
    next: ordered[(index + 1) % ordered.length] ?? null,
  };
}

/** Only the categories that actually have work in them. */
export function getActiveCategories(): ProjectCategory[] {
  const used = new Set(projects.map((project) => project.category));
  return PROJECT_CATEGORIES.filter((category) => used.has(category));
}
