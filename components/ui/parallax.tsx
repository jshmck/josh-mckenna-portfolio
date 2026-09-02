"use client";

import { useEffect, useRef } from "react";

type ParallaxProps = {
  children: React.ReactNode;
  /**
   * Scroll multiplier. The wireframe specifies 0.85× for the signature
   * illustration — below 1 the element trails the page.
   */
  speed?: number;
  /**
   * Clamp on the shift, px either direction. Unbounded by default (Home's
   * signature image has generous surrounding whitespace, so a large shift
   * is fine). Grids with tight gaps between items need this set — otherwise
   * an element far from the viewport centre can drift far enough to detach
   * from its own layout position and overlap a neighbour.
   */
  maxOffset?: number;
  /**
   * Tighter clamp below md (768px), when set. Elements drift *toward* the
   * viewport centre (see the offset math below), so two vertically
   * adjacent parallaxed elements straddling the centre CONVERGE — by up
   * to 2×clamp combined. A gap that comfortably absorbs that on desktop
   * can be smaller than it on a phone: the work gallery's 8px mobile gap
   * against the cards' 12px clamp meant up to 16px of genuine overlap
   * mid-scroll ("i dont want them to overlap as you scroll though so set
   * a minimum padding," per Josh). The guaranteed minimum visual padding
   * between neighbours is gap − 2×(effective clamp) — callers with tight
   * mobile gaps set this so that number stays positive.
   */
  mobileMaxOffset?: number;
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
  maxOffset = Infinity,
  mobileMaxOffset,
  className = "",
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Checked per frame rather than once — rotation/resize across the md
    // boundary should swap clamps without needing its own listener; the
    // cached query object makes the per-frame read effectively free.
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    let raf = 0;
    let queued = false;

    const update = () => {
      queued = false;
      const cap =
        mobileMaxOffset !== undefined && mobileQuery.matches ? mobileMaxOffset : maxOffset;
      const rect = node.getBoundingClientRect();
      // Distance of the element's centre from the viewport's centre.
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
      const clamped = Math.max(-cap, Math.min(cap, offset * (speed - 1)));
      node.style.transform = `translate3d(0, ${clamped}px, 0)`;
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
  }, [speed, maxOffset, mobileMaxOffset]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
