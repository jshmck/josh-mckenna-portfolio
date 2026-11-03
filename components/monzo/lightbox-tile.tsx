"use client";

import type { CSSProperties, ReactNode } from "react";

import { useProjectLightbox } from "@/components/work/project-lightbox-context";

/**
 * A tile that opens the page's shared lightbox at `index`. With `r` it is a
 * member of a same-height row (see .height-row in globals.css), which sizes
 * it from its own aspect ratio.
 */
export function LbTile({
  index,
  label,
  r,
  className = "",
  children,
}: {
  index: number;
  label: string;
  r?: number;
  className?: string;
  children: ReactNode;
}) {
  const { openAt } = useProjectLightbox();
  return (
    <button
      type="button"
      onClick={() => openAt(index)}
      aria-label={`Open larger view of ${label}`}
      className={`block cursor-zoom-in text-left ${className}`}
      style={r ? ({ "--r": r } as CSSProperties) : undefined}
    >
      {children}
    </button>
  );
}
