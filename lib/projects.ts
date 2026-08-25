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
  "Hospitality",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

/** Aspect ratios available to gallery images, keyed to CSS aspect-ratio. */
export type ImageRatio =
  | "1/1"
  | "2/3"
  | "4/5"
  | "3/4"
  | "4/3"
  | "5/4"
  | "3/2"
  | "16/10"
  // Beefbar Posters' true print ratios — none of the ratios above were close
  // enough to snap to without a visible crop or letterbox gap.
  | "12/17"
  | "15/22";

export type ProjectImage = {
  ratio: ImageRatio;
  /** Describes the artwork for screen readers and as the visible caption. */
  alt: string;
  /** Real artwork path under /public once Josh delivers files. */
  src?: string;
  /**
   * `cover` (default) fills the frame, cropping overflow — right for
   * photography. `contain` shows the whole image with no crop, for flat
   * lockups/logos whose edges are the content — Plate pairs it with a
   * canvas-matched surface instead of the placeholder tone, since the
   * letterbox gap would otherwise show as a jarring placeholder-blue bar
   * behind real artwork.
   */
  fit?: "cover" | "contain";
};

export type Credit = {
  role: string;
  name: string;
};

export type Project = {
  slug: string;
  title: string;
  client: string;
  /** Stays numeric even for an ongoing project — getAllProjects() sorts on
   *  this. Use `yearLabel` to override what actually prints. */
  year: number;
  /** Overrides the printed year, e.g. an ongoing series — "2017–Present".
   *  Falls back to `year` when absent. */
  yearLabel?: string;
  discipline: string;
  deliverables: string;
  /** A project can sit under more than one filter pill on /work. */
  categories: ProjectCategory[];
  /** One line under the card title in grids. */
  summary: string;
  /** Caption printed under the hero image. */
  heroCaption: string;
  /** "The brief, in Josh's words." — one paragraph per entry. */
  brief: string[];
  credits: Credit[];
  hero: ProjectImage;
  /**
   * Trial: a second image shown side-by-side with `hero` instead of the
   * usual single full-width Plate — sound-of-driving only for now. Own
   * caption from its own `alt`, same as the later gallery two-up.
   */
  heroPair?: ProjectImage;
  /**
   * Trial: overrides the /work and home-embedded gallery card's lead image
   * when it should differ from `hero` (the big image atop the project's own
   * page) — la-pride only for now, see WorkGallery. Falls back to `hero`
   * when absent.
   */
  cardImage?: ProjectImage;
  /**
   * Overrides the /work and home-embedded gallery card's frame ratio —
   * WorkGallery otherwise cycles a fixed sequence per card position for the
   * masonry rhythm, regardless of the image's own shape, which is fine for
   * most artwork but forces a real fixed format (Beefbar's posters) into
   * whatever ratio its position happens to land on.
   */
  cardRatio?: ImageRatio;
  /**
   * Crossfades in over the card's lead image on hover/focus. Set this to
   * curate the pick (e.g. la-pride); otherwise `getCardHoverImage` below
   * picks `heroPair` or the first gallery image automatically, so every
   * project with a second image gets the swap for free.
   */
  cardHoverImage?: ProjectImage;
  /**
   * Trial: small decorative pieces that lean toward the cursor next to the
   * title, same treatment as the /work page's top illustration row — la-pride
   * only for now. Purely decorative (no alt), so keep this to flat character
   * art that reads fine without a caption, not anything load-bearing.
   */
  headerIllustrations?: { src: string; aspect: string }[];
  /**
   * Trial: small decorative pieces stacked under the sticky credits
   * sidebar, top to bottom — la-pride only for now. Unlike
   * `headerIllustrations`, these lean toward the cursor on hover
   * (TiltIllustration), matching the /work page's top row rather than the
   * static header treatment.
   */
  creditsIllustrations?: { src: string; aspect: string }[];
  /** Gallery below the write-up. First two render as a two-up row, unless
   *  `galleryLayout` says otherwise. */
  gallery: ProjectImage[];
  /**
   * `"grid"` renders the whole `gallery` as a uniform, clickable two-column
   * grid (each image opens full-size in a lightbox) instead of the default
   * two-up-then-single-column stack — la-pride only for now, closer to how
   * James Junk's own project page presents the same shoot.
   *
   * `"poster-grid"` goes further: skips the usual full-bleed hero too and
   * opens straight into a four-column grid of every image (hero + gallery
   * combined) — for a series where every piece shares a similar ratio and a
   * single full-width hero would run too tall to see on landing. Beefbar
   * Posters only for now.
   */
  galleryLayout?: "grid" | "poster-grid";
  /** Surfaced in the homepage "Selected work" band. */
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "beefbar-posters",
    title: "Beefbar",
    client: "Beefbar",
    year: 2017,
    yearLabel: "2017–Present Day",
    discipline: "Illustration",
    deliverables: "Illustrated Poster & Menu Design",
    categories: ["Hospitality", "Character"],
    summary: "One new poster, every time Beefbar opens somewhere new. Still counting.",
    heroCaption: "The Baku opening poster — part of Beefbar's ongoing series.",
    brief: [
      "With every new opening of a Beefbar restaurant around the world comes a new poster, designed by me, taking influence from the surrounding landmarks, cityscape, culture and heritage — Baku's Flame Towers and waterfront, Comporta's dunes, whatever the city actually gives you to draw. The same artwork doubles as the cover of the menu. Not every poster's made the cut here — this is a selection, not the full series.",
      "The 'beefbar' script and the city's own name across the sheet stay fixed. Everything else comes from wherever the restaurant's landed — Comporta's just a dune path, Malta's set inside the dining room.",
    ],
    credits: [{ role: "Graphic Design & Illustration", name: "Josh McKenna" }],
    galleryLayout: "poster-grid",
    cardRatio: "12/17",
    // The /work card's round-corner clip cuts across whichever poster's own
    // printed border is showing — Luxembourg's reads better there than
    // Baku's (the hero, used everywhere else) did.
    cardImage: {
      ratio: "12/17",
      alt: "Luxembourg",
      src: "/work/beefbar-posters/05-luxembourg.webp",
    },
    hero: {
      ratio: "12/17",
      alt: "Baku",
      src: "/work/beefbar-posters/01-baku-02.webp",
    },
    // Each poster's own printed border is part of the artwork, kept
    // visible — the grid runs square corners (see PosterGrid) instead of
    // cropping it out. Ordered chronologically, per Josh.
    gallery: [
      {
        ratio: "12/17",
        alt: "Belgrade",
        src: "/work/beefbar-posters/03-belgrade-web.webp",
      },
      {
        ratio: "12/17",
        alt: "Comporta",
        src: "/work/beefbar-posters/04-comporta-4.webp",
      },
      {
        ratio: "12/17",
        alt: "Marrakech",
        src: "/work/beefbar-posters/06-marrakech.webp",
      },
      {
        ratio: "12/17",
        alt: "Luxembourg",
        src: "/work/beefbar-posters/05-luxembourg.webp",
      },
      {
        ratio: "15/22",
        alt: "Malta",
        src: "/work/beefbar-posters/01-malta-city-hr.webp",
      },
      {
        ratio: "15/22",
        alt: "St Tropez",
        src: "/work/beefbar-posters/02-beefbar-st-tropez.webp",
      },
      {
        ratio: "15/22",
        alt: "Esencia",
        src: "/work/beefbar-posters/03-esencia.webp",
      },
      {
        ratio: "12/17",
        alt: "Santorini",
        src: "/work/beefbar-posters/11-santorini.webp",
      },
      {
        ratio: "12/17",
        alt: "New York",
        src: "/work/beefbar-posters/09-new-york.webp",
      },
      {
        ratio: "12/17",
        alt: "Kuwait",
        src: "/work/beefbar-posters/04-kuwait.webp",
      },
      {
        ratio: "12/17",
        alt: "Méribel",
        src: "/work/beefbar-posters/07-meribel.webp",
      },
      {
        ratio: "12/17",
        alt: "Dubai",
        src: "/work/beefbar-posters/01-dubai.webp",
      },
      {
        ratio: "12/17",
        alt: "Edinburgh",
        src: "/work/beefbar-posters/02-edinburgh.webp",
      },
      {
        ratio: "12/17",
        alt: "Paris",
        src: "/work/beefbar-posters/10-paris.webp",
      },
      {
        ratio: "12/17",
        alt: "Monaco",
        src: "/work/beefbar-posters/08-monaco.webp",
      },
    ],
  },
  {
    slug: "la-pride",
    title: "L.A. Pride",
    client: "City of Los Angeles",
    year: 2024,
    discipline: "Festival Identity",
    deliverables: "Branding · Banners · Wayfinding · Wristbands · Merch",
    categories: ["Pride"],
    summary: "An L and an A, built out of people, stretched across a park.",
    heroCaption: "",
    brief: [
      "LA Pride's been running since 1970, and by 2024 the bill included Ricky Martin, Muna and Jojo Siwa. James Junk and I got the call to rebuild the whole visual identity — branding, wayfinding, every banner on site, the lounges, the wristbands, the merch. Vintage Olympic typography and old campaign posters were the starting point; from there we built the letters themselves out of people, stacking characters into the L and the A. It had to hold up at every scale there is — stage-header-sized and cap-badge-sized, same drawing.",
      "James handled the type, I drew the characters. Fifty years is a long time to be handed the keys to. Scroll on, you'll see what we did with them.",
    ],
    credits: [
      {
        role: "Creative Direction, Illustration & Graphic Design",
        name: "Josh McKenna",
      },
      { role: "Graphic Design, Co-Designer", name: "James Junk" },
      {
        role: "Photography",
        name: "Wes and Alex, Ashley Osborn, Polk Imaging, Dana Pleasant, Amy Hanoa",
      },
      { role: "Production", name: "NVE Experience Agency" },
      { role: "Client", name: "LA Pride / Christopher Street West Association" },
    ],
    hero: {
      // True ratio (1.5), not the site's usual 16/10 hero — close enough
      // that forcing 16/10 isn't necessary and 3/2 crops nothing.
      ratio: "3/2",
      alt: "The main stage entrance, key art across the header",
      src: "/work/la-pride/23-key-art-stage-banner.webp",
    },
    // The /work card leads with the logo mark itself, not a photo — the
    // project page's own hero (above) is the photo.
    cardImage: {
      ratio: "1/1",
      fit: "contain",
      alt: "The key art lockup",
      src: "/work/la-pride/04-key-art-lockup.webp",
    },
    cardHoverImage: {
      ratio: "2/3",
      alt: "Billboard — Hollywood Blvd, Sunday June 9",
      src: "/work/la-pride/09-lamp-post-banner.webp",
    },
    headerIllustrations: [
      { src: "/work/la-pride/lol-shield.webp", aspect: "2160/1500" },
      { src: "/work/la-pride/license-plate.webp", aspect: "2160/1500" },
    ],
    /**
     * Not-landscape first, because the template pairs the first two into a
     * two-up row and runs everything after them full width. A 2/3 portrait
     * at 1344px wide is almost entirely wall. `ratio` is a curatorial crop,
     * not the source's native aspect — the VIP entrance shot is landscape
     * but declared 2/3 here so it pairs at the flyposted lineup's height.
     */
    gallery: [
      {
        ratio: "2/3",
        alt: "Flyposted lineup sheet and site map",
        src: "/work/la-pride/07-flyposted-lineup.webp",
      },
      {
        ratio: "2/3",
        fit: "contain",
        alt: "The key art lockup",
        src: "/work/la-pride/04-key-art-lockup.webp",
      },
      {
        ratio: "16/10",
        alt: "VIP entrance",
        src: "/work/la-pride/17-vip-entrance.webp",
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
        alt: "Wristbands — VIP and general admission",
        src: "/work/la-pride/10-wristbands.webp",
      },
      {
        ratio: "16/10",
        alt: "Vehicle wrap — the box truck",
        src: "/work/la-pride/08-truck-wrap.webp",
      },
      {
        ratio: "16/10",
        alt: "The Trans Lounge signage",
        src: "/work/la-pride/13-trans-lounge.webp",
      },
      {
        ratio: "16/10",
        alt: "Jojo Siwa, backstage in an LA Pride lanyard",
        src: "/work/la-pride/22-jojo-siwa-backstage.webp",
      },
      {
        ratio: "16/10",
        alt: "The main stage screen, running archival Pride footage",
        src: "/work/la-pride/16-main-stage-screen.webp",
      },
      {
        ratio: "16/10",
        alt: "The main stage by day",
        src: "/work/la-pride/19-main-stage-day.webp",
      },
      {
        ratio: "16/10",
        alt: "The key art, over the merch tent",
        src: "/work/la-pride/24-key-art-merch-tent.webp",
      },
      {
        ratio: "16/10",
        alt: "Wayfinding totem, another angle",
        src: "/work/la-pride/18-totem-angle.webp",
      },
      {
        ratio: "16/10",
        alt: "The main stage at night, before the crowd arrived",
        src: "/work/la-pride/21-night-stage.webp",
      },
    ],
    galleryLayout: "grid",
    featured: true,
  },
  {
    slug: "night-bus",
    title: "Night Bus",
    client: "Personal",
    year: 2025,
    discipline: "Character Series",
    deliverables: "12 Drawings",
    categories: ["Character"],
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
    categories: ["Mural"],
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
    categories: ["Editorial"],
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
    categories: ["Character"],
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
    categories: ["Character"],
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
    categories: ["Character"],
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
    slug: "sound-of-driving",
    title: "The Sound of Driving",
    client: "Personal",
    year: 2026,
    discipline: "Editorial Illustration",
    deliverables: "Key Art · Magazine Mockup",
    categories: ["Automotive", "Editorial"],
    summary: "A hot-pink electric sports car makes the case for keeping the noise.",
    heroCaption: "The finished key art.",
    brief: [
      "An editorial about the debate between rumbling exhaust notes and the futuristic hum of instant torque.",
    ],
    credits: [{ role: "Illustration", name: "Josh McKenna" }],
    hero: {
      ratio: "4/5",
      alt: "\"Have EVs Killed the Sound of Driving?\" — the finished key art",
      src: "/work/sound-of-driving/03-final.webp",
    },
    heroPair: {
      ratio: "4/5",
      alt: "Mocked up as a magazine spread",
      src: "/work/sound-of-driving/04-mag-03.webp",
    },
    gallery: [],
    featured: true,
  },
  {
    slug: "bombay-sapphire",
    title: "Stir Creativity",
    client: "Bombay Sapphire",
    year: 2018,
    discipline: "Illustration",
    deliverables: "Mural · Embroidered Jacket · Hand-Painted Bottles",
    categories: ["Mural"],
    summary:
      "A gin campaign in three parts: a live-painted mural, an embroidered jacket, and fifty hand-finished bottles.",
    heroCaption: "The mural, live in Bombay Sapphire's Shoreditch pop-up.",
    brief: [
      "Bombay Sapphire's CANVAS was a four-day pop-up in Shoreditch built around one line: Stir Creativity. I was one of fifteen artists asked to contribute, working across three pieces instead of one — a mural painted live in the window, a back-of-jacket embroidery, and fifty hand-finished bottles.",
      "The starting point was a Grains of Paradise pod from a trip to the distillery — earthy for the first few seconds, then this fiery burst. I wanted the work to feel the same way, harvesty and celebratory at once, so the mural and the jacket both lean on the same botanical shapes and hot orange-on-blue palette.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Embroidery", name: "Lisa" },
      { role: "Photography", name: "Rankin" },
    ],
    hero: {
      ratio: "3/2",
      alt: "The mural in Bombay Sapphire's Shoreditch CANVAS pop-up, #StirCreativity in the window",
      src: "/work/bombay-sapphire/01-storefront.webp",
    },
    gallery: [
      {
        ratio: "4/3",
        alt: "The finished jacket back",
        src: "/work/bombay-sapphire/03-jacket-flatlay.webp",
      },
      {
        ratio: "4/3",
        alt: "Embroidering the design by hand",
        src: "/work/bombay-sapphire/04-embroidery-macro.webp",
      },
      {
        ratio: "5/4",
        alt: "Sketching the design on iPad before it went to embroidery",
        src: "/work/bombay-sapphire/05-ipad-sketch.webp",
      },
      {
        ratio: "3/2",
        alt: "Painting the mural live in the window",
        src: "/work/bombay-sapphire/02-mural-painting.webp",
      },
      {
        ratio: "4/3",
        alt: "Fifty hand-finished bottles, ready to go",
        src: "/work/bombay-sapphire/07-bottles-wide.webp",
      },
      {
        ratio: "4/3",
        alt: "Bottle detail — botanicals from the Grains of Paradise",
        src: "/work/bombay-sapphire/08-bottles-macro.webp",
      },
    ],
  },
  {
    slug: "wagamama-brighton",
    title: "Wagamama Brighton",
    client: "Wagamama",
    year: 2023,
    discipline: "Window Display",
    deliverables: "Illustrated Window Display",
    categories: ["Pride", "Character", "Hospitality"],
    summary: "Eight characters celebrating Pride, wrapped across a restaurant window.",
    heroCaption: "The full artwork, designed for Wagamama's Brighton window.",
    brief: [
      "A Pride window display for Wagamama's Brighton restaurant, celebrating the city's diverse and inclusive spirit. Eight characters — a rainbow fan, a raised fist, a trans flag, a wheelchair — spread across the glass as a joyful tribute to the LGBTQIA+ community. It's stayed up as a permanent feature of the restaurant's window ever since.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Client", name: "Wagamama" },
    ],
    hero: {
      ratio: "16/10",
      alt: "The full Wagamama Brighton Pride artwork",
      src: "/work/wagamama-brighton/02-full-artwork.webp",
    },
    gallery: [
      {
        ratio: "1/1",
        alt: "The finished window, installed at Wagamama Brighton",
        src: "/work/wagamama-brighton/01-window-install.webp",
      },
      {
        ratio: "1/1",
        alt: "Detail — the rainbow fan",
        src: "/work/wagamama-brighton/03-detail-purple-top.webp",
      },
      {
        ratio: "1/1",
        alt: "Detail — the wide-brim hat",
        src: "/work/wagamama-brighton/04-detail-pink-hat.webp",
      },
      {
        ratio: "1/1",
        alt: "Detail — the trans flag",
        src: "/work/wagamama-brighton/05-detail-wheelchair.webp",
      },
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
  const used = new Set(projects.flatMap((project) => project.categories));
  return PROJECT_CATEGORIES.filter((category) => used.has(category));
}

/**
 * The gallery card's hover image. An explicit `cardHoverImage` (la-pride)
 * wins; otherwise picks the first other real image belonging to the same
 * project — `heroPair`, then the gallery — so hovering swaps in something
 * different wherever a project actually has a second image available.
 */
export function getCardHoverImage(project: Project): ProjectImage | undefined {
  if (project.cardHoverImage) return project.cardHoverImage;

  const lead = project.cardImage ?? project.hero;
  const candidates = [project.heroPair, ...project.gallery];

  return candidates.find(
    (image): image is ProjectImage => Boolean(image?.src) && image?.src !== lead.src,
  );
}
