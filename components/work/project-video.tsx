"use client";

import { useEffect, useRef } from "react";

type ProjectVideoProps = {
  video: { src: string; alt: string; poster?: string };
  /**
   * Silent clips (Jimny's turnaround) autoplay muted on loop — ambient,
   * no reason to wait for a click. A clip with real audio (Nomad Wheels'
   * promotional film) gets native controls instead and never autoplays:
   * browsers block autoplay-with-sound anyway, and forcing a visitor to
   * hear something they didn't ask for is the wrong call even where it's
   * technically allowed.
   */
  sound?: boolean;
  className?: string;
};

/**
 * Autoplay is a real motion concern the sitewide prefers-reduced-motion CSS
 * rule can't touch (it neutralises `animation` and `transition`, not native
 * video playback), so silent clips check the media query themselves and
 * stay paused on their first frame when the visitor has asked for reduced
 * motion. Sound clips never autoplay in the first place, so no guard is
 * needed there.
 */
export function ProjectVideo({ video, sound = false, className }: ProjectVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (sound) return;
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!reduceMotion) {
      node.play().catch(() => {});
    }
  }, [sound]);

  return (
    <video
      ref={ref}
      src={video.src}
      poster={video.poster}
      aria-label={video.alt}
      className={`aspect-video w-full rounded-3xl object-cover ${className ?? ""}`}
      muted={!sound}
      loop={!sound}
      controls={sound}
      playsInline
      preload="metadata"
    />
  );
}
