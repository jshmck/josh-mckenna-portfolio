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

/**
 * True masonry: bin-packs cards into N columns from each card's already-
 * known aspect ratio, always placing the next card into whichever column
 * (or, for a 2-span card, whichever adjacent column pair) is currently
 * shortest — instead of CSS multi-column's `column-fill: balance`, which
 * estimates an "ideal" column height before it knows any card's real size.
 * When a tall card there (held to `break-inside-avoid`) doesn't fit that
 * estimate, the browser pushes it to the next column and leaves the gap it
 * would've filled sitting empty. That can't happen here — packing is
 * driven by a value we already have, not a guess the browser has to make
 * blind.
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

  const columnHeights = new Array(columnCount).fill(0);
  const placements: Placement[] = [];

  for (const item of items) {
    const span = Math.min(item.span ?? 1, columnCount);

    // Find whichever run of `span` adjacent columns has the smallest
    // shared starting height (the tallest of the two, for a 2-span item,
    // since its top edge has to clear both).
    let bestStart = 0;
    let bestHeight = Infinity;
    for (let start = 0; start <= columnCount - span; start++) {
      const rangeHeight = Math.max(...columnHeights.slice(start, start + span));
      if (rangeHeight < bestHeight) {
        bestHeight = rangeHeight;
        bestStart = start;
      }
    }

    const widthPx = span * ASSUMED_COLUMN_WIDTH + (span - 1) * GAP;
    const heightPx = widthPx / item.ratio;

    placements.push({
      key: item.key,
      node: item.node,
      top: bestHeight,
      left: `calc((100% - ${(columnCount - 1) * GAP}px) / ${columnCount} * ${bestStart} + ${bestStart * GAP}px)`,
      width: `calc((100% - ${(columnCount - 1) * GAP}px) / ${columnCount} * ${span} + ${(span - 1) * GAP}px)`,
    });

    for (let c = bestStart; c < bestStart + span; c++) {
      columnHeights[c] = bestHeight + heightPx + GAP;
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
