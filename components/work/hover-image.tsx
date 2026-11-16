"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/** The crossfade image on a Work card. Rendered empty until the visitor first
 *  hovers or focuses the card (the nearest `.group` ancestor), so it is never
 *  requested for cards nobody touches. Every `/_next/image` request counts
 *  against Vercel's Image Optimization cache-read quota, and these used to
 *  load for every card scrolled past, doubling the cost of the grid. */
export function HoverImage({
  src,
  sizes,
  position,
}: {
  src: string;
  sizes: string;
  position?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const card = ref.current?.closest(".group");
    if (!card) return;
    const arm = () => setArmed(true);
    card.addEventListener("pointerenter", arm, { once: true });
    card.addEventListener("focusin", arm, { once: true });
    return () => {
      card.removeEventListener("pointerenter", arm);
      card.removeEventListener("focusin", arm);
    };
  }, []);

  return (
    <span ref={ref} className="contents">
      {armed && (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
          style={{ objectPosition: position }}
        />
      )}
    </span>
  );
}
