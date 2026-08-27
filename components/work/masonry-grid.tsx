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
 */
function pack(
  items: MasonryItem[],
  columnCount: number,
): { key: string; node: React.ReactNode; col: number; span: number; top: number; height: number }[] {
  const columnHeights = new Array(columnCount).fill(0);
  const remaining = [...items];
  const placements: { key: string; node: React.ReactNode; col: number; span: number; top: number; height: number }[] = [];

  while (remaining.length > 0) {
    let pickIndex = 0;
    let pickScore = Infinity;
    let pickStart = 0;
    let pickTop = 0;

    const windowSize = Math.min(remaining.length, LOOKAHEAD);
    for (let i = 0; i < windowSize; i++) {
      const span = Math.min(remaining[i].span ?? 1, columnCount);

      let bestStart = 0;
      let bestTop = Infinity;
      for (let start = 0; start <= columnCount - span; start++) {
        const rangeHeight = Math.max(...columnHeights.slice(start, start + span));
        if (rangeHeight < bestTop) {
          bestTop = rangeHeight;
          bestStart = start;
        }
      }

      const deadSpace = bestTop - Math.min(...columnHeights);
      // Dead space dominates the score; queue position only breaks ties
      // between options that leave the same (usually zero) dead space.
      const score = deadSpace * 1000 + i;
      if (score < pickScore) {
        pickScore = score;
        pickIndex = i;
        pickStart = bestStart;
        pickTop = bestTop;
      }
    }

    const [item] = remaining.splice(pickIndex, 1);
    const span = Math.min(item.span ?? 1, columnCount);
    const widthPx = span * ASSUMED_COLUMN_WIDTH + (span - 1) * GAP;
    const heightPx = widthPx / item.ratio;

    placements.push({ key: item.key, node: item.node, col: pickStart, span, top: pickTop, height: heightPx });

    for (let c = pickStart; c < pickStart + span; c++) {
      columnHeights[c] = pickTop + heightPx + GAP;
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
