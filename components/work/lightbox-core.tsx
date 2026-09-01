"use client";

import { useEffect, useState } from "react";

import type { ProjectImage } from "@/lib/projects";

export type LightboxDirection = "next" | "prev" | null;

export type LightboxState = {
  images: ProjectImage[];
  openIndex: number | null;
  direction: LightboxDirection;
  openImage: ProjectImage | null;
  openAt: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  close: () => void;
};

/**
 * Open/close/cycle state and Escape/Arrow keyboard handling behind every
 * lightbox on the site — HeroLightbox, ImageStack, GalleryGrid and
 * PosterGrid all drive their dialog off one instance of this hook (see
 * LightboxOverlay), so keyboard nav, slide direction and body-scroll
 * locking can't drift between them.
 */
export function useLightboxState(images: ProjectImage[]): LightboxState {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // null = fresh open (bouncy pop-in); set on every arrow/keyboard nav so the
  // next frame slides in from the direction of travel instead of hard-cutting.
  const [direction, setDirection] = useState<LightboxDirection>(null);

  const goNext = () => {
    setDirection("next");
    setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
  };
  const goPrev = () => {
    setDirection("prev");
    setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
  };
  const openAt = (index: number) => {
    setDirection(null);
    setOpenIndex(index);
  };
  const close = () => setOpenIndex(null);

  useEffect(() => {
    if (openIndex === null) return;

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenIndex(null);
      if (event.key === "ArrowRight" && images.length > 1) {
        setDirection("next");
        setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
      }
      if (event.key === "ArrowLeft" && images.length > 1) {
        setDirection("prev");
        setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex, images.length]);

  const openImage = openIndex === null ? null : (images[openIndex] ?? null);

  return { images, openIndex, direction, openImage, openAt, goNext, goPrev, close };
}
