import type { ImageRatio } from "@/lib/projects";

/**
 * /lab — the experiments page. A loose collage of cut-outs and posters that
 * can be dragged about (and stay where they're dropped) and shuffled.
 *
 * This file is the whole content seam for the page: which artwork appears,
 * how big, and the scatter maths that decides where it lands. Everything
 * points at files that already ship with the site, nothing is copied. To add
 * a piece, drop the artwork anywhere under public/ and add a line below.
 */

type LabBase = {
  id: string;
  src: string;
  /** width / height of the artwork. */
  aspect: number;
  /** Width in stage units. One unit is 1% of the stage's shorter side
   *  (see `.lab-stage` in globals.css), so the collage keeps its proportions
   *  at any window size. */
  size: number;
  /** Left out below md, where the full set would be a pile, not a collage. */
  desktopOnly?: boolean;
};

export type LabPiece =
  /** An alpha WebP/PNG drawn as-is, no frame. */
  | (LabBase & { kind: "cutout" })
  /** A full-bleed rectangle, rendered through Plate with square corners.
   *  `ratio` is Plate's ratio token, so it has to be one Plate knows. */
  | (LabBase & { kind: "poster"; ratio: ImageRatio });

const O = "/illustrations/objects";
const W = "/work";

export const labPieces: LabPiece[] = [
  // Cut-outs — the same alpha artwork the homepage hero drifts.
  { id: "car", kind: "cutout", src: `${O}/car-super-n-body-honda.webp`, aspect: 1.178, size: 30 },
  { id: "citroen", kind: "cutout", src: `${O}/citroen-2cv-cutout.webp`, aspect: 2.403, size: 34 },
  { id: "face", kind: "cutout", src: `${O}/josh-face-2.webp`, aspect: 1.103, size: 21 },
  { id: "hand", kind: "cutout", src: `${O}/hand-air-2.webp`, aspect: 0.9, size: 19 },
  { id: "flowers", kind: "cutout", src: `${O}/flowers.webp`, aspect: 1.112, size: 24 },
  { id: "hat", kind: "cutout", src: `${O}/cowboy-hat.webp`, aspect: 1.331, size: 23 },
  { id: "pato", kind: "cutout", src: `${O}/pato.webp`, aspect: 0.8, size: 19, desktopOnly: true },
  { id: "pride", kind: "cutout", src: `${O}/pride-sticker.webp`, aspect: 0.781, size: 16, desktopOnly: true },
  { id: "yeti", kind: "cutout", src: `${O}/yeti-cooler.webp`, aspect: 0.8, size: 19, desktopOnly: true },
  { id: "chair", kind: "cutout", src: `${O}/chair-vitra-virgil-4.webp`, aspect: 0.866, size: 19, desktopOnly: true },
  { id: "tin", kind: "cutout", src: `${W}/piper-heidsieck/01-tin-v2.webp`, aspect: 0.586, size: 14, desktopOnly: true },

  // Posters — real print pieces, kept to the ratios Plate already knows.
  { id: "baku", kind: "poster", src: `${W}/beefbar-posters/01-baku-02.webp`, aspect: 0.707, ratio: "707/1000", size: 20 },
  { id: "meribel", kind: "poster", src: `${W}/beefbar-posters/07-meribel.webp`, aspect: 0.707, ratio: "707/1000", size: 20 },
  { id: "la-pride", kind: "poster", src: `${W}/la-pride/01-la-pride-2x3-v2.webp`, aspect: 0.667, ratio: "2/3", size: 19 },
  { id: "rodeo", kind: "poster", src: `${W}/levis-rainbow-rodeo/01-poster-v2.webp`, aspect: 0.8, ratio: "4/5", size: 20 },
  { id: "underground", kind: "poster", src: `${W}/figma-underground/01-underground-final-hr.webp`, aspect: 0.8, ratio: "4/5", size: 19, desktopOnly: true },
  { id: "proud", kind: "poster", src: `${W}/bershka/01-we-are-proud-hero.webp`, aspect: 0.5625, ratio: "9/16", size: 15 },
  { id: "monaco", kind: "poster", src: `${W}/beefbar-posters/08-monaco.webp`, aspect: 0.707, ratio: "707/1000", size: 21, desktopOnly: true },
  { id: "santorini", kind: "poster", src: `${W}/beefbar-posters/11-santorini.webp`, aspect: 0.707, ratio: "707/1000", size: 20, desktopOnly: true },
  { id: "rimowa", kind: "poster", src: `${W}/figma-rimowa/01-rimowa2.webp`, aspect: 0.8, ratio: "4/5", size: 19, desktopOnly: true },
  { id: "vitra", kind: "poster", src: `${W}/figma-vitra-virgil/01-vitgr-hr3.webp`, aspect: 0.8, ratio: "4/5", size: 19, desktopOnly: true },
  { id: "cowboy", kind: "poster", src: `${W}/cowboy/02-cowboy-full-hr.webp`, aspect: 0.8, ratio: "4/5", size: 18, desktopOnly: true },
  { id: "voxi", kind: "poster", src: `${W}/voxi-pride/02-card.webp`, aspect: 0.8, ratio: "4/5", size: 19, desktopOnly: true },
];

/** Maximum resting tilt either side of upright, degrees. Cut-outs can lean
 *  further than posters, which read as paper and look wrong at a jaunty angle. */
export const LAB_TILT = { cutout: 10, poster: 6 } as const;

/* ---------------------------------------------------------------------------
   Scatter
   --------------------------------------------------------------------------- */

/** Seeded PRNG (mulberry32). The server render has to be deterministic, so it
 *  can never touch Math.random; the browser swaps in real randomness after
 *  mount, in an effect. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** An item's footprint in pixels, and how far it may lean. */
export type Box = { w: number; h: number; tilt: number };

/** Where an item sits. `fx`/`fy` are 0–1 across the stage's *free range*
 *  (stage size minus the item's own), so 0 is flush left/top and 1 is flush
 *  right/bottom. Fractions, not pixels, so a resize keeps every item inside
 *  the stage with no JS: the CSS turns them into a translate. */
export type Placement = { fx: number; fy: number; rot: number; z: number };

/** A rectangle in stage pixels. */
export type Rect = { x: number; y: number; w: number; h: number };

/** Where the big lowercase labels sit on a desktop stage, as fractions of it.
 *  Only used when the caller can't measure the real thing (the server render);
 *  the browser passes the labels' actual rectangles instead, which is what
 *  keeps this right on a phone, where "mckenna" spans three quarters of the
 *  width. A soft penalty, not a wall: a poster tucked under a word is part of
 *  the look, but the first impression should still read. */
const DEFAULT_ZONES: { x0: number; y0: number; x1: number; y1: number }[] = [
  { x0: 0, y0: 0, x1: 0.3, y1: 0.26 },
  { x0: 0.78, y0: 0, x1: 1, y1: 0.1 },
  { x0: 0, y0: 0.82, x1: 0.46, y1: 1 },
  { x0: 0.72, y0: 0.82, x1: 1, y1: 1 },
];

/** Random positions tried per item; the least-overlapping one wins. */
const CANDIDATES = 32;

function overlap(a: Rect, b: Rect) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

/**
 * Best-candidate scatter. Biggest items go first, each trying a handful of
 * uniformly random spots and keeping the one that covers the least of what's
 * already down (and of the label zones). That keeps the coverage even without
 * making it a grid: overlaps still happen, they just don't pile into one heap.
 * Stacking order is shuffled independently, so the biggest piece isn't always
 * underneath.
 */
export function scatter(
  boxes: Box[],
  stage: { w: number; h: number },
  rand: () => number,
  /** Label rectangles to steer clear of. Defaults to a desktop guess. */
  labelZones?: Rect[],
): Placement[] {
  const zones: Rect[] =
    labelZones ??
    DEFAULT_ZONES.map((z) => ({
      x: z.x0 * stage.w,
      y: z.y0 * stage.h,
      w: (z.x1 - z.x0) * stage.w,
      h: (z.y1 - z.y0) * stage.h,
    }));
  const order = boxes
    .map((_, i) => i)
    .sort((a, b) => boxes[b].w * boxes[b].h - boxes[a].w * boxes[a].h);

  const placed: Rect[] = [];
  const out: Placement[] = new Array(boxes.length);

  for (const i of order) {
    const box = boxes[i];
    const area = box.w * box.h;
    // A zero-size item (hidden at this breakpoint) takes no space and has
    // nothing to avoid; it still needs *a* placement so the CSS vars exist.
    if (area <= 0) {
      out[i] = { fx: rand(), fy: rand(), rot: 0, z: 0 };
      continue;
    }

    const freeW = Math.max(stage.w - box.w, 0);
    const freeH = Math.max(stage.h - box.h, 0);
    let best: { cost: number; fx: number; fy: number; rect: Rect } | null = null;

    for (let c = 0; c < CANDIDATES; c += 1) {
      const fx = rand();
      const fy = rand();
      const rect = { x: fx * freeW, y: fy * freeH, w: box.w, h: box.h };
      let cost = 0;
      for (const other of placed) {
        cost += overlap(rect, other) / Math.min(area, other.w * other.h);
      }
      for (const zone of zones) cost += (1.5 * overlap(rect, zone)) / area;
      if (!best || cost < best.cost) best = { cost, fx, fy, rect };
    }

    // CANDIDATES is a positive constant, so `best` is always set by here.
    const pick = best!;
    placed.push(pick.rect);
    out[i] = { fx: pick.fx, fy: pick.fy, rot: (rand() * 2 - 1) * box.tilt, z: 0 };
  }

  // Stacking order: a Fisher-Yates shuffle of 1..n, independent of size.
  const stack = boxes.map((_, i) => i + 1);
  for (let i = stack.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [stack[i], stack[j]] = [stack[j], stack[i]];
  }
  out.forEach((placement, i) => {
    placement.z = stack[i];
  });

  return out;
}

/** The layout the server renders (and a no-JS visitor sees): the same scatter,
 *  against an assumed 1440×800 desktop stage and a fixed seed, so it is
 *  identical on every request. The browser replaces it on mount. */
export function initialLayout(pieces: LabPiece[]): Placement[] {
  // 0.9cqmin of an 800px-tall stage: the desktop `--lab-unit` in globals.css.
  const unit = 7.2;
  return scatter(
    pieces.map((piece) => ({
      w: piece.size * unit,
      h: (piece.size * unit) / piece.aspect,
      tilt: LAB_TILT[piece.kind],
    })),
    { w: 1440, h: 800 },
    mulberry32(20261126),
  );
}
