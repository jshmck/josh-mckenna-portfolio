import type { Metadata } from "next";
import Link from "next/link";

import { LabItem } from "@/components/lab/lab-item";
import { LabStage } from "@/components/lab/lab-stage";
import { initialLayout, labPieces } from "@/lib/lab";

/**
 * Experiments. Unlisted: noindex + nofollow (page metadata and an
 * X-Robots-Tag header in next.config.ts), no nav link, not in the sitemap.
 * Same arrangement as /lego and /koto — "unlisted", not "secret", since a
 * static site has no auth. Nothing here touches the real pages; delete
 * app/lab, components/lab, lib/lab.ts and the `type-lab` / `.lab-*` rules in
 * globals.css and the site is exactly as it was.
 *
 * The idea, borrowed from quentinchambry.com: a loose pile of cut-outs and
 * posters, big lowercase words in the corners, pieces you can pick up and put
 * down, and a shuffle. See components/lab/lab-stage.tsx for how it behaves.
 */
export const metadata: Metadata = {
  title: "Lab",
  description: "Experiments.",
  robots: { index: false, follow: false, nocache: true },
};

export default function LabPage() {
  const layout = initialLayout(labPieces);

  return (
    <LabStage>
      {/* The pile. Its own stacking context: pieces take z-indexes that keep
          climbing as they're picked up, and they must never get above the
          labels, which sit in the sibling layer after it. */}
      <div className="absolute inset-0 isolate">
        {labPieces.map((piece, i) => (
          <LabItem key={piece.id} piece={piece} placement={layout[i]} />
        ))}
      </div>

      {/* Labels. Ignore the pointer, so the pile underneath stays grabbable
          right up to the corners; only the links and the button opt back in.
          `data-lab-zone` marks what the scatter should steer clear of: the
          stage measures these rectangles itself, so it holds at any size. */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-gutter">
        <div className="flex items-start justify-between gap-6">
          <h1 data-lab-zone="" className="type-lab">
            josh
            <br />
            mckenna
            <span className="sr-only">, illustrator. Experiments.</span>
          </h1>
          <p
            data-lab-zone=""
            className="type-label pt-1 text-right max-md:max-w-[9rem]"
          >
            drag things about
            <br />
            click the gaps to shuffle
          </p>
        </div>

        <div className="flex items-end justify-between gap-6">
          {/* type-lab on the nav, not the links, so the gap's `em` is the big
              type's em and not the page's 16px. */}
          <nav
            data-lab-zone=""
            aria-label="Sections"
            className="type-lab pointer-events-auto flex flex-col md:flex-row md:gap-x-[0.3em]"
          >
            <Link href="/work" className="hover:text-accent">
              work
            </Link>
            <Link href="/info" className="hover:text-accent">
              info
            </Link>
            <Link href="/contact" className="hover:text-accent">
              contact
            </Link>
          </nav>
          <button
            type="button"
            data-lab-zone=""
            data-lab-shuffle=""
            className="type-lab pointer-events-auto hover:text-accent"
          >
            shuffle
          </button>
        </div>
      </div>
    </LabStage>
  );
}
