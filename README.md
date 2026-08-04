# Josh McKenna — portfolio

Portfolio site for illustrator **Josh McKenna**. Built from the
["Josh — Illustrator" wireframes](https://www.figma.com/design/eEQKXqithQ17p0iYdEWwvL/Website-Ref?node-id=17-125)
in Figma.

Next.js 16 · React 19 · TypeScript · Tailwind v4. Fully static — all 17 routes
prerender, so it deploys anywhere and loads fast on a phone.

> **Josh — start here:**
> [#17 — end-to-end launch checklist](https://github.com/opensesh/josh-mckenna-portfolio/issues/17).
> It maps everything left to do, in the order worth doing it.

## Getting started

```bash
npm install && npm run dev
```

Then open http://localhost:3000.

## What's here

| Route          | State                                                               |
| -------------- | ------------------------------------------------------------------- |
| `/`            | Hero with drifting navigable objects, intro, selected work, marquee |
| `/work`        | Filterable masonry gallery                                          |
| `/work/[slug]` | Project template — 9 projects, one page each                        |
| `/about`       | Pinned scroll sequence, timeline, clients                            |
| `/contact`     | Commission enquiry form                                             |
| `/shop`        | Placeholder + waitlist (commerce channel undecided)                 |

## For Josh — how to add your work

Everything lives in one file: **[`lib/projects.ts`](lib/projects.ts)**.

To add a project, copy an existing block and edit it:

```ts
{
  slug: "my-new-piece",        // becomes /work/my-new-piece
  title: "My New Piece",
  client: "Someone",
  year: 2026,
  discipline: "Editorial illustration",
  deliverables: "3 spots",
  category: "Editorial",       // drives the /work filters
  accent: "#ffb600",           // the colour behind the title — pick your own
  summary: "One line for the card.",
  heroCaption: "What this image is.",
  brief: ["First paragraph.", "Second paragraph."],
  credits: [{ role: "Art direction", name: "Name" }],
  hero: { ratio: "16/10", alt: "Describe the artwork" },
  gallery: [
    { ratio: "4/5", alt: "Detail one" },
    { ratio: "4/5", alt: "Detail two" },
  ],
  featured: true,              // also show it on the homepage
}
```

**Right now every image is a grey placeholder** showing its own description. That
is deliberate — the site is fully reviewable before any final files exist. To
drop in real artwork, put the file in `public/` and add `src`:

```ts
hero: { ratio: "16/10", alt: "Describe the artwork", src: "/la-pride-cover.jpg" }
```

Your details — email, Instagram, city — are in
[`lib/site.ts`](lib/site.ts). The About page copy is in
[`lib/about.ts`](lib/about.ts).

## Things still to decide

Listed in [DESIGN.md](DESIGN.md#open-decisions). The two that matter most:

- **The display typeface.** The wireframes use BBH Hegarty, which is licensed.
  The site currently substitutes Archivo Black — close in structure, but less
  characterful. Worth resolving before launch.
- **How the shop sells.** Shopify, Stripe, or print-on-demand — the choice
  restructures `/shop` rather than restyling it, so it's better decided than
  guessed.

Both forms currently open the visitor's mail client with everything pre-filled,
so no enquiry gets lost while a backend is undecided.

## Scripts

```bash
npm run dev      # dev server on :3000
npm run build    # production build (typechecks too)
npm run lint     # eslint
npm start        # serve the production build
```

## Working on this with Claude Code

The repo ships a full [`.claude/`](.claude) configuration — conventions in
[CLAUDE.md](CLAUDE.md), the design system in [DESIGN.md](DESIGN.md), plus
commands for the loop we actually use:

| Command          | What it does                                      |
| ---------------- | ------------------------------------------------- |
| `/restart`       | Clear caches, restart the dev server              |
| `/commit`        | Atomic conventional commits from the current diff |
| `/verify`        | Build · lint · design review · real browser pass  |
| `/design-review` | Token, type, motion and a11y drift on the diff    |
| `/use-pack`      | Pull in a specialist — a11y, perf, ux, security   |

Run `/use-pack a11y` before any handoff and `/use-pack perf` once real artwork
lands — those two catch what the build can't.
