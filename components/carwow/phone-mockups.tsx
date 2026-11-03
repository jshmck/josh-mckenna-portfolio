import type { ReactNode } from "react";

import { ProjectVideo } from "@/components/work/project-video";

/*
 * Plain rounded device frame for the screen recordings. The still Story phones
 * are pre-rendered images (public/carwow/phone-*.webp, built by
 * scripts/mockups/), so this is the only phone drawn in code.
 */
function Phone({ children, ratio }: { children: ReactNode; ratio: string }) {
  return (
    <div
      className="w-full rounded-[2.2rem] bg-ink p-[7px] shadow-[0_24px_50px_-18px_rgb(0_0_0/0.45)]"
      style={{ aspectRatio: ratio }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[1.7rem] bg-canvas">
        {children}
      </div>
    </div>
  );
}

/** A screen recording that already shows the app interface, in a plain frame. */
export function RecordingPhone({
  src,
  poster,
  alt,
}: {
  src: string;
  poster: string;
  alt: string;
}) {
  return (
    <Phone ratio="9 / 17.2">
      <div className="absolute inset-0">
        <ProjectVideo
          video={{ src, poster, alt }}
          ratio="9/16"
          radius=""
          className="h-full w-full"
        />
      </div>
    </Phone>
  );
}
