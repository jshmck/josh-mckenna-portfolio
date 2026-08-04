# Josh McKenna — portfolio

Your portfolio site. Six pages, built from the wireframes we did together in Figma.

**[The Figma file →](https://www.figma.com/design/eEQKXqithQ17p0iYdEWwvL/Website-Ref?node-id=0-1)**
· [The wireframes specifically →](https://www.figma.com/design/eEQKXqithQ17p0iYdEWwvL/Website-Ref?node-id=17-125)

> ### 👋 Start here
>
> **[Issue #17 — the end-to-end checklist](https://github.com/opensesh/josh-mckenna-portfolio/issues/17)**
> lists everything left to do, in the order worth doing it. This README explains
> how to actually work on the thing.

---

## What's already done

Every page, layout and animation is built and working:

| Page | What it does |
|---|---|
| **Home** | Your name, six floating objects (three of them are links), an intro, three selected projects, the scrolling banner |
| **Work** | All your projects in a grid, filterable by type |
| **Project page** | One per project — big title, images, your write-up, credits |
| **About** | The scroll sequence where an illustration comes apart, your timeline, client list |
| **Contact** | Commission enquiry form |
| **Shop** | Placeholder for now — waitlist only |

## What isn't

**Every image is a grey box with a description written on it.** That's on purpose — it meant the whole site could be built and reviewed before any artwork existed. Swapping them for real work is [issue #1](https://github.com/opensesh/josh-mckenna-portfolio/issues/1), and it'll transform how the thing feels.

The project write-ups are placeholder text too. They're written roughly in your voice so the pages read properly, but they're not your words.

---

# Working on it

## What you need installed

Three things, one time:

1. **[Node.js](https://nodejs.org)** — download the **LTS** version. This is what runs the site on your machine.
2. **[VS Code](https://code.visualstudio.com)** — a code editor. Free. Others exist; this is the common one.
3. **[GitHub Desktop](https://desktop.github.com)** — a visual way to save and upload your changes without typing commands.

> **Why GitHub Desktop?** You *can* do all of this by typing commands, and you'll see them written that way in a lot of tutorials. But there's no prize for it. GitHub Desktop shows you exactly what you've changed before you commit to anything, which is genuinely safer while you're learning.

## Getting it on your computer

1. Open GitHub Desktop → **File → Clone repository**
2. Find `opensesh/josh-mckenna-portfolio`
3. Pick a folder and click **Clone**

Now open that folder in VS Code. In VS Code, go to **Terminal → New Terminal** — a panel opens at the bottom. Type this and press enter:

```bash
npm install
```

This downloads everything the site needs to run. It takes a minute or two and prints a lot of text. That's normal. You only do this once.

## Running it

In the same terminal:

```bash
npm run dev
```

You'll see something like `Ready on http://localhost:3000`. Open that address in your browser and there's your site.

**Leave that terminal running while you work.** Every time you save a file, the browser updates by itself — no refresh needed.

To stop it, click in the terminal and press `Ctrl + C`.

---

# The bits you'll actually edit

There are about 60 files in here. **You need three of them.**

### 📁 `lib/projects.ts` — all your work

Every project lives here. This is the file you'll open most.

### 📁 `lib/site.ts` — your details

Email, Instagram, city, the links in the menu and footer.

### 📁 `lib/about.ts` — the About page

Your timeline and the client list.

> Files ending in `.ts` are TypeScript. Don't be put off by the name — for these three files it's just a structured list. If you can fill in a form, you can edit these.

---

## Adding a project

Open `lib/projects.ts`. You'll see blocks that look like this, one per project. Copy a whole block (from `{` to `},`) and change the words:

```ts
{
  slug: "my-new-piece",
  title: "My New Piece",
  client: "Someone Lovely",
  year: 2026,
  discipline: "Editorial illustration",
  deliverables: "3 spot illos",
  category: "Editorial",
  accent: "#ffb600",
  summary: "One line that shows under the title.",
  heroCaption: "What the main image is.",
  brief: [
    "First paragraph about the project.",
    "Second paragraph.",
  ],
  credits: [
    { role: "Art direction", name: "Their Name" },
  ],
  hero: { ratio: "16/10", alt: "Describe the artwork" },
  gallery: [
    { ratio: "4/5", alt: "A detail shot" },
    { ratio: "4/5", alt: "Another detail" },
  ],
  featured: true,
},
```

### What each bit does

| Field | What it's for |
|---|---|
| `slug` | The web address. `"my-new-piece"` → `yoursite.com/work/my-new-piece`. Lowercase, dashes instead of spaces, no punctuation. |
| `category` | Which filter it appears under on `/work`. Must be one of: `Editorial`, `Character`, `Packaging`, `Mural`, `Personal` |
| `accent` | The colour behind the title on that project's page. Any hex code — pick one that suits the work. |
| `brief` | Your write-up. Each `"quoted bit"` is one paragraph. |
| `ratio` | The shape of the image. Options: `1/1` square, `4/5` and `3/4` portrait, `5/4` and `16/10` landscape. |
| `alt` | Describes the image for people using screen readers — **and** it's what shows on the grey placeholder. Worth writing properly. |
| `featured` | `true` puts it on the homepage. Three is about right; more and it stops being a selection. |

### Rules that will trip you up

- **Every line needs its comma at the end.** Miss one and the site won't build. This is the single most common mistake.
- **Text goes in "double quotes".** If your text contains an apostrophe that's fine — `"Josh's studio"` works. A double quote inside needs a backslash: `"she said \"no\""`.
- **Numbers don't get quotes.** `year: 2026`, not `year: "2026"`.

If something breaks, the terminal tells you which line. It's almost always a missing comma.

## Putting real images in

1. Put the file in the **`public`** folder — e.g. `public/la-pride-cover.jpg`
2. Add `src` to that image, with a `/` at the front:

```ts
hero: {
  ratio: "16/10",
  alt: "L.A. Pride cover illustration",
  src: "/la-pride-cover.jpg"
}
```

That's the whole thing. The grey box becomes your artwork.

**Export tips:**

- **JPG** for artwork. PNG only if you need a transparent background.
- Export around **2500px** on the long edge. Big images get automatically resized down for phones, but starting with a 12MB file just makes your build slow.
- Make `ratio` match the real shape, or it'll crop.
- **Keep the `alt` text.** Update it to describe the real image.

---

# Saving your changes

Two steps, and it helps to know they're different things:

**Commit** = saving a checkpoint on your computer, with a note about what you changed.
**Push** = uploading those checkpoints to GitHub, where they're backed up and (once the site is live) go online.

In GitHub Desktop:

1. Changed files appear in the left panel — **click one to see exactly what changed**, green for added, red for removed
2. Bottom left, write a short note: *"Add L.A. Pride images"*
3. Click **Commit to main**
4. Click **Push origin** at the top

That's it. Commit often — small checkpoints are much easier to undo than one enormous one.

> **Nothing you do here is permanent.** Every version is kept. If you break something badly, it can always be put back — you have not destroyed anything.

---

# Words you'll keep seeing

| Word | What it means |
|---|---|
| **Repo** | This whole project folder |
| **Commit** | A saved checkpoint with a note |
| **Push** | Upload your commits to GitHub |
| **Pull** | Download changes someone else made |
| **Branch** | A parallel version, for trying something risky |
| **Build** | Turning the code into an actual website |
| **Deploy** | Putting it on the internet |
| **Localhost** | The version running on your own machine |
| **Component** | A reusable chunk of page — the nav, a project card |
| **Terminal** | The text panel where you type commands |

---

# When something breaks

**The site won't start / errors in the terminal**

Read the error — it usually names the file and line. Nine times out of ten it's a missing comma or an unclosed quote in `lib/projects.ts`.

**It's behaving strangely and you haven't changed anything**

Stop it (`Ctrl + C`) and clear the cache:

```bash
rm -rf .next
npm run dev
```

**An image isn't showing**

- Is it in the `public` folder?
- Does the filename in the code match exactly, including capitals? `Photo.JPG` and `photo.jpg` are different files as far as this is concerned.
- Does `src` start with a `/`?

**You've made a mess and want to start over**

In GitHub Desktop, right-click the changed files → **Discard changes**. Back to your last commit.

---

# Using Claude Code

If you're working with Claude Code, this repo is already set up for it — it'll pick up the house rules automatically. Useful commands:

| Command | What it does |
|---|---|
| `/restart` | Clears the cache and restarts the site — fixes most weirdness |
| `/commit` | Saves your changes with a tidy note |
| `/verify` | Checks everything still works before you push |
| `/design-review` | Flags anything drifting from the design system |
| `/use-pack a11y` | Accessibility check |

The rules it follows are in [CLAUDE.md](CLAUDE.md), and the colours, type and motion are documented in [DESIGN.md](DESIGN.md).

---

# For the curious

Not required reading — but if you want to know what's under this:

**Next.js 16** and **React 19** — the framework. **TypeScript** — JavaScript that catches mistakes before they reach the browser. **Tailwind v4** — how the styling works.

The site is fully **static**: all 17 pages get built ahead of time, so there's no database and nothing to load. It's why it'll be fast on a phone.

```
app/          the pages
components/   reusable pieces (nav, footer, cards, animations)
lib/          ← your content lives here
public/       ← your images go here
```

---

# Commands, all in one place

```bash
npm install     # one time, after cloning
npm run dev     # start the site on your computer
npm run build   # check it'll work when published
npm run lint    # check for code mistakes
```

---

Anything unclear, ask. There's no such thing as an obvious question with this stuff — everyone who works with code learned it by asking someone.
