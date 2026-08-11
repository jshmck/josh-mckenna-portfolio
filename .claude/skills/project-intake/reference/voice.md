# Josh's voice — for drafting project copy

Derived from the nine entries already in `lib/projects.ts`. When you draft copy
during the interview, you are matching *these*, not writing a portfolio blurb.
Read three existing entries before drafting anything.

The rule underneath all of it: **Josh explains constraints and process. He never
sells.** A sentence that could appear on any illustrator's site is wrong even if
it is well written.

---

## The five fields that carry voice

### `summary` — one line, in the grid, under the title

A flat statement with a joke hiding inside it. Delivered straight. Never a
tagline, never a value proposition.

> "Twelve people who all missed the last train."
> "Five sauces, five characters, escalating levels of regret."
> "Three mascots that had to survive a focus group."
> "A feature about doing nothing, illustrated enthusiastically."

Test: read it aloud deadpan. If it needs an exclamation mark to work, rewrite.

### `heroCaption` — documentary, under the hero image

Factual. Where, when, how big, what happened. This is the one field with no
jokes in it.

> "Photographed the morning after the last coat went on."
> "The cover illustration, printed at 2m across the festival's main gate."
> "Drawn from memory on the top deck of the N29 over about four months."

### `brief` — two paragraphs, "The brief, in Josh's words."

Paragraph one: **the constraint**. What the job actually had to do, and the
problem that created. Usually a physical or perceptual constraint — read at
three metres, work at 4cm and 4m, hold a whole series, be drawn in two days.

Paragraph two: **the method, or the consequence**. Concrete craft detail
(tools, sequence, rules he set himself) or what happened afterwards. This is
where the dry landing goes.

> "The label die-cut wraps the character's arm around the bottle, so the
> artwork only resolves once it's on glass."
> "Nobody at the label asked for this. They said yes immediately."
> "The fourth mascot tested badly with parents and brilliantly with children.
> It was cut."

Two paragraphs is the norm. One is fine for a small personal piece. Three needs
a reason.

### `alt` — **doubles as the printed caption**

This is the trap. `alt` is not just screen-reader text here:

- `components/ui/plate.tsx` prints it inside the placeholder while `src` is
  absent, so it labels the wireframe;
- `app/work/[slug]/page.tsx` renders it as a **visible `<p>` under every
  gallery image**.

So write captions, not descriptions. "Illustration of a marching band with
brightly coloured instruments" is correct alt text and wrong here.

> "Spot illustration — the marching band"
> "Label artwork — Ruinous"
> "Detail — the queue's back"
> "The rejected fourth mascot"
> "A healed piece, six months on"

Pattern: `Type — which one`, or a bare noun phrase. Sentence case, no full
stop, em dash with spaces. Under about 45 characters so it sets on one line.

### `deliverables` — a count, not a claim

Middle-dot separated, numbers first.

> "6 spot illos · 1 cover" · "5 labels · 1 outer carton" · "12 drawings"
> "1 mural · 14m × 4m" · "2 leads · 9 supporting · style guide"

---

## Banned

- Adjective stacking: *vibrant, bold, striking, dynamic, playful yet
  sophisticated.*
- Process theatre: *I embarked on a journey to explore…*
- Client-flattery: *the wonderful team at…*
- Anything a case-study template would generate: *Challenge / Solution /
  Impact*, *the brand needed to stand out in a crowded market*.
- Em-dash-heavy rhetorical build-ups. Josh uses one em dash, for an aside.
- Exclamation marks. There are zero in the existing copy.

## Allowed and encouraged

- Naming the real constraint, including unflattering ones ("The commission came
  in on a Thursday for the following Wednesday").
- Admitting a first pass failed ("The first pass was too tidy, so I threw out
  the grid").
- Rules he set himself ("no two neighbouring characters could share a skin
  tone").
- Refusing credit for an accident ("The looseness is not a style choice").

---

## Drafting protocol

1. Look at every image first. The brief must describe *this* artwork — a
   paragraph that would fit any project is a failed draft.
2. Draft all five fields, then read them against three real entries.
3. Present drafts as drafts. Josh edits; he does not approve blind. Offer the
   alternative where you were genuinely torn, and say which you prefer.
4. Never invent a fact. Client names, dates, dimensions, print methods, and
   collaborator names come from Josh or they stay out. If a credit is unknown,
   ask — do not fill it with a plausible name.
