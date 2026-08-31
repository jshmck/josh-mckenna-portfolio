"use client";

import { useEffect, useRef, useState } from "react";

import { sequenceStates } from "@/lib/about";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * The pinned "decomposing illustration" section from the About wireframe.
 *
 * One illustration made of six fragments. As the visitor scrolls the section,
 * the fragments pull apart, scatter, and leave — resolving into the four
 * annotated states (Intact → Separating → Scattering → Handoff).
 *
 * The pinning is native `position: sticky` inside a tall wrapper, so the
 * browser owns it. JS only maps scroll offset to a 0–1 progress value, writes
 * fragment transforms straight to the DOM, and updates React state four times
 * total — once per state change — rather than on every frame.
 *
 * With reduced motion or no JS, the fragments stay in their intact
 * composition and all four captions render as a static list, which is exactly
 * how the wireframe presents them side by side.
 */

/** Where each fragment travels to, as a fraction of the stage box. */
const FRAGMENTS = [
  { x: -0.62, y: -0.34, rotate: -24, ratio: 1.3, width: 0.3, left: 0.06, top: 0.1 },
  { x: 0.58, y: -0.4, rotate: 19, ratio: 0.85, width: 0.24, left: 0.66, top: 0.04 },
  { x: -0.5, y: 0.46, rotate: 15, ratio: 1.5, width: 0.28, left: 0.1, top: 0.56 },
  { x: 0.66, y: 0.38, rotate: -21, ratio: 1, width: 0.26, left: 0.63, top: 0.52 },
  { x: 0.04, y: -0.7, rotate: 30, ratio: 1.1, width: 0.2, left: 0.4, top: 0.02 },
  { x: -0.08, y: 0.72, rotate: -16, ratio: 1.25, width: 0.22, left: 0.39, top: 0.6 },
];

export function DecomposeSequence() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fragmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [stage, setStage] = useState(0);

  /* Drives layout, not just whether a listener is attached, so it has to be a
     rendered value rather than a check inside the effect. */
  const animated = !useReducedMotion();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !animated) return;

    let raf = 0;
    let queued = false;
    let lastStage = -1;

    const update = () => {
      queued = false;

      const rect = wrapper.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;

      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);

      // Ease the scatter so the first third reads as a gentle separation
      // rather than an immediate explosion.
      const eased = progress * progress;

      for (let i = 0; i < FRAGMENTS.length; i += 1) {
        const fragment = FRAGMENTS[i];
        const node = fragmentRefs.current[i];
        if (!node) continue;

        node.style.transform = `translate3d(${fragment.x * eased * 100}%, ${
          fragment.y * eased * 100
        }%, 0) rotate(${fragment.rotate * eased}deg)`;
        // Fragments fade out over the back half — by 100% the frame is empty.
        node.style.opacity = String(Math.max(0, 1 - Math.max(0, progress - 0.45) * 2.2));
      }

      const nextStage = Math.min(
        sequenceStates.length - 1,
        Math.floor(progress * sequenceStates.length),
      );
      if (nextStage !== lastStage) {
        lastStage = nextStage;
        setStage(nextStage);
      }
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
  }, [animated]);

  return (
    <section
      ref={wrapperRef}
      aria-label="How an illustration comes apart"
      className={animated ? "relative h-[400vh]" : "relative"}
    >
      <div
        className={
          animated
            ? "sticky top-0 flex h-screen items-center overflow-hidden"
            : "flex items-center py-20"
        }
      >
        <div className="mx-auto grid w-full max-w-frame items-center gap-12 px-6 md:grid-cols-[1fr_320px] md:px-gutter">
          {/* Stage */}
          <div className="relative aspect-[5/4] w-full">
            {FRAGMENTS.map((fragment, index) => (
              <div
                key={index}
                ref={(node) => {
                  fragmentRefs.current[index] = node;
                }}
                aria-hidden="true"
                className="absolute rounded-[40px] bg-placeholder will-change-transform"
                style={{
                  width: `${fragment.width * 100}%`,
                  aspectRatio: String(fragment.ratio),
                  left: `${fragment.left * 100}%`,
                  top: `${fragment.top * 100}%`,
                }}
              />
            ))}
          </div>

          {/* Captions */}
          <div>
            <p className="type-label text-ink-muted">Scroll sequence</p>

            {animated ? (
              <div className="mt-6">
                <p className="type-label text-accent">
                  {stage + 1} / {sequenceStates.length}
                </p>
                <h3 className="type-heading mt-3 text-ink">
                  {sequenceStates[stage].label}
                </h3>
                <p className="type-lede mt-4 text-ink-muted">
                  {sequenceStates[stage].caption}
                </p>
              </div>
            ) : (
              <ol className="mt-6 space-y-6">
                {sequenceStates.map((state, index) => (
                  <li key={state.label}>
                    <p className="type-label text-accent">
                      {index + 1} / {sequenceStates.length}
                    </p>
                    <h3 className="mt-1.5 font-body text-lg font-medium text-ink">
                      {state.label}
                    </h3>
                    <p className="mt-1 text-[15px] text-ink-muted">
                      {state.caption}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
