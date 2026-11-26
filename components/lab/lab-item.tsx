import Image from "next/image";
import type { CSSProperties } from "react";

import { Plate } from "@/components/ui/plate";
import { LAB_TILT, type LabPiece, type Placement } from "@/lib/lab";

/** Pieces run ~14-34% of the stage's shorter side, so on desktop none is
 *  wider than about a fifth of the window; a phone gets half. Both land on
 *  the 640 rung of the image ladder (next.config.ts), one transformation each. */
const SIZES = "(max-width: 767px) 50vw, 20vw";

/**
 * One piece of the /lab collage. A server component: it only describes the
 * item. Everything that moves it lives in lab-stage.tsx, which finds these by
 * their `data-lab-item` attribute and writes `--fx` / `--fy` / `--rot` (see
 * `.lab-item` in globals.css).
 *
 * The placement baked in here is the fixed, seeded one from `initialLayout`:
 * it is what a no-JS visitor sees, and what the HTML says before the browser
 * swaps in a random scatter. Decorative and `aria-hidden`, like the homepage
 * hero's objects; the shuffle button is the keyboard-operable control.
 *
 * Two wrappers on purpose. The outer one owns position (a translate; the
 * shuffle glide is switched on by the stage, see `.lab-stage[data-glide]` in
 * globals.css); the inner one owns lean and lift (`rotate`, `scale`), so a
 * drag's lift never fights a shuffle's travel. The inner also carries the
 * entrance, hidden until the stage flags itself ready.
 */
export function LabItem({
  piece,
  placement,
}: {
  piece: LabPiece;
  placement: Placement;
}) {
  const style = {
    "--s": piece.size,
    "--a": piece.aspect,
    "--fx": placement.fx,
    "--fy": placement.fy,
    "--rot": `${placement.rot}deg`,
    zIndex: placement.z,
  } as CSSProperties;

  // Hidden-on-phone pieces stay lazy, so a phone never downloads them
  // (a display:none lazy image is never fetched); everything else is the page.
  const loading = piece.desktopOnly ? "lazy" : "eager";

  return (
    <div
      data-lab-item=""
      data-lab-tilt={LAB_TILT[piece.kind]}
      aria-hidden="true"
      style={style}
      className={`lab-item absolute left-0 top-0 cursor-grab touch-none select-none will-change-transform data-[held]:cursor-grabbing ${piece.desktopOnly ? "max-md:hidden" : ""}`}
    >
      <div className="opacity-0 [rotate:var(--rot)] transition-[scale_200ms_var(--ease-drift),rotate_700ms_var(--ease-bounce)] [animation-delay:calc(var(--i,0)*30ms)] group-data-[ready]/stage:animate-[lab-rise_600ms_var(--ease-drift)_both] in-data-[held]:scale-[1.06] noscript:opacity-100">
        {piece.kind === "poster" ? (
          <Plate
            image={{ ratio: piece.ratio, src: piece.src, alt: "" }}
            radius="rounded-none"
            sizes={SIZES}
            loading={loading}
          />
        ) : (
          <div className="relative" style={{ aspectRatio: String(piece.aspect) }}>
            <Image
              src={piece.src}
              alt=""
              fill
              sizes={SIZES}
              loading={loading}
              draggable={false}
              className="object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}
