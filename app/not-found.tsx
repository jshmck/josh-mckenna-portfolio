import Image from "next/image";

import { ButtonLink } from "@/components/ui/button";

/**
 * App Router's dedicated 404 — renders for any unmatched route, no route
 * segment of its own. Pato (the confused dog from the hero orbit) turns up
 * lost, on the same gentle bob the rest of the site's decorative art uses.
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

      <h2 className="type-heading mt-4 text-ink">Wrong turn somewhere.</h2>
      <p className="type-lede mt-4 max-w-md text-ink-muted">
        This page wandered off and hasn&apos;t been seen since. Let&apos;s
        get you back to the good stuff.
      </p>

      <ButtonLink href="/" className="mt-10">
        Back to home
      </ButtonLink>
    </section>
  );
}
