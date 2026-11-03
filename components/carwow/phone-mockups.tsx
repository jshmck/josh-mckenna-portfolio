import Image from "next/image";

import { ReelPlayhead } from "@/components/carwow/reel-playhead";
import { ProjectVideo } from "@/components/work/project-video";

/*
 * A screen recording inside the iPhone mockup. The frame is a transparent
 * cut-out (public/carwow/phone-frame.webp, built by scripts/mockups/) whose
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
        className="absolute overflow-hidden bg-ink"
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
          <svg
            viewBox="0 0 24 24"
            className="h-[5.3cqw] w-[5.3cqw]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <svg
            viewBox="0 0 24 24"
            className="h-[5.3cqw] w-[5.3cqw]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </div>
      </div>
      <Image
        src="/carwow/phone-frame.webp"
        alt=""
        width={700}
        height={1299}
        sizes="(max-width: 768px) 60vw, 20vw"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </div>
  );
}
