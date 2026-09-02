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

    // `overflow: hidden` on its own doesn't lock scroll on iOS Safari --
    // the page (and the fixed dialog sitting on top of it) can still be
    // dragged, and once that scroll starts, Safari's own dynamic toolbar
    // show/hide changes the visual viewport mid-gesture, which is what
    // was actually behind "something is up with the lightbox on
    // mobile... seems to have dropped off screen," per Josh -- LightboxOverlay's
    // own height math (see its useViewportSize) is computed once and
    // trusted, so a viewport that changes size out from under it renders
    // stale. Pinning the body itself in place (the standard iOS
    // scroll-lock technique) stops that scroll from ever starting, which
    // is more reliable than trying to chase every resulting layout
    // symptom individually. Position is captured/restored around the
    // fixed pin so closing the lightbox doesn't leave the page jumped to
    // the top.
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
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
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex, images.length]);

  const openImage = openIndex === null ? null : (images[openIndex] ?? null);

  return { images, openIndex, direction, openImage, openAt, goNext, goPrev, close };
}
