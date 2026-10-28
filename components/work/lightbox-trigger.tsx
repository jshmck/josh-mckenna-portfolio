"use client";

import type { ReactNode } from "react";

import { useProjectLightbox } from "@/components/work/project-lightbox-context";

/**
 * Wraps a silent hero clip so a click opens it in the project's shared
 * lightbox, at `index` in the combined cycle (project-content.tsx puts the
 * clip straight after the hero image). Same hover lift and zoom-in cursor
 * as HeroLightbox's images. Not for clips with native controls — a click on
 * the control bar would open the dialog instead of scrubbing.
 */
export function LightboxTrigger({
  index,
  label,
  children,
}: {
  index: number;
  label: string;
  children: ReactNode;
}) {
  const { openAt } = useProjectLightbox();

  return (
    <button
      type="button"
      onClick={() => openAt(index)}
      aria-label={`Open larger view of ${label}`}
      className="group block w-full cursor-zoom-in text-left"
    >
      <div className="overflow-hidden rounded-frame">
        <div className="transition-transform duration-300 ease-drift group-hover:scale-[1.02]">
          {children}
        </div>
      </div>
    </button>
  );
}
