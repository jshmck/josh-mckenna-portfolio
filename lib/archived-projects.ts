import type { Project } from "./projects";

/**
 * Projects pulled from display but kept intact for later reinstatement —
 * "remove LGBT centre project (archive it somewhere but don't want it
 * displayed rn)," per Josh. Only /archive imports this file — Josh's own
 * unlinked, noindexed shelf ("a hidden place that i can bring back
 * easily," see app/archive/page.tsx); nothing here prerenders a
 * /work/<slug> route or appears in the /work grid. Restoring a project
 * is moving its entry back into the `projects` array in lib/projects.ts
 * at the spot it should display (array order IS the gallery order now —
 * see getAllProjects). Artwork stays put in public/work/<slug>/ so a
 * restore needs no asset work.
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
    // Icons category retired 2026-09-18 (see PROJECT_CATEGORIES) — tag
    // removed so this entry stays restorable as-is.
    categories: [],
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
  {
    // Single overview sheet for now — Josh was redrawing the set in a
    // new style when this was still live; if it's ever restored, the
    // individual stickers may exist by then.
    //
    // Archived the day after "bring it's all love by google way down to
    // the bottom of the gallery" moved it to the very end of the
    // projects array — it was the gallery's last card, unpinned, when
    // Josh pulled it entirely. Its old HSBC (19) / Voxi (20) square-row
    // groupmates were already a duo by then.
    slug: "its-all-love",
    title: "It's All Love",
    client: "Google",
    // TRIAL: the original confirmed example for this whole mechanism —
    // see Project.cardTitle.
    cardLabel: "Google",
    year: 2017,
    discipline: "Stickers & Iconography",
    deliverables: "Sticker Set · 24 Stickers",
    // Icons category retired 2026-09-18 (see PROJECT_CATEGORIES) — tag
    // removed so this entry stays restorable as-is.
    categories: ["LGBTQ+"],
    summary: "Twenty-four stickers for Google: hair flicks, butt slaps and one wedding.",
    heroCaption: "The full 24-sticker set, designed for Google's global sticker programme, 2017.",
    brief: [
      "In 2017, Anyways commissioned a Pride sticker set for Google, part of its ongoing global sticker programme: twenty-four stickers, from a finger snap to a full lesbian wedding.",
      "The set went on to win an Applied Arts Photography & Illustration Award in the Conceptual Illustration category, Spring 2018.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Agency", name: "Anyways" },
      { role: "Client", name: "Google" },
    ],
    // /work card only, per Josh — a four-sticker composite on a solid
    // light-pink fill, so the card gets a real surface instead of the
    // overview sheet's transparent float. The project page above keeps
    // the full sheet; this never renders there. Pinned to its true 1/1
    // ("make sure it stays at 1/1") so RATIO_CYCLE can't crop it.
    cardRatio: "1/1",
    cardImage: {
      ratio: "1/1",
      alt: "Four stickers from the set",
      src: "/work/its-all-love/04-hero-light.webp",
    },
    // Rainbow_2 flattened onto the composite's own pink (sampled
    // 255/230/246) — the hover overlay renders with no surface of its
    // own, so a transparent sticker would float over the four-sticker
    // card instead of replacing it.
    cardHoverImage: {
      ratio: "1/1",
      alt: "The rainbow sticker",
      src: "/work/its-all-love/05-rainbow-hover-light.webp",
    },
    hero: {
      ratio: "1/1",
      alt: "The full sticker set",
      src: "/work/its-all-love/01-overview-01.webp",
      // Transparent PNG — same fix as the Instagram sticker's hero:
      // contain sits on bg-canvas, so no placeholder tone shows through
      // the transparent background.
      fit: "contain",
    },
    gallery: [],
  },
  {
    // Archived per Josh ("archive ace & tate"), not deleted — artwork
    // stays in public/work/ace-tate-logo/ so a restore needs no asset
    // work. The hero's position: "80% 50%" crop-shift only mattered for
    // the /work grid's forced-4/5 dense frame; harmless on restore.
    slug: "ace-tate-logo",
    title: "Ace & Tate",
    client: "Ace & Tate",
    // TRIAL: "Re/Viewed > Ace & Tate," per Josh — the actual series name
    // this ran under ("re/viewed", see the brief below). See
    // Project.cardTitle.
    cardTitle: "Re/Viewed",
    cardLabel: "Ace & Tate",
    year: 2019,
    discipline: "Illustration",
    deliverables: "1 Illustration",
    // Icons category retired 2026-09-18 (see PROJECT_CATEGORIES) — tag
    // removed so this entry stays restorable as-is.
    categories: [],
    summary: "Ace & Tate's ampersand, redrawn as a seated figure.",
    heroCaption: "For \"re/viewed,\" Ace & Tate's series inviting illustrators to reinterpret their logo, 2019.",
    brief: [
      "Ace & Tate asked me to reinterpret their logo for \"re/viewed,\" a series putting the brand mark in different illustrators' hands. At the time I was drawing voluptuous, feminine characters almost exclusively, so I went looking for her inside the ampersand.",
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
      // The figure sits right-of-centre in the square source (its own
      // hand almost touches the right edge); a dead-centre crop into the
      // /work grid's forced-4/5 dense frame cropped that hand off while
      // leaving empty red on the left. Shifts the crop window right to
      // keep the whole figure in frame either way — no effect on the
      // project page, where this renders at its native 1/1 with nothing
      // cropped.
      position: "80% 50%",
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
    // Archived per Josh (the 2026-09-18 batch, browsable on /archive),
    // not deleted — artwork stays in public/work/ so a restore is just
    // moving this entry back into lib/projects.ts at the right spot.
    slug: "bum-selfie",
    title: "Bum Selfie",
    client: "Cake Boy Magazine",
    // TRIAL: plain client label, title unchanged — see Project.cardTitle.
    cardLabel: "Cake Boy Magazine",
    year: 2020,
    discipline: "Editorial Illustration",
    deliverables: "2 illustrations",
    categories: [],
    summary: "Two ways to photograph your own arsehole.",
    heroCaption: "",
    brief: [
      "Cake Boy magazine wanted a two-part illustration for a feature on the different ways to photograph your own arsehole.",
    ],
    credits: [{ role: "Illustration", name: "Josh McKenna" }],
    cardRatio: "4/5",
    hero: {
      ratio: "4/5",
      alt: "An updated version",
      src: "/work/bum-selfie/02-butt-selfie-2.webp",
    },
    gallery: [
      {
        ratio: "4/5",
        alt: "Bend over",
        src: "/work/bum-selfie/03-bend-over-4-5.webp",
      },
    ],
    featured: false,
  },

  {
    // Archived per Josh (the 2026-09-18 batch, browsable on /archive),
    // not deleted — artwork stays in public/work/ so a restore is just
    // moving this entry back into lib/projects.ts at the right spot.
    slug: "mini-animation",
    title: "Mini Animation",
    client: "Personal",
    year: 2017,
    discipline: "Illustration & Animation",
    deliverables: "1 animation",
    categories: ["Cars", "Motion"],
    summary: "A Mini convertible, animated for a five-second loop.",
    heroCaption: "A held frame from the animation, 2017.",
    brief: [
      "A personal animation exercise: a Mini convertible driving past palm trees on a five-second loop.",
    ],
    credits: [{ role: "Illustration, Animation & Creative Direction", name: "Josh McKenna" }],
    // True 16/9 (source is 1220x686) on the project page; cropped to 1/1
    // on the /work card per Josh.
    cardRatio: "1/1",
    // The whole piece is the animation — the grid card plays it rather
    // than sitting on the still frame like every other video-backed card.
    cardVideo: true,
    hero: {
      ratio: "16/9",
      alt: "The Mini, mid-drive",
      src: "/work/mini-animation/01-mini-driving-hero.webp",
    },
    heroVideo: {
      src: "/work/mini-animation/02-mini-driving.mp4",
      alt: "The Mini animation, looping",
      ratio: "16/9",
    },
    gallery: [],
  },

  {
    // Archived per Josh (the 2026-09-18 batch, browsable on /archive),
    // not deleted — artwork stays in public/work/ so a restore is just
    // moving this entry back into lib/projects.ts at the right spot.
    slug: "hikes-n-bikes",
    title: "Hikes n Bikes",
    client: "Hikes and Bikes LA",
    // TRIAL: "Wall Mural > Hikes and Bikes LA," per Josh — see
    // Project.cardTitle.
    cardTitle: "Wall Mural",
    cardLabel: "Hikes and Bikes LA",
    year: 2020,
    discipline: "Mural",
    deliverables: "1 mural",
    categories: ["Murals"],
    summary: "Seven cyclists and a peach, painted on a West Hollywood bike shop.",
    heroCaption:
      "Painted at La Cienega and Santa Monica Boulevards, West Hollywood, December 2020.",
    brief: [
      "The wall is the side of a bike-rental and organised-hike shop at the corner of La Cienega and Santa Monica Boulevards in West Hollywood, directly under a Kylie Jenner billboard. A few big shapes and five words: pump less gas, pump more...ass.",
    ],
    credits: [
      { role: "Illustration, Mural & Creative Direction", name: "Josh McKenna" },
      { role: "Client", name: "Hikes and Bikes LA" },
    ],
    // Pinned to the photo's true 4/5 so RATIO_CYCLE can't crop the
    // billboard out of the top of the card — the Kylie billboard is
    // the joke and has to survive the crop.
    cardRatio: "4/5",
    hero: {
      ratio: "4/5",
      alt: "The wall, under the Kylie Jenner billboard",
      src: "/work/hikes-n-bikes/01-mural-kylie-billboard.webp",
    },
    // The 15s ladder clip sits beside the finished-wall photo in the
    // hero two-up (Last Call precedent). Declared 4/5 to match the
    // hero's height — the source is a 9:16 phone clip, and the cover
    // crop trims sky and ground, not the ladder.
    heroVideo: {
      src: "/work/hikes-n-bikes/03-painting-process.mp4",
      alt: "Painting the peach's leaves, day one",
      position: "pair",
      ratio: "4/5",
    },
    // A lone gallery image defaults into the two-up row's left column at
    // half width — a wall-wide strip wants the full frame instead.
    gallerySpans: [{ startIndex: 0, count: 1 }],
    gallery: [
      {
        ratio: "25/11",
        // Transparent PNG — contain sits on bg-canvas so the
        // placeholder tone can't show through the background.
        fit: "contain",
        alt: "The full artwork — pump less gas, pump more",
        src: "/work/hikes-n-bikes/02-mural-artwork.webp",
      },
    ],
  },

  {
    // Archived per Josh (the 2026-09-18 batch, browsable on /archive),
    // not deleted — artwork stays in public/work/ so a restore is just
    // moving this entry back into lib/projects.ts at the right spot.
    slug: "womp-jimny",
    title: "Jimny",
    client: "Personal",
    year: 2026,
    // In the Womp 3D block closing this array — see Money Bench's own
    // comment.
    discipline: "3D Illustration",
    deliverables: "1 Turnaround · 3 Renders",
    categories: ["Cars", "3D", "Motion"],
    summary: "My favourite car, modelled in Womp.",
    heroCaption: "",
    brief: [
      "Modelled in Womp, a browser-based 3D tool. A gloopy, wompy homage to my favourite car, the Jimny.",
    ],
    credits: [{ role: "3D Illustration & Creative Direction", name: "Josh McKenna" }],
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
    // Archived per Josh (the 2026-09-18 batch, browsable on /archive),
    // not deleted — artwork stays in public/work/ so a restore is just
    // moving this entry back into lib/projects.ts at the right spot.
    slug: "perineum-sunning",
    title: "Perineum Sunning",
    client: "Personal",
    year: 2020,
    discipline: "Illustration",
    deliverables: "Key Art",
    categories: [],
    summary: "2020's strangest wellness trend.",
    heroCaption: "",
    brief: [
      "2020's wellness trend of the moment was perineum sunning: thirty seconds of direct sun, no shade.",
    ],
    credits: [{ role: "Illustration & Creative Direction", name: "Josh McKenna" }],
    cardRatio: "1/1",
    hero: {
      ratio: "1/1",
      alt: "Sunbathing, from an unusual angle",
      src: "/work/perineum-sunning/01-perineum-sunning.webp",
    },
    gallery: [],
    featured: false,
  },

  {
    // Archived per Josh (the 2026-09-18 batch, browsable on /archive),
    // not deleted — artwork stays in public/work/ so a restore is just
    // moving this entry back into lib/projects.ts at the right spot.
    slug: "tilda-rice",
    title: "Tilda Rice",
    client: "Tilda",
    // TRIAL: "Flavour Animations > Tilda Rice," per Josh — cardLabel
    // spells out the full "Tilda Rice" rather than falling back to the
    // bare client field. See Project.cardTitle.
    cardTitle: "Flavour Animations",
    cardLabel: "Tilda Rice",
    year: 2022,
    discipline: "Illustration",
    deliverables: "Illustrations for Animation",
    categories: ["Motion"],
    summary: "Illustrations for three animated Tilda ads, one per flavour.",
    heroCaption: "Illustration for three animated Tilda Rice ads (Katsu Curry, Indonesian Fried Rice and Masala), 2022.",
    brief: [
      "Tilda commissioned illustration work for a set of three animated ads, one per flavour (Katsu Curry, Indonesian Fried Rice and Masala), animated by Rave Growl via agency Havas.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Animation", name: "Rave Growl" },
      { role: "Agency", name: "Havas" },
      { role: "Client", name: "Tilda" },
    ],
    cardRatio: "1/1",
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
    // Posters are each flavour's own product shot — these clips have sound,
    // so they never autoplay, and without a poster the row sits on whatever
    // first frame the browser bothers to decode.
    videoRow: [
      {
        src: "/work/tilda-rice/katsu.mp4",
        alt: "Katsu Curry Rice animation",
        poster: "/work/tilda-rice/02-katsu-curry.webp",
        sound: true,
      },
      {
        src: "/work/tilda-rice/fried-rice.mp4",
        alt: "Indonesian Fried Rice animation",
        poster: "/work/tilda-rice/01-fried-rice.webp",
        sound: true,
      },
      {
        src: "/work/tilda-rice/masala.mp4",
        alt: "Masala Rice animation",
        poster: "/work/tilda-rice/03-masala-rice.webp",
        sound: true,
      },
    ],
    // The product shots moved onto the clips above as posters — an empty
    // gallery keeps them off the page body, but getCardHoverImage would
    // then find no second image, so the /work card's hover swap is pinned
    // to the same katsu shot it auto-picked when the gallery was here.
    cardHoverImage: {
      ratio: "1/1",
      alt: "Tilda Katsu Curry Rice packaging",
      src: "/work/tilda-rice/02-katsu-curry.webp",
    },
    gallery: [],
  },

  {
    // Archived per Josh (the 2026-09-18 batch, browsable on /archive),
    // not deleted — artwork stays in public/work/ so a restore is just
    // moving this entry back into lib/projects.ts at the right spot.
    slug: "comic-relief-sink-the-pink",
    title: "Comic Relief x Sink The Pink",
    client: "Comic Relief",
    clientPartner: "Sink The Pink",
    // TRIAL: "Pride Totes > Comic Relief," per Josh — see Project.cardTitle.
    cardTitle: "Pride Totes",
    cardLabel: "Comic Relief",
    year: 2020,
    discipline: "Pride Campaign",
    deliverables: "2 tote designs",
    categories: ["LGBTQ+"],
    summary: "Two couples in one embrace, printed for Red Nose Day. One ended up on a Spice Girl's shoulder.",
    heroCaption:
      "One of two couple pairings, printed onto canvas totes.",
    brief: [
      "Comic Relief, in partnership with Sink The Pink, commissioned tote bag artwork for Red Nose Day 2020: two couple pairings, printed across the range.",
    ],
    credits: [
      { role: "Illustration & Creative Direction", name: "Josh McKenna" },
      { role: "Client", name: "Comic Relief" },
      { role: "Partner", name: "Sink The Pink" },
    ],
    // True ratio (2000x2000) — pinned rather than left to RATIO_CYCLE's
    // chance assignment, same fix as the other unpinned cards found
    // alongside the Bum Selfie 3D report.
    cardRatio: "1/1",
    hero: {
      ratio: "1/1",
      alt: "Tote artwork — pairing one",
      src: "/work/comic-relief-sink-the-pink/01-tote-women.webp",
    },
    heroPair: {
      ratio: "1/1",
      alt: "Tote artwork — pairing two",
      src: "/work/comic-relief-sink-the-pink/02-tote-men.webp",
    },
    gallery: [
      {
        ratio: "1/1",
        alt: "Mel C, of the Spice Girls, posted this online",
        // Low-res screenshot — the original photo file is lost.
        small: true,
        src: "/work/comic-relief-sink-the-pink/03-mel-c-tote.webp",
      },
    ],
  },

  {
    // Archived per Josh (browsable on /archive), not deleted — artwork
    // stays in public/work/whatsapp/ so a restore is just moving this
    // entry back into lib/projects.ts at the right spot.
    slug: "whatsapp",
    title: "WhatsApp",
    client: "WhatsApp",
    // TRIAL: "Privacy Campaign > WhatsApp," per Josh — see
    // Project.cardTitle.
    cardTitle: "Privacy Campaign",
    cardLabel: "WhatsApp",
    year: 2018,
    discipline: "Campaign Illustration",
    deliverables: "2 illustrations",
    categories: [],
    summary: "Beach couples, for WhatsApp's campaign about private messaging.",
    heroCaption: "For WhatsApp's \"It's between you\" campaign, 2018.",
    brief: [
      "WhatsApp commissioned illustrations for \"It's between you,\" its campaign about private messaging: couples in close conversation under a parasol.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Client", name: "WhatsApp" },
    ],
    // Both source squares are true 1/1 — pinned so RATIO_CYCLE can't crop
    // the lockup. The campaign version leads, per Josh; the clean
    // illustration rides beside it.
    cardRatio: "1/1",
    hero: {
      ratio: "1/1",
      alt: "\"It's between you.\"",
      src: "/work/whatsapp/01-between-you.webp",
    },
    heroPair: {
      ratio: "1/1",
      alt: "Under the parasol",
      src: "/work/whatsapp/02-ladies.webp",
    },
    gallery: [],
  },

  {
    // Archived per Josh (browsable on /archive), not deleted — artwork
    // stays in public/work/away-pride-stickers/ so a restore is just
    // moving this entry back into lib/projects.ts at the right spot.
    slug: "away-pride-stickers",
    title: "Away",
    client: "Away",
    // TRIAL: "Pride Sticker Set > Away," per Josh — see Project.cardTitle.
    cardTitle: "Pride Sticker Set",
    cardLabel: "Away",
    year: 2019,
    discipline: "Pride Campaign",
    deliverables: "Sticker Set",
    categories: ["LGBTQ+"],
    summary: "Two couples, a rainbow and a sunbather, sized to fit on a suitcase.",
    heroCaption: "A set of five Pride stickers, available in Away's stores throughout Pride month, 2019.",
    brief: [
      "Away commissioned a set of five Pride stickers, available in-store throughout Pride month 2019. They looked great on the aluminium luggage.",
    ],
    credits: [
      { role: "Illustration", name: "Josh McKenna" },
      { role: "Client", name: "Away" },
    ],
    // The /work card leads with the luggage mockup now, per Josh — hover
    // swaps to the flat sticker set. True ratio (2000x2328, reduced
    // 250/291), matching cardImage so the card isn't cropped.
    cardRatio: "250/291",
    cardImage: {
      ratio: "250/291",
      alt: "The sticker set, applied to Away luggage",
      src: "/work/away-pride-stickers/01-sticker-luggage.webp",
    },
    cardHoverImage: {
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

];
