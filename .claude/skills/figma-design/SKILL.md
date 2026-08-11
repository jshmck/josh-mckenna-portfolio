---
name: figma-design
description: |
  Capture, iterate on, and inspect Figma designs via the Figma MCP into the
  .claude-design/ folder structure — the design-to-code producer, sourced from
  Figma Dev Mode. Activates on /figma-design
  slash command or phrases like "import figma design", "capture figma node",
  "figma to code", "snapshot figma frame", "figma iter", "inspect figma".
  Generic on node URL — works for any feature/subpage.
---

# /figma-design — Figma Dev Mode capture + iteration

End-to-end skill for moving UI designs from a **Figma file** into the repository's
`.claude-design/` exploration folders, in the **exact v2 iter shape** the
`/design-handoff` → `/canvas-to-code` pipeline already ingests. It is the
standalone design-to-code producer: it captures a Figma node and writes the v2
iter contract straight into `.claude-design/`, ready for the bridge to short-circuit.

**Keywords**: figma, dev mode, node, frame, get_design_context, variable, token,
import, capture, baseline, iter, variation, snapshot, inspect, design-to-code

## Why this exists (and why NOT the canvas-to-code Figma decoder)

`/canvas-to-code`'s built-in Figma path is a **stub** — its extractor explicitly
passes a Figma export through untouched (`// TODO: figma decoder not yet
implemented`). So we never feed canvas-to-code a raw Figma export. Instead this
skill **produces a v2 iter folder** (`source: figma`), which makes canvas-to-code
take its **iter short-circuit** (Gate 5a) — copying our clean pre-extracted JSX,
the way it ingests any v2 iter. The high-fidelity path, not the stub.

## Mental model

```
            ┌─────────────────────────┐
            │   Figma file (Dev Mode) │
            │  figma.com/design/...   │
            └────────────┬────────────┘
                         │  (1) import  node-url → iter
                         │  (2) variation  sibling node → next iter
                         │  (3) inspect  report iter state
                         ▼
            ┌─────────────────────────┐
            │  .claude-design/        │
            │   <feature>/<subpage>/  │
            │   figma/iter-NN-<slug>/ │
            └────────────┬────────────┘
                         │  (separate: /canvas-to-code:start — see /design-handoff)
                         ▼
            ┌─────────────────────────┐
            │  React production code  │
            └─────────────────────────┘
```

The skill writes to `.claude-design/` only. It never edits production React — that's
the bridge's job. It writes the **v2 iter contract** (owned by `/design-handoff`),
with `<tool>` = `figma/` and `source: figma`.

## Folder convention (the v2 iter shape)

```
.claude-design/<feature>/<subpage>/figma/iter-NN-<slug>/
  source-meta.yaml
  notes.md
  screenshots/01-<view>.png
  jsx/<feature>-<subpage>.tsx
  tokens.json              # figma-design-specific: the resolved-token sidecar
```

- `<feature>` / `<subpage>` — decided from the **target route**, not the Figma node
  name. Ask the user for the route the node maps to (the Figma frame name is a hint,
  never authoritative). `<subpage>` = `home` when the route is the feature index.
- `<tool>` — always `figma/` for this skill.
- `iter-NN-<slug>` — `iter-01-baseline` for the first capture; subsequent
  `iter-NN-<short-kebab-slug>` describes design intent / state.

See `.claude-design/<feature>/README.md` for the shared convention.

## Source-meta v2 schema (the bridge contract)

Identical to the canonical schema in
[`../design-handoff/SKILL.md` § Source-meta v2 schema](../design-handoff/SKILL.md#source-meta-v2-schema-the-bridge-contract).
Never duplicate it — the only differences for a Figma iter are:

```yaml
metaVersion: 2
source: figma # ← the discriminator that routes to the iter short-circuit
feature: market
subpage: home
targetRoute: /market
jsxPath: jsx/market-home.tsx
primaryScreenshot: screenshots/01-baseline.png
```

Figma-specific optional provenance (bridge preserves, ignores):

- `figmaFileKey`, `figmaNodeId`, `figmaNodeName` — pointers back to the source.
- `capturedScale` — the node's `original_width` ÷ rendered width, so the scale
  caveat is recorded (see gotchas).
- `forceCode: true` — records that codegen was forced (the normal path).
- `tokensSidecar: tokens.json` — points at the resolved-token head-start.

## Invocation handling — route without assuming

| Args                                                            | Route                          |
| --------------------------------------------------------------- | ------------------------------ |
| A Figma URL containing `?node-id=` (or `figma.com/design/…`)    | Workflow 1 (Import)            |
| `variation <node-id\|node-url>`                                 | Workflow 2 (Variation)         |
| `inspect` (exact keyword)                                       | Workflow 3 (Inspect)           |
| **No args, or ambiguous**                                       | **Prompt + wait. Don't default.** |

A bare node URL **with** `?node-id` → import. A `figma.com/design` URL **without**
`node-id` → ask for a node-specific URL (the MCP requires a concrete node target;
never guess a nodeId).

When no args: print the menu and **stop**. Do NOT call `AskUserQuestion` (it blocks
the user from supplying the URL in the same reply). Do NOT fall through to inspect.

> Which workflow?
>
> - `import <figma-node-url>` — capture a node into a new iter (URL must include `?node-id=`)
> - `variation <node-id|url>` — capture an alternate/sibling frame as the next iter
> - `inspect` — report figma iter state + bridge-readiness (no input needed)
>
> Reply with workflow + input on one line.

Then **WAIT**.

## Verify once per session

Before the first capture, call `mcp__figma__whoami`. If it errors or returns no
team with a Dev/Full seat, stop and tell the user the file/seat isn't reachable.
`get_code_connect_map` requires an Org/Enterprise Dev seat — the "open session"
org now has it (tier `org`, seat `Dev`), so it no longer errors. **Try it**: if
it returns mappings (non-empty), feed them to the bridge so reuse resolves to the
real `shared/components/*`. But it returns `{}` for designs built from **raw
frames** (no published component instances — "No published components found"),
which is how designs in this project are currently authored; in that case reuse-mapping stays
manual at the canvas-to-code mapper. On a seat error (lower tier), catch and skip;
never treat it as fatal.

## Three workflows

### 1. Import (Figma node URL → iter folder)

**Trigger**: user provides a Figma URL with `?node-id=`.

**Steps**:

1. Parse the URL → `{ fileKey, nodeId }`. URL `figma.com/design/:fileKey/:name?node-id=1-2`
   → `fileKey = :fileKey`, `nodeId = 1:2` (convert `-` to `:`).
2. Confirm the **target route** with the user → derive `<feature>`/`<subpage>`.
   Do not infer the route from the Figma node name alone.
3. Determine the iter folder: if `<feature>/<subpage>/figma/` doesn't exist →
   `iter-01-baseline/`; else next-numbered `iter-NN-<slug>` (ask for the slug).
4. **Structure pass** — `mcp__figma__get_metadata({ fileKey, nodeId })`. Read the
   child tree. Classify (see § Multi-state detection):
   - **single screen** → capture this node directly.
   - **N sibling screens** (states) → propose one iter each sharing `targetRoute`;
     confirm with the user before capturing more than one.
   - **ambiguous** → ask.
5. **Visual** — `mcp__figma__get_screenshot({ fileKey, nodeId, maxDimension: 1400 })`.
   Download the PNG via the returned URL+curl into `<iter>/screenshots/01-baseline.png`.
   Record `original_width`/`original_height` for `capturedScale`.
6. **Code** — `mcp__figma__get_design_context({ fileKey, nodeId, forceCode: true,
   excludeScreenshot: true, clientFrameworks: "react", clientLanguages: "typescript,tsx,css" })`.
   - `forceCode: true` is **required** — without it large nodes degrade to a bare
     structure tree (verified: a 4720px board returns the tree by default but full
     JSX with forceCode). The result is persisted to a tool-result file when large;
     **do not read it into context** — pass its path to the extractor (step 8).
   - Only if `forceCode` itself still degrades (not observed in practice) → fall
     back to § Auto-chunk.
7. **Variables** — `mcp__figma__get_variable_defs({ fileKey, nodeId })`. Write the
   returned object to `<iter>/vars.tmp.json` (a scratch input for the extractor).
8. **Extract** (deterministic, no context cost):
   ```
   bun run figma:extract \
     --context <persisted get_design_context file> \
     --vars    <iter>/vars.tmp.json \
     --out     <iter> --slug <feature>-<subpage> \
     --node <nodeId> --file <fileKey>
   ```
   This writes `jsx/<slug>.tsx` (re-headered verbatim Figma codegen) and
   `tokens.json` (every var resolved to its nearest project token via
   `paper-figma-map.json` + OKLab snap). Delete `vars.tmp.json` after. The script
   **refuses** to write if handed a degraded structure tree — that's the signal to
   re-run step 6 with forceCode (or chunk).
9. **Assets** — for each entry in `tokens.json.assets`, `mcp__figma__download_assets`
   into `<iter>/assets/` and rewrite the JSX const to the local path, OR list them
   in `notes.md` as gaps. The inlined `figma.com/api/mcp/asset/…` URLs expire in
   ~7 days — never leave them as the only reference.
10. **Scaffold** `source-meta.yaml` (v2 + Figma provenance) and `notes.md` (what was
    captured, multi-state decision, scale factor, asset handling, fidelity flags).
11. **Commit**: `feat(<feature>): add Figma iter-NN-<slug> for <subpage>`.
12. Run the `/design-handoff` decision rules; if all four pass, suggest
    `/canvas-to-code:start`. Never auto-promote.

### 2. Variation (sibling/alternate node → next iter)

**Trigger**: `variation <node-id|node-url>` — a different frame in the same file
(an alternate state, a redesign of the same route).

**Steps**:

1. Resolve `{ fileKey, nodeId }` (reuse the current file's `fileKey` if only a
   node-id is given).
2. Confirm the target `<feature>/<subpage>` — same route as the baseline if this is
   another state; a new route if it's a different page.
3. Next iter number = highest existing under `<feature>/<subpage>/figma/` + 1. Ask
   for a slug describing the variation's intent.
4. Run import steps 5–11 against the node.
5. In `notes.md`, prompt the user for what this variation tries differently and
   what's worth promoting. Don't fabricate intent — ask.

### 3. Inspect (report state, suggest captures)

**Trigger**: user types `inspect` / "what figma iters exist" / "any pending figma
captures". **Never** triggered by absence of args.

**Steps**:

1. Scan `.claude-design/` for all `<feature>/<subpage>/figma/iter-*/source-meta.yaml`.
2. Report **bridge-readiness** per iter (the canvas-to-code contract):
   - **Bridge-ready** ✅: `metaVersion: 2`, all required v2 fields present, and
     `jsxPath` + `primaryScreenshot` resolve on disk.
   - **Bridge-pending** ⚠️: missing/old `metaVersion`, missing fields, or referenced
     files absent. Print exactly which.
3. Flag **stale assets**: any iter whose `tokens.json` still has `localized: false`
   entries older than ~7 days → the asset URLs have likely expired; suggest a
   re-capture.
4. For each bridge-pending iter, print the lines needed to backfill. Don't auto-edit
   — show the diff and let the user confirm. Never auto-capture.

## Multi-state detection (Decision: detect & ask)

After `get_metadata`, look at the direct children of the captured node:

- If ≥2 children have **similar large dimensions** and each is a **self-contained
  layout** (its own rail/header/content) → treat as **N states** → propose one iter
  per child sharing `targetRoute`, and confirm before capturing more than the first.
- If children are **sub-regions of one layout** (a header band + a content column +
  a sidebar) → it's **one screen** → capture the parent node as a single iter.
- When unsure → ask the user "is this one screen or N states?" before capturing.

This is the state-vs-region call; keep the user in control of it.

## Auto-chunk (rare fallback only)

`forceCode: true` returns full JSX even for very large nodes, so chunking is almost
never needed. Use it ONLY if `get_design_context({ forceCode: true })` still returns
a structure tree (the extractor exits with code 2):

1. From the `get_metadata` tree, take the node's direct children.
2. `get_design_context({ forceCode: true })` per child → verbatim child JSX.
3. Reconstruct the parent wrapper from the children's `x/y/w/h` geometry (stack
   direction, gap, padding) — mark it `data-inferred-layout` and note it in
   `notes.md`. The screenshot + the mapper are the layout ground truth downstream.
4. Descend another level only where a child *still* degrades. Cap the depth; if a
   single leaf still degrades, stop and ask the user to point at a smaller frame.

Cross as few boundaries as possible — every inferred wrapper replaces real CSS.

## Constraints + gotchas

- **`forceCode: true` is mandatory on the code call.** Default get_design_context
  degrades large nodes to a structure tree (no CSS). Verified live on this repo's
  files. The extractor guards against accidentally writing a tree.
- **Never read the JSX into context.** Large nodes persist to a tool-result file
  (50–200KB+). Always hand the file path to `bun run figma:extract`; never `Read`
  the whole thing.
- **Expiring asset URLs.** The inlined `figma.com/api/mcp/asset/…` constants live
  ~7 days. Localize via `download_assets` at capture (step 9), or the iter rots.
- **Scale pollution.** If a frame is drawn above 1× (boards in this project often are), literal
  `text-[Npx]` / `w-[Npx]` are inflated. The **variable names** in `tokens.json` are
  authoritative; record `capturedScale` so the mapper can divide out.
- **Code Connect is available but usually empty.** The "open session" org now has
  the Dev seat (tier `org`), so `get_code_connect_map` no longer errors — but it
  only returns links for **published Figma component instances** that have been
  mapped to code. Designs in this project are built from raw frames (no published components +
  no mappings authored), so it returns `{}` today. Try it; use mappings when
  present; otherwise component reuse is the canvas-to-code mapper's job (manual
  against `shared/components/`). To make it useful: publish a Figma component
  library, build designs from instances, then author mappings via
  `get_code_connect_suggestions` → `add_code_connect_map`/`send_code_connect_mappings`.
- **Tokens are reference, not production.** `jsx/*.tsx` keeps Figma's slash-form
  vars; `tokens.json` is a head-start, not a binding. The mapper owns final Style-2
  token + component decisions. Rows with `safe: false` in tokens.json need review.
- **Route comes from the user, not the node name.** Always confirm the target route.
- **Capture the parent FRAME's layout geometry, not just the component.** Column widths,
  the multi-pane ratio (e.g. a 440px drawer next to a 1034px preview), and gaps live in
  the PAGE FRAME's child `x`/`width` (`get_metadata`), NOT in a component's JSX. Record
  them in `notes.md` (e.g. "drawer:preview = 440:1034 ≈ 30:70") so the bridge sizes
  columns by ratio (flex-grow), never guessed. This is a real recurring miss — see memory
  `[[figma-literal-port-and-frame-geometry]]`.
- **Target-node JSX beats a component-set INVENTORY** at build time. A kit board that
  lists variants is a conformance spec, not the page; the actual target frame's JSX wins.
- **No production code edits.** `.claude-design/` iters are staging only.
- **A capture is NEVER "spec-only" — always produce the full artifact set.** Every
  captured node must end with ALL of: `screenshots/*.png` + the extractor-input context +
  `jsx/<slug>.tsx` + `tokens.json` (+ `source-meta.yaml` referencing `jsxPath` +
  `tokensSidecar` + `primaryScreenshot`). Even when the iter merely *refines an existing
  component* (states/variants), you still run the extractor and produce jsx+tokens — do
  NOT stop at screenshots + notes. (Owner rule 2026-07-12; memory `[[figma-capture-always-full]]`.)
- **Fetch → extract in ONE pass; never pre-create an empty `jsx/` dir.** The sequence
  is: `get_design_context` (forceCode) → immediately `bun run figma:extract` → *then*
  scaffold `source-meta.yaml`/`notes.md`. `figma:extract` creates `jsx/` itself, so
  running `mkdir -p .../jsx` up front just leaves a misleading empty folder in the gap
  ("why is there no jsx?"). And the extractor re-headers the **verbatim** codegen — do
  NOT hand-write a summarised context file; pass the full persisted `get_design_context`
  result (or the complete code string) so the `jsx/` reference is faithful.
- **8-digit alpha hex crashes the token resolver.** `get_variable_defs` returns some
  colors as `#rrggbbaa` (e.g. `#ffffff33`, `#0000002e` — shadow/alpha tokens). The
  extractor's OKLab `nearestToken` throws `Invalid hex color` on these and writes no
  `tokens.json`. Drop the 8-digit entries from `vars.tmp.json` before running (they're
  effect/alpha colors that don't map to a Style-2 token anyway); the `jsx/` still wrote.
- **Component-instance nodes return sparse/empty codegen.** Component **sets** (e.g. a
  multi-variant "Overflow Menu") and **annotated proposal/legend boards** are built from
  Figma component *instances*; `get_design_context` returns little/no CSS for the
  instance regions. Capture them anyway — but the **contract** (which controls/rows per
  variant, the archetype rules) is the payload, not the pixels. Decode the variants from
  the `get_metadata` tree + the screenshot, and record the contract in `notes.md`. These
  nodes are best used as a **conformance spec** for canvas-to-code, not a pixel source.

## Files this skill creates / modifies

| Path                                                                | Action  |
| ------------------------------------------------------------------- | ------- |
| `.claude-design/<feature>/<subpage>/figma/iter-NN-<slug>/`          | created |
| `…/iter-NN-<slug>/source-meta.yaml`                                 | created |
| `…/iter-NN-<slug>/notes.md`                                         | created |
| `…/iter-NN-<slug>/screenshots/01-*.png`                             | created |
| `…/iter-NN-<slug>/jsx/<slug>.tsx`                                   | created |
| `…/iter-NN-<slug>/tokens.json`                                      | created |
| `…/iter-NN-<slug>/assets/*` (localized images)                      | created |

**Never modifies**: production code (`app/`, `shared/`, `features/`), other iters,
the bridge's canonical handoff files.

## Cross-references

- [`../design-handoff/SKILL.md`](../design-handoff/SKILL.md) — the seam to
  Canvas-to-Code; **owns the canonical v2 source-meta schema this skill writes
  against**, and carries the four readiness rules.
- [`scripts/figma/extract-design-context.ts`](../../../scripts/figma/extract-design-context.ts)
  — the deterministic JSX + tokens.json extractor (`bun run figma:extract`).
- [`scripts/figma/nearest-color.ts`](../../../scripts/figma/nearest-color.ts) +
  [`.canvas-to-code/paper-figma-map.json`](../../../.canvas-to-code/paper-figma-map.json)
  — the hex → project-token resolver the extractor reuses.
- [`.claude/commands/figma-design.md`](../../commands/figma-design.md) — the
  slash-command entry point.
- `mcp__figma__*` — Figma MCP tool reference (`get_metadata`, `get_screenshot`,
  `get_design_context`, `get_variable_defs`, `download_assets`, `whoami`).
