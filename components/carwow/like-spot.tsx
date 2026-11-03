"use client";

import { useState } from "react";

/** The phone screen inside its mockup image, as fractions of the image. */
const SCREEN = { left: 9.9, top: 3.78, width: 79.9, height: 92.06 };
/** The screen the ad was rendered on (see scripts/mockups). */
const RENDER = { w: 775, h: 1657 };

export type LikeBox = {
  /** `heart` fills red; `like` is the Facebook-style thumb + label; `count` is
   *  the video-site pill with a number. */
  kind: "heart" | "like" | "count";
  /** The baked-in control's position on the 775x1657 render, in px. */
  x: number;
  y: number;
  w: number;
  h: number;
};

const THUMB =
  "M7 11v9H3v-9zM7 11l4-8c1.5 0 2.5 1 2.5 2.5V9H20a1.5 1.5 0 0 1 1.5 1.8l-1.6 8A2 2 0 0 1 18 20.5H7";
const HEART =
  "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z";

/**
 * A live hit area laid over the like control baked into a phone mockup. Press
 * it and the control lights up (red heart, blue "Liked", or a count that goes
 * up by one) over the picture of the original. Just for fun; nothing is stored.
 * Sits inside a `relative [container-type:inline-size]` wrapper around the
 * image, so sizes in cqw scale with the phone.
 */
export function LikeSpot({ box }: { box: LikeBox }) {
  const [liked, setLiked] = useState(false);
  const pos = {
    left: `${SCREEN.left + (SCREEN.width * box.x) / RENDER.w}%`,
    top: `${SCREEN.top + (SCREEN.height * box.y) / RENDER.h}%`,
    width: `${(SCREEN.width * box.w) / RENDER.w}%`,
    height: `${(SCREEN.height * box.h) / RENDER.h}%`,
  };
  const icon = (fill: boolean, className: string, d: string) => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill={fill ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      onClick={() => setLiked((v) => !v)}
      className="absolute cursor-pointer"
      style={pos}
    >
      {liked && box.kind === "heart" && (
        <span
          key="heart"
          className="absolute -inset-[8%] flex animate-[heart-pop_320ms_ease-out] items-center justify-center text-like"
        >
          {icon(true, "h-full w-full", HEART)}
        </span>
      )}
      {liked && box.kind === "like" && (
        <span
          key="like"
          className="absolute -inset-x-[4%] -inset-y-[18%] flex items-center gap-[1.1cqw] bg-white pl-[0.5cqw] text-[2.6cqw] font-semibold text-brand"
        >
          {icon(
            true,
            "h-[4.1cqw] w-[4.1cqw] animate-[heart-pop_320ms_ease-out]",
            THUMB,
          )}
          Liked
        </span>
      )}
      {liked && box.kind === "count" && (
        <span
          key="count"
          className="absolute inset-0 flex items-center gap-[1.1cqw] rounded-full bg-neutral-200 pl-[2.7cqw] text-[2.5cqw] font-semibold text-ink"
        >
          {icon(
            true,
            "h-[4.1cqw] w-[4.1cqw] animate-[heart-pop_320ms_ease-out]",
            THUMB,
          )}
          13
        </span>
      )}
    </button>
  );
}
