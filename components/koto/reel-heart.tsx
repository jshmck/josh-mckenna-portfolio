"use client";

import { useState } from "react";

/**
 * The Reel's heart: press it and it fills red with a little pop. Purely for
 * fun; nothing is stored.
 */
export function ReelHeart() {
  const [liked, setLiked] = useState(false);
  return (
    <button
      type="button"
      aria-label={liked ? "Unlike" : "Like"}
      aria-pressed={liked}
      onClick={() => setLiked((v) => !v)}
      className="pointer-events-auto cursor-pointer"
    >
      <svg
        viewBox="0 0 24 24"
        key={String(liked)}
        className={`h-[6.4cqw] w-[6.4cqw] ${liked ? "animate-[heart-pop_320ms_ease-out] fill-like stroke-like" : "fill-transparent stroke-current"}`}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
