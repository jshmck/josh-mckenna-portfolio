#!/usr/bin/env node
/**
 * find-drop — work out where the artwork Josh just handed over actually is.
 *
 * /new-project accepts assets three ways, and only one of them arrives as a
 * path. This script covers the other two by looking for image files that
 * changed recently in the places a drop lands, then grouping them by folder so
 * the agent can offer a real choice instead of asking "where are the files?".
 *
 * Locations searched, in reporting order:
 *   ~/.claude/paste-cache   images pasted or dragged into the Claude Code prompt
 *   ~/Desktop               top level, plus one level of subfolders
 *   ~/Downloads             top level (Figma and Drive exports land here)
 *   --also <dir>            anywhere else, repeatable
 *
 * Usage
 *   node .claude/skills/project-intake/scripts/find-drop.mjs [--minutes 120]
 *        [--also ~/Dropbox/josh] [--min-pixels 250000]
 *
 * Exit codes: 0 candidates found · 2 nothing recent · 1 bad usage.
 *
 * This script only reads file metadata. It never opens, moves or deletes
 * anything — ingest-artwork.mjs does the copying, once a folder is chosen.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

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

/** Screenshots and UI chrome that are never portfolio artwork. */
const IGNORE = [
  /^screenshot /i,
  /^screen shot /i,
  /^simulator screen/i,
  /^cleanshot/i,
];

function expandHome(input) {
  return input.startsWith("~") ? path.join(os.homedir(), input.slice(1)) : input;
}

function parseArgs(argv) {
  const options = { minutes: 120, also: [], minPixels: 0 };

  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];

    if (flag === "--minutes") {
      options.minutes = Number(value);
      i += 1;
    } else if (flag === "--also") {
      options.also.push(expandHome(value ?? ""));
      i += 1;
    } else if (flag === "--min-pixels") {
      options.minPixels = Number(value);
      i += 1;
    } else if (flag === "--help" || flag === "-h") {
      process.stdout.write(
        "find-drop [--minutes 120] [--also <dir>] [--min-pixels 0]\n",
      );
      process.exit(0);
    } else {
      process.stderr.write(`find-drop: unknown flag ${flag}\n`);
      process.exit(1);
    }
  }

  if (!Number.isFinite(options.minutes) || options.minutes <= 0) {
    process.stderr.write("find-drop: --minutes must be a positive number\n");
    process.exit(1);
  }

  return options;
}

function scanDir(dir, cutoff, out, depth) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return; // unreadable or absent — not an error, just nothing here
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (depth > 0) scanDir(full, cutoff, out, depth - 1);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!RASTER.has(path.extname(entry.name).toLowerCase())) continue;
    if (IGNORE.some((pattern) => pattern.test(entry.name))) continue;

    let stat;
    try {
      stat = fs.statSync(full);
    } catch {
      continue;
    }
    if (stat.mtimeMs < cutoff) continue;

    out.push({ file: full, dir, bytes: stat.size, mtime: stat.mtimeMs });
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const home = os.homedir();
  const cutoff = Date.now() - options.minutes * 60_000;

  const roots = [
    { dir: path.join(home, ".claude", "paste-cache"), depth: 1, origin: "chat" },
    { dir: path.join(home, "Desktop"), depth: 1, origin: "desktop" },
    { dir: path.join(home, "Downloads"), depth: 0, origin: "downloads" },
    ...options.also.map((dir) => ({ dir, depth: 1, origin: "custom" })),
  ];

  const found = [];
  for (const root of roots) {
    const hits = [];
    scanDir(root.dir, cutoff, hits, root.depth);
    for (const hit of hits) found.push({ ...hit, origin: root.origin });
  }

  const filtered = found.filter((hit) => hit.bytes >= options.minPixels);

  // Group by containing folder — a folder of exports is the unit Josh thinks
  // in, and it is what ingest-artwork.mjs wants as --from.
  const groups = new Map();
  for (const hit of filtered) {
    const group = groups.get(hit.dir) ?? {
      dir: hit.dir,
      origin: hit.origin,
      files: [],
      newest: 0,
      bytes: 0,
    };
    group.files.push(path.basename(hit.file));
    group.newest = Math.max(group.newest, hit.mtime);
    group.bytes += hit.bytes;
    groups.set(hit.dir, group);
  }

  const candidates = [...groups.values()]
    .map((group) => ({
      dir: group.dir,
      origin: group.origin,
      count: group.files.length,
      megabytes: Number((group.bytes / 1024 / 1024).toFixed(2)),
      newest: new Date(group.newest).toISOString(),
      files: group.files.sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      ),
    }))
    .sort((a, b) => b.newest.localeCompare(a.newest));

  process.stdout.write(
    `${JSON.stringify({ minutes: options.minutes, candidates }, null, 2)}\n`,
  );

  process.exit(candidates.length > 0 ? 0 : 2);
}

main();
