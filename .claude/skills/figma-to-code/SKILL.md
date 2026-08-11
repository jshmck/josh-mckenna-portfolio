---
name: figma-to-code
description: |
  One-shot: take a Figma design link all the way to production code by running
  /figma-design (capture) → /canvas-to-code:start (build or reconcile) with all the
  repo's best practices baked in. Use this whenever the user hands over a figma.com
  design link and wants it implemented — activates on phrasings like "this is the
  design for <X>, run this through /figma-design and /canvas-to-code:start and build",
  "build all exactly match to the tsx/screenshot", "match 100%", "rebuild the <X>
  from this figma", or a bare figma.com/design link + a build intent. Saves retyping
  the full pipeline every time. Orchestrates the two existing skills — it does NOT
  replace or compete with them.
---

# /figma-to-code — Figma link → production code (one command)

You handed me a Figma link and want it in the app, matched faithfully. This skill runs
the **whole pipeline** so you don't retype it. It is a thin conductor over two existing
skills — `/figma-design` (capture) and `/canvas-to-code:start` (bridge) — plus the
judgment calls and gotchas from `.context/playbooks/figma-to-code.md` (read it — it is
the source of truth for the *why*; this file is the *run order*).

## Inputs (parse from the user's message; ask only if truly missing)

- **The Figma link.** ⚠️ **If the URL has `focus-id`, THAT is the target node** —
  `node-id=0-1` is just the page. e.g.
  `…?node-id=0-1&m=dev&focus-id=1152-50153` → target node `1152:50153`. Convert `-`→`:`.
  If there's no `focus-id`, use `node-id` (must be a concrete node, not `0-1`).
- **Target route / feature.** Confirm it if not obvious. If prior iters exist for the
  same surface (`.claude-design/<feature>/<subpage>/figma/`), infer and state your
  assumption instead of prompting.
- **Intent.** "build all", "match 100%", "rebuild <surface>" → fidelity is paramount:
  fidelity-audit the result against the captured screenshot before finishing.

## Run order

1. **Capture — invoke `/figma-design import <node-url>`.** It writes + commits a v2
   iter (`source: figma`) under `.claude-design/<feature>/<subpage>/figma/iter-NN-…/`.
   Honor its gotchas (they're in that skill): fetch → `bun run figma:extract` in one
   pass; no pre-created empty `jsx/`; drop 8-digit alpha hex from `vars.tmp.json`;
   component-set / proposal-board nodes give sparse codegen → decode the **contract**
   from the metadata tree + screenshot and record it in `notes.md`.
   - **For a full redesign, capture the WHOLE surface + every state as ONE coherent
     iter set FIRST — before any coding.** Aligning to a moving/piecemeal target (some
     nodes old, some new, one a wireframe) guarantees a mix-and-match hybrid. Fix the
     target before you build against it.
2. **Readiness — `/design-handoff`.** Fix any blocker; never auto-promote.
3. **Pick the posture — DEFAULT is full REDESIGN (rebuild wholesale).** Owner
   preference (durable): *"mostly don't restyle — all should be redesign."* Treat the
   Figma design as authoritative for STRUCTURE and rebuild the presentational layer from
   the iter by default; do NOT patch the old markup (patching makes the old render tree
   the base → old scaffolding survives underneath = mix-and-match hybrid). Three cases:
   - **Surface does NOT exist → BUILD** from the iter (emit new slices).
   - **Surface exists → REBUILD the presentational layer WHOLESALE (the default).** Make
     the **iter the single source of structure**; regenerate the markup from it and
     re-attach only the **data/behavior seams** (props, hooks, services, handlers — they
     live in the container/hook layer, not the markup); then **DELETE the old
     presentational code** (leftover branches/components ARE the hybrid). Two ways: (A)
     `/canvas-to-code:start` from the iter — best for drastic redesigns, old markup can't
     bleed in by construction; (B) tell the subagent "rebuild this component's render
     tree from iter N, then wire back these seams" — never "align the existing markup".
   - **RESTYLE + patch-in-place is the RARE exception** — only when the structure is
     genuinely identical and it's a pure token/spacing/label tweak. If you take this
     path, **say so explicitly**; when in doubt, redesign.
   > A read-only **conformance reconcile** (audit an existing surface against a spec,
   > flag drift, emit no code) is a separate VERIFICATION activity — still fine to run,
   > and it's not "restyle". The default above is about how you IMPLEMENT a design.
4. **Bridge — invoke `/canvas-to-code:start`** pointed at the iter (Gate-5a
   short-circuit uses the pre-extracted JSX). Reconcile mode → run read-only (audit →
   map → flag drift); build / wholesale-rebuild mode → let it emit slices from the
   design. See the reconcile section in `.context/equipment/canvas-to-code.md`.
5. **Implement.** Reconcile → fix confirmed drift only. Rebuild → regenerate markup +
   rewire seams + delete old code. For multi-file work, dispatch **parallel
   `typescript-implementer` subagents, one per disjoint file** (Opus), each grounded in
   the captured screenshot + notes + a reference page, each told to STOP-and-report
   rather than fabricate. **Every added control must be functional over a real data
   facet — never a dead button.**
6. **Gates + MEASURED visual QA:**
   - `bun run typecheck` · `bun run test` (never `bun test`) · `bun run build` ·
     `/design-review`.
   - **Pixel-diff fidelity audit (this is the measured gate, not eyeballing):** open the
     surface in-browser, capture a **crop of just the component region** (browser `zoom`
     of its bbox — not the full viewport, or the app chrome swamps the diff), save it,
     then run:
     ```
     bun run figma:fidelity --reference <iter>/screenshots/01-baseline.png \
       --actual <live-crop.png> --out <scratchpad>/fidelity.png
     ```
     Read the report: if `aspectSkewPct` is high, re-crop to match the Figma node before
     trusting the %. Open the diff PNG; for each high-% region decide **real drift**
     (wrong spacing/color/missing element → fix) vs **noise** (live-vs-mock DATA, fonts,
     anti-aliasing → ignore). The % is a spotlight, never a pass/fail verdict.
   - **Whole-page parity sweep (default, since redesign is the default), not
     per-component.** Render the real page next to the FULL Figma frame and hunt leftover
     old chrome — per-component checks structurally can't catch a hybrid.
7. **Commit + push** per the repo's git mode (`scripts/git-mode.sh`): fast-track →
   commit+push to `development`; reviewed → feature branch → PR.

## Judgment — surface these, don't decide unilaterally

- **Two Figma sources contradict** (e.g. a kebab spec vs a standardization board on
  where a control lives) → `AskUserQuestion`, don't pick a side.
- **A spec omits a working feature, or a page-mock and an archetype legend disagree**
  → ask; owner decisions win over the mock and are durable — record them in memory
  (see `[[brand-hub-header-archetypes]]` for worked examples).
- **"Match 100%" ≠ blindly add every control the spec shows** — if a page has no real
  facet/dimension, omit + note rather than ship a dead control.

Otherwise proceed without re-prompting — that's the point of this skill.

## Fidelity discipline — read this or you WILL diverge (hard-won, 2026-07-16)

A whole design-system rebuild diverged 15+ times because it was built from **screenshots
+ the nearest repo primitive** instead of the **literal fetched JSX**, and because layout
geometry was composed instead of read from the frame. Do NOT repeat these:

1. **Port the LITERAL per-state JSX** — translate each `className`'s Figma slash-var via
   the iter's `tokens.json` (the extractor's exact map). Never eyeball structure from a
   screenshot, and never swap in the closest existing component because it "looks right"
   (that's how a bare-pill toggle became two icon buttons, and a neutral pill became
   Aperol). If a value is in the JSX — a bg color, a padding, a control type — read it;
   don't guess. When a complaint is "why didn't you get this from the JSX?", the answer is
   always: because I didn't open the JSX for that element.
2. **Read column widths / ratios / gaps from the parent FRAME**, not the component JSX.
   The drawer:preview ratio (e.g. 440:1034 ≈ 30:70) lives in the page frame's child
   geometry (`get_metadata` x/width), never in the drawer *component*. Keep ratios via
   flex-grow; don't hardcode px.
3. **Target-node JSX beats a component-set INVENTORY.** A kit board listing a variant
   (e.g. a "Timeline" drawer mode) is not the page. If the actual target frame shows only
   Basic/Advanced, that wins.
4. **Read the SPECIFIC state's JSX** — don't carry an element from one state (a
   missing-brand "Main Settings" header) onto another (populated).
5. **Apply repo rules even while porting literally** — §13 no-layout-shift especially:
   the JSX's per-variant padding (active `px-0` / inactive `px-3`) shifts at runtime;
   normalize it + reserve the active-indicator space.
6. **Dedupe a control captured in two nodes** (a picker in both the drawer and preview
   node → one home; ask the owner which).

See memory `[[figma-literal-port-and-frame-geometry]]`.

## Do NOT

- **NEVER make a capture "spec-only"** (screenshots + notes without `jsx`/`tokens`).
  EVERY captured node produces the FULL artifact set — screenshot(s) **+** extractor-input
  context **+** `jsx/*.tsx` **+** `tokens.json` — every single time, even when the iter
  only refines an existing component. "It's just refining X so I'll skip the jsx" is a
  corner you do not cut (owner rule; see memory `[[figma-capture-always-full]]`).
- Feed a **raw Figma export** to `/canvas-to-code` (its Figma decoder is a stub) —
  always go through `/figma-design`.
- **Default to patch/restyle** — this repo's default is a full redesign (rebuild
  wholesale). Only patch in place for a genuine pure-token tweak, and say so.
- **Hand-align the old markup** — it produces a mix-and-match hybrid (old scaffold
  survives under new styling). Rebuild the render tree from the iter and re-attach seams
  instead; then delete the old code.
- **Emit code during a read-only conformance CHECK** — a reconcile run only audits +
  flags drift; that's distinct from implementing a design (which rebuilds wholesale).
- **Capture piecemeal.** Aligning card, then menu, then a state — against an
  inconsistent node set — blends versions. Capture the whole surface + all states as one
  coherent iter set first.
- Treat the **pixel-diff %** as a pass/fail verdict, or run it on a full-viewport
  screenshot (crop to the component first).
- Run any of this from the monorepo root — run root is `frontend/`.

## Related

`.context/playbooks/figma-to-code.md` (the why + rebuild-vs-patch posture) ·
`.claude/skills/figma-design/SKILL.md` · `.context/equipment/canvas-to-code.md` ·
`.context/playbooks/design-workflow.md` · `scripts/figma/fidelity-diff.ts`
(`bun run figma:fidelity`) · memory `[[full-redesign-rebuild-posture]]`,
`[[canvas-to-code-fidelity-audit]]`.
