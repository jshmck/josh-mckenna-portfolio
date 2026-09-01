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
  "Icons",
  "Logo",
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
  | "15/22"
  // Voxi Pride's "Endless Love" banner crop — a 3.37:1 panorama with every
  // character lined up in frame; snapping it to 16/10 would crop out most
  // of the width. True output ratio, zero drift.
  | "2400/713"
  // Womp 3D Exploration's leaping-girl render — a full diagonal reach with
  // the trailing hand already close to the frame edge; the nearest stock
  // ratio (4/5) would clip the fingers. True 1920x2160 output ratio.
  | "8/9"
  // Instagram Sticker's Venice Beach photo — a standard phone-portrait
  // shot (1134x2016, true 9:16). Nearest existing ratio (3/4) would have
  // cropped 28.7%, risking the figure's raised arm at the top of frame.
  | "9/16"
  // Instagram Sticker's Sticker Set photo — true 16:9, no existing ratio
  // came within 10% without a visible side crop.
  | "16/9"
  // Instagram Sticker's Vogue takeover screenshot — a two-panel Instagram
  // Stories composite, true 1496x1334. Nearest existing ratio (5/4) cropped
  // "SOUND ON" and other edge detail; this is a near-exact match instead.
  | "9/8"
  // Mr Porter Invites' new day/night artwork — true 1414x2000 (a near-exact
  // 1/√2, ISO-paper proportions). Nearest existing ratio (3/4) cropped
  // noticeably.
  | "707/1000"
  // Away's suitcase mockup reshoot — true 2000x2328 (reduced 250/291).
  // Nearest existing ratio (4/5) would have cropped 7%.
  | "250/291"
  // WSJ AirPods article screenshot — true 1376x2184 (reduced 172/273).
  // Nearest existing ratio (3/4) would have cropped the masthead or the
  // body copy.
  | "172/273";

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
  /**
   * Set to `false` to skip the visible caption ImageStack prints under a
   * gallery image, while keeping `alt` for accessibility — trial, wired
   * up in ImageStack's row-grouped images only so far (Instagram
   * Sticker's LA row: Venice Beach keeps its caption, the two supporting
   * shots either side don't need to repeat "part of the same LA series").
   * Defaults to true.
   */
  caption?: boolean;
  /**
   * Caps a standalone gallery image to the same max-w-lg (512px) width
   * ImageStack already gives portrait pieces, regardless of this image's
   * own orientation. Wired up for a low-resolution 2017 screenshot
   * (Instagram Sticker's Vogue takeover) that read too large and betrayed
   * its source quality at the gallery's normal full-frame width — "make
   * it smaller on the page," per Josh, "and still retain the grid rules"
   * (no one-off layout, just the existing small-image path).
   */
  small?: boolean;
  /**
   * Square corners instead of the sitewide rounded frame, for artwork
   * that already has its own border treatment baked in — same reasoning
   * as poster-grid's square corners for Beefbar. Read per-image in
   * HeroLightbox, so `hero` and `heroPair` need it set on both to read as
   * a matched pair rather than one square, one rounded. Wired up for Mr
   * Porter Invites so far, per Josh: "remove the curved frame radius for
   * these (like beefbar)."
   */
  square?: boolean;
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
   * A clip in the hero slot — `hero` still carries a still image
   * alongside it (used for the /work card, and as the video's poster
   * frame when `poster` isn't set). Silent clips (default, Jimny)
   * autoplay muted on loop; `sound: true` (Nomad Wheels) switches to
   * native controls and no autoplay instead. `position` decides where
   * it sits relative to `heroPair`/`hero` when both are present —
   * `"top"` (default, Nomad Wheels: the film is the main showcase) or
   * `"bottom"` (Pato: the two renders are the artwork, the clip is
   * supplementary). With no `heroPair` and no `hero` on the page
   * (Jimny), position is moot — the video is the whole hero slot.
   * `poster` overrides the thumbnail shown before playback — Nomad
   * Wheels uses an actual frame from the film itself rather than
   * `hero`'s illustration, since the two are different kinds of image.
   * See components/work/project-video.tsx for the prefers-reduced-
   * motion guard.
   */
  heroVideo?: {
    src: string;
    alt: string;
    sound?: boolean;
    poster?: string;
    /** "pair" renders the video inside the heroPair two-up, alongside
     *  `hero`, instead of full-width above or below it. "outro" moves it
     *  out of the hero block entirely, rendering it after the write-up
     *  instead — Jimny only for now, where the three renders lead the page
     *  (via hero/heroPair/heroThird) and the turnaround clip reads as a
     *  closer rather than the opener. */
    position?: "top" | "bottom" | "pair" | "outro";
    /** Defaults to 16/9. Set when the clip isn't landscape. */
    ratio?: ImageRatio;
  };
  /**
   * A second image shown side-by-side with `hero` instead of the usual
   * single full-width Plate — sound-of-driving, the Womp pairs and BMW Z1.
   * Own caption from its own `alt`, same as the later gallery two-up,
   * unless `hideHeroCaptions` turns it off.
   */
  heroPair?: ProjectImage;
  /**
   * A third image alongside `hero`/`heroPair`, all three side by side —
   * Costa Smeralda's three posters, none of them a "pair" plus an
   * afterthought. Requires `heroPair` to also be set; HeroLightbox ignores
   * a lone `heroThird` without it. Own caption from its own `alt`, same as
   * `heroPair`.
   */
  heroThird?: ProjectImage;
  /**
   * Multiple video clips shown small, side by side — Tilda Rice's three
   * packaging animations, which Josh wanted included (a real deliverable)
   * but not blown up full-width the way a single heroVideo runs. Distinct
   * from `heroVideo` (one clip, full-size) and `galleryVideo` (one clip
   * inserted mid-gallery) — neither supports more than one clip. Renders
   * at the very top of the page, above `hero` (unlike `hero`, which it sits
   * above even when `heroHiddenOnPage` keeps `hero` out of the page body
   * entirely). All same silent-autoplay / reduced-motion handling as
   * ProjectVideo elsewhere.
   */
  videoRow?: { src: string; alt: string; poster?: string; sound?: boolean }[];
  /**
   * Keeps `hero` out of its usual top-of-page slot entirely — `hero` is
   * still required (it's the /work card thumbnail and the OG image) but
   * isn't repeated in the page body. Tilda Rice only for now: Josh wanted
   * the three product photos to read together as one group, after the
   * write-up, rather than one of them singled out above the videos.
   */
  heroHiddenOnPage?: boolean;
  /**
   * Suppresses the caption paragraph(s) under `hero`/`heroPair` — BMW Z1
   * only for now, where the alt text ("BMW Z1") added nothing the title
   * above it didn't already say.
   */
  hideHeroCaptions?: boolean;
  /**
   * Runs the hero below `WriteUp` instead of above it, capped at a
   * narrow, centred width (max-w-lg) with no caption, instead of the
   * usual full-bleed 1344px leading the page. Originally for a piece
   * drawn to run small (Monocle's magazine spot illustration); now the
   * default for any true single-image project (a handful of the Womp
   * 3D and Figma Draw pieces) — a lone image still reads oversized at
   * full-bleed with nothing else on the page to balance it against.
   */
  heroSize?: "spot";
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
  /**
   * Trial: a single decorative cut-out that bobs gently beside the
   * `heroSize: "spot"` hero — First 3D Character only for now, reusing the
   * same transparent PNG already drifting in the homepage hero. Purely
   * decorative (no alt), hidden below md since there's no room to float
   * anything beside a hero that's already full-width on mobile.
   */
  floatingObject?: { src: string; aspect: string };
  /**
   * Trial: a silent video inserted mid-gallery — Instagram Sticker's Mardi
   * Gras footage only for now. Doesn't join the lightbox's click-to-enlarge
   * cycle (ImageStack's `images` stays pure photos); rendered as its own
   * block in normal scroll flow, positioned by `afterIndex` (0 = before
   * every gallery image, 1 = after `gallery[0]`, etc — same indexing as
   * `gallery` itself, not `restImages`).
   */
  galleryVideo?: {
    src: string;
    alt: string;
    sound?: boolean;
    afterIndex: number;
  };
  /**
   * Trial: an animated GIF inserted mid-gallery — Instagram Sticker's
   * original sticker animation only for now. Next's image optimizer
   * freezes GIFs to their first frame, so this bypasses Plate and renders
   * via next/image's `unoptimized` mode instead, which serves the source
   * bytes as-is and keeps the animation. Same `afterIndex` indexing as
   * `galleryVideo`.
   */
  galleryGif?: {
    src: string;
    alt: string;
    ratio: ImageRatio;
    afterIndex: number;
  };
  /**
   * Groups `count` consecutive `gallery` images (starting at `startIndex`,
   * a plain index into `gallery` — not the "after N shown" counting
   * `galleryVideo`/`galleryGif` use) into one CSS grid row instead of
   * stacking them as full-width singles.
   *
   * Any entry at all — even one — also opts the whole gallery out of the
   * default "first two images pair into a two-up row" behaviour, since
   * that default only applies when `gallerySpans` is empty. `count: 1`
   * uses exactly that: it doesn't group anything (falls through to a
   * plain full-width single, not a half-empty grid), it just exists to
   * flip that switch — for a gallery that should run one image after
   * another, full width, in the order given.
   */
  gallerySpans?: { startIndex: number; count: number }[];
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
  /** `"poster-grid"` only: column count at the widest breakpoint. Defaults
   *  to 4 (Beefbar). Rooted Journal's ten same-size spot icons read as two
   *  clean rows of five rather than 4+4+2, so it opts into 5. */
  posterGridColumns?: 4 | 5;
  /** Surfaced in the homepage "Selected work" band. */
  featured?: boolean;
  /**
   * The artwork itself is close enough to `--color-accent` (the nav's
   * active-link colour) that the purple "Work" text nearly disappears when
   * the fixed nav scrolls directly over it — Atlanta Magazine's card
   * background is the first real case. Flags both the /work card
   * (project-card.tsx) and, since California Magazine's hero has the same
   * problem on its own project page, the project page's own hero wrapper
   * (app/work/[slug]/page.tsx) with a `data-nav-contrast="light"`
   * attribute; nav.tsx watches for that attribute intersecting its own
   * fixed position and swaps the active link to white only while it's in
   * view, everywhere else on the site keeps the normal purple (which reads
   * fine against cream, blue, pink — every other case checked so far).
   */
  navContrastLight?: boolean;
  /**
   * Sorts before every non-pinned project, lowest rank first —
   * Josh's own curated lead-in to /work, independent of year.
   * getAllProjects() otherwise sorts strictly by year descending, which
   * would sink a genuinely old piece (Beefbar and Pride Sticker both
   * predate 2018) to the bottom regardless of how much Josh wants it
   * visible. Ties (or the default, unset) fall back to the normal year
   * sort — every unpinned project keeps sorting exactly as before.
   */
  pinnedRank?: number;
};

export const projects: Project[] = [
  {
    slug: "palm-springs",
    title: "Palm Springs",
    client: "Personal",
    year: 2025,
    discipline: "Illustration",
    deliverables: "Key Art",
    categories: ["Automotive"],
    summary: "A carport doing its one job, in Palm Springs.",
    heroCaption: "",
    brief: [
      "No brief — just an excuse to draw a mid-century carport roofline against the San Jacinto mountains, with a two-tone convertible parked underneath.",
    ],
    credits: [{ role: "Illustration", name: "Josh McKenna" }],
    cardRatio: "1/1",
    hero: {
      ratio: "1/1",
      alt: "Palm Springs — a mid-century carport",
      src: "/work/palm-springs/01-palm-springs.webp",
    },
    gallery: [],
    featured: true,
  },
  {
    slug: "ford-bronco",
    title: "Ford Bronco",
    client: "Personal",
    year: 2021,
    discipline: "Illustration",
    deliverables: "Key Art",
    categories: ["Automotive"],
    summary: "The new Bronco, reveal day.",
    heroCaption: "",
    brief: [
      "No brief — just an excuse to draw the new Bronco, out in the desert on the week it was revealed.",
    ],
    credits: [{ role: "Illustration", name: "Josh McKenna" }],
    cardRatio: "1/1",
    hero: {
      ratio: "1/1",
      alt: "Ford Bronco, three-quarter rear, parked in the desert",
      src: "/work/ford-bronco/01-bronco-2021.webp",
    },
    gallery: [],
    featured: false,
  },
  {
    slug: "tilda-rice",
    title: "Tilda Rice",
    client: "Tilda",
    year: 2022,
    discipline: "Illustration",
    deliverables: "Illustrations for Animation",
    categories: ["Character", "Icons"],
    summary: "Three rice pouches, three flavours, three animations.",
    heroCaption: "Illustration for three animated Tilda Rice ads — Katsu Curry, Indonesian Fried Rice and Masala — 2022.",
    brief: [
      "Tilda commissioned illustration work for a set of three animated ads, one per flavour — Katsu Curry, Indonesian Fried Rice and Masala — brought to life by animation studio Rave Growl via agency Havas.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Animation", name: "Rave Growl" },
      { role: "Agency", name: "Havas" },
      { role: "Client", name: "Tilda" },
    ],
    hero: {
      ratio: "1/1",
      alt: "Tilda Indonesian Fried Rice packaging",
      src: "/work/tilda-rice/01-fried-rice.webp",
    },
    // Sits above the write-up, hero stays out of the page body — see
    // Project.videoRow and Project.heroHiddenOnPage. `hero` still picks the
    // /work gallery card's thumbnail (see ProjectCard's baseImage) even
    // though it doesn't render on the project page itself.
    heroHiddenOnPage: true,
    videoRow: [
      { src: "/work/tilda-rice/katsu.mp4", alt: "Katsu Curry Rice animation", sound: true },
      { src: "/work/tilda-rice/fried-rice.mp4", alt: "Indonesian Fried Rice animation", sound: true },
      { src: "/work/tilda-rice/masala.mp4", alt: "Masala Rice animation", sound: true },
    ],
    // All three product photos in one row, not the default two-up-then-single
    // stack — see Project.gallerySpans.
    gallerySpans: [{ startIndex: 0, count: 3 }],
    gallery: [
      {
        ratio: "1/1",
        alt: "Tilda Katsu Curry Rice packaging",
        src: "/work/tilda-rice/02-katsu-curry.webp",
      },
      {
        ratio: "1/1",
        alt: "Tilda Indonesian Fried Rice packaging",
        src: "/work/tilda-rice/01-fried-rice.webp",
      },
      {
        ratio: "1/1",
        alt: "Tilda Masala Rice packaging",
        src: "/work/tilda-rice/03-masala-rice.webp",
      },
    ],
  },
  {
    slug: "california-magazine",
    title: "California Magazine",
    client: "California Magazine",
    year: 2019,
    // The purple background is close enough to the nav's own accent purple
    // that "Work" nearly disappears when the fixed nav scrolls over this
    // card or hero — same fix as Atlanta Magazine and LGBTQ Centre.
    navContrastLight: true,
    discipline: "Editorial Illustration",
    deliverables: "Half-Page Illustration",
    categories: ["Editorial"],
    summary: "An egg, nested in a bed of California poppies.",
    heroCaption: "A half-page illustration for California Magazine, on the state's growing fertility industry, 2019.",
    brief: [
      "A half-page illustration for California Magazine, running alongside a piece on the state becoming a hub for fertility development — an egg held in a bed of California poppies, the state flower.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Client", name: "California Magazine" },
    ],
    hero: {
      ratio: "4/5",
      alt: "An egg, nested in California poppies",
      src: "/work/california-magazine/01-california-mag.webp",
    },
    gallery: [],
  },
  {
    slug: "kiehls-trevor-project",
    title: "Kiehl's",
    client: "Kiehl's",
    year: 2023,
    discipline: "Pride Campaign",
    deliverables: "Packaging · Parade Float",
    categories: ["Pride", "Character"],
    summary: "A Pride parade, wrapped around a jar of face cream.",
    heroCaption: "For Kiehl's 2023 global Pride campaign, in support of The Trevor Project.",
    brief: [
      "Kiehl's commissioned artwork for their 2023 global Pride campaign, in support of The Trevor Project — a parade scene built into limited-edition packaging across Kiehl's product line, with the same artwork on a float in the New York City Pride parade. A portion of proceeds from the products went to The Trevor Project.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Agency", name: "Havas" },
      { role: "Client", name: "Kiehl's" },
    ],
    hero: {
      ratio: "1/1",
      alt: "Limited-edition Kiehl's Ultra Facial Cream, Pride campaign packaging",
      src: "/work/kiehls-trevor-project/01-kiehls-trevor-project-face-cream-ultra-facial-cream.webp",
    },
    heroPair: {
      ratio: "1/1",
      alt: "The full cast of characters",
      src: "/work/kiehls-trevor-project/02-characters-1.webp",
    },
    gallery: [
      {
        ratio: "1/1",
        alt: "The full cast of characters",
        src: "/work/kiehls-trevor-project/03-characters-2.webp",
      },
      {
        ratio: "1/1",
        alt: "Kiehl's × Josh McKenna",
        src: "/work/kiehls-trevor-project/04-press-quote.webp",
      },
    ],
  },
  {
    slug: "costa-smeralda",
    title: "Costa Smeralda",
    client: "Costa Smeralda",
    year: 2022,
    discipline: "Illustration",
    deliverables: "3 Posters",
    categories: ["Hospitality", "Automotive"],
    summary: "Three hotels, three vintage travel posters, one coastline.",
    heroCaption: "A set of travel posters for three Costa Smeralda hotels — Cala di Volpe, Romazzino and Cervo — 2022.",
    hideHeroCaptions: true,
    brief: [
      "Costa Smeralda commissioned a set of vintage-style travel posters, one per hotel — Hotel Cala di Volpe, Hotel Romazzino and Hotel Cervo.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Client", name: "Costa Smeralda" },
    ],
    // No-border crops, specifically for the /work card — Romazzino leads,
    // Cala di Volpe swaps in on hover.
    cardRatio: "4/5",
    cardImage: {
      ratio: "4/5",
      alt: "Hotel Romazzino",
      src: "/work/costa-smeralda/02-romazzino-no-border.webp",
    },
    cardHoverImage: {
      ratio: "4/5",
      alt: "Hotel Cala di Volpe",
      src: "/work/costa-smeralda/01-cala-di-volpe-no-border.webp",
    },
    // All three side by side, each keeping its own printed border — square
    // corners rather than the sitewide rounded frame, same reasoning as
    // Beefbar's posters: a rounded clip would cut into a border that's
    // already part of the artwork.
    hero: {
      ratio: "3/4",
      alt: "Hotel Cala di Volpe",
      src: "/work/costa-smeralda/01-cala-di-volpe.webp",
      square: true,
    },
    heroPair: {
      // True ratio updated to match Cala di Volpe's — Josh re-exported
      // Romazzino specifically so all three posters would match height on
      // the project page.
      ratio: "3/4",
      alt: "Hotel Romazzino",
      src: "/work/costa-smeralda/02-romazzino.webp",
      square: true,
    },
    heroThird: {
      // True ratio (0.7072) — closer to 12/17 than the 3/4 this would
      // otherwise snap to.
      ratio: "12/17",
      alt: "Hotel Cervo",
      src: "/work/costa-smeralda/03-smeralda-cervo.webp",
      square: true,
    },
    gallery: [],
  },
  {
    slug: "london-lgbtq-centre",
    title: "LGBTQ Centre",
    client: "London LGBTQ+ Community Centre",
    year: 2019,
    discipline: "Illustration",
    deliverables: "Brand Mark",
    categories: ["Pride", "Character", "Logo"],
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
  {
    slug: "wsj-airpods-rich",
    title: "WSJ",
    client: "The Wall Street Journal",
    year: 2019,
    yearLabel: "February 2019",
    discipline: "Editorial Illustration",
    deliverables: "1 Illustration",
    categories: ["Editorial"],
    summary: "Three ears, three AirPods, one dollar coin doing the talking.",
    heroCaption: "For \"Do AirPods Make You Look Rich? These Millennials Think So,\" by Jacob Gallagher, WSJ, February 2019.",
    hideHeroCaptions: true,
    brief: [
      "Jacob Gallagher's piece was about AirPods becoming a status symbol on sight — a $159 pair of headphones read as wealth from across a subway platform, whether or not that was true.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Writer", name: "Jacob Gallagher" },
      { role: "Client", name: "The Wall Street Journal" },
    ],
    hero: {
      ratio: "3/2",
      alt: "Three ears in a row, each wearing an AirPod",
      src: "/work/wsj-airpods-rich/01-illustration.webp",
    },
    heroPair: {
      ratio: "172/273",
      alt: "The piece as it ran on WSJ.com",
      src: "/work/wsj-airpods-rich/02-article.webp",
    },
    gallery: [],
  },
  {
    slug: "ace-tate-logo",
    title: "Ace & Tate",
    client: "Ace & Tate",
    year: 2019,
    discipline: "Illustration",
    deliverables: "1 Illustration",
    categories: ["Character", "Icons", "Logo"],
    summary: "The ampersand, sat cross-legged and fully aware of it.",
    heroCaption: "For \"re/viewed,\" Ace & Tate's series inviting illustrators to reinterpret their logo, 2019.",
    brief: [
      "Ace & Tate asked me to reinterpret their logo for \"re/viewed,\" a series putting the brand mark in different illustrators' hands. At the time I was drawing voluptuous, feminine characters almost exclusively, so the brief became: find her inside the ampersand.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Client", name: "Ace & Tate" },
    ],
    // True ratio — pinned explicitly rather than left to RATIO_CYCLE, same
    // fix as Sumo/Boat Int./Coca-Cola earlier this session.
    cardRatio: "1/1",
    hero: {
      ratio: "1/1",
      alt: "A seated figure, built from the Ace & Tate ampersand",
      src: "/work/ace-tate-logo/01-illustration.webp",
    },
    gallery: [
      {
        ratio: "16/9",
        alt: "The Ace & Tate wordmark",
        src: "/work/ace-tate-logo/02-logo.webp",
      },
    ],
  },
  {
    slug: "monocle-downward-trend",
    title: "Downward Trend",
    client: "Monocle",
    year: 2018,
    yearLabel: "October 2018, Issue 117",
    discipline: "Editorial Illustration",
    deliverables: "1 Spot Illo",
    categories: ["Editorial"],
    summary: "A stiletto heel, cracking under its own weight.",
    heroCaption: "For \"Downward Trend,\" Sophie Grove's piece on the decline of the high heel, Monocle, October 2018.",
    brief: [
      "A spot illustration for Monocle, alongside Sophie Grove's piece on high heels falling out of fashion — runways and front rows moving toward flats and trainers as comfort and practicality took over from a shoe once built on status and restriction.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Writer", name: "Sophie Grove" },
      { role: "Client", name: "Monocle" },
    ],
    // Drawn to run small next to a column of text, same as Sumo — the
    // usual full-bleed hero shows it at a scale it was never meant to be
    // seen at.
    heroSize: "spot",
    hero: {
      ratio: "4/5",
      alt: "A stiletto heel, cracked clean through",
      src: "/work/monocle-downward-trend/01-monocle-heel-snap.webp",
    },
    gallery: [],
  },
  {
    slug: "away-pride-stickers",
    title: "Away",
    client: "Away",
    year: 2019,
    discipline: "Pride Campaign",
    deliverables: "Sticker Set",
    categories: ["Pride", "Character", "Icons"],
    summary: "Two couples, a rainbow and a sunbather, sized to fit on a suitcase.",
    heroCaption: "A set of five Pride stickers, available in Away's stores throughout Pride month, 2019.",
    brief: [
      "Away commissioned a set of five Pride stickers, available in-store throughout Pride month 2019 — designed to go anywhere, but it looked great on their aluminium luggage.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Client", name: "Away" },
    ],
    // The /work card leads with the flat sticker set, not the low-res
    // suitcase mockup.
    cardRatio: "4/5",
    cardImage: {
      ratio: "4/5",
      alt: "The full sticker set",
      src: "/work/away-pride-stickers/02-sticker-set.webp",
    },
    // Both true 4/5 now that the mockup's been re-exported at high res —
    // paired side by side, full column width (not `small`, per Josh — the
    // resolution isn't a concern anymore, so no reason to cap them).
    hero: {
      ratio: "4/5",
      alt: "The full sticker set",
      src: "/work/away-pride-stickers/02-sticker-set.webp",
    },
    // True ratio (2000x2328, reduced 250/291) — the reshoot's crop is no
    // longer an exact 4/5.
    heroPair: {
      ratio: "250/291",
      alt: "The sticker set, applied to Away luggage",
      src: "/work/away-pride-stickers/01-sticker-luggage.webp",
      caption: false,
    },
    gallery: [],
  },
  {
    // Merged with the former wagamama-brighton project — two Wagamama Pride
    // window commissions a year apart, character work similar enough
    // between them that they read better as one project than two. Brighton
    // (2023, the stronger piece) leads as hero; the 2022 UK-wide "Proud
    // Beyond Pride" vinyl and its installation photos moved into the
    // gallery, along with one kept Brighton detail shot (the other three —
    // close-up character crops, the most repetitive part — were dropped).
    slug: "wagamama-pride",
    title: "Wagamama Pride",
    client: "Wagamama",
    year: 2023,
    yearLabel: "2022–2023",
    pinnedRank: 1,
    discipline: "Pride Campaign",
    deliverables: "Vinyl Window Display",
    categories: ["Pride", "Character", "Hospitality"],
    summary: "Two Pride windows, one restaurant chain, a year apart.",
    heroCaption: "The full artwork, designed for Wagamama's Brighton window, 2023.",
    brief: [
      "For Pride month 2022, Wagamama wanted one window design that could run across every UK restaurant at once — the same artwork, resized and cropped differently at each site's own glass, from a full corner window at Marble Arch to an equally huge run at Old Street.",
      "The year after, Wagamama's Brighton restaurant got its own dedicated window — eight characters spread across the glass as a joyful tribute to the city's diverse and inclusive spirit. It's stayed up as a permanent feature ever since.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Installation Photography", name: "Peter O'Sullivan" },
      { role: "Client", name: "Wagamama" },
    ],
    // Card and hero share 16/9 now — Josh's clearer re-export of the
    // Brighton artwork (Sep 2026) is natively 3413x1920, retiring the
    // 1063/640 crop (and its ImageRatio member) the hero used to carry.
    cardRatio: "16/9",
    hero: {
      ratio: "16/9",
      alt: "The full Wagamama Brighton Pride artwork",
      src: "/work/wagamama-pride/01-full-hr.webp",
    },
    // The first three run one after another, full width; the last two —
    // both documentary installation shots — pair up instead, per Josh.
    gallerySpans: [{ startIndex: 3, count: 2 }],
    gallery: [
      {
        ratio: "16/9",
        alt: "The full \"Proud Beyond Pride\" artwork",
        src: "/work/wagamama-pride/02-proud-beyond-pride-full-hr.webp",
      },
      {
        ratio: "3/2",
        alt: "The window at Wagamama's Old Street",
        src: "/work/wagamama-pride/03-old-street.webp",
      },
      {
        ratio: "3/2",
        alt: "The window at Wagamama's Marble Arch",
        src: "/work/wagamama-pride/04-marble-arch.webp",
      },
      {
        ratio: "2/3",
        alt: "The sandwich board outside Wagamama's Old Street",
        src: "/work/wagamama-pride/05-sandwich-board.webp",
      },
      {
        ratio: "1/1",
        alt: "The finished window, installed at Wagamama Brighton",
        src: "/work/wagamama-pride/06-window-install.webp",
      },
    ],
  },
  {
    slug: "atlanta-magazine",
    title: "Alphabet Soup",
    client: "Atlanta Magazine",
    year: 2022,
    pinnedRank: 3,
    // The purple gradient background is close enough to the nav's own
    // accent purple that "Work" nearly disappears when the fixed nav
    // scrolls over this card — see the field's own doc comment.
    navContrastLight: true,
    yearLabel: "October 2022",
    discipline: "Editorial Illustration",
    deliverables: "1 Illustration",
    categories: ["Pride", "Editorial"],
    summary: "Every letter of the acronym, spelled out so nobody has to ask twice.",
    heroCaption: "For Atlanta Magazine's October 2022 feature \"Alphabet Soup,\" written by Taylor Alxndr.",
    brief: [
      "Atlanta Magazine's October 2022 issue ran a piece by Taylor Alxndr explaining the growing LGBTQIA2+ acronym letter by letter, for readers who wanted to keep up but didn't know where to start. The illustration needed to hold the whole term at once, legibly, rather than breaking it into ten separate icons.",
      "The acronym itself became the artwork — each letter built as its own piece of type, with figures posed in and around the lettering rather than illustrated separately underneath it.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Writer", name: "Taylor Alxndr" },
      { role: "Client", name: "Atlanta Magazine" },
    ],
    // The artwork itself is a wide 16/9 wordmark banner — force the /work
    // grid card to the same landscape shape instead of RATIO_CYCLE's default
    // portrait, so the card isn't cropping down a wide piece.
    cardRatio: "16/9",
    cardImage: {
      ratio: "16/9",
      alt: "The LGBTQIA2+ acronym rendered as a wordmark, with figures posed in and around the letters.",
      src: "/work/atlanta-magazine/01-lgbtqiqa.webp",
    },
    hero: {
      ratio: "16/9",
      alt: "The LGBTQIA2+ acronym rendered as a wordmark, with figures posed in and around the letters.",
      src: "/work/atlanta-magazine/01-lgbtqiqa.webp",
    },
    gallery: [
      {
        ratio: "4/3",
        alt: "The spread on the printed page.",
        src: "/work/atlanta-magazine/02-magazine-landscape.webp",
      },
    ],
  },
  {
    slug: "coca-cola-moments",
    title: "Coca-Cola Moments",
    client: "Coca-Cola",
    year: 2022,
    discipline: "Illustration",
    deliverables: "5 Icons",
    categories: ["Character", "Icons"],
    summary: "A hot dog, a bottle, a pizza slice — Coke turns up in all of them.",
    heroCaption: "One of five \"everyday moments\" icons made for Coca-Cola, 2022.",
    // No visible captions on this one -- "Poolside" turned out to be a
    // wrong guess at what one of these actually shows, and rather than
    // fix the wording, Josh asked to just drop captions here entirely.
    // alt text stays for accessibility.
    hideHeroCaptions: true,
    brief: [
      "Commissioned via Momentum for Coca-Cola — a set of everyday moments, each one built around capturing a genuine Coke moment rather than posing the drink as the hero shot.",
      "Five square icons, one flat style throughout, so they'd run interchangeably across social.",
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
  {
    slug: "boat-international",
    title: "Boat Int.",
    client: "Boat International",
    year: 2024,
    yearLabel: "December 2024",
    discipline: "Editorial Illustration",
    deliverables: "1 Illustration",
    categories: ["Editorial"],
    summary: "A dayboat, tethered to a sun of its own.",
    heroCaption: "For Boat International's December 2024 feature on solar-powered yachts.",
    brief: [
      "Boat International commissioned this for a piece by Sam Fortescue on solar tech finally reaching mid-sized yachts — the 12- to 24-metre range that's always been stuck between too much power-hungry kit and not enough battery capacity to run it quietly.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Client", name: "Boat International" },
    ],
    // The artwork is a true 4/5, not RATIO_CYCLE's default alternation —
    // same fix as monocle-spot-illo and coca-cola-moments.
    cardRatio: "4/5",
    hero: {
      ratio: "4/5",
      alt: "A dayboat at anchor, tethered to a sun-shaped solar balloon.",
      src: "/work/boat-international/01-boat-international.webp",
    },
    heroPair: {
      ratio: "4/5",
      alt: "The spread on the printed page.",
      src: "/work/boat-international/02-boat-international-mockup.webp",
    },
    gallery: [],
  },
  {
    slug: "step-journal",
    title: "Step Journal",
    client: "STEP Journal",
    year: 2019,
    yearLabel: "August/September 2019",
    discipline: "Editorial Illustration",
    deliverables: "1 Cover Illustration",
    categories: ["Editorial"],
    summary: "One house, cut open to show every tax lurking inside.",
    heroCaption: "The cover for STEP Journal's August/September 2019 issue, Volume 27/Issue 7.",
    brief: [
      "STEP Journal's cover story was about the tax complexity buried in owning property — capital gains, inheritance, income tax, all stacking up in ways most owners never see coming. The brief needed one image that read that complexity at a glance, for an audience of trust and estate professionals who already know the subject cold.",
      "A knife cuts straight through the house, exposing it like a cross-section — each layer labelled with the tax that applies to it.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Client", name: "STEP Journal" },
    ],
    // True ratio — pinned explicitly rather than left to RATIO_CYCLE, which
    // happened to also give 4/5, but only by chance of array position.
    cardRatio: "4/5",
    hero: {
      ratio: "4/5",
      alt: "A house sliced open by a knife, its layers labelled with capital gains, inheritance and income tax.",
      src: "/work/step-journal/01-step-journal.webp",
    },
    heroPair: {
      ratio: "4/5",
      alt: "The cover on the printed issue.",
      src: "/work/step-journal/02-step-journal-cover-mockup.webp",
    },
    gallery: [],
  },
  {
    slug: "weapons-of-reason-gay-divide",
    title: "The Gay Divide",
    client: "Weapons of Reason",
    year: 2019,
    yearLabel: "The Inequality Issue, 2019",
    discipline: "Editorial Illustration",
    deliverables: "Editorial Illustration",
    categories: ["Editorial", "Pride"],
    summary: "A mechanic, rising from under the hood in heels.",
    heroCaption: "Illustrated for \"The Gay Divide,\" Weapons of Reason's The Inequality Issue, 2019.",
    brief: [
      "Weapons of Reason commissioned illustration for \"The Gay Divide,\" a feature in The Inequality Issue on how the LGB+ pay gap may have its roots in homophobic bullying and a lack of LGBTQ+ education in schools — following two people's experiences of how that bullying shaped the classes they took, the subjects they could focus on and the careers they went on to pursue.",
      "The brief asked for ruthlessly simple, iconic concepts within Weapons of Reason's prescribed 19-colour palette — each piece limited to 2–5 of those colours to keep a consistent brand feel across the issue.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Words", name: "Jamie Broadway" },
      { role: "Client", name: "Weapons of Reason" },
    ],
    cardRatio: "1/1",
    cardImage: {
      ratio: "1/1",
      alt: "A mechanic, living his truth in pink heels",
      src: "/work/weapons-of-reason-gay-divide/03-wor-gay-divide-web-01-hr.webp",
    },
    // True ratio 1.7637 (4000x2268) — close enough to 16/9 (1.7778) to snap
    // with no visible crop. Full-width, no heroPair, so the spread reads
    // as wide as the site's usual two-up hero grid instead of one column
    // of it — per Josh, the spread should lead the page. Replaced the
    // original flat export with Josh's mockup-shadow render.
    hero: {
      ratio: "16/9",
      alt: "The Gay Divide spread, opening page",
      src: "/work/weapons-of-reason-gay-divide/01-spread-final-hr.webp",
    },
    gallery: [
      {
        ratio: "1/1",
        alt: "A mechanic, living his truth in pink heels",
        src: "/work/weapons-of-reason-gay-divide/03-wor-gay-divide-web-01-hr.webp",
      },
      {
        ratio: "1/1",
        alt: "The spread, held open and read in print",
        src: "/work/weapons-of-reason-gay-divide/01-ins-post-arrive-2.webp",
      },
    ],
  },
  {
    slug: "opto-markets-2019",
    title: "OPTO Mag",
    client: "CMC Markets",
    year: 2019,
    yearLabel: "OPTO Issue 03, Jan/Feb 2019",
    discipline: "Editorial Illustration",
    deliverables: "Cover + 2 Opener Illustrations",
    categories: ["Editorial"],
    summary: "Two oversized numerals, packed with everything trading in 2019.",
    heroCaption: "One of two opener illustrations for OPTO's Issue 03 cover story, \"The Markets in 2019,\" CMC Markets, Jan/Feb 2019.",
    brief: [
      "CMC Markets commissioned the cover and two opener illustrations for OPTO magazine's Issue 03 cover story, \"The Markets in 2019\" — trading intelligence on what was coming next across retail, cars, tech, media, banks, AI & AR, cannabis, medtech, fintech and esports, with a sector's icons built into the oversized \"2019\" numerals themselves.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Client", name: "CMC Markets" },
    ],
    cardRatio: "1/1",
    hero: {
      ratio: "1/1",
      alt: "The '2019' opener, packed with delivery drones, self-driving cars and social platform icons",
      src: "/work/opto-markets-2019/02-opener-1-final.webp",
    },
    heroPair: {
      ratio: "1/1",
      alt: "The second '2019' opener, packed with cannabis, gaming and fintech icons",
      src: "/work/opto-markets-2019/03-opener-2-final.webp",
    },
    gallery: [
      {
        ratio: "4/5",
        alt: "The OPTO Issue 03 cover, \"The Markets in 2019\"",
        src: "/work/opto-markets-2019/01-front-cover.webp",
      },
    ],
    // Explicit, not getCardHoverImage's default (heroPair wins first, so
    // it'd swap in the second opener) — Josh wants the cover as the
    // /work hover swap specifically.
    cardHoverImage: {
      ratio: "4/5",
      alt: "The OPTO Issue 03 cover, \"The Markets in 2019\"",
      src: "/work/opto-markets-2019/01-front-cover.webp",
    },
  },
  {
    slug: "vogue-sun-tan",
    title: "Tanning Tips",
    client: "Vogue Magazine",
    year: 2018,
    // Pinned to the middle of /work's curated block, regardless of year
    // — Josh wants this one prominent despite being older than most of
    // the rest, just not leading the page.
    pinnedRank: 10,
    discipline: "Editorial Illustration",
    deliverables: "3 Spot Illustrations",
    categories: ["Editorial"],
    // Standardized to 16/9 with the other landscape /work cards, not the
    // hero's true 1.6 — still clears LANDSCAPE_SPAN_RATIO (1.3) either way,
    // so it spans two columns automatically, same as UAL Booklets and
    // Bombay Sapphire.
    cardRatio: "16/9",
    summary: "A three-part series on how to tan safely, from SPF to shade to protective clothing.",
    heroCaption: "The first of a three-part series on tanning safely.",
    brief: [
      "I created a three-part editorial illustration series for Vogue Magazine, focusing on how to tan safely. The artwork visually guides readers through essential sun protection tips, including applying SPF, seeking shade during peak hours, and incorporating protective clothing and accessories.",
    ],
    credits: [{ role: "Illustration", name: "Josh McKenna" }],
    // True ratio (1.5), not the old 16/10 — Josh's refreshed exports are
    // natively 3:2, same fix as UAL Booklets' reshoot.
    hero: {
      ratio: "3/2",
      alt: "Applying sunscreen, hat pulled low against the sun.",
      src: "/work/vogue-sun-tan/01-vogue-sun-1.webp",
    },
    gallery: [
      {
        ratio: "3/2",
        alt: "A fine mist of tanning oil in the afternoon light.",
        src: "/work/vogue-sun-tan/02-vogue-sun-2.webp",
      },
      {
        ratio: "3/2",
        alt: "Face down on the sand, out of the midday sun.",
        src: "/work/vogue-sun-tan/03-vogue-sun-3.webp",
      },
    ],
  },
  {
    slug: "instagram-sticker",
    title: "Pride Sticker",
    client: "Instagram",
    year: 2017,
    yearLabel: "2017–2022",
    pinnedRank: 4,
    discipline: "Pride Campaign",
    deliverables: "Sticker Set · Mural · Parade Float",
    categories: ["Pride", "Mural", "Character", "Icons"],
    featured: true,
    // cardImage is a true 1/1 — pinned explicitly, same fix as
    // monocle-spot-illo, so a future reorder can't flip it via RATIO_CYCLE.
    cardRatio: "1/1",
    summary:
      "I created an iconic Pride sticker for Instagram Stories: a sassy, muscular bloke in red high heels. Meant to last a month, it stayed live for five years, used by millions and turned into a symbol of queer culture and self-expression.",
    heroCaption: "The original character design, created for Instagram's 2017 Pride sticker set.",
    brief: [
      "In 2017, Jeffrey Gerson, then Instagram's Senior Product Marketing Lead, found my work in queer mag Hello Mr, a piece I'd done on David Hockney, and reached out.",
      "Instagram wanted a sticker that celebrated Pride using queer iconography as part of a new sticker set for Stories, with other LGBTQ+ artists (Carra Sykes, Andy Simmonds, Cute Brute and José Antonio Roda), available throughout Pride month.",
      "So I created a sassy, muscular bloke in red high heels, designed to read clearly at sticker size, a couple of cm on a phone screen. The artwork reflects where my style was at that point: bold shapes, a simple palette, diverse characters, a tongue-in-cheek sense of humour. It's true to masculinity and sexuality, my real lived experience and personal take on Pride.",
      "Its popularity meant it stayed embedded in the app for five years. Millions used it, including celebrities I never expected to see sharing my art (Michelle Obama!).",
      "What started as a small icon on a phone screen went way beyond the app: a 10ft-high float at Sydney Mardi Gras, murals at Trafalgar Square and Meta's head offices, an Instagram takeover of Vogue's account, a feature in a Gestalten book and public talks I'm still giving today. It was mad.",
      "Almost a decade on, it's still doing work. I've had hundreds, maybe thousands, of messages from folk thanking me for representing them in my work. Everybody posted it, referenced it, used it as their own way of feeling fierce and self-expression (Jonathan Van Ness talks about this on Queer Eye!).",
      "It opened the door to years of Pride and charity work that followed, including a project Mel C from the Spice Girls put her name behind.",
      "Not bad for a sticker that was only meant to last a month.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Senior Product Marketing Lead", name: "Jeffrey Gerson" },
      { role: "Video Footage — Sydney Mardi Gras", name: "Pedestrian TV" },
    ],
    hero: {
      ratio: "1/1",
      alt: "The Instagram Pride sticker character",
      src: "/work/instagram-sticker/03-instagram-sticker.webp",
      // Transparent PNG — cover's default bg-placeholder surface (brand
      // blue) would show through the transparent margin around the
      // figure. contain uses bg-canvas instead, the same fix real
      // artwork with transparency always needs (see Plate).
      fit: "contain",
    },
    // /work card only — same character on a solid lavender fill instead of
    // the hero's transparent PNG, so the card needs no contain/canvas-
    // letterbox workaround. The project page's own hero above is untouched.
    cardImage: {
      ratio: "1/1",
      alt: "The Instagram Pride sticker character",
      src: "/work/instagram-sticker/01-instagram-sticker-bg2-hr.webp",
    },
    // GIF leads the gallery (afterIndex: 0, before the two-up pair) — the
    // sticker's own animation, right after the write-up. Video sits right
    // after the two-up pair (afterIndex: 2 = after gallery[0] and [1]),
    // keeping the whole Mardi Gras beat — float photo, float detail,
    // footage — together before Sticker Set breaks to a new subject.
    galleryGif: {
      src: "/work/instagram-sticker/10-sticker-animation.gif",
      alt: "The move behind the sticker.",
      ratio: "1/1",
      afterIndex: 0,
    },
    galleryVideo: {
      src: "/work/instagram-sticker/09-mardi-gras-video.mp4",
      alt: "Footage from the Sydney Mardi Gras parade, courtesy of Pedestrian TV.",
      sound: true,
      afterIndex: 3,
    },
    // Sticker Set (16/9) leads as a standalone single, above the float, per
    // Josh — it can't sit in a two-up pair with either Mardi Gras photo
    // (3/4) without mismatching heights, so gallerySpans skips the default
    // "first two auto-pair" and takes manual control of the whole layout
    // from index 0: Mardi Gras 2019 + Detail pair at indices 1-2, the three
    // LA composites (indices 3-5, all true 9/16) share a row, and the book
    // feature + Meta mural (indices 6-7, both 4/5) — the two "lonely"
    // single-image features — pair up too.
    gallerySpans: [
      { startIndex: 1, count: 2 },
      { startIndex: 3, count: 3 },
      { startIndex: 6, count: 2 },
    ],
    gallery: [
      {
        ratio: "16/9",
        alt: "The sticker as it appeared within the Pride set.",
        src: "/work/instagram-sticker/05-sticker-set-hr.webp",
      },
      {
        ratio: "3/4",
        alt: "The character reimagined as a 10ft-high float, watched by an estimated 500,000 spectators at the Sydney Mardi Gras parade.",
        src: "/work/instagram-sticker/06-sydney-mardi-gras-1.webp",
      },
      {
        ratio: "3/4",
        alt: "Close-up of the float lit up at night during the parade.",
        src: "/work/instagram-sticker/07-sydney-mardi-gras-2.webp",
      },
      {
        ratio: "9/16",
        alt: "The character placed on Venice Beach's Pride-painted lifeguard tower, part of a personal series of the character around LA.",
        src: "/work/instagram-sticker/01-06.webp",
      },
      {
        ratio: "9/16",
        alt: "The character on top of a liquor store sign, part of the same LA series.",
        src: "/work/instagram-sticker/01-02.webp",
        caption: false,
      },
      {
        ratio: "9/16",
        alt: "The character balanced on a vintage Jeep, part of the same LA series.",
        src: "/work/instagram-sticker/02-05.webp",
        caption: false,
      },
      {
        ratio: "4/5",
        alt: "The project and interview feature in Mr Hudson Explores, published by Gestalten.",
        src: "/work/instagram-sticker/04-mr-hudson-explores.webp",
      },
      {
        ratio: "4/5",
        alt: "The same three figures, painted inside Meta's head offices.",
        src: "/work/instagram-sticker/02-facebook-mural-cropped.webp",
      },
      {
        ratio: "9/8",
        small: true,
        alt: "Instagram takeover of British Vogue's account, where the mural at Trafalgar Square appeared behind me as I read out #kindcomments from the Pride sticker set's marketing campaign.",
        src: "/work/instagram-sticker/08-vogue-takeover.webp",
      },
    ],
  },
  {
    slug: "womp-first-3d-character",
    title: "First 3D Character",
    client: "Personal",
    year: 2026,
    discipline: "3D Illustration",
    deliverables: "1 Render",
    categories: ["3D", "Character"],
    summary: "A beanie, a moustache, an earring — the first character built in Womp.",
    heroCaption: "",
    brief: [
      "Modelled in Womp, a browser-based 3D tool — the first character I built in 3D, before Pato, Jimny or Last Call. Wanted to push my 2D character features into three dimensions.",
    ],
    credits: [{ role: "3D Illustration", name: "Josh McKenna" }],
    // True ratio — pinned explicitly rather than left to RATIO_CYCLE, which
    // happened to also give 1/1, but only by chance of array position.
    cardRatio: "1/1",
    heroSize: "spot",
    // Same cut-out already drifting in the homepage hero (id: "ambient-1")
    // — reused here rather than re-exported, so the two stay pixel-identical.
    floatingObject: { src: "/illustrations/objects/face.png", aspect: "0.795" },
    hero: {
      ratio: "1/1",
      alt: "A beanie, a moustache, an earring",
      src: "/work/womp-first-3d-character/01-blue-face.webp",
    },
    gallery: [],
  },
  {
    slug: "womp-jimny",
    title: "Jimny",
    client: "Personal",
    year: 2026,
    pinnedRank: 18,
    discipline: "3D Illustration",
    deliverables: "1 Turnaround · 3 Renders",
    categories: ["3D", "Automotive"],
    summary: "My favourite car, rendered because I wanted an excuse to model it.",
    heroCaption: "",
    brief: [
      "Modelled in Womp, a browser-based 3D tool — a gloopy, wompy homage to my favourite car, the Jimny.",
    ],
    credits: [{ role: "3D Illustration", name: "Josh McKenna" }],
    // Not the true 1/1 — Josh's call, 4/5 reads better here than the
    // RATIO_CYCLE-by-chance square did. Pinned explicitly either way.
    cardRatio: "4/5",
    // Closes the page instead of leading it — see the "outro" case in
    // Project.heroVideo's position doc comment. `hero` still carries a
    // still (used for the /work card).
    heroVideo: {
      src: "/work/womp-jimny/00-turnaround.mp4",
      alt: "The Jimny, turning",
      position: "outro",
    },
    // Three renders side by side up top, captions off — see heroThird's
    // doc comment.
    hideHeroCaptions: true,
    hero: {
      ratio: "1/1",
      alt: "The Jimny, front three-quarter",
      src: "/work/womp-jimny/02-front.webp",
    },
    heroPair: {
      ratio: "1/1",
      alt: "The Jimny, from the back",
      src: "/work/womp-jimny/01-back.webp",
    },
    heroThird: {
      ratio: "1/1",
      alt: "The Jimny, side profile",
      src: "/work/womp-jimny/03-side.webp",
    },
    gallery: [],
  },
  {
    slug: "womp-twingo",
    title: "Twingo",
    client: "Personal",
    year: 2026,
    discipline: "3D Illustration",
    deliverables: "2 Renders",
    categories: ["3D", "Automotive"],
    summary: "Same little city car, once yellow under pink light and once black under red.",
    heroCaption: "",
    brief: [
      "Modelled in Womp, a browser-based 3D tool — my own take on the Renault Twingo, a remix of the MK1 and the new Twingo EV, with side vents and chunky arches nodding to the Renaultsport Espace and the turbo era.",
      "Same car rendered twice — yellow under pink light, black under red.",
    ],
    credits: [{ role: "3D Illustration", name: "Josh McKenna" }],
    // True ratio — pinned explicitly rather than left to RATIO_CYCLE, which
    // happened to also give 4/5, but only by chance of array position.
    cardRatio: "4/5",
    // Only two images, both the same subject in two colourways — side by
    // side reads better than a full-width hero and a lone gallery image.
    hero: {
      ratio: "4/5",
      alt: "The Twingo, in yellow",
      src: "/work/womp-twingo/01-yellow.webp",
    },
    heroPair: {
      ratio: "4/5",
      alt: "The Twingo, in black",
      src: "/work/womp-twingo/02-black.webp",
    },
    gallery: [],
  },
  {
    slug: "womp-money-bench",
    title: "Money Bench",
    client: "Personal",
    year: 2026,
    pinnedRank: 13,
    discipline: "3D Illustration",
    deliverables: "2 Renders",
    categories: ["3D", "Character", "Editorial"],
    summary: "Tapping into the coffee fund.",
    heroCaption: "",
    brief: [
      "Modelled in Womp, a browser-based 3D tool — coffee cups, a bench, coins scattered mid-fall, in two versions: one with company, one alone.",
    ],
    credits: [{ role: "3D Illustration", name: "Josh McKenna" }],
    // True ratio — pinned explicitly rather than left to RATIO_CYCLE, which
    // was giving this 1/1 by chance.
    cardRatio: "4/5",
    hero: {
      ratio: "4/5",
      alt: "Two on the bench",
      src: "/work/womp-money-bench/01-bench.webp",
    },
    heroPair: {
      ratio: "4/5",
      alt: "Alone on the bench",
      src: "/work/womp-money-bench/02-bench-blue-guy-02.webp",
    },
    gallery: [],
  },
  {
    slug: "womp-pato",
    title: "Pato",
    client: "Personal",
    year: 2026,
    discipline: "3D Illustration",
    deliverables: "2 Renders · 1 Turnaround",
    categories: ["3D", "Character"],
    summary: "Three legs, full confidence.",
    heroCaption: "",
    brief: [
      "Modelled in Womp, a browser-based 3D tool — Pato, my three-legged dog.",
    ],
    credits: [{ role: "3D Illustration", name: "Josh McKenna" }],
    // True ratio — was silently cropping to 1/1 via RATIO_CYCLE's chance
    // assignment; the actual renders are 4/5.
    cardRatio: "4/5",
    // Video sits below the two renders rather than leading the page —
    // the renders are the artwork, the clip is supplementary.
    heroVideo: {
      src: "/work/womp-pato/03-pato-video.mp4",
      alt: "Pato, turning",
      position: "bottom",
    },
    hero: {
      ratio: "4/5",
      alt: "Pato",
      src: "/work/womp-pato/01-pato.webp",
    },
    heroPair: {
      // Josh recropped the render itself to 4/5, matching hero — no
      // CSS crop needed to land the two frames at the same size.
      ratio: "4/5",
      alt: "Pato, from behind",
      src: "/work/womp-pato/02-pato-back.webp",
    },
    gallery: [],
  },
  {
    slug: "womp-last-call",
    title: "Last Call",
    client: "Personal",
    year: 2026,
    pinnedRank: 14,
    discipline: "3D Illustration",
    deliverables: "1 Render · 1 Turnaround",
    categories: ["3D"],
    summary: "Last call at the bar for this lost cowboy.",
    heroCaption: "The Last Call hat and keyring",
    brief: [
      "Modelled in Womp, a browser-based 3D tool — a cowboy hat and a \"Last Call\" keyring.",
    ],
    credits: [{ role: "3D Illustration", name: "Josh McKenna" }],
    // True ratio — pinned explicitly rather than left to RATIO_CYCLE, which
    // happened to also give 4/5, but only by chance of array position.
    cardRatio: "4/5",
    heroVideo: {
      src: "/work/womp-last-call/02-last-call-video.mp4",
      alt: "The Last Call hat and keyring, turning",
      position: "pair",
      ratio: "4/5",
    },
    hero: {
      ratio: "4/5",
      alt: "The Last Call hat and keyring",
      src: "/work/womp-last-call/01-last-call.webp",
    },
    gallery: [],
  },
  {
    slug: "womp-leap",
    title: "Leap",
    client: "Personal",
    year: 2026,
    discipline: "3D Illustration",
    deliverables: "1 Render",
    categories: ["3D", "Character"],
    summary: "Mid-air, headphones on, committed to the landing.",
    heroCaption: "",
    brief: [
      "Modelled in Womp, a browser-based 3D tool — headphones on, full diagonal reach.",
    ],
    credits: [{ role: "3D Illustration", name: "Josh McKenna" }],
    // True ratio — was silently cropping to 4/5 via RATIO_CYCLE's chance
    // assignment, clipping the figure's trailing hand exactly like the
    // hero comment below warns against. One of the deliberate odd ones,
    // like Beefbar and Voxi Pride.
    cardRatio: "8/9",
    heroSize: "spot",
    hero: {
      // True 1920x2160 ratio — the default 4/5 crop would clip the
      // trailing hand of this figure's full diagonal reach.
      ratio: "8/9",
      alt: "Mid-leap, headphones on",
      src: "/work/womp-leap/01-leap.webp",
    },
    gallery: [],
  },
  {
    slug: "rooted-journal-editorial",
    title: "Living Regeneratively",
    client: "The Rooted Journal",
    year: 2025,
    pinnedRank: 5,
    yearLabel: "Spring 2025",
    discipline: "Editorial Illustration",
    deliverables: "10 Spot Illustrations",
    categories: ["Editorial"],
    summary: "Composting, fishing and shouting into a megaphone, drawn at the same scale.",
    heroCaption: "Illustrated for \"Living Regeneratively,\" The Rooted Journal Issue 02, Spring 2025.",
    brief: [
      "Ten regenerative-living habits — composting, fishing responsibly, buying secondhand — needed one icon each for \"Living Regeneratively,\" a feature written by Dustin Beatty for The Rooted Journal's Spring 2025 issue. Each habit runs as its own call-out box, so every illustration had to work as a single self-contained icon rather than part of a larger scene.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Client", name: "The Rooted Journal" },
    ],
    // Ten small spot icons — a full-width hero or a two-column gallery
    // blows any one of them up far past the scale they were drawn at.
    // poster-grid (Beefbar's pattern) skips the big hero and opens
    // straight into a grid instead — five columns, so the ten icons land
    // as two clean rows with the reference photos trailing in their own
    // partial row after.
    galleryLayout: "poster-grid",
    posterGridColumns: 5,
    // The /work grid card leads with its own standalone illustration, not
    // any of the ten spot icons below — Josh's call. Solid brown
    // background, so no contain/canvas-letterbox workaround needed here
    // either. cardRatio forces the card frame itself square to match.
    cardRatio: "1/1",
    cardImage: {
      ratio: "1/1",
      alt: "A woman kneeling among wildflowers",
      src: "/work/rooted-journal-editorial/01-rooted-journal2.webp",
    },
    hero: {
      // PNG exports (Josh replaced the original JPEG-derived set) — real
      // alpha around each icon's halo shape, not a baked-in white square.
      // `contain` shows the true edges against canvas instead of letting
      // the transparent corners reveal the placeholder-blue surface.
      ratio: "1/1",
      fit: "contain",
      alt: "Spot illustration — reforest",
      src: "/work/rooted-journal-editorial/06-reforest.webp",
    },
    gallery: [
      {
        ratio: "1/1",
        fit: "contain",
        alt: "Spot illustration — support local",
        src: "/work/rooted-journal-editorial/01-support-local.webp",
      },
      {
        ratio: "1/1",
        fit: "contain",
        alt: "Spot illustration — plant native",
        src: "/work/rooted-journal-editorial/02-plant-native.webp",
      },
      {
        ratio: "1/1",
        fit: "contain",
        alt: "Spot illustration — preserve heirloom",
        src: "/work/rooted-journal-editorial/07-preserve-heirloom.webp",
      },
      {
        ratio: "1/1",
        fit: "contain",
        alt: "Spot illustration — harvest rainwater",
        src: "/work/rooted-journal-editorial/04-harvest-rainwater.webp",
      },
      {
        ratio: "1/1",
        fit: "contain",
        alt: "Spot illustration — fishing",
        src: "/work/rooted-journal-editorial/03-fishing.webp",
      },
      {
        ratio: "1/1",
        fit: "contain",
        alt: "Spot illustration — buy seconds",
        src: "/work/rooted-journal-editorial/05-buy-seconds.webp",
      },
      {
        ratio: "1/1",
        fit: "contain",
        alt: "Spot illustration — upcycle",
        src: "/work/rooted-journal-editorial/09-upcycle.webp",
      },
      {
        ratio: "1/1",
        fit: "contain",
        alt: "Spot illustration — compost",
        src: "/work/rooted-journal-editorial/08-compost.webp",
      },
      {
        ratio: "1/1",
        fit: "contain",
        alt: "Spot illustration — advocate",
        src: "/work/rooted-journal-editorial/10-advocate.webp",
      },
    ],
  },
  {
    slug: "figma-yeti",
    title: "Yeti",
    client: "Personal",
    year: 2025,
    pinnedRank: 8,
    discipline: "Illustration",
    deliverables: "1 Illustration",
    categories: ["Character"],
    summary: "A YETI cooler, occupied.",
    heroCaption: "",
    brief: [
      "Made in Figma Draw — a yeti figure lounging inside a YETI-brand cooler, blue duotone.",
    ],
    credits: [{ role: "Illustration", name: "Josh McKenna" }],
    // Portrait source — RATIO_CYCLE would otherwise land the /work card
    // on a square or landscape slot depending on position.
    cardRatio: "4/5",
    heroSize: "spot",
    hero: {
      ratio: "4/5",
      alt: "The YETI cooler",
      src: "/work/figma-yeti/01-yeti-hr.webp",
    },
    gallery: [],
  },
  {
    slug: "figma-underground",
    title: "Underground",
    client: "Personal",
    year: 2025,
    pinnedRank: 15,
    discipline: "Illustration",
    deliverables: "1 Illustration",
    categories: ["Editorial"],
    summary: "Mind the closing doors — and whatever's still in your hand.",
    heroCaption: "",
    brief: [
      "Made in Figma Draw — \"mind the closing doors,\" with the Underground roundel split down the middle like the doors themselves, a hand and a bag caught right in the gap.",
    ],
    credits: [{ role: "Illustration", name: "Josh McKenna" }],
    // Portrait source — RATIO_CYCLE would otherwise land the /work card
    // on a square or landscape slot depending on position.
    cardRatio: "4/5",
    heroSize: "spot",
    hero: {
      ratio: "4/5",
      alt: "Underground roundel",
      src: "/work/figma-underground/01-underground-final-hr.webp",
    },
    gallery: [],
  },
  {
    slug: "figma-servebots",
    title: "Servebots",
    client: "Personal",
    year: 2025,
    discipline: "Illustration",
    deliverables: "1 Illustration",
    categories: ["Character"],
    summary: "LA's chaotic sidewalk bots, forever stalling out halfway across a crossing.",
    heroCaption: "",
    brief: [
      "Made in Figma Draw — a nod to Serve Robotics' sidewalk delivery bots, the chaotic little things that tear up LA's pavements and stop dead halfway along a crossing.",
    ],
    credits: [{ role: "Illustration", name: "Josh McKenna" }],
    // Portrait source — RATIO_CYCLE would otherwise land the /work card
    // on a square or landscape slot depending on position.
    cardRatio: "4/5",
    heroSize: "spot",
    hero: {
      ratio: "4/5",
      alt: "Servebots on delivery",
      src: "/work/figma-servebots/01-servebots-hr2.webp",
    },
    gallery: [],
  },
  {
    slug: "figma-vitra-virgil",
    title: "Vitra",
    client: "Personal",
    year: 2025,
    discipline: "Illustration",
    deliverables: "1 Illustration",
    categories: ["Editorial"],
    summary: "A chair, repeated as wallpaper, in case the first one wasn't clear enough.",
    heroCaption: "A tribute to a great design collaboration — Vitra × Virgil Abloh, 2025.",
    brief: [
      "Made in Figma Draw — the Vitra × Virgil Abloh chair, repeated as a wordmark pattern behind it.",
    ],
    credits: [{ role: "Illustration", name: "Josh McKenna" }],
    // Portrait source — RATIO_CYCLE would otherwise land the /work card
    // on a square or landscape slot depending on position.
    cardRatio: "4/5",
    heroSize: "spot",
    hero: {
      ratio: "4/5",
      alt: "Vitra × Virgil Abloh",
      src: "/work/figma-vitra-virgil/01-vitgr-hr.webp",
    },
    gallery: [],
  },
  {
    slug: "figma-bmw-z1",
    title: "BMW Z1",
    client: "Personal",
    year: 2025,
    pinnedRank: 16,
    discipline: "Illustration",
    deliverables: "2 Illustrations",
    categories: ["Automotive"],
    summary: "A niche favourite, picked for doors that drop straight into the sill.",
    heroCaption: "",
    brief: [
      "Made in Figma Draw — the BMW Z1 got the most attention of the set, a second background and a four-colour carousel.",
    ],
    credits: [{ role: "Illustration", name: "Josh McKenna" }],
    // Portrait source — RATIO_CYCLE would otherwise land the /work card
    // on a square or landscape slot depending on position.
    cardRatio: "4/5",
    // Neither alt adds anything past the title above them.
    hideHeroCaptions: true,
    hero: {
      ratio: "4/5",
      alt: "BMW Z1, four colourways",
      src: "/work/figma-bmw-z1/01-carousel-hr.webp",
    },
    heroPair: {
      ratio: "4/5",
      alt: "BMW Z1",
      src: "/work/figma-bmw-z1/02-single.webp",
    },
    gallery: [],
  },
  {
    slug: "nomad-wheels-505-livery",
    title: "505 Touring",
    client: "Nomad Wheel Co.",
    year: 2024,
    pinnedRank: 12,
    discipline: "Automotive Livery",
    deliverables: "Vehicle Livery · Event Poster · Social Assets · Promotional Film",
    categories: ["Automotive"],
    summary: "Livery and posters for a wheel launch, field-tested on camera in Josh's own Land Cruiser.",
    heroCaption:
      "The full print-ready livery artwork for Nomad Wheel Co.'s 505 Touring launch, styled after vintage Dakar rally posters (and my actual Land Cruiser — yep that's me driving).",
    brief: [
      "Nomad Wheel Co. asked for a full graphic package around the launch of the 505 Touring wheel — vehicle livery, an event poster and social assets, all built from the same vintage Dakar rally look. The same marks — the Nomad globe, the 505 script, the sponsor lockups for Toyo Tires and DVR — had to survive full-bleed on a print poster and cropped square for a phone screen.",
      "The livery went onto my own Land Cruiser, which I then drove through the California desert for the launch's promotional film — the closest I've come to field-testing my own artwork.",
    ],
    credits: [
      { role: "Creative Direction & Illustration", name: "Josh McKenna" },
      { role: "Client", name: "Nomad Wheel Co." },
    ],
    // Josh's own re-crop, a true 4/5 with no empty margin — used as-is for
    // both the /work card and the project page's own hero, so no separate
    // cardImage override is needed (ProjectCard falls back to hero).
    cardRatio: "4/5",
    // Promo film leads the page (real audio, native controls — sound:
    // true), with the poster and the flyer as a two-up underneath it
    // rather than a full-width hero followed by a single gallery image.
    heroVideo: {
      src: "/work/nomad-wheels-505-livery/04-touring-promo.mp4",
      alt: "The 505 Touring launch promotional film",
      sound: true,
      poster: "/work/nomad-wheels-505-livery/05-video-poster.webp",
    },
    hero: {
      ratio: "4/5",
      alt: "The full 505 Touring livery — Land Cruiser drifting through desert dunes",
      src: "/work/nomad-wheels-505-livery/01-nomad-505.webp",
    },
    heroPair: {
      ratio: "1/1",
      alt: "505 Touring release event flyer",
      src: "/work/nomad-wheels-505-livery/01-socials-02.webp",
    },
    gallery: [],
  },
  {
    slug: "mr-porter-miami-invites",
    title: "Mr Porter Invites",
    client: "Mr Porter",
    year: 2021,
    discipline: "Event Invitation",
    deliverables: "2 Invitations",
    categories: ["Hospitality", "Automotive"],
    // Overrides effectiveCardRatio's RATIO_CYCLE fallback -- without this
    // the /work grid was landing this card on a square slot regardless of
    // cardImage's own declared ratio (ProjectCard's `ratio` prop always
    // wins over the image's own, so both need to agree). "Need to be
    // 4-5," per Josh.
    cardRatio: "4/5",
    summary: "Same building, same car, same palm trees — just moved the sun.",
    heroCaption: "The day and night invitation designs for the same Mr Porter Miami event.",
    brief: [
      "Mr Porter needed two invitations for the same Miami event — one for day, one for night.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Client", name: "Mr Porter" },
    ],
    // True 707/1000 ratio (a near-exact 1/√2, ISO-paper proportions) —
    // 3/4 would have cropped noticeably. Square corners, not the sitewide
    // rounded frame — "remove the curved frame radius for these (like
    // beefbar)," per Josh: these have their own border treatment baked
    // into the artwork the same way Beefbar's posters do, and rounding
    // would clip across it.
    hero: {
      ratio: "707/1000",
      alt: "Mr Porter Miami invite — night",
      src: "/work/mr-porter-miami-invites/01-mr-porter-night.webp",
      square: true,
    },
    heroPair: {
      ratio: "707/1000",
      alt: "Mr Porter Miami invite — day",
      src: "/work/mr-porter-miami-invites/02-mr-porter-day.webp",
      square: true,
    },
    // Card preview gets its own day/night pair, cropped to 4/5 rather
    // than the hero's true ratio — "in the gallery preview I have
    // included day cover and night cover to be used... put it in a 4-5
    // frame," per Josh. Night leads at rest, day crossfades in on hover
    // (getCardHoverImage) — "need to be... the night image," per Josh.
    cardImage: {
      ratio: "4/5",
      alt: "Mr Porter Miami invite — night",
      src: "/work/mr-porter-miami-invites/03-mr-porter-night-cover.webp",
    },
    cardHoverImage: {
      ratio: "4/5",
      alt: "Mr Porter Miami invite — day",
      src: "/work/mr-porter-miami-invites/04-mr-porter-day-cover.webp",
    },
    gallery: [],
  },
  {
    slug: "monocle-spot-illo",
    title: "Sumo",
    client: "Monocle",
    year: 2018,
    pinnedRank: 17,
    // Explicit, not RATIO_CYCLE's alternation — the artwork itself is a
    // square export, and leaving this to the cycle meant a pinnedRank
    // reorder elsewhere could silently flip this card's parity and crop it
    // into 4/5 with no change to this project's own fields at all.
    cardRatio: "1/1",
    discipline: "Editorial Illustration",
    deliverables: "1 Spot Illo",
    categories: ["Editorial", "Icons"],
    summary: "A sumo wrestler's whole physique, reduced to a knot and a topknot.",
    heroCaption: "",
    brief: [
      "A spot illustration for Monocle — it ran about 4cm across with text wrapped around it, so it had to stay recognisable through just the topknot and the knotted mawashi belt.",
    ],
    credits: [{ role: "Illustration", name: "Josh McKenna" }],
    // Drawn to run small next to a column of text — the usual full-bleed
    // hero shows it at a scale it was never meant to be seen at.
    heroSize: "spot",
    // Solid teal background, not the old transparent export — cover fit
    // needs no contain/canvas-letterbox workaround. Last of the /work
    // pinned set's transparent-bg cards to get one.
    hero: {
      ratio: "1/1",
      alt: "Spot illustration — sumo wrestler",
      src: "/work/monocle-spot-illo/01-monocle-sumo-26.webp",
    },
    gallery: [],
  },
  {
    slug: "ual-welcome-booklets",
    title: "UAL Booklets",
    client: "University of the Arts London",
    year: 2017,
    yearLabel: "2017/18/19/20",
    discipline: "Illustration",
    deliverables: "Covers · Inside Pages · Spots · Maps",
    categories: ["Character", "Editorial"],
    // Standardized to 16/9 with the other landscape /work cards, not the
    // photo's true 3/2 — checked against the actual spread, nothing
    // essential is cropped. Same fix as Bombay Sapphire below.
    cardRatio: "16/9",
    summary: "Six UAL colleges, six colour-ways, one shared case of first-week nerves.",
    heroCaption: "One interior spread, reused across all six 2017–2020 college editions.",
    brief: [
      "UAL is six separate colleges, and the welcome guide had to work for all of them at once — one set of content, run six times in six colour-ways, so a fresher landing at Chelsea didn't get handed Central Saint Martins' copy by mistake.",
      "Same drawings throughout: a wayfinding map, campus-life spots, the ID card queue. Ran for four editions, 2017 to 2020.",
    ],
    credits: [{ role: "Illustration", name: "Josh McKenna" }],
    // Full reshoot -- "replace all images with these new ones," from a
    // folder Josh named "Blue BG." Hero stays the ID card queue (kept
    // "the same," per Josh) but now points at that reshoot's own version
    // of the page. Map gets its own dedicated photo for the first time
    // (previously the closest thing was a flat grid of covers wrongly
    // captioned as the map) and leads the gallery -- "I want map to be
    // featured second, then the covers etc after." Two new pages this
    // round too: individual cover pairs shot against a blue backdrop
    // (Wimbledon/LCC/CSM each next to the shared "Your creative future
    // starts here" cover), and a new interior spread covering
    // Commonplace, Events and Arts SU.
    hero: {
      ratio: "3/2",
      alt: "Interior spread — the ID card queue",
      src: "/work/ual-welcome-booklets/01-university-of-the-arts-img-4125.webp",
    },
    gallery: [
      {
        ratio: "3/2",
        alt: "Interior spread — the wayfinding map",
        src: "/work/ual-welcome-booklets/02-map.webp",
      },
      {
        ratio: "3/2",
        alt: "Covers — six colour-ways",
        src: "/work/ual-welcome-booklets/03-university-of-the-arts-img-4074.webp",
      },
      {
        ratio: "3/2",
        alt: "Six covers — laid flat",
        src: "/work/ual-welcome-booklets/04-university-of-the-arts-img-4111.webp",
      },
      {
        ratio: "3/2",
        alt: "Wimbledon College of Arts, next to the shared cover design",
        src: "/work/ual-welcome-booklets/05-university-of-the-arts-img-4037.webp",
      },
      {
        ratio: "3/2",
        alt: "Central Saint Martins, next to the shared cover design",
        src: "/work/ual-welcome-booklets/07-university-of-the-arts-img-4040.webp",
      },
      {
        ratio: "3/2",
        alt: "Spines — Welcome Guide 2017/18",
        src: "/work/ual-welcome-booklets/08-university-of-the-arts-img-4043.webp",
      },
      {
        ratio: "3/2",
        alt: "Interior spread — the market stall",
        src: "/work/ual-welcome-booklets/09-university-of-the-arts-img-4128.webp",
      },
      {
        ratio: "3/2",
        alt: "Interior spread — the library page",
        src: "/work/ual-welcome-booklets/10-university-of-the-arts-img-4067.webp",
      },
      {
        ratio: "3/2",
        alt: "Interior spread — moving in",
        src: "/work/ual-welcome-booklets/11-university-of-the-arts-img-4054.webp",
      },
      {
        ratio: "3/2",
        alt: "Interior spread — Commonplace, Events and Arts SU",
        src: "/work/ual-welcome-booklets/12-university-of-the-arts-img-4071.webp",
      },
      {
        ratio: "3/2",
        alt: "Interior spread — a student's own words",
        src: "/work/ual-welcome-booklets/13-university-of-the-arts-img-4129.webp",
      },
    ],
  },
  {
    slug: "voxi-pride",
    title: "Voxi Pride",
    client: "VOXI by Vodafone",
    year: 2019,
    discipline: "Pride Campaign",
    deliverables: "Phone Cases · Flags · Pins · Social · Tees",
    categories: ["Pride", "Character"],
    summary: "Eleven characters, cut into pins, flags, cases and tees.",
    heroCaption: "",
    brief: [
      "For VOXI, a side brand of Vodafone, I designed a Pride campaign and merchandise for the LGBTQIA+ community — the same set of characters, built out across phone cases, flags, pins, social posts and tees.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Client", name: "VOXI by Vodafone" },
    ],
    hero: {
      // True ratio (3.3657), not the site's usual 16/10 — the "Endless
      // Love" banner crop of the full cast.
      ratio: "2400/713",
      alt: "The full \"Endless Love\" banner artwork for VOXI's Pride campaign",
      src: "/work/voxi-pride/01-banner.webp",
    },
    // True ratio (0.7998) — a fresh 4/5 export, replacing the old 3/4
    // portrait poster crop.
    cardRatio: "4/5",
    cardImage: {
      ratio: "4/5",
      alt: "Full cast, cropped for the card",
      src: "/work/voxi-pride/02-card.webp",
    },
    // Explicit, not getCardHoverImage's default (first gallery image) —
    // Josh wants the phone case as the /work hover swap specifically.
    cardHoverImage: {
      ratio: "1/1",
      alt: "VOXI × Josh McKenna, on a phone case",
      src: "/work/voxi-pride/07-phone.webp",
    },
    // Uniform two-column grid (see GalleryGrid) rather than the usual
    // two-up-then-full-width stack — six true-square images read better
    // even, and it puts the two merch shots (phone case, pins) in their
    // own row at the end instead of mixed in with the artwork.
    galleryLayout: "grid",
    gallery: [
      {
        ratio: "1/1",
        alt: "Endless Love — framed square",
        src: "/work/voxi-pride/03-vox-9.webp",
      },
      {
        ratio: "1/1",
        alt: "VOXI tile — the leopard print",
        src: "/work/voxi-pride/04-vox-10.webp",
      },
      {
        ratio: "1/1",
        alt: "VOXI tile — the peace sign",
        src: "/work/voxi-pride/05-vox-11.webp",
      },
      {
        ratio: "1/1",
        alt: "Endless Love — the kiss",
        src: "/work/voxi-pride/06-vox-12.webp",
      },
      {
        ratio: "1/1",
        alt: "VOXI × Josh McKenna, on a phone case",
        src: "/work/voxi-pride/07-phone.webp",
      },
      {
        ratio: "1/1",
        alt: "The artwork on pin badges",
        src: "/work/voxi-pride/08-pins.webp",
      },
    ],
  },
  {
    slug: "beefbar-posters",
    title: "Beefbar",
    client: "Beefbar",
    year: 2017,
    yearLabel: "2017–Present Day",
    pinnedRank: 7,
    discipline: "Illustration",
    deliverables: "Illustrated Poster & Menu Design",
    categories: ["Hospitality", "Character"],
    summary: "One new poster, every time Beefbar opens somewhere new. Still counting.",
    heroCaption: "The Monte Carlo poster — Beefbar's flagship, part of the ongoing series.",
    brief: [
      "Every new Beefbar opening gets a poster, designed by me — one per city, taking cues from whatever's actually there: Baku's Flame Towers, Comporta's dunes, the local landmarks and culture. The same artwork doubles as the menu cover. This is a selection, not the full series.",
      "Only the 'beefbar' script and the city's name stay fixed across every poster. Everything else comes from the place itself — Malta's is set inside the dining room instead of out on the street.",
    ],
    credits: [{ role: "Graphic Design & Illustration", name: "Josh McKenna" }],
    galleryLayout: "poster-grid",
    cardRatio: "12/17",
    // No cardImage override — used to be Luxembourg, because the /work
    // card's round-corner clip cut across whichever poster's own printed
    // border was showing and Baku's (the hero then) read badly there.
    // Monte Carlo (the hero now) is a no-border export, so it doesn't have
    // that problem; the /work card falls back to hero (getCardHoverImage,
    // lib/projects.ts) with no override needed.
    // True ratio (1358×1920 = 0.7073) snaps far closer to 12/17 (0.7059)
    // than to the ingester's auto-picked 3/4 (0.75, a 5.9% crop) — 12/17
    // also matches every other poster in this grid.
    hero: {
      ratio: "12/17",
      alt: "Monte Carlo",
      src: "/work/beefbar-posters/01-monte-carlo-no-border.webp",
    },
    // Each poster's own printed border is part of the artwork, kept
    // visible — the grid runs square corners (see PosterGrid) instead of
    // cropping it out. Luxembourg leads (was the cardImage override, still
    // deserves prominence) so it lands second overall, right after Monte
    // Carlo the hero; everything after that stays chronological, per Josh.
    gallery: [
      {
        ratio: "12/17",
        alt: "Luxembourg",
        src: "/work/beefbar-posters/05-luxembourg.webp",
      },
      {
        ratio: "12/17",
        alt: "Baku",
        src: "/work/beefbar-posters/01-baku-02.webp",
      },
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
    pinnedRank: 6,
    discipline: "Festival Identity",
    deliverables: "Branding · Banners · Wayfinding · Wristbands · Merch",
    categories: ["Pride"],
    // True ratio of the lockup cardImage (2700×2700, a true square crop of
    // the same artwork) — pinned explicitly rather than leaving it to
    // chance which cycle slot lands here (a slightly-off ratio would crop
    // "PRIDE 2024" at the edges).
    cardRatio: "1/1",
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
    // project page's own hero (above) is the photo. Solid lime-green
    // background, not the transparent key-art lockup this replaced — cover
    // fit needs no contain/canvas-letterbox workaround, and cardRatio holds
    // the frame at the art's true 1/1 so "PRIDE 2024" isn't cropped.
    cardImage: {
      ratio: "1/1",
      alt: "The LA Pride 2024 lockup",
      src: "/work/la-pride/01-la-pride-1x1.webp",
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
  },
  {
    slug: "sound-of-driving",
    title: "The Sound of Driving",
    client: "Personal",
    year: 2026,
    pinnedRank: 9,
    discipline: "Editorial Illustration",
    deliverables: "Key Art · Magazine Mockup",
    categories: ["Automotive", "Editorial"],
    summary: "A hot-pink electric sports car makes the case for keeping the noise.",
    heroCaption: "The finished key art.",
    brief: [
      "An editorial about the debate between rumbling exhaust notes and the futuristic hum of instant torque.",
    ],
    credits: [{ role: "Illustration", name: "Josh McKenna" }],
    // True ratio — pinned explicitly rather than left to RATIO_CYCLE, which
    // was giving this 1/1 by chance.
    cardRatio: "4/5",
    hero: {
      ratio: "4/5",
      alt: "\"Have EVs Killed the Sound of Driving?\" — the finished key art",
      src: "/work/sound-of-driving/03-final-hr.webp",
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
    pinnedRank: 11,
    discipline: "Illustration",
    deliverables: "Mural · Embroidered Jacket · Hand-Painted Bottles",
    categories: ["Mural"],
    // Standardized to 16/9 with the other landscape /work cards, not the
    // hero's true 1.5 — checked against the actual storefront shot,
    // nothing essential is cropped. Same fix as UAL Booklets above.
    cardRatio: "16/9",
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
];

/* ==========================================================================
   Access helpers — pages should use these, never `projects` directly.
   ========================================================================== */

/** Newest first, except any pinnedRank project sorts to the front first
 *  (lowest rank first) — see Project.pinnedRank. */
export function getAllProjects(): Project[] {
  return [...projects].sort((a, b) => {
    const rankA = a.pinnedRank ?? Infinity;
    const rankB = b.pinnedRank ?? Infinity;
    if (rankA !== rankB) return rankA - rankB;
    return b.year - a.year;
  });
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
