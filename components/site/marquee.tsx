import { marqueeWords } from "@/lib/site";

/**
 * Infinite marquee band — "ALWAYS DRAWING ● NEVER STILL", scrolling left.
 * Words alternate Waldeck weight (regular / black) and the separator dot is
 * the purple display accent, per the wireframe annotation.
 *
 * Pure CSS, no JS: the word list is rendered twice inside a track that
 * translates -50%, so the second copy lands exactly where the first started
 * and the loop is seamless. `prefers-reduced-motion` freezes it via the global
 * rule in globals.css.
 */
export function Marquee() {
  const sequence = [...marqueeWords, ...marqueeWords, ...marqueeWords];

  return (
    <section aria-hidden="true" className="overflow-hidden bg-brand py-8">
      <div
        className="flex w-max animate-[marquee_22s_linear_infinite] items-center gap-8"
        style={{ willChange: "transform" }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center gap-8">
            {sequence.map((word, index) => (
              <span key={`${copy}-${index}`} className="flex items-center gap-8">
                <span
                  className="type-title shrink-0 text-canvas"
                  style={{ fontWeight: index % 2 === 0 ? 500 : 900 }}
                >
                  {word}
                </span>
                <span
                  className="size-2.5 shrink-0 rounded-full bg-accent"
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
