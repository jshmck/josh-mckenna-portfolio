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

/** 32px (gap-8) expressed in the same "1/ratio" unit bin-packing compares
 *  column heights in below — see the component doc comment for why an
 *  assumed width is good enough here. ~420px is a representative column
 *  width at the 3-column breakpoint (1344px frame, two 32px gaps, /3). */
const GAP_HEIGHT_UNIT = 32 / 420;

export type MasonryItem = {
  key: string;
  /** width / height — every column renders the same width, so this alone
   *  is enough to compare relative card heights for bin-packing; the
   *  actual pixel width never needs to be known. */
  ratio: number;
  node: React.ReactNode;
};

type MasonryGridProps = {
  items: MasonryItem[];
};

/**
 * True masonry: bin-packs cards into N columns from each card's already-
 * known aspect ratio, always placing the next card into the currently-
 * shortest column — instead of CSS multi-column's `column-fill: balance`,
 * which estimates an "ideal" column height before it knows any card's real
 * size. When a tall card there (held to `break-inside-avoid`) doesn't fit
 * that estimate, the browser pushes it to the next column and leaves the
 * gap it would've filled sitting empty. That can't happen here — packing
 * is driven by a value we already have, not a guess the browser has to
 * make blind.
 *
 * Column count is viewport-driven (1 / 2 / 3) and only knowable client-
 * side, so the very first paint defaults to 1 column before the mount
 * effect below corrects it — cards visibly settle into their real columns
 * a moment after the page loads or the filter changes, rather than being
 * columned from the first frame. That's the accepted cost of not having a
 * real viewport width before JS runs, per Josh (the previous CSS-only
 * approach had no reflow but couldn't reliably avoid gaps; this trades
 * one for the other).
 */
export function MasonryGrid({ items }: MasonryGridProps) {
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const update = () => setColumnCount(getColumnCount());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const columns: MasonryItem[][] = Array.from({ length: columnCount }, () => []);
  const columnHeights = new Array(columnCount).fill(0);

  for (const item of items) {
    const shortest = columnHeights.indexOf(Math.min(...columnHeights));
    columns[shortest].push(item);
    columnHeights[shortest] += 1 / item.ratio + GAP_HEIGHT_UNIT;
  }

  return (
    <div className="flex gap-8">
      {columns.map((column, i) => (
        <div key={i} className="flex flex-1 flex-col gap-8">
          {column.map((item) => (
            <div key={item.key}>{item.node}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
