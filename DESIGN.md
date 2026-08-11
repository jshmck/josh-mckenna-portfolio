# Design system

Everything here is derived from the Figma file
**[Website-Ref](https://www.figma.com/design/eEQKXqithQ17p0iYdEWwvL/Website-Ref?node-id=0-1)**
— specifically the
["Josh — Illustrator" wireframes at node 17:125](https://www.figma.com/design/eEQKXqithQ17p0iYdEWwvL/Website-Ref?node-id=17-125).

Source of truth in code: the `@theme` block in [app/globals.css](app/globals.css).

## Colour

| Token                      | Value     | Use                                              |
| -------------------------- | --------- | ------------------------------------------------ |
| `canvas`                   | `#ffffff` | Page background                                  |
| `ink`                      | `#141414` | Primary text                                     |
| `ink-muted`                | `#8c877e` | Secondary text, labels, captions                  |
| `brand`                    | `#30b7ff` | The commission path — CTAs, wordmark, marquee, hero nav cards |
| `accent`                   | `#ae88ff` | Purple display accent — section titles, active nav |
| `highlight`                | `#ffb600` | Default project title wash                        |
| `hairline`                 | `#e3dfd5` | Rules and container borders                       |
| `placeholder`              | `#e3dfd5` | Decorative artwork slots                          |
| `placeholder-strong`       | `#d8d3c7` | Navigable artwork slots                           |

Josh's Website v2 (Figma node 101:5) retired the old red accent. `brand` blue is
the path marker — if something blue isn't asking the visitor to hire Josh, it's
probably wrong. `accent` purple is the display voice: the Waldeck section titles.

## Typography

| Role            | Family                    | Size                            |
| --------------- | ------------------------- | ------------------------------- |
| `type-display`  | Waldeck → Archivo Black   | `clamp(2.75rem, 9.8vw, 8.25rem)` |
| `type-title`    | Waldeck → Archivo Black   | `clamp(1.75rem, 4.6vw, 3.5rem)` |
| `type-heading`  | Archivo Black             | `clamp(1.75rem, 4vw, 3rem)`     |
| `type-lede`     | Archivo Medium            | `clamp(1.125rem, 1.6vw, 1.375rem)` |
| `type-label`    | Space Mono, uppercase     | `11px` / `0.02em`               |
| body            | Archivo Medium            | `15px`                          |

Two display voices. **Waldeck** (the bubbly rounded face) carries the brand
moments — the `type-display` wordmark, the `type-title` section titles and the
marquee. **Archivo Black** is the tight grotesque for `type-heading` statement
lines ("London-based illustrator…", "Got something that needs drawing?").

### The display typeface — Waldeck (trial)

Josh's v2 specifies **Waldeck**. The trial weights are self-hosted from
[public/fonts/waldeck](public/fonts/waldeck) and loaded with `next/font/local`
in [app/layout.tsx](app/layout.tsx) as `--font-waldeck`. Notes:

- The trial **Black (900)** OTF renders fine metrically but `type-display` uses a
  `0.9` line-height so the stacked two-line wordmark doesn't collide.
- To swap in the licensed family, drop the files at the same paths (keep the
  `--font-waldeck` variable name) — nothing in `globals.css` changes.
- These are **trial** files: resolve the licence before launch.

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
- `:focus-visible` ring in `brand`, 2px, 3px offset (blue keeps contrast on the
  blue marquee band, where a purple ring would vanish)
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
| **Display typeface**  | Waldeck is on trial weights — resolve the licence before launch.         |
| **Commerce channel**  | Shopify vs Stripe vs print-on-demand. Restructures `/shop` entirely.     |
| **Form backend**      | Both forms hand off to `mailto` today. Swap one function body each.      |
| **Josh's city**       | `siteConfig.location` says London; the wireframe says `[CITY]`.          |
| **Real copy**         | Project write-ups are placeholder prose in Josh's voice, not his words.  |
| **Terms page**        | Footer links `/terms`, which doesn't exist yet.                         |

None of these are blocking a review — all of them are blocking a launch.
