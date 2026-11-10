"use client";

import { Children, useRef, useState, type ReactNode } from "react";

/**
 * A row of images that is side by side from md and, on a phone, a swipe
 * carousel where every slide is the full width of the column: the first image
 * is its normal size, with no sliver of the next one showing at the edge. With
 * nothing peeking in to hint that it swipes, small dots under the row (phones
 * only) show how many slides there are and which one you're on.
 *
 * The scrolling and snapping are CSS (.swipe-phone in globals.css). The only
 * state is the active dot, set when the slide index changes, which is the one
 * thing a visitor reads, never per scroll frame.
 */
export function SwipeRow({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = Children.count(children);

  const onScroll = () => {
    const el = scroller.current;
    if (!el || el.children.length < 2) return;
    const first = el.children[0] as HTMLElement;
    const second = el.children[1] as HTMLElement;
    const step = second.offsetLeft - first.offsetLeft;
    if (step <= 0) return;
    const next = Math.min(count - 1, Math.max(0, Math.round(el.scrollLeft / step)));
    if (next !== active) setActive(next);
  };

  return (
    <div>
      <div ref={scroller} className={className} onScroll={onScroll}>
        {children}
      </div>
      {count > 1 && (
        <div aria-hidden="true" className="mt-3 flex justify-center gap-1.5 md:hidden">
          {Array.from({ length: count }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i === active ? "bg-ink" : "bg-ink/25"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
