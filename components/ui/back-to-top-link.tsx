"use client";

/**
 * The subtle, inline successor to the retired BackToTop pill — "i think
 * there should be a back to top for web projects, but something more
 * subtle," per Josh, with "all inline, nothing fixed" as the chosen
 * shape: a plain caption-voice text button sitting in normal flow at
 * the end of a project page, no frost, no fixed positioning, no
 * appearance threshold. Client component solely for the scrollTo —
 * which omits an explicit `behavior` so the sitewide scroll-behavior
 * CSS (and its reduced-motion override) decides smooth vs instant,
 * same as the old pill did. Hover treatment is the breadcrumb Work
 * link's own (scale + bold), keeping every caption-line interactive in
 * one voice.
 */
export function BackToTopLink() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0 })}
      className="type-label inline-block text-ink transition-[font-weight,transform] duration-200 ease-in-out hover:scale-105 hover:font-bold hover:duration-300 hover:ease-drift"
    >
      Back to top ↑
    </button>
  );
}
