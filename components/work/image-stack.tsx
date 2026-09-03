"use client";

import { Fragment } from "react";

import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { ProjectVideo } from "@/components/work/project-video";
import { useProjectLightbox } from "@/components/work/project-lightbox-context";
import type { ImageRatio, ProjectImage } from "@/lib/projects";

type ImageStackProps = {
  /** First two render as a two-up row and everything after runs full
   *  width, unless `gallerySpans` is set — then it takes full manual
   *  control of the layout from index 0 instead. */
  images: ProjectImage[];
  /** How many images precede this gallery in the shared
   *  ProjectLightboxProvider's combined list (the hero + heroPair/heroThird
   *  above the write-up) — added to every local index so clicking a
   *  gallery image opens the right frame in the shared cycle. */
  indexOffset?: number;
  /** Trial (Instagram Sticker only): a silent video inserted mid-gallery,
   *  outside the lightbox's photo-cycle. See Project.galleryVideo. */
  galleryVideo?: { src: string; alt: string; sound?: boolean; afterIndex: number };
  /** Trial (Instagram Sticker only): fills the same slot an animated GIF
   *  used to — a silent video, autoplaying on loop via ProjectVideo, which
   *  is both lighter than the source GIF and immune to Next's image
   *  optimizer freezing GIFs to their first frame. See Project.galleryGif. */
  galleryGif?: { src: string; alt: string; ratio: ImageRatio; afterIndex: number };
  /** Trial (Instagram Sticker only): groups consecutive images into one
   *  row instead of stacking them. See Project.gallerySpans. */
  gallerySpans?: { startIndex: number; count: number }[];
};

/** Josh's vertical pieces are drawn to run small — full-bleed at the frame's
 *  1344px width blows a portrait illustration up far past its designed
 *  scale. Same cap `heroSize: "spot"` uses for a portrait hero. */
function isPortrait(ratio: string) {
  const [w, h] = ratio.split("/").map(Number);
  return h > w;
}

/**
 * The gallery below a project's write-up — first two as a two-up row, the
 * rest full width, each with its own caption underneath. Every frame opens
 * in the shared ProjectLightboxProvider lightbox, prev/next cycling across
 * the whole project (hero included), since the grid crops every shot down
 * from its real size.
 */
export function ImageStack({
  images,
  indexOffset = 0,
  galleryVideo,
  galleryGif,
  gallerySpans = [],
}: ImageStackProps) {
  const { openAt } = useProjectLightbox();
  // Defining any gallerySpans opts a project out of the default "first two
  // auto-pair" convenience — it's taking manual control of the layout from
  // index 0 instead (Instagram Sticker: a standalone single leads, then a
  // span-defined pair, not the hardcoded first-two). Every other project
  // passes no gallerySpans, so this is always false there and nothing changes.
  const manualLayout = gallerySpans.length > 0;
  const [firstImage, secondImage, ...restImages] = images;
  const loopImages = manualLayout ? images : restImages;
  const indexOffsetLocal = manualLayout ? 0 : 2;

  return (
    <>
      {/* pb-28 -> pb-40 -- originally sized so the last caption cleared
          the since-removed BackToTop pills; "Make sure there's room
          under the project," per Josh, still holds on desktop.
          max-md:pb-24 -- "the spacing from last image or text to bottom
          of project card is a bit too large, decrease this," per Josh:
          with the mobile card's own bottom edge (rounded corner +
          margin) closing the page now, 160px of empty card read as a
          hole; 96px keeps clearance for the docked dot pill without
          the void. Same pairing in PosterGrid and the grid-layout
          wrapper in project-content.tsx. */}
      {/* space-y-6/gap-6 below md throughout this file (was a flat -8
          everywhere) — "spacing needs to be closer for work project image
          frames on mobile," per Josh, mobile only, matching the same
          gap-6/md:gap-8 pairing PosterGrid and MasonryGrid already use.
          Desktop's md:space-y-8/md:gap-8 stays exactly as it was. */}
      <div className="mx-auto max-w-frame space-y-6 px-6 pb-40 max-md:pb-24 md:space-y-8 md:px-gutter">
        {galleryGif && galleryGif.afterIndex === 0 && (
          // Capped to max-w-lg (512px) — the source is only 1080px native,
          // so stretching it to the frame's full 1344px width would
          // upscale it past its real resolution and blur.
          <Reveal className="mx-auto max-w-lg">
            <ProjectVideo
              video={{ src: galleryGif.src, alt: galleryGif.alt }}
              ratio={galleryGif.ratio}
            />
            <p className="type-label mt-3 text-ink-muted">{galleryGif.alt}</p>
          </Reveal>
        )}

        {!manualLayout && (firstImage || secondImage) && (
          <div
            className={
              firstImage?.small || secondImage?.small
                ? "flex flex-wrap justify-center gap-6 md:gap-8"
                : "grid gap-6 md:grid-cols-2 md:gap-8"
            }
          >
            {[firstImage, secondImage].filter(Boolean).map((image, index) => (
              <Reveal
                key={image.alt}
                delay={index * 110}
                className={image.small ? "w-full max-w-lg" : undefined}
              >
                <button
                  type="button"
                  onClick={() => openAt(indexOffset + index)}
                  aria-label={`Open larger view of ${image.alt}`}
                  className="block w-full cursor-zoom-in text-left"
                >
                  <Plate image={image} sizes={image.small ? "(max-width: 768px) 100vw, 512px" : "(max-width: 768px) 100vw, 50vw"} />
                </button>
                {image.caption !== false && (
                  <p className="type-label mt-3 text-ink-muted">{image.alt}</p>
                )}
              </Reveal>
            ))}
          </div>
        )}

        {/* Consecutive `small` singles (not already claimed by a
            gallerySpan or interrupted by galleryVideo) pair up two at a
            time instead of each running full-width alone — "put images
            side by side if they're small," per Josh. Computed once
            up front as a set of "already paired, skip on your own
            iteration" indices, since a plain .map can't look behind
            itself mid-render. */}
        {(() => {
          const pairedAway = new Set<number>();
          for (let i = 0; i < loopImages.length; i++) {
            const fullIndex = i + indexOffsetLocal;
            if (pairedAway.has(fullIndex)) continue;
            const inSpan = gallerySpans.some(
              (span) => fullIndex >= span.startIndex && fullIndex < span.startIndex + span.count,
            );
            if (inSpan) continue;
            const next = loopImages[i + 1];
            const nextFullIndex = fullIndex + 1;
            const nextInSpan = gallerySpans.some((span) => span.startIndex === nextFullIndex);
            const videoBreak = galleryVideo?.afterIndex === fullIndex;
            if (loopImages[i].small && next?.small && !nextInSpan && !videoBreak) {
              pairedAway.add(nextFullIndex);
            }
          }

          return loopImages.map((image, index) => {
          const fullIndex = index + indexOffsetLocal;

          // Consumed by the previous iteration's small-pair below — skip.
          if (pairedAway.has(fullIndex)) return null;

          // Already rendered as part of an earlier row — skip.
          const inLaterSpan = gallerySpans.some(
            (span) => fullIndex > span.startIndex && fullIndex < span.startIndex + span.count,
          );
          if (inLaterSpan) return null;

          // count: 1 opts an image out of the default two-up pairing
          // without actually grouping it with anything — falls through to
          // the plain full-width single below instead of a half-empty grid.
          const span = gallerySpans.find((s) => s.startIndex === fullIndex && s.count > 1);
          if (span) {
            const spanImages = loopImages.slice(index, index + span.count);
            return (
              <Fragment key={image.alt}>
                <Reveal>
                  <div className={`grid grid-cols-1 gap-6 md:gap-8 ${span.count === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                    {spanImages.map((spanImage, i) => (
                      <div key={spanImage.alt}>
                        <button
                          type="button"
                          onClick={() => openAt(indexOffset + fullIndex + i)}
                          aria-label={`Open larger view of ${spanImage.alt}`}
                          className="block w-full cursor-zoom-in text-left"
                        >
                          <Plate
                            image={spanImage}
                            sizes={span.count === 3 ? "(max-width: 640px) 100vw, 33vw" : "(max-width: 640px) 100vw, 50vw"}
                          />
                        </button>
                        {spanImage.caption !== false && (
                          <p className="type-label mt-3 text-ink-muted">{spanImage.alt}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Reveal>

                {galleryVideo && galleryVideo.afterIndex === fullIndex + span.count && (
                  <Reveal>
                    <ProjectVideo
                      video={{ src: galleryVideo.src, alt: galleryVideo.alt }}
                      sound={galleryVideo.sound}
                    />
                    <p className="type-label mt-3 text-ink-muted">{galleryVideo.alt}</p>
                  </Reveal>
                )}
              </Fragment>
            );
          }

          if (pairedAway.has(fullIndex + 1)) {
            const next = loopImages[index + 1];
            return (
              <Reveal key={image.alt}>
                <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                  {[image, next].map((pairImage, i) => (
                    <div key={pairImage.alt} className="w-full max-w-lg">
                      <button
                        type="button"
                        onClick={() => openAt(indexOffset + fullIndex + i)}
                        aria-label={`Open larger view of ${pairImage.alt}`}
                        className="block w-full cursor-zoom-in text-left"
                      >
                        <Plate image={pairImage} sizes="(max-width: 768px) 100vw, 512px" />
                      </button>
                      {pairImage.caption !== false && (
                        <p className="type-label mt-3 text-ink-muted">{pairImage.alt}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Reveal>
            );
          }

          const capped = isPortrait(image.ratio) || image.small;
          return (
            <Fragment key={image.alt}>
              <Reveal
                className={capped ? "mx-auto max-w-lg" : undefined}
                navContrastLight={image.navContrastLight}
              >
                <button
                  type="button"
                  onClick={() => openAt(indexOffset + fullIndex)}
                  aria-label={`Open larger view of ${image.alt}`}
                  className="block w-full cursor-zoom-in text-left"
                >
                  <Plate
                    image={image}
                    sizes={
                      capped
                        ? "(max-width: 768px) 100vw, 512px"
                        : "(max-width: 1344px) 100vw, 1344px"
                    }
                  />
                </button>
                <p className="type-label mt-3 text-ink-muted">{image.alt}</p>
              </Reveal>

              {galleryVideo && galleryVideo.afterIndex === fullIndex + 1 && (
                <Reveal>
                  <ProjectVideo
                    video={{ src: galleryVideo.src, alt: galleryVideo.alt }}
                    sound={galleryVideo.sound}
                  />
                  <p className="type-label mt-3 text-ink-muted">{galleryVideo.alt}</p>
                </Reveal>
              )}
            </Fragment>
          );
          });
        })()}
      </div>
    </>
  );
}
