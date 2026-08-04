"use client";

import { useEffect, useRef } from "react";

type RevealProps = {
  children: React.ReactNode;
  /** Stagger within a group, in ms. */
  delay?: number;
  className?: string;
};

/**
 * Fade + rise on first scroll into view — the "REVEAL" annotation on the
 * project detail wireframe.
 *
 * Deliberately holds no React state. The hidden and revealed looks are both
 * CSS, selected by the `data-reveal` attribute (see globals.css), and the
 * effect's only job is to flip that attribute when the observer fires — which
 * is what an effect is actually for: syncing an external system, not driving
 * renders.
 *
 * Three consequences worth keeping:
 * - No flash of visible content, because the hidden state is the CSS default
 *   rather than something JS has to apply after first paint.
 * - `prefers-reduced-motion` and `<noscript>` both un-hide via plain CSS, so
 *   content can never be stranded invisible if JS fails to run.
 * - The observer disconnects after the first trigger. A reveal that replays
 *   every time you scroll past reads as a glitch, not a flourish.
 */
export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.dataset.reveal = "shown";
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal="hidden"
      style={{ transitionDelay: `${delay}ms` }}
      className={className}
    >
      {children}
    </div>
  );
}
