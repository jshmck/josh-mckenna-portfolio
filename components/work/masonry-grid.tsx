"use client";

import { useEffect, useState } from "react";

/** Matches the site's existing md/lg breakpoints (columns-1 md:columns-2
 *  lg:columns-3, the CSS multi-column approach this replaces). */
const LG_BREAKPOINT = 1024;
const MD_BREAKPOINT = 768;

function getColumnCount() {
  if (typeof window === "undefined") return 1;
  if (window.innerWidth >= LG_BREAKPOINT) return 3;
  if (window.innerWidth >= MD_BREAKPOINT) return 2;
  return 1;
}

const GAP = 32; // px, matches gap-8

/** Stand-in column width for converting a ratio into a comparable height —
 *  see the component doc comment for why the actual on-screen pixel width
 *  never needs to be known for bin-packing to be correct. ~420px is
 *  representative of a real column at the 3-column breakpoint (1344px
 *  frame, two 32px gaps, /3); used unchanged at every column count since
 *  it only has to be internally consistent, not match the real viewport. */
const ASSUMED_COLUMN_WIDTH = 420;

export type MasonryItem = {
  key: string;
  /** width / height — used to compute the card's height at a shared
   *  column width; the actual pixel width never needs to be known since
   *  every column (or pair, for a 2-span item) is compared like-for-like. */
  ratio: number;
  /** Columns wide. 2 renders across two adjacent columns (clamped to 1
   *  whenever there's only a single column to give it). Defaults to 1. */
  span?: 1 | 2;
  /** True when the card's own image renders on the canvas surface (Plate's
   *  `fit: "contain"` letterbox) rather than filling the frame — two of
   *  these side by side both show the same page-background colour, so the
   *  seam between them disappears and the pair reads as one big empty gap.
   *  See pack()'s adjacency check, which refuses to seat one of these next
   *  to another. */
  transparent?: boolean;
  node: React.ReactNode;
};

type MasonryGridProps = {
  items: MasonryItem[];
};

type Placement = {
  key: string;
  node: React.ReactNode;
  left: string;
  top: number;
  width: string;
};

/** Items considered at each step when deciding what to place next — see
 *  `pack()` below. Large enough to find a good filler for a stalled 2-span
 *  item without turning this into a full reorder of the whole grid. */
const LOOKAHEAD = 6;

type Packed = {
  key: string;
  node: React.ReactNode;
  col: number;
  span: number;
  top: number;
  height: number;
  transparent?: boolean;
};

function verticallyOverlaps(aTop: number, aHeight: number, bTop: number, bHeight: number): boolean {
  return aTop < bTop + bHeight && bTop < aTop + aHeight;
}

/** True if seating a transparent item at (start..start+span, top..top+height)
 *  would put it directly beside another already-placed transparent item —
 *  same row band, neighbouring column. Only the immediate left/right
 *  neighbour columns matter; two transparent cards stacked in the same
 *  column read as separate cards (there's a real gap between them), only
 *  side-by-side is the failure mode. */
function seatsAdjacentTransparent(
  placed: Packed[],
  start: number,
  span: number,
  top: number,
  height: number,
): boolean {
  const neighbours = [start - 1, start + span];
  return placed.some((p) => {
    if (!p.transparent) return false;
    if (!verticallyOverlaps(top, height, p.top, p.height)) return false;
    return neighbours.includes(p.col) || (p.span === 2 && neighbours.includes(p.col + 1));
  });
}

/**
 * Bin-packs `items` into `columnCount` columns, returning each one's
 * column-relative (start, top, height) in px at ASSUMED_COLUMN_WIDTH.
 *
 * Doesn't just walk `items` in strict order and place each one wherever it
 * currently fits best — a first-fit pass like that has a real failure
 * mode once 2-span cards are mixed in: a 2-span card can only start once
 * *both* columns it needs have caught up, so if it's next in the queue
 * while one column is still short, that column sits empty waiting for it
 * even though a later 1-span card would have filled the wait perfectly.
 * That's not a hypothetical — it's exactly what /work's pinned order
 * produced (a 2-span card stranding a shorter column behind it).
 *
 * Instead, at each step this looks at the next `LOOKAHEAD` not-yet-placed
 * items and scores each by how much *dead space* placing it now would
 * leave elsewhere (its start height minus the shortest column's current
 * height) — ties broken by queue position, so items only jump ahead of
 * each other when doing so actually closes a gap. Original order (the
 * pinned rank Josh set) is the default; it only yields when strictly
 * placing in order would strand a column.
 *
 * A second, harder constraint sits on top: a `transparent` item (Plate's
 * `fit: "contain"` letterbox, matching the page background) is never
 * seated directly beside another transparent item — two of those next to
 * each other read as one big empty hole, not two cards. Candidates that
 * would violate it are excluded from the dead-space comparison entirely,
 * not just penalised, so gap-avoidance can't override it — unless every
 * candidate in the window would violate it, in which case the rule yields
 * rather than stalling the layout.
 */
function pack(items: MasonryItem[], columnCount: number): Packed[] {
  const columnHeights = new Array(columnCount).fill(0);
  const remaining = [...items];
  const placements: Packed[] = [];

  while (remaining.length > 0) {
    const windowSize = Math.min(remaining.length, LOOKAHEAD);
    const candidates = [];

    for (let i = 0; i < windowSize; i++) {
      const item = remaining[i];
      const span = Math.min(item.span ?? 1, columnCount);

      let bestStart = 0;
      let bestTop = Infinity;
      for (let start = 0; start <= columnCount - span; start++) {
        const rangeHeight = Math.max(...columnHeights.slice(start, start + span));
        if (rangeHeight < bestTop) {
          bestTop = rangeHeight;
          bestStart = start;
        }
      }

      const widthPx = span * ASSUMED_COLUMN_WIDTH + (span - 1) * GAP;
      const heightPx = widthPx / item.ratio;
      const deadSpace = bestTop - Math.min(...columnHeights);
      const blocked =
        item.transparent && seatsAdjacentTransparent(placements, bestStart, span, bestTop, heightPx);

      candidates.push({ i, start: bestStart, top: bestTop, height: heightPx, span, deadSpace, blocked });
    }

    // Prefer candidates that don't violate the transparency rule; only
    // fall back to a violating one if every option in the window would.
    const allowed = candidates.filter((c) => !c.blocked);
    const pool = allowed.length > 0 ? allowed : candidates;

    let pick = pool[0];
    for (const c of pool) {
      // Dead space dominates the score; queue position only breaks ties
      // between options that leave the same (usually zero) dead space.
      if (c.deadSpace * 1000 + c.i < pick.deadSpace * 1000 + pick.i) pick = c;
    }

    const [item] = remaining.splice(pick.i, 1);
    placements.push({
      key: item.key,
      node: item.node,
      col: pick.start,
      span: pick.span,
      top: pick.top,
      height: pick.height,
      transparent: item.transparent,
    });

    for (let c = pick.start; c < pick.start + pick.span; c++) {
      columnHeights[c] = pick.top + pick.height + GAP;
    }
  }

  return placements;
}

/**
 * True masonry: bin-packs cards into N columns from each card's already-
 * known aspect ratio (see `pack()` above for how it avoids stranding a
 * column behind a stalled 2-span card) — instead of CSS multi-column's
 * `column-fill: balance`, which estimates an "ideal" column height before
 * it knows any card's real size. When a tall card there (held to
 * `break-inside-avoid`) doesn't fit that estimate, the browser pushes it
 * to the next column and leaves the gap it would've filled sitting empty.
 * That can't happen here — packing is driven by values we already have,
 * not a guess the browser has to make blind.
 *
 * Renders via absolute positioning rather than N independent flex columns
 * — a 2-span card straddles two columns, so no single column's own flex
 * flow can own it; every card needs a real computed (left, top, width)
 * instead. Position/size are expressed with CSS calc() mixing % (so the
 * grid stays fluid on resize) and a fixed px GAP, the standard formula for
 * "N equal columns with fixed gaps between them."
 *
 * Column count is viewport-driven (1 / 2 / 3) and only knowable client-
 * side, so the very first paint defaults to 1 column before the mount
 * effect below corrects it — cards visibly settle into their real columns
 * a moment after the page loads or the filter changes, rather than being
 * columned from the first frame. That's the accepted cost of not having a
 * real viewport width before JS runs, per Josh.
 */
export function MasonryGrid({ items }: MasonryGridProps) {
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const update = () => setColumnCount(getColumnCount());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const packed = pack(items, columnCount);
  const placements: Placement[] = packed.map((p) => ({
    key: p.key,
    node: p.node,
    top: p.top,
    left: `calc((100% - ${(columnCount - 1) * GAP}px) / ${columnCount} * ${p.col} + ${p.col * GAP}px)`,
    width: `calc((100% - ${(columnCount - 1) * GAP}px) / ${columnCount} * ${p.span} + ${(p.span - 1) * GAP}px)`,
  }));

  const columnHeights = new Array(columnCount).fill(0);
  for (const p of packed) {
    for (let c = p.col; c < p.col + p.span; c++) {
      columnHeights[c] = Math.max(columnHeights[c], p.top + p.height + GAP);
    }
  }
  const containerHeight = Math.max(0, Math.max(...columnHeights) - GAP);

  return (
    <div className="relative" style={{ height: containerHeight }}>
      {placements.map((p) => (
        <div key={p.key} className="absolute" style={{ left: p.left, top: p.top, width: p.width }}>
          {p.node}
        </div>
      ))}
    </div>
  );
}
