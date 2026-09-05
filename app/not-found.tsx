import Image from "next/image";
import Link from "next/link";

import { PageEndCard } from "@/components/ui/page-end-card";

/**
 * App Router's dedicated 404 — renders for any unmatched route, no route
 * segment of its own. Pato (the confused dog from the hero orbit) stands in
 * for the visitor who took a wrong turn, on the same gentle bob the rest of
 * the site's decorative art uses.
 */
export default function NotFound() {
  return (
    <PageEndCard>
      <section className="mx-auto flex max-w-frame flex-col items-center px-6 pb-32 pt-24 text-center md:px-gutter md:pt-32">
        <div
          aria-hidden="true"
          className="relative w-40 animate-[bob_4s_ease-in-out_infinite] md:w-56"
          style={{ aspectRatio: "0.8" }}
        >
          <Image
            src="/illustrations/objects/pato.webp"
            alt=""
            fill
            sizes="(max-width: 768px) 160px, 224px"
            priority
            className="object-contain"
          />
        </div>

        <h1 className="type-heading mt-8 text-ink">404</h1>

        <p className="type-lede mt-4 max-w-md text-ink-muted">This page doesn&apos;t exist.</p>

        {/* Same pill treatment as the filter chips / HOWDY submit button
            (components/work/work-gallery.tsx, components/contact/enquiry-form.tsx) —
            ink outline -> brand outline on hover, filled brand/canvas on active. */}
        <Link
          href="/"
          className="font-grotesque mt-10 rounded-full border border-ink px-4 py-[9.5px] text-[11px] leading-none font-semibold uppercase tracking-[0.02em] text-ink-muted text-trim-caps transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:border-brand hover:text-brand active:border-brand active:bg-brand active:text-canvas"
        >
          Home
        </Link>
      </section>
    </PageEndCard>
  );
}
