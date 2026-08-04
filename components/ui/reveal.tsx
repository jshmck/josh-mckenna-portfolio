"use client";

import { useEffect, useRef, useState } from "react";

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
 * Uses IntersectionObserver rather than scroll listeners so it costs nothing
 * while idle, and unobserves after the first trigger: a reveal that replays
 * every time you scroll past reads as a glitch, not a flourish. Elements start
 * visible and are only hidden once JS confirms the observer is running, so a
 * failed hydration can never leave content invisible.
 */
export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    setArmed(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hidden = armed && !shown;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-[opacity,transform] duration-700 ease-drift ${
        hidden ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100"
      } ${className}`}
    >
      {children}
    </div>
  );
}
