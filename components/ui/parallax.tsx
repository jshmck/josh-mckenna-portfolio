"use client";

import { useEffect, useRef } from "react";

type ParallaxProps = {
  children: React.ReactNode;
  /**
   * Scroll multiplier. The wireframe specifies 0.85× for the signature
   * illustration — below 1 the element trails the page.
   */
  speed?: number;
  className?: string;
};

/**
 * Scroll parallax for a single element.
 *
 * Reads layout inside a rAF and writes the transform in the same frame, so it
 * never interleaves reads and writes across frames (which is what causes
 * layout thrash on scroll). The scroll listener only ever sets a flag.
 */
export function Parallax({
  children,
  speed = 0.85,
  className = "",
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let queued = false;

    const update = () => {
      queued = false;
      const rect = node.getBoundingClientRect();
      // Distance of the element's centre from the viewport's centre.
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
      node.style.transform = `translate3d(0, ${offset * (speed - 1)}px, 0)`;
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
