# Accessibility

Audited 2026-09-06 against WCAG 2.2 AA — full-site (all 14 routes, desktop +
mobile viewports): axe-core, measured contrast from the real `@theme` tokens,
scripted keyboard traversal of every page, reduced-motion emulation, 320px
reflow, screen-reader semantics review. Everything the audit found was either
fixed the same day (see the `fix(a11y):` commits around this file's creation)
or is listed below as **consciously accepted** — meaning Josh saw the measured
numbers and chose the design. Don't "fix" items on this list in passing; each
one is a deliberate decision with an owner, and reopening it is a design
conversation, not a lint cleanup.

## Consciously accepted (Josh, 2026-09-06)

| What | Measured | Criterion | The decision |
| --- | --- | --- | --- |
| Brand blue `#30b7ff` carrying text on canvas — nav active/hover links, the hero wordmark, "SAy HeLLO", form error labels, link/label hovers — and its inverse, canvas-on-brand (active filter pill, CTA `:active` fill) | 2.13:1 (4.5:1 or 3:1 required, size-dependent) | 1.4.3 | "Accept everything as-is," per Josh — the blue **is** the brand; offered the split (keep blue, move only error text + active-pill text to ink) and the darker-blue token swap, chose neither. Revisit only if the brand palette itself changes. |
| LGBTQ+ pill hover border `#F7A0C4` (1.85:1) and brand-blue hover borders (2.13:1) | 1.85 / 2.13:1 vs 3:1 | 1.4.11 | Part of the same accepted brand system; never the sole state indicator (text weight + fill change alongside). |
| Shop's ghosted product grid at 40% opacity | 2.84:1 / 2.08:1 | 1.4.3 | The grid is `aria-hidden` placeholder décor for an unopened shop and deliberately reads as "not real yet". Revisit when the shop is real. |
| Frosted nav worst case: brand-blue text over `bg-canvas/15` frost over blue artwork | down to 1.11:1 | 1.4.3 | Known issue with prior history — `navContrastLight` was removed 2026-09-04 and Josh is designing a replacement treatment. Whatever replaces it should target ≥4.5:1 for the 15px mobile links. Tracked, not forgotten. |

## Known content gaps (backlog, not accepted)

- **Captions/transcripts for sound videos** (WCAG 1.2.2): the three Info press
  films (A Minute With, Bombay Sapphire, HP Latex), the Nomad 505 promo and
  the Mardi Gras footage ship without `<track>` captions. Needs source
  transcripts from Josh — the interview films matter most (speech is the
  content there). Wire via WebVTT `<track kind="captions">` on
  `components/work/project-video.tsx` / the Info film cards when ready.

## Fixed in the same pass (for the record)

Peek decoys made `inert` (invisible tab stops / wrong-project lightbox);
lightbox focus moved/trapped/restored + SR paging announcements + arrows at
every width; form errors `role="alert"` + focused success panels; focus ring
switched to ink sitewide and `outline-none` suppressions removed; sub-360px
nav compression (320px reflow); Work drop-down keyboard parity; feature
gallery track focusable; heading-order h2; search-clear hit area; cart
labelled "Shop"; scroll-cue chevron contrast; card image alt de-duplication;
YouTube embed focus hand-off.

## Standing expectations for new work

- Keyboard: every new interactive control reachable AND operable; gesture-only
  interactions need a visible non-gesture equivalent (the lightbox arrows and
  breadcrumb `<`/`>` are the precedent).
- Any new decoy/mirror render of real content gets `inert` + `aria-hidden`
  together (see `project-stack-swipe.tsx`).
- Dialogs move focus in on open, trap Tab, restore on close
  (`lightbox-overlay.tsx` is the reference implementation).
- Dynamic status changes (form results, filter counts, paging) get a live
  region or focus move — association via `aria-describedby` alone announces
  nothing.
- The reduced-motion discipline (every rAF loop behind a `matchMedia` early
  return, autoplay JS-gated) is the house pattern — the audit called it
  exemplary; keep it that way.
