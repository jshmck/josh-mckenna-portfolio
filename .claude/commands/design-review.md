---
description: Design-system quality check on the working diff. Flags token, type, motion and accessibility drift with file:line citations, then returns PASS or FAIL.
allowed-tools: Read, Bash, Grep
---

# /design-review — design-system quality check

Activate the `frontend-design`, `brand-guidelines` and `bos-code-quality` skills,
then apply the checks below to the current diff. This command is **read-only** —
report, don't fix.

## Step 1 — scope

```bash
git diff --cached --name-only; git diff --name-only
```

In scope: `app/**`, `components/**`, `lib/**`, `app/globals.css`. Skip config,
docs and tests. If nothing is in scope, report
`No design files in diff — review skipped. Verdict: PASS`.

## Step 2 — the checks

Record every match with **file path and line number**.

### 1 — Raw hex outside the token block

Pattern: `#[0-9a-fA-F]{3,8}` in any file other than `app/globals.css`.

Every colour resolves through a `@theme` token: `bg-canvas`, `text-ink`,
`text-ink-muted`, `border-hairline`, `bg-accent`, `text-accent`,
`bg-placeholder`, `bg-placeholder-strong`, `bg-highlight`. A raw hex in a
component means the palette now lives in two places.

**One sanctioned exception:** `Project.accent` in `lib/projects.ts` — a
per-project wash is content, not chrome, and is applied via inline style in
`app/work/[slug]/page.tsx`.

### 2 — Bracket CSS-var syntax

Pattern: `\[var\(--`

Use the mapped class (`bg-canvas`), never `bg-[var(--color-canvas)]`. Bracket
notation breaks IntelliSense and silently drops opacity modifiers — `/30` on a
bracketed CSS var produces no opacity at all and no error.

### 3 — Ad-hoc type instead of a semantic role

Pattern: `text-[` with a px value, or `font-\['`, in `app/**` / `components/**`.

Four roles cover this site: `type-display`, `type-heading`, `type-label`,
`type-lede`. A fifth size is a design decision, not a utility — if a new role is
genuinely needed, it goes in `globals.css` as an `@utility`, not inline.

Body copy at `text-[15px]` with `font-body` is sanctioned (it's the wireframe's
body size and appears in the meta grids and card titles).

### 4 — Accent misuse

Pattern: `border-accent`, or `bg-accent` / `text-accent` on something that
isn't a CTA, a hero navigation object, or an annotation.

`--color-accent` (#ff3b2f) marks the commission path. It is not a border colour
for containers and not a decorative fill. Containers use `border-hairline`.

### 5 — Thick borders

Pattern: `border-2`, `border-4`.

Always wrong. Use `border` (1px). The hero's navigable objects use
`border-[1.5px]` — that value is ported from Figma and is the only exception.

### 6 — Banned icon

Pattern: `Sparkles`.

Hard ban, no exceptions.

### 7 — Unguarded motion

Any new `requestAnimationFrame` loop, `animate-*` class, or scroll listener that
does not check `prefers-reduced-motion`.

The global rule in `globals.css` neutralises CSS `animation` and `transition`,
but it **cannot stop a rAF loop or a scroll handler** — those need an explicit
`window.matchMedia("(prefers-reduced-motion: reduce)").matches` early return.
Reference implementations: `components/home/drifting-hero.tsx`,
`components/ui/parallax.tsx`, `components/about/decompose-sequence.tsx`.

### 8 — Images bypassing Plate

Pattern: `<img` or `next/image` imported anywhere except `components/ui/plate.tsx`.

Every artwork slot flows through `<Plate>` so the placeholder state stays
consistent and every image keeps its `sizes` attribute.

### 9 — Interactive element without accessible semantics

A clickable `div`, an icon-only control with no accessible name, or a decorative
element that isn't `aria-hidden`.

Specifically: hero objects that navigate must be `<Link>` with an `aria-label`;
the three decorative ones must be `aria-hidden="true"`.

### 10 — Missing `sizes` on a fill image

A `<Plate>` used without a `sizes` prop. Without it Next serves the largest
candidate to every viewport, which is the single most common way an
image-heavy portfolio loses its Lighthouse score.

## Step 3 — report

```
## Design Review

**Files reviewed:** {n}
**Findings:** {total}

### {n} — {check name}
{No findings} OR:
- components/work/project-card.tsx:31 — `text-gray-400`

---
**Verdict: PASS** (no findings)
```

or `**Verdict: FAIL** — {n} finding(s). Fix before committing.`

Flag ambiguous cases with `(verify manually)` rather than guessing — an accent
on an element that may or may not be a CTA is a question, not a failure.
