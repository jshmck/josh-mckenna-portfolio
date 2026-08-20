"use client";

import Image from "next/image";
import { useRef } from "react";

/**
 * A static illustration (no orbit, no drift) that leans toward the cursor
 * on hover — same directional-tilt math as the homepage hero's floating
 * objects (components/home/drifting-hero.tsx), just without the rAF orbit
 * loop underneath it. Scale lives on the outer wrapper as a CSS
 * `hover:scale`; rotate is JS-driven on the inner node, same split the
 * hero uses so the two transforms (independent properties in Tailwind v4,
 * not bundled into one `transform`) don't fight each other.
 */

const MAX_TILT = 8;

type TiltIllustrationProps = {
  src: string;
  /** Empty by default (purely decorative, matching every other floating
   *  cut-out on the site) — pass a real string for one that isn't. */
  alt?: string;
  aspect: string;
  /**
   * Fixed dimension driving the box; the other follows from `aspect`.
   * Pass exactly one — `height` for a piece sized to its own scale (a
   * number, or a CSS length string like a clamp()), `width` for one that
   * should fill whatever space it's given (e.g. "100%" in a flex-1 slot).
   */
  height?: number | string;
  width?: number | string;
  /** Passed straight to next/image. Widen this if the rendered box is
   *  much bigger than the 190px default — otherwise the optimizer keeps
   *  serving a small candidate that ends up upscaled and soft. */
  sizes?: string;
};

export function TiltIllustration({
  src,
  alt = "",
  aspect,
  height,
  width,
  sizes = "190px",
}: TiltIllustrationProps) {
  const plateRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const plate = plateRef.current;
    if (!plate) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const relX = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const clamped = Math.max(-1, Math.min(1, relX));
    plate.style.rotate = `${-clamped * MAX_TILT}deg`;
  };

  const handlePointerLeave = () => {
    const plate = plateRef.current;
    if (!plate) return;
    plate.style.rotate = "0deg";
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative transition-[scale_300ms_var(--ease-drift)] hover:scale-[1.06]"
      style={{ aspectRatio: aspect, height, width }}
    >
      <div
        ref={plateRef}
        className="relative h-full w-full transition-[rotate_150ms_ease-out]"
      >
        <Image src={src} alt={alt} fill sizes={sizes} className="object-contain" />
      </div>
    </div>
  );
}
