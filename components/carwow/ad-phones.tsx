import Image from "next/image";

import { LikeSpot, type LikeBox } from "@/components/carwow/like-spot";
import { Reveal } from "@/components/ui/reveal";
import { SwipeRow } from "@/components/ui/swipe-row";

/*
 * The graphic-design static ads, shared by /carwow and /lego: the Nomad and
 * Möbelwagen Tax Return Sale in the four formats each ran in, each set on an
 * iPhone with the like button live-looking but look-only.
 */

export type AdPhone = { src: string; label: string; like: LikeBox };

/** Nomad's Tax Return Sale in the four formats it ran in. */
export const NOMAD_FORMATS: AdPhone[] = [
  {
    src: "/carwow/phone-nomad-b-ad.webp",
    label: "Facebook ad · 1:1",
    like: { kind: "like", x: 83, y: 1217, w: 96, h: 40 },
  },
  {
    src: "/carwow/phone-nomad-b-post.webp",
    label: "Instagram post · 4:5",
    like: { kind: "heart", x: 24, y: 1219, w: 46, h: 46 },
  },
  {
    src: "/carwow/phone-nomad-b-story.webp",
    label: "Instagram Story · 9:16",
    like: { kind: "heart", x: 623, y: 1552, w: 44, h: 44 },
  },
  {
    src: "/carwow/phone-nomad-b-banner.webp",
    label: "Video banner ad · 16:9",
    like: { kind: "count", x: 24, y: 769, w: 129, h: 66 },
  },
];

export const MOBELWAGEN_FORMATS: AdPhone[] = [
  {
    src: "/carwow/phone-mw-c-ad.webp",
    label: "Facebook ad · 1:1",
    like: { kind: "like", x: 83, y: 1217, w: 96, h: 40 },
  },
  {
    src: "/carwow/phone-mw-c-post.webp",
    label: "Instagram post · 4:5",
    like: { kind: "heart", x: 24, y: 1219, w: 46, h: 46 },
  },
  {
    src: "/carwow/phone-mw-c-story.webp",
    label: "Instagram Story · 9:16",
    like: { kind: "heart", x: 623, y: 1552, w: 44, h: 44 },
  },
  {
    src: "/carwow/phone-mw-banner.webp",
    label: "Video banner ad · 16:9",
    like: { kind: "count", x: 24, y: 807, w: 129, h: 66 },
  },
];

/** A row of iPhone mockups: a swipe carousel on a phone, four across from md. Look-only, like the Reels. */
export function PhoneRow({ phones, brand }: { phones: AdPhone[]; brand: string }) {
  return (
    <SwipeRow className="swipe-phone flex items-start gap-4 md:grid md:grid-cols-4 md:gap-6">
      {phones.map((f) => (
        <Reveal key={f.src} className="md:w-auto">
          <div className="relative [container-type:inline-size]">
            <Image
              src={f.src}
              alt={`${brand}, ${f.label}, on an iPhone`}
              width={700}
              height={1299}
              sizes="(max-width: 768px) 62vw, 25vw"
              className="h-auto w-full"
            />
            <LikeSpot box={f.like} />
          </div>
          <p className="type-label mt-1 text-ink-muted">{f.label}</p>
        </Reveal>
      ))}
    </SwipeRow>
  );
}
