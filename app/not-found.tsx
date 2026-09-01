import Image from "next/image";
import Link from "next/link";

/**
 * App Router's dedicated 404 — renders for any unmatched route, no route
 * segment of its own. Pato (the confused dog from the hero orbit) stands in
 * for the visitor who took a wrong turn, on the same gentle bob the rest of
 * the site's decorative art uses.
 */
export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-frame flex-col items-center px-6 pb-32 pt-24 text-center md:px-gutter md:pt-32">
      <div
        aria-hidden="true"
        className="relative w-40 animate-[bob_4s_ease-in-out_infinite] md:w-56"
        style={{ aspectRatio: "0.8" }}
      >
        <Image
          src="/illustrations/objects/pato.png"
          alt=""
          fill
          sizes="(max-width: 768px) 160px, 224px"
          priority
          className="object-contain"
        />
      </div>

      <h1 className="type-display mt-8 text-accent">404</h1>

      <p className="type-lede mt-4 max-w-md text-ink-muted">This page doesn&apos;t exist.</p>

      {/* Same pill treatment as BackToTop (components/ui/back-to-top.tsx) —
          frosted glass, brand-blue inset wash, the same nav-pill-hover
          squash-and-stretch bounce — but static in the page flow rather
          than fixed/scroll-triggered, since this is the one thing on the
          page to press and should be visible immediately. */}
      <Link
        href="/"
        className="mt-10 rounded-full border border-transparent bg-canvas/15 px-8 py-5 font-body text-[18px] text-ink shadow-[inset_0_1px_8px_rgba(255,255,255,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3),inset_0_0_22px_color-mix(in_srgb,var(--color-brand)_32%,transparent)] backdrop-blur-md backdrop-saturate-150 transition-[color,background-color] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:animate-[nav-pill-hover_650ms_ease-in-out] hover:text-brand active:animate-[nav-pill-hover_650ms_ease-in-out] active:bg-brand active:text-canvas"
      >
        Back to home
      </Link>
    </section>
  );
}
