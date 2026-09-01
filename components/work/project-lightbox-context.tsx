"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useLightboxState, type LightboxState } from "@/components/work/lightbox-core";
import { LightboxOverlay } from "@/components/work/lightbox-overlay";
import type { ProjectImage } from "@/lib/projects";

const ProjectLightboxContext = createContext<LightboxState | null>(null);

/**
 * Wraps a project page's hero-through-gallery region in one shared
 * lightbox cycle. `images` is the full project sequence in page order —
 * hero (+ heroPair/heroThird) first, then the gallery — so opening any
 * image, whether it sits above the write-up or below it, pages through
 * every image in the project rather than just its own section. Renders the
 * one shared dialog once, for every descendant that opens it.
 *
 * Not used by PosterGrid (`galleryLayout: "poster-grid"`) — that layout
 * already combines hero + gallery into one array with no write-up split in
 * between, so it manages its own lightbox state directly.
 */
export function ProjectLightboxProvider({
  images,
  children,
}: {
  images: ProjectImage[];
  children: ReactNode;
}) {
  const state = useLightboxState(images);

  return (
    <ProjectLightboxContext.Provider value={state}>
      {children}
      <LightboxOverlay state={state} />
    </ProjectLightboxContext.Provider>
  );
}

export function useProjectLightbox() {
  const context = useContext(ProjectLightboxContext);
  if (!context) {
    throw new Error("useProjectLightbox must be used within a ProjectLightboxProvider");
  }
  return context;
}
