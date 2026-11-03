import { readFile } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

import type { ImageRatio, ProjectImage } from "@/lib/projects";

/** Shorthand for a still in /public/work/<folder>/<file>.webp. */
export const img = (
  folder: string,
  file: string,
  ratio: ImageRatio,
  alt: string,
): ProjectImage => ({ src: `/work/${folder}/${file}.webp`, ratio, alt });

const NEAREST: [ImageRatio, number][] = [
  ["1/1", 1],
  ["2/3", 2 / 3],
  ["4/5", 0.8],
  ["3/4", 0.75],
  ["4/3", 4 / 3],
  ["5/4", 1.25],
  ["3/2", 1.5],
  ["16/10", 1.6],
  ["9/16", 9 / 16],
  ["16/9", 16 / 9],
];
const nearestRatio = (r: number): ImageRatio =>
  NEAREST.reduce((best, c) =>
    Math.abs(c[1] - r) < Math.abs(best[1] - r) ? c : best,
  )[0];

/** A still with its real pixel ratio (read from the file, so nothing is
 *  cropped) and its place in the lightbox. */
export type Still = { src: string; alt: string; r: number; lb: number };

/**
 * The shared lightbox for a private page, in page order. Each tile registers
 * itself and keeps the index; the `lightbox` array is complete before the
 * provider renders, so call everything before returning the JSX.
 */
export function createLightbox() {
  const lightbox: ProjectImage[] = [];
  const reg = (image: ProjectImage) => lightbox.push(image) - 1;

  const measure = async (image: ProjectImage & { src: string }) => {
    const { width, height } = await sharp(
      await readFile(join(process.cwd(), "public", image.src)),
    ).metadata();
    return (width ?? 1) / (height ?? 1);
  };

  const stills = async (
    images: (ProjectImage | undefined)[],
  ): Promise<Still[]> => {
    const ok = images.filter(
      (i): i is ProjectImage & { src: string } => !!i?.src,
    );
    const ratios = await Promise.all(ok.map(measure));
    return ok.map((image, i) => ({
      src: image.src,
      alt: image.alt,
      r: ratios[i],
      lb: reg({ ...image, ratio: nearestRatio(ratios[i]) }),
    }));
  };

  /** Clips register a poster + video pair. */
  const clip = (
    video: { src: string; poster?: string; alt: string } | undefined,
    ratio: ImageRatio,
  ) =>
    video?.poster
      ? {
          ...video,
          poster: video.poster,
          ratio,
          lb: reg({
            src: video.poster,
            ratio,
            alt: video.alt,
            video: { src: video.src },
          }),
        }
      : undefined;

  return { lightbox, reg, stills, clip };
}
