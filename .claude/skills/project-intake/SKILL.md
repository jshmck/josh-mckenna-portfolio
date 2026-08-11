---
name: project-intake
description: |
  Turn a pile of artwork into a published project page. Ingests images from a
  folder, a Claude Code chat drop or a Figma node, interviews Josh for the
  title, copy, category and vibe, writes the entry into lib/projects.ts,
  previews /work/<slug> in a real browser and opens the PR.
  Activates on the /new-project slash command and on phrases like "add a new
  project", "here are the assets for", "new piece for the portfolio",
  "publish this project", "add this to my work page".
---

# /new-project — assets in, reviewed project page out

The whole point: Josh opens Claude Code, hands over a folder or a Figma link,
answers a handful of questions, looks at a screenshot, says yes, and a PR
exists. Nobody touches `lib/projects.ts` by hand.

**Read [reference/voice.md](reference/voice.md) before drafting any copy.** The
interview is only worth running if the output sounds like the nine entries
already in the file.

## Contract

| Stage | Who decides | Output |
| ----- | ----------- | ------ |
| 0 Preflight | script | clean branch off `main` |
| 1 Ingest | script | `public/work/<slug>/*.webp` + manifest |
| 2 Look | agent | draft copy, proposed ratios and order |
| 3 Interview | **Josh** | every field confirmed |
| 4 Write | agent | one new object in `lib/projects.ts` |
| 5 Preview | agent | screenshots of `/work/<slug>` and `/work` |
| 6 Publish | **Josh** | commits + PR |

Stages 3 and 6 are the only ones that stop for a human. Everything else runs
without asking. If you find yourself asking Josh a question a script could
answer, that is a bug in this skill.

---

## Stage 0 — Preflight

```bash
git status --short && git branch --show-current
```

- Uncommitted work present → **stop and ask**. Do not stash unrelated changes
  to make room. Offer to branch from a worktree instead.
- Work on `feat/project-<slug>`, branched from `main`, never on `main` itself.
- `npm install` if `node_modules` is absent — the ingester needs `sharp`, which
  arrives as a dependency of Next. Nothing gets added to `package.json`.

---

## Stage 1 — Ingest

### Find the assets

Three routes. Try them in this order and stop at the first that yields files.

**A · A path Josh named.** A folder or files in the message
(`~/Desktop/dynasty-final`). Use it directly. Most reliable route; prefer it.

**B · A drop into the chat.** Images dragged or pasted into the Claude Code
prompt are visible to you, but you cannot assume they exist on disk, and you
cannot write image bytes out of context. Locate the real files:

```bash
node .claude/skills/project-intake/scripts/find-drop.mjs --minutes 120
```

It scans `~/.claude/paste-cache`, `~/Desktop` and `~/Downloads` for images
touched recently, groups them by folder, and skips screenshots. Present the
candidate folders and let Josh confirm which one — do not guess between two
plausible folders.

If it finds nothing, say so plainly and ask for a folder path. Do not pretend
to ingest images you can only see in the conversation: you would produce a
project entry pointing at files that do not exist, and the build would pass,
because `src` is just a string.

**C · A Figma node.** A `figma.com/design/...` URL. Use the Figma MCP:
`get_metadata` to find the exported image nodes, then `download_assets` into a
temp directory, then treat that directory as route A. Capture the node URL —
it belongs in the PR body.

### Normalise them

```bash
node .claude/skills/project-intake/scripts/ingest-artwork.mjs \
  --slug <kebab-slug> \
  --from <dir-or-file> \
  --manifest .claude/tmp/<slug>-manifest.json
```

Reads real dimensions, snaps each to one of the five ratios `ImageRatio`
allows, caps the long edge at 2400px, writes webp into `public/work/<slug>/`,
prints a manifest. Add `--hero <filename>` to override the hero pick, `--from`
again for extra files. `--dry-run` reports without writing.

Filename order is the ordering signal, so `01-`, `02-` prefixes in the source
control the gallery sequence. The script strips them and applies its own.

### Read `flagged` before moving on

`Plate` renders `object-cover`, so a snapped ratio is a **crop of the
artwork**, not a rounding error. Any plate in `manifest.flagged` drifts more
than `CROP_TOLERANCE` from its true ratio. For each one, choose deliberately:

1. accept the crop — fine for installation shots and detail photos;
2. re-export at a supported ratio — best when Josh still has the file open;
3. **add a ratio** to `ImageRatio` in `lib/projects.ts` *and* `RATIO_CLASS` in
   `components/ui/plate.tsx` — correct when the same drift keeps recurring.

Never silently accept a flagged crop on a character piece; the crop lands on a
face.

> **Tuning dial.** `CROP_TOLERANCE` and `shouldFlagCrop()` in
> `scripts/ingest-artwork.mjs` decide how often this stage interrupts. They
> ship at a deliberately provisional 8%, and portrait and landscape are
> currently judged identically — which is probably wrong. See the TODO block
> in that file.

---

## Stage 2 — Look at the work

Before asking Josh anything, **read every ingested image** with the Read tool.
This is what makes the interview short: you arrive with drafts, not blanks.

From the artwork alone, form a view on:

- what the pieces have in common — medium, line quality, palette, subject;
- which is the strongest opener, and whether the script's hero pick agrees;
- which two should sit side by side (the first two gallery entries render as a
  two-up row, so pair them by ratio and subject);
- a candidate `category`, `discipline`, `accent`, and draft `summary`, `alt`
  and `brief` per [reference/voice.md](reference/voice.md).

Sample the accent from the artwork rather than inventing one — a colour pulled
from the piece is the point of the per-project wash.

---

## Stage 3 — Interview

Use `AskUserQuestion` for the closed fields, batching up to four at a time.
**Always lead with your proposal.** "Category — I read this as Packaging" beats
"What category is this?".

### Closed fields — ask as options

| Field | Options |
| ----- | ------- |
| `category` | the `PROJECT_CATEGORIES` union. A new value means editing the union, which also adds a filter chip to `/work` via `getActiveCategories()`. Flag that. |
| `featured` | yes / no — **see the guardrail below** |
| `accent` | 2–3 swatches sampled from the artwork, plus "house yellow" (omit the field) |
| hero | your pick vs the runner-up, if you disagree with the script |

### Open fields — ask as prose, with a draft attached

`title` · `client` · `year` · `discipline` · `deliverables` · `summary` ·
`heroCaption` · `brief` (2 paragraphs) · `credits` (role/name pairs).

Facts are Josh's, always. Never invent a client name, a year, a print method,
a dimension or a collaborator. If a credit is unknown, ask; if he does not
know either, leave the role out rather than filling it.

Derive `slug` from the title in kebab-case, and check it against existing
slugs — it is the route, so a collision is a broken page. If it collides,
propose an alternative rather than appending a number.

### Guardrail — `featured` is capped at three

`getFeaturedProjects(limit = 3)` filters by `featured` and then **slices to
three, newest first**. A fourth featured project does not appear on the
homepage; it silently displaces the oldest. So if three are already featured
and Josh wants this one featured, ask which existing project gets demoted, and
change both in the same commit.

---

## Stage 4 — Write the entry

One new object in the `projects` array in `lib/projects.ts`, inserted at the
top so the file reads newest-first.

- Fill `src` on every image from the manifest. An image without `src` renders
  as a taupe placeholder — correct while artwork is pending, wrong here.
- `ratio` comes from the manifest, not from your reading of the image.
- Match the surrounding formatting exactly; prettier runs on save via the
  PostToolUse hook, but field order and comment style are yours to match.
- Raw hex is permitted for `accent` and nowhere else. That is the one
  sanctioned exception in `CLAUDE.md`; do not add colours to any other field.
- Touch no other file unless the interview decided to add a ratio, add a
  category, or demote a featured project.

Then commit — assets and entry as one logical unit, any type-union change as a
separate commit before it.

---

## Stage 5 — Preview

Do not ask Josh to check it. Drive it:

1. `preview_start` with `{ name: "josh-mckenna-dev" }`.
2. Screenshot `/work/<slug>` — hero, write-up, sticky credits, image stack.
3. Screenshot `/work` — the new card, and the filter count if the category is
   new.
4. `read_console_messages` — hydration warnings are this site's most likely
   failure, and three components animate from client state.
5. Re-check at mobile width; the two-up gallery row collapses to one column.

Send the screenshots with `SendUserFile`. Say what you want him to look at —
crops, colour, ordering — rather than "let me know if this looks right".

Then run `npm run build` and confirm `/work/<slug>` appears in the route table
as static. A project that does not prerender is a regression on a static site.

---

## Stage 6 — Publish

Only after Josh approves the preview.

1. `/design-review` on the diff. A FAIL blocks the PR.
2. Push `feat/project-<slug>` and open the PR with `gh pr create`.
3. PR body: the artwork's origin (folder, chat drop, or the Figma node URL),
   the ratio snaps that were flagged and how each was resolved, and anything
   still unresolved — a missing credit, a placeholder year.
4. Do not merge. Josh merges.

---

## Guardrails

- **Never invent content.** Names, dates, dimensions, clients and credits come
  from Josh. A plausible-sounding fabricated credit is the worst possible
  output of this skill.
- **Never write an entry whose `src` does not exist on disk.** The build will
  not catch it.
- **Never commit into a dirty tree** you did not create.
- **Never bundle.** Union changes, the project entry, and a featured demotion
  are separate commits.
- **Stay static.** No API route, no CMS, no upload endpoint. The drag-and-drop
  surface is the Claude Code prompt, not a page on the site.
- Read content through the helpers in `lib/projects.ts`, never the array.
