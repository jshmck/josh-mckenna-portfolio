import Image from "next/image";
import type { ReactNode } from "react";

import { Plate } from "@/components/ui/plate";
import { ProjectVideo } from "@/components/work/project-video";

/*
 * Phone mockups for the Carwow application page: the finished artwork sits
 * untouched underneath, and the app-style interface is drawn on top in code
 * (plain frame, generic icons, no platform logos), so it stays sharp at any
 * size and the art can be swapped without re-exporting anything.
 */

type Icon =
  "heart" | "comment" | "send" | "bookmark" | "more" | "close" | "music";

function Glyph({
  name,
  className = "h-6 w-6",
}: {
  name: Icon;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  switch (name) {
    case "heart":
      return (
        <svg {...common}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "comment":
      return (
        <svg {...common}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      );
    case "send":
      return (
        <svg {...common}>
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...common}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "more":
      return (
        <svg {...common}>
          <circle cx="5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case "music":
      return (
        <svg {...common}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
  }
}

/** Brand avatar: the brand's own profile picture when given, else its first letter. */
function Avatar({
  brand,
  avatar,
  className = "h-8 w-8",
}: {
  brand: string;
  avatar?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`type-label relative flex ${className} shrink-0 items-center justify-center overflow-hidden rounded-full bg-canvas text-ink ring-2 ring-canvas`}
    >
      {avatar ? (
        <Image src={avatar} alt="" fill sizes="40px" className="object-cover" />
      ) : (
        brand.slice(0, 1)
      )}
    </span>
  );
}

/** Plain rounded device frame, no notch artwork or maker branding. */
function Phone({
  children,
  ratio,
  notch = true,
}: {
  children: ReactNode;
  ratio: string;
  notch?: boolean;
}) {
  return (
    <div
      className="w-full rounded-[2.2rem] bg-ink p-[7px] shadow-[0_24px_50px_-18px_rgb(0_0_0/0.45)]"
      style={{ aspectRatio: ratio }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[1.7rem] bg-canvas">
        {notch && (
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-2 z-20 h-[14px] w-[34%] -translate-x-1/2 rounded-full bg-ink"
          />
        )}
        {children}
      </div>
    </div>
  );
}

const shade = "bg-gradient-to-b from-ink/55 to-transparent";
const shadeUp = "bg-gradient-to-t from-ink/60 to-transparent";

export function StoryPhone({
  src,
  brand,
  alt,
  avatar,
}: {
  src: string;
  brand: string;
  alt: string;
  avatar?: string;
}) {
  return (
    <Phone ratio="9 / 17.2">
      <div className="absolute inset-0">
        <Plate
          image={{ ratio: "9/16", src, alt }}
          radius=""
          sizes="(max-width: 768px) 60vw, 22vw"
        />
      </div>
      <div
        className={`absolute inset-x-0 top-0 z-10 px-3 pb-8 pt-7 ${shade} text-canvas`}
      >
        <div className="flex gap-1">
          <span className="h-[3px] flex-1 rounded-full bg-canvas" />
          <span className="h-[3px] flex-1 rounded-full bg-canvas/40" />
          <span className="h-[3px] flex-1 rounded-full bg-canvas/40" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Avatar brand={brand} avatar={avatar} className="h-7 w-7" />
          <span className="type-label">{brand}</span>
          <span className="type-label ml-auto opacity-80">Sponsored</span>
          <Glyph name="close" className="h-5 w-5" />
        </div>
      </div>
      <div
        className={`absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 px-3 pb-3 pt-8 ${shadeUp} text-canvas`}
      >
        <span className="type-label flex-1 rounded-full border border-canvas/70 px-4 py-2.5">
          Send message
        </span>
        <Glyph name="heart" className="h-6 w-6" />
        <Glyph name="send" className="h-6 w-6" />
      </div>
    </Phone>
  );
}

export function ReelPhone({
  src,
  brand,
  alt,
  caption,
  avatar,
}: {
  src: string;
  brand: string;
  alt: string;
  caption: string;
  avatar?: string;
}) {
  return (
    <Phone ratio="9 / 17.2">
      <div className="absolute inset-0">
        <Plate
          image={{ ratio: "9/16", src, alt }}
          radius=""
          sizes="(max-width: 768px) 60vw, 22vw"
        />
      </div>
      <p
        className={`type-label absolute inset-x-0 top-0 z-10 px-4 pb-8 pt-7 ${shade} text-canvas`}
      >
        Reels
      </p>
      <div className="absolute bottom-24 right-2 z-10 flex flex-col items-center gap-4 text-canvas">
        <Glyph name="heart" className="h-7 w-7" />
        <Glyph name="comment" className="h-7 w-7" />
        <Glyph name="send" className="h-7 w-7" />
        <Glyph name="more" className="h-6 w-6" />
      </div>
      <div
        className={`absolute inset-x-0 bottom-0 z-10 px-3 pb-3 pt-12 ${shadeUp} text-canvas`}
      >
        <div className="flex items-center gap-2">
          <Avatar brand={brand} avatar={avatar} className="h-7 w-7" />
          <span className="type-label">{brand}</span>
          <span className="type-label rounded-md border border-canvas/80 px-2 py-1">
            Follow
          </span>
        </div>
        <p className="mt-2 text-[12px] leading-snug">{caption}</p>
        <p className="type-label mt-2 flex items-center gap-1.5 opacity-90">
          <Glyph name="music" className="h-3.5 w-3.5" /> Original audio
        </p>
      </div>
    </Phone>
  );
}

export function FeedPhone({
  src,
  brand,
  alt,
  caption,
  avatar,
}: {
  src: string;
  brand: string;
  alt: string;
  caption: string;
  avatar?: string;
}) {
  return (
    <Phone ratio="9 / 17.2">
      <div className="flex h-full flex-col bg-canvas pt-7 text-ink">
        <div className="flex items-center gap-2 px-3 py-2">
          <Avatar brand={brand} avatar={avatar} className="h-7 w-7" />
          <span className="type-label">{brand}</span>
          <span className="type-label text-ink-muted">Sponsored</span>
          <Glyph name="more" className="ml-auto h-5 w-5" />
        </div>
        <Plate
          image={{ ratio: "4/5", src, alt }}
          radius=""
          sizes="(max-width: 768px) 60vw, 22vw"
        />
        <div className="flex items-center gap-3 px-3 pt-3">
          <Glyph name="heart" className="h-6 w-6" />
          <Glyph name="comment" className="h-6 w-6" />
          <Glyph name="send" className="h-6 w-6" />
          <Glyph name="bookmark" className="ml-auto h-6 w-6" />
        </div>
        <p className="px-3 pt-2 text-[12px] leading-snug">
          <span className="font-bold">{brand}</span> {caption}
        </p>
      </div>
    </Phone>
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
    <Phone ratio="9 / 17.2" notch={false}>
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
