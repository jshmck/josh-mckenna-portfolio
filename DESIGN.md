# Design system

Everything here is derived from the "Josh — Illustrator" wireframes in Figma
([node 17:125](https://www.figma.com/design/eEQKXqithQ17p0iYdEWwvL/Website-Ref?node-id=17-125)).
Source of truth in code: the `@theme` block in [app/globals.css](app/globals.css).

## Colour

| Token                      | Value     | Use                                              |
| -------------------------- | --------- | ------------------------------------------------ |
| `canvas`                   | `#ffffff` | Page background                                  |
| `ink`                      | `#141414` | Primary text, marquee band                       |
| `ink-muted`                | `#8c877e` | Secondary text, labels, captions                  |
| `accent`                   | `#ff3b2f` | The commission path — CTAs, hero nav, annotations |
| `highlight`                | `#ffb600` | Default project title wash                        |
| `hairline`                 | `#e3dfd5` | Rules and container borders                       |
| `placeholder`              | `#e3dfd5` | Decorative artwork slots                          |
| `placeholder-strong`       | `#d8d3c7` | Navigable artwork slots                           |

`accent` is a path marker, not a decoration. If something red isn't asking the
visitor to hire Josh, it's probably wrong.

## Typography

| Role            | Family                    | Size                            |
| --------------- | ------------------------- | ------------------------------- |
| `type-display`  | BBH Hegarty → Archivo Black | `clamp(2.75rem, 9.8vw, 8.25rem)` |
| `type-heading`  | BBH Hegarty → Archivo Black | `clamp(1.75rem, 4vw, 3rem)`     |
| `type-lede`     | Archivo Medium            | `clamp(1.125rem, 1.6vw, 1.375rem)` |
| `type-label`    | Space Mono, uppercase     | `11px` / `0.02em`               |
| body            | Archivo Medium            | `15px`                          |

### The display typeface — open decision

The wireframes specify **BBH Hegarty**, a licensed face we can't redistribute as
a webfont. The stack currently leads with it and falls back to **Archivo Black**,
which is on Google Fonts and shares Archivo's skeleton, so the pairing stays
coherent.

To switch to the real face once licensed: drop the `woff2` into `app/fonts/`,
load it with `next/font/local` in [app/layout.tsx](app/layout.tsx) as
`--font-archivo-black`, and nothing else changes — `--font-display` in
`globals.css` already names `"BBH Hegarty"` first.

Note the display face carries the site's personality. Archivo Black is a
competent stand-in, not a match — Hegarty is chunkier and rounder. Worth
resolving before launch.

## Rhythm

- Page gutter `--spacing-gutter` = `2.75rem` (44px, from the wireframe)
- Content frame `--container-frame` = `84rem` (1344px)
- Section padding `py-24` for bands, `py-20` for page headers
- Sections separated by a `border-hairline` rule, not whitespace alone

## Motion

`--ease-drift` = `cubic-bezier(0.22, 1, 0.36, 1)` for everything easing to rest.

Three hand-rolled loops, no animation library:

| Component            | Technique                                                    |
| -------------------- | ------------------------------------------------------------ |
| `drifting-hero`      | rAF loop, DOM transforms in `cqw`/`cqh`, pointer repel        |
| `parallax`           | rAF read+write in one frame, avoiding layout thrash           |
| `decompose-sequence` | Native `position: sticky` pin, JS maps scroll → 0–1 progress  |
| `marquee`            | Pure CSS, duplicated track translating `-50%`                 |
| `reveal`             | `IntersectionObserver`, disconnects after first trigger       |

Every one has an explicit reduced-motion branch. The global CSS rule in
`globals.css` cannot stop a rAF loop — that's why each checks `matchMedia`
itself.

## Accessibility

- Skip link to `#main` in the root layout
- `:focus-visible` ring in `accent`, 2px, 3px offset
- Hero: 3 navigating objects are `<Link>` with `aria-label`; the 3 decorative
  ones are `aria-hidden="true"`
- Work filters are `<button aria-pressed>`, with an `aria-live` result count
- Forms: `<label>` per field, `aria-invalid` + `aria-describedby` on error
- Ghosted shop cards are `aria-hidden` — they aren't buyable and shouldn't be
  announced

## Artwork

Everything renders through [`<Plate>`](components/ui/plate.tsx). With no `src`
it draws the taupe placeholder labelled with its own alt text, so a missing
piece is visible and self-identifying rather than an empty box.

To add real artwork: drop the file in `public/`, set `src` on the image object in
`lib/projects.ts`. Nothing else changes.

## Open decisions

| Decision              | Where it bites                                                          |
| --------------------- | ----------------------------------------------------------------------- |
| **Display typeface**  | BBH Hegarty licence, or commit to Archivo Black. Changes the whole feel. |
| **Commerce channel**  | Shopify vs Stripe vs print-on-demand. Restructures `/shop` entirely.     |
| **Form backend**      | Both forms hand off to `mailto` today. Swap one function body each.      |
| **Josh's city**       | `siteConfig.location` says London; the wireframe says `[CITY]`.          |
| **Real copy**         | Project write-ups are placeholder prose in Josh's voice, not his words.  |
| **Terms page**        | Footer links `/terms`, which doesn't exist yet.                         |

None of these are blocking a review — all of them are blocking a launch.
