import { marqueeWords } from "@/lib/site";

/**
 * Infinite marquee band — "Always drawing ● Never still", scrolling left.
 *
 * Pure CSS, no JS: the word list is rendered twice inside a track that
 * translates -50%, so the second copy lands exactly where the first started
 * and the loop is seamless. `prefers-reduced-motion` freezes it via the global
 * rule in globals.css.
 */
export function Marquee() {
  const sequence = [...marqueeWords, ...marqueeWords, ...marqueeWords];

  return (
    <section
      aria-hidden="true"
      className="overflow-hidden border-y border-hairline bg-ink py-7"
    >
      <div
        className="flex w-max animate-[marquee_22s_linear_infinite] items-center gap-8"
        style={{ willChange: "transform" }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center gap-8">
            {sequence.map((word, index) => (
              <span key={`${copy}-${index}`} className="flex items-center gap-8">
                <span className="type-display shrink-0 text-[clamp(1.5rem,3.4vw,2.75rem)] text-canvas">
                  {word}
                </span>
                <span
                  className="size-2 shrink-0 rounded-full bg-accent"
                  role="presentation"
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
