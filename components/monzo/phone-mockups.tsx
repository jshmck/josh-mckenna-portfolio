import Image from "next/image";

import { ReelHeart } from "@/components/monzo/reel-heart";
import { ReelPlayhead } from "@/components/monzo/reel-playhead";
import { ProjectVideo } from "@/components/work/project-video";

/*
 * A screen recording inside the iPhone mockup. The frame is a transparent
 * cut-out (public/monzo/phone-frame.webp, built by scripts/mockups/) whose
 * screen is a hole, so the clip sits behind it and nothing but the phone's own
 * edge shows. The Story interface (handle on top, message bar underneath) is
 * drawn in code over the black bars the 9:16 clip leaves. Sizes are in cqw so
 * everything scales with the phone.
 */
const SCREEN = {
  left: "9.9%",
  top: "3.78%",
  width: "79.9%",
  height: "92.06%",
  // The screen's own rounded corners, so no square corner pokes past the bezel.
  borderRadius: "13% / 6.1%",
};

export function ReelPhone({
  src,
  poster,
  handle,
  avatar,
  alt,
}: {
  src: string;
  poster: string;
  handle: string;
  avatar: string;
  alt: string;
}) {
  return (
    <div
      className="relative w-full [container-type:inline-size]"
      style={{ aspectRatio: "700 / 1299" }}
    >
      <div
        data-reel=""
        className="group/reel absolute overflow-hidden bg-ink"
        style={SCREEN}
      >
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <ProjectVideo
            video={{ src, poster, alt }}
            ratio="4/5"
            radius=""
            className="!aspect-[480/650]"
          />
        </div>
        <ReelPlayhead />
        {/* Reels-style actions up the right edge, drawn in code like the rest. */}
        <div className="pointer-events-none absolute bottom-[21%] right-[3.5cqw] flex flex-col items-center gap-[4.2cqw] text-white drop-shadow-[0_0_1.2cqw_rgb(0_0_0/0.55)]">
          <ReelHeart />
          {[
            "M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.6-.8L3 21l1.9-5.2A8.4 8.4 0 1 1 21 11.5z",
            "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
          ].map((d) => (
            <svg
              key={d}
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-[6.4cqw] w-[6.4cqw]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={d} />
            </svg>
          ))}
          <svg
            viewBox="0 0 24 24"
            className="h-[6.4cqw] w-[6.4cqw]"
            fill="currentColor"
          >
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 top-[8.5%] flex items-center gap-[2.5cqw] px-[4cqw] text-[3.4cqw] text-white"
          aria-hidden="true"
        >
          <Image
            src={avatar}
            alt=""
            width={60}
            height={60}
            className="h-[6.5cqw] w-[6.5cqw] rounded-full"
          />
          <b className="font-semibold">{handle}</b>
          <span className="opacity-80">Sponsored</span>
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-[3.2%] flex items-center gap-[3.1cqw] px-[4cqw] text-[3.3cqw] text-white"
          aria-hidden="true"
        >
          <span className="flex-1 whitespace-nowrap rounded-full border border-white/80 px-[3.4cqw] py-[1.9cqw]">
            Send message
          </span>
        </div>
      </div>
      <Image
        src="/monzo/phone-frame.webp"
        alt=""
        width={700}
        height={1299}
        sizes="(max-width: 768px) 60vw, 20vw"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </div>
  );
}
