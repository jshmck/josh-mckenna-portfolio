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

      <h2 className="type-heading mt-4 text-ink">You&apos;re lost.</h2>
      <p className="type-lede mt-4 max-w-md text-ink-muted">
        This page doesn&apos;t exist. One click and you&apos;re home.
      </p>

      {/* Same pill as the Work page's category filters (components/work/work-gallery.tsx)
          — filled/active look, since this is the one thing on the page to press. */}
      <Link
        href="/"
        className="font-display mt-10 rounded-full bg-brand px-4 py-2 text-[11px] font-waldeck-medium uppercase tracking-[0.02em] text-canvas transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105"
      >
        Back to home
      </Link>
    </section>
  );
}
