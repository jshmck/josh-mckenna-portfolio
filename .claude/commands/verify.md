---
description: Full pre-handoff verification — build, types, lint, design review, and a real browser pass
allowed-tools: Bash, Read, Grep
---

# /verify — prove it works before saying it works

Activate the `verification-before-completion` skill. Run every gate below and
report the actual output. **Never report a pass you didn't observe.**

## 1 — Build and types

```bash
npm run build
```

Next 16 runs TypeScript as part of the build, so a clean build covers both. Read
the route table in the output and confirm:

- every route still prerenders (`○ Static` or `● SSG`) — a route that silently
  became dynamic is a regression on a static portfolio;
- `/work/[slug]` lists one path per project in `lib/projects.ts`.

## 2 — Lint

```bash
npm run lint
```

## 3 — Design system

Run `/design-review` and include its verdict here. A FAIL there is a FAIL here.

## 4 — Browser pass

Start the dev server, then drive it — don't ask the user to check.

For each of `/`, `/work`, `/work/la-pride`, `/about`, `/contact`, `/shop`:

- take a screenshot and actually look at it;
- read the console for errors and hydration warnings.

Hydration mismatches are the failure mode this site is most exposed to, because
three components animate from client state. If you see one, suspect a value that
differs between server and client render (`Date`, random, viewport-dependent
layout) before anything else.

Then check the interactions the wireframes specify, since none of them are
covered by a type check:

- hero objects drift, reverse at the frame edge, and lean away from the pointer;
- the three navigating objects are keyboard-reachable and show a focus ring;
- Work filters change the grid and the count updates;
- the About sequence pins and advances through all four states;
- both forms show validation errors on empty submit.

## 5 — Reduced motion

Re-check the homepage and About with reduced motion emulated. Expected: the hero
settles into a static scattered composition, the marquee is frozen, and About
renders all four captions as a static list. Nothing should be mid-animation or
invisible.

## 6 — Report

State each gate's real result:

```
- build: PASS (17/17 static)
- lint: PASS
- design-review: PASS
- browser: PASS — 6 routes, no console errors
- reduced motion: PASS
```

If a gate failed, say so plainly with the output, and do not describe the work
as done. A skipped gate is reported as skipped, never as a pass.
