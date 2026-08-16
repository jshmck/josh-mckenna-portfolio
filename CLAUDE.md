@AGENTS.md

# Josh McKenna — portfolio

A static Next.js 16 portfolio for illustrator Josh McKenna.

**Design source of truth:**
[Website-Ref in Figma](https://www.figma.com/design/eEQKXqithQ17p0iYdEWwvL/Website-Ref?node-id=0-1)
— the built site comes from the
["Josh — Illustrator" wireframes, node 17:125](https://www.figma.com/design/eEQKXqithQ17p0iYdEWwvL/Website-Ref?node-id=17-125).
The red annotations on those frames are implementation contracts, not commentary.
When code and wireframe disagree about a behaviour, check the annotation before
assuming the code is right.

Six routes: Home, Work, Work/[slug], About, Contact, Shop. Every one prerenders
static — there is no backend, no database and no API route. Keep it that way
unless a feature genuinely requires otherwise; the whole site is deployable to a
CDN and that is a feature, not an accident.

## Stack

Next 16.3 (App Router, Turbopack) · React 19.2 · TypeScript · Tailwind v4 · npm.

Tailwind v4 has **no `tailwind.config.js`**. Tokens live in the `@theme` block in
[app/globals.css](app/globals.css). Adding a token there generates the utility.

## Hard rules

- **Colour goes through tokens.** Raw hex belongs in the `@theme` block in
  `globals.css` and nowhere else. Use `bg-canvas`, `text-ink`, `text-ink-muted`,
  `border-hairline`, `bg-brand`, `text-accent`, `bg-placeholder`. The one
  sanctioned exception is `Project.accent` in `lib/projects.ts` — a per-project
  wash is content.
- **Never bracket a CSS var.** `bg-canvas`, not `bg-[var(--color-canvas)]`.
  Bracket notation silently drops opacity modifiers: `/30` on a bracketed var
  produces no opacity and no error.
- **Five type roles, not ad-hoc sizes.** `type-display`, `type-title`,
  `type-heading`, `type-label`, `type-lede`. A new size is a design decision —
  add it as an `@utility` in `globals.css`, never inline.
- **`--color-brand` (#30b7ff) marks the commission path.** CTAs, the JOSH
  McKenna wordmark, the marquee band, the hero navigation cards. `--color-accent`
  (#ae88ff) is the purple display accent — section titles (`SELECTED WORK`,
  `MORE ABOUT JOSH →`) and the active/hovered primary nav link, which also goes
  bold on hover/active as of the nav rework. Neither is a container border
  colour; containers use `border-hairline`. (Josh's v2 retired the old red.)
- **No `border-2` or thicker.** No current exception — the hero objects'
  hover state has no card or outline at all now, just a scale/tilt lift.
- **Never the `Sparkles` icon.** Hard ban.
- **No icons before section headers.**
- **Framed images go through `<Plate>`** ([components/ui/plate.tsx](components/ui/plate.tsx)).
  It renders the taupe wireframe placeholder labelled with its own alt text until
  a real `src` exists, so the site is fully reviewable before any final artwork
  lands. Always pass `sizes` — without it Next serves the largest candidate to
  every viewport. The one exception is the drifting-hero cut-outs: they're
  transparent PNGs rendered with `object-contain` (no rounded frame or surface),
  so they use `next/image` directly — still with `sizes`.
- **Guard every animation.** The global `prefers-reduced-motion` rule in
  `globals.css` neutralises CSS `animation` and `transition`, but it **cannot
  stop a rAF loop or a scroll listener**. Those need an explicit
  `window.matchMedia("(prefers-reduced-motion: reduce)").matches` early return.
- **Never animate through React state.** The three motion components write
  transforms straight to the DOM inside a rAF and update state only when
  something a human reads changes. Driving a 60fps loop through `useState` costs
  hundreds of reconciliations a second.
- **Nothing random or time-dependent in render.** Three components hydrate from
  client state, so a `Math.random()` height or a `Date.now()` in markup produces
  a hydration mismatch. `RATIO_CYCLE` in `work-gallery.tsx` exists for exactly
  this reason.

## Layout

```
app/
  globals.css          design tokens (@theme) + semantic type utilities
  layout.tsx           fonts, metadata, nav/footer shell, skip link
  page.tsx             home
  work/page.tsx        gallery index
  work/[slug]/page.tsx project template (generateStaticParams)
  about/ contact/ shop/
components/
  site/     nav · footer · marquee · cta-band     (chrome, every page)
  ui/       plate · button · reveal · parallax    (primitives)
  home/     drifting-hero                        (page-specific)
  about/    decompose-sequence
  work/     project-card · work-gallery
  contact/  enquiry-form
  shop/     waitlist-form
lib/
  site.ts       nav links, contact details, footer — single source for chrome
  projects.ts   typed project content + access helpers
  about.ts      timeline, clients, sequence captions
```

**Read content through the helpers in `lib/projects.ts`** (`getAllProjects`,
`getProject`, `getFeaturedProjects`, `getProjectNeighbours`), never the
`projects` array directly. That indirection is the seam for swapping in a CMS
later without touching a page.

## Motion contracts

These are specified in the wireframe annotations, not invented. Preserve them:

| Where            | Contract                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| Hero objects     | Bounce physics — roam the frame, bounce off the edges, gentle pull back toward centre, repel each other so they don't pile up |
| Hero cursor      | Nearby objects lean away with linear falloff; hover scales 1.06           |
| Hero semantics   | 3 of 6 objects are real navigation; the other 3 are `aria-hidden`         |
| Signature illo   | Trails scroll at 0.85×                                                   |
| Marquee          | Loops seamlessly, left, forever                                          |
| Project images   | Fade + rise once on first view, never replay                              |
| Project credits  | Column pins while the write-up scrolls                                    |
| About sequence   | Pins for 4 viewport-heights across four annotated states                  |

## Git workflow

**Commit after each logical unit — never one bundled commit at the end.** Use
`/commit`, which reads the diff, decides the split, and formats conventionally.
Every commit must leave the tree building.

Work on a branch off `main`, then open a PR. Don't push to `main` directly.

## Validation

Before calling anything done, run `/verify`. It gates on:

1. `npm run build` — types included, and every route still static
2. `npm run lint`
3. `/design-review` — token, type, motion and a11y drift on the diff
4. A real browser pass with console checked, including reduced motion

## Commands

| Command          | What it does                                                     |
| ---------------- | ---------------------------------------------------------------- |
| `/new-project`   | Artwork in, reviewed project page out — ingest, interview, PR    |
| `/restart`       | Clear `.next` + caches, bring the dev server back up on :3000    |
| `/commit`        | Atomic conventional commits from the current diff                |
| `/verify`        | Full pre-handoff gate (build · lint · design · browser)          |
| `/design-review` | Read-only design-system check on the diff                        |
| `/use-pack`      | Bring in a specialist — a11y, perf, ux, security, database       |
| `/chatlog`       | Path to this session's transcript, to resume from another session |

Skills in `.claude/skills/` auto-activate: `frontend-design`,
`brand-guidelines`, `incremental-commits`, `verification-before-completion`,
`systematic-debugging`, `writing-plans`, `figma-to-code`, `figma-design`,
`project-intake`.

**Adding a project is a command, not an edit.** `/new-project` owns the whole
path — ingesting artwork into `public/work/<slug>/`, interviewing for the copy,
writing the entry, previewing it and opening the PR. Hand-editing
`lib/projects.ts` skips the ratio snapping and the `featured` cap, which are
the two things that go wrong silently.

## Open decisions

Tracked in [DESIGN.md](DESIGN.md) — the display typeface licence, the commerce
channel, the form backend, and Josh's city. Don't resolve these silently; each
one changes real code.
