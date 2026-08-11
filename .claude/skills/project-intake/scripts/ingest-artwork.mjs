#!/usr/bin/env node
/**
 * ingest-artwork — normalise a pile of artwork into a project's image set.
 *
 * This is the deterministic half of /new-project. It does the things that
 * should never be left to a language model: reading real pixel dimensions,
 * snapping them to the five ratios `ImageRatio` allows, capping resolution,
 * and writing predictable filenames into `public/work/<slug>/`.
 *
 * It deliberately does NOT write `lib/projects.ts`. It prints a manifest and
 * stops. Alt text, ordering intent and prose are judgement calls that belong
 * to the interview, not to a script.
 *
 * Usage
 *   node .claude/skills/project-intake/scripts/ingest-artwork.mjs \
 *     --slug hot-sauce-dynasty \
 *     --from ~/Desktop/dynasty-final \
 *     [--from ~/Desktop/one-more.png]   repeatable; dirs or files
 *     [--hero 03-range.png]             else auto-picked, see pickHero()
 *     [--max-edge 2400]                 long-edge cap in px
 *     [--quality 82]                    webp quality
 *     [--out public/work]               parent dir for <slug>/
 *     [--manifest path.json]            also write the manifest to disk
 *     [--dry-run]                       report only, touch nothing
 *
 * Exit codes: 0 ok · 1 bad usage · 2 nothing ingestable · 3 write failure.
 */

import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/* ==========================================================================
   Ratio policy
   ========================================================================== */

/**
 * The five ratios `ImageRatio` in lib/projects.ts permits, as decimals.
 * Keep this table in sync with that union — a value here that the type does
 * not allow produces a manifest that will not typecheck.
 */
const RATIOS = [
  { name: "1/1", value: 1 / 1 },
  { name: "4/5", value: 4 / 5 },
  { name: "3/4", value: 3 / 4 },
  { name: "5/4", value: 5 / 4 },
  { name: "16/10", value: 16 / 10 },
];

/**
 * Snap a real aspect ratio to the nearest permitted one.
 *
 * Compared in log space, so being 20% too wide and 20% too tall are treated
 * as equally wrong. Linear comparison is biased toward the landscape end of
 * the table and would push portrait artwork to 1/1 too eagerly.
 *
 * @param {number} width
 * @param {number} height
 * @returns {{ name: string, value: number, drift: number }}
 *   `drift` is the absolute log distance to the chosen ratio. 0 is exact;
 *   ~0.05 is imperceptible; ~0.2 is a visibly tight crop.
 */
function snapRatio(width, height) {
  const actual = width / height;

  let best = RATIOS[0];
  let bestDrift = Infinity;

  for (const candidate of RATIOS) {
    const drift = Math.abs(Math.log(actual / candidate.value));
    if (drift < bestDrift) {
      best = candidate;
      bestDrift = drift;
    }
  }

  return { name: best.name, value: best.value, drift: bestDrift };
}

/* --------------------------------------------------------------------------
   TUNING DIAL — how much crop is acceptable before we stop and ask?

   `Plate` renders with `object-cover`. That means the gap between an image's
   true ratio and its snapped ratio is not a rounding error, it is pixels of
   Josh's artwork being cut off the edge. A 3:2 photo snapped to 16/10 loses
   ~4% of its width. A 2:3 portrait snapped to 3/4 loses ~11% of its height —
   which is a head, or a signature.

   The trade-off:
     - Tolerant  → the pipeline stays hands-off, but some pieces ship cropped.
     - Strict    → nothing ships cropped, but you get asked about half the
                   images, which defeats the point of the automation.

   There is a third option the flag exists to make visible: if a ratio keeps
   drifting badly, the right fix is to add a ratio to `ImageRatio` in
   lib/projects.ts and to `RATIO_CLASS` in components/ui/plate.tsx, not to
   crop the work.

   ~~~ YOUR CALL — see the note in SKILL.md → "Stage 1". ~~~
   TODO(josh): tune CROP_TOLERANCE, and decide whether portrait artwork
   deserves a stricter bar than landscape. Portraits are usually characters,
   where the crop lands on a face; landscapes are usually installation shots,
   where losing an edge costs nothing. Right now both are judged identically.
-------------------------------------------------------------------------- */

/** Log-distance above which a snap is reported as a crop worth reviewing. */
const CROP_TOLERANCE = 0.08; // ≈ 8% off the true ratio

/**
 * @param {{ drift: number, value: number }} snap
 * @param {number} width
 * @param {number} height
 * @returns {boolean} true when the human should look before this ships
 */
function shouldFlagCrop(snap, width, height) {
  return snap.drift > CROP_TOLERANCE;
}

/* ==========================================================================
   Arguments
   ========================================================================== */

function parseArgs(argv) {
  const options = {
    slug: null,
    from: [],
    hero: null,
    maxEdge: 2400,
    quality: 82,
    out: "public/work",
    manifest: null,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const next = () => {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("--")) {
        fail(`${flag} needs a value`);
      }
      i += 1;
      return value;
    };

    switch (flag) {
      case "--slug":
        options.slug = next();
        break;
      case "--from":
        options.from.push(expandHome(next()));
        break;
      case "--hero":
        options.hero = next();
        break;
      case "--max-edge":
        options.maxEdge = Number(next());
        break;
      case "--quality":
        options.quality = Number(next());
        break;
      case "--out":
        options.out = next();
        break;
      case "--manifest":
        options.manifest = next();
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--help":
      case "-h":
        process.stdout.write(helpText());
        process.exit(0);
        break;
      default:
        fail(`unknown flag: ${flag}`);
    }
  }

  if (!options.slug) fail("--slug is required");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(options.slug)) {
    fail(`--slug must be kebab-case: got "${options.slug}"`);
  }
  if (options.from.length === 0) fail("at least one --from is required");
  if (!Number.isFinite(options.maxEdge) || options.maxEdge < 400) {
    fail("--max-edge must be a number >= 400");
  }

  return options;
}

function helpText() {
  return `ingest-artwork — normalise artwork into public/work/<slug>/

  --slug <kebab>      required, matches Project.slug
  --from <path>       required, repeatable; a directory or a single file
  --hero <filename>   pick the hero explicitly, by source filename
  --max-edge <px>     long-edge cap (default 2400)
  --quality <1-100>   webp quality (default 82)
  --out <dir>         parent for <slug>/ (default public/work)
  --manifest <path>   also write the JSON manifest here
  --dry-run           report only, write nothing
`;
}

function fail(message) {
  process.stderr.write(`ingest-artwork: ${message}\n\n${helpText()}`);
  process.exit(1);
}

function expandHome(input) {
  return input.startsWith("~")
    ? path.join(os.homedir(), input.slice(1))
    : input;
}

/* ==========================================================================
   Source collection
   ========================================================================== */

const RASTER = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".avif",
  ".tif",
  ".tiff",
  ".heic",
  ".heif",
]);

/** macOS sidecar and export noise that should never become a gallery slot. */
function isNoise(name) {
  return name.startsWith(".") || name === "Icon\r";
}

function collectSources(inputs) {
  const files = [];

  for (const input of inputs) {
    if (!fs.existsSync(input)) fail(`no such path: ${input}`);

    const stat = fs.statSync(input);

    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(input)) {
        if (isNoise(entry)) continue;
        const full = path.join(input, entry);
        if (!fs.statSync(full).isFile()) continue;
        if (!RASTER.has(path.extname(entry).toLowerCase())) continue;
        files.push(full);
      }
    } else if (RASTER.has(path.extname(input).toLowerCase())) {
      files.push(input);
    }
  }

  // Natural sort, so `2` lands before `10`. Filename order is the artist's
  // ordering signal — renaming files is the cheapest way to reorder a gallery.
  return [...new Set(files)].sort((a, b) =>
    path
      .basename(a)
      .localeCompare(path.basename(b), undefined, { numeric: true }),
  );
}

/* ==========================================================================
   Image handling
   ========================================================================== */

/**
 * sharp ships as a dependency of Next, so it is always present in a repo that
 * has run `npm install` — there is nothing to add to package.json.
 *
 * Resolution is attempted from the working directory first and the script's
 * own location second. That order matters: every path this script writes is
 * relative to cwd, so cwd is the repo it is acting on. Preferring it lets the
 * script run from a git worktree, whose .claude/ has no node_modules above it.
 */
function loadSharp() {
  const resolvers = [
    createRequire(path.join(process.cwd(), "package.json")),
    createRequire(import.meta.url),
  ];

  for (const resolve of resolvers) {
    try {
      return resolve("sharp");
    } catch {
      /* try the next root */
    }
  }

  return fail(
    "sharp is not resolvable. Run this from the repo root, where Next's " +
      "sharp dependency is installed (`npm install` if node_modules is absent).",
  );
}

/**
 * HEIC/HEIF from an iPhone often has no libheif behind sharp. macOS `sips`
 * always can, so transcode to PNG in a temp file and hand that to sharp.
 */
function normaliseInput(file, tempDir) {
  const extension = path.extname(file).toLowerCase();
  if (extension !== ".heic" && extension !== ".heif") return file;

  const staged = path.join(tempDir, `${path.basename(file, extension)}.png`);
  try {
    execFileSync("sips", ["-s", "format", "png", file, "--out", staged], {
      stdio: "ignore",
    });
    return staged;
  } catch {
    return file; // let sharp produce the real error
  }
}

/**
 * Filenames are how the artist signals order, so exports usually arrive
 * already numbered (`01-range.png`). We prepend our own ordinal, so strip any
 * leading number first \u2014 otherwise the output reads `01-01-range.webp`.
 */
function kebab(input) {
  return (
    input
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/^[\s_-]*\d+[\s._-]+/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "plate"
  );
}

/**
 * Default hero: the largest landscape piece.
 *
 * The project template renders the hero full-bleed at up to 1344px with
 * `priority`, so a portrait there wastes the width and pushes the write-up
 * below the fold. Largest-area landscape is almost always the range shot,
 * the installation photo, or the cover — the piece that establishes the job.
 * `--hero` overrides this whenever the artist disagrees.
 */
function pickHero(plates, requested) {
  if (requested) {
    const wanted = plates.find(
      (plate) => path.basename(plate.source) === requested,
    );
    if (!wanted) {
      fail(
        `--hero "${requested}" is not among the ingested files:\n  ` +
          plates.map((plate) => path.basename(plate.source)).join("\n  "),
      );
    }
    return { hero: wanted, reason: "explicit --hero" };
  }

  const landscape = plates.filter((plate) => plate.width >= plate.height);
  const pool = landscape.length > 0 ? landscape : plates;
  const hero = pool.reduce((best, plate) =>
    plate.width * plate.height > best.width * best.height ? plate : best,
  );

  return {
    hero,
    reason:
      landscape.length > 0
        ? "largest landscape piece"
        : "no landscape artwork — largest piece overall",
  };
}

/* ==========================================================================
   Main
   ========================================================================== */

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const sharp = loadSharp();

  const sources = collectSources(options.from);
  if (sources.length === 0) {
    process.stderr.write(
      "ingest-artwork: found no images in the given sources.\n",
    );
    process.exit(2);
  }

  const outDir = path.join(options.out, options.slug);
  const publicRoot = `${path.sep}public${path.sep}`;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ingest-"));

  if (!options.dryRun) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const plates = [];

  for (const [index, source] of sources.entries()) {
    const staged = normaliseInput(source, tempDir);

    let metadata;
    try {
      metadata = await sharp(staged).metadata();
    } catch (error) {
      process.stderr.write(
        `ingest-artwork: skipping ${path.basename(source)} — ${error.message}\n`,
      );
      continue;
    }

    const { width, height } = metadata;
    if (!width || !height) {
      process.stderr.write(
        `ingest-artwork: skipping ${path.basename(source)} — no dimensions\n`,
      );
      continue;
    }

    const snap = snapRatio(width, height);
    const ordinal = String(plates.length + 1).padStart(2, "0");
    const stem = kebab(path.basename(source, path.extname(source)));
    const filename = `${ordinal}-${stem}.webp`;
    const destination = path.join(outDir, filename);

    const longEdge = Math.max(width, height);
    const scale = Math.min(1, options.maxEdge / longEdge);
    const outWidth = Math.round(width * scale);
    const outHeight = Math.round(height * scale);

    if (!options.dryRun) {
      try {
        await sharp(staged)
          .resize({ width: outWidth, height: outHeight, fit: "inside" })
          .webp({ quality: options.quality, alphaQuality: 100 })
          .toFile(destination);
      } catch (error) {
        process.stderr.write(
          `ingest-artwork: failed writing ${filename} — ${error.message}\n`,
        );
        process.exit(3);
      }
    }

    // `src` is what goes into lib/projects.ts: a public-root-relative URL.
    const absolute = path.resolve(destination);
    const cut = absolute.lastIndexOf(publicRoot);
    const src =
      cut === -1
        ? `/${path.relative(process.cwd(), destination).split(path.sep).join("/")}`
        : absolute.slice(cut + publicRoot.length - 1).split(path.sep).join("/");

    plates.push({
      src,
      ratio: snap.name,
      alt: "", // filled in during the interview, never guessed by this script
      source,
      width,
      height,
      outWidth,
      outHeight,
      natural: Number((width / height).toFixed(4)),
      drift: Number(snap.drift.toFixed(4)),
      cropFlagged: shouldFlagCrop(snap, width, height),
      hasAlpha: Boolean(metadata.hasAlpha),
      bytes:
        options.dryRun || !fs.existsSync(destination)
          ? null
          : fs.statSync(destination).size,
    });
  }

  fs.rmSync(tempDir, { recursive: true, force: true });

  if (plates.length === 0) {
    process.stderr.write("ingest-artwork: every source failed to read.\n");
    process.exit(2);
  }

  const { hero, reason } = pickHero(plates, options.hero);

  const manifest = {
    slug: options.slug,
    outDir,
    dryRun: options.dryRun,
    heroReason: reason,
    hero,
    gallery: plates.filter((plate) => plate !== hero),
    flagged: plates.filter((plate) => plate.cropFlagged).map((plate) => ({
      src: plate.src,
      source: path.basename(plate.source),
      natural: plate.natural,
      ratio: plate.ratio,
      drift: plate.drift,
    })),
  };

  if (options.manifest && !options.dryRun) {
    fs.mkdirSync(path.dirname(options.manifest), { recursive: true });
    fs.writeFileSync(options.manifest, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
}

await main();
