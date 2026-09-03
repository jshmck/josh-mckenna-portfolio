"use client";

import Image from "next/image";
import { useState } from "react";

type YouTubeEmbedProps = {
  /** The YouTube video id (the `v=` param), not a full URL. */
  videoId: string;
  /** Local poster under /public — the card makes no request to YouTube
   *  until someone actually presses play. */
  poster: string;
  alt: string;
};

/**
 * A click-to-load YouTube card for talks the site doesn't own the
 * recording of (Config is Figma's video, Nicer Tuesdays is It's Nice
 * That's) — embedding is the legitimate route where re-hosting the file
 * isn't. Until clicked it's just a local poster in the same rounded
 * 16/9 frame as the self-hosted film cards (video cards are true 16/9,
 * not the image grid's 16/10, so player and poster fill the frame
 * exactly), so a visitor who never presses play never talks to YouTube
 * (no cookies, no player script); the youtube-nocookie host keeps the
 * post-click footprint down too. Playback is user-initiated, so no
 * reduced-motion guard is needed, and the lone hover transition is
 * neutralised by the global prefers-reduced-motion rule.
 */
export function YouTubeEmbed({ videoId, poster, alt }: YouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-frame bg-ink">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title={alt}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play: ${alt}`}
          className="group absolute inset-0"
        >
          <Image
            src={poster}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink/70 transition-transform duration-200 group-hover:scale-110"
          >
            <svg
              viewBox="0 0 24 24"
              className="ml-1 h-6 w-6 fill-canvas"
            >
              <path d="M7 4.5v15l13-7.5-13-7.5Z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
