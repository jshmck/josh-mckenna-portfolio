import { PROJECT_CATEGORIES } from "@/lib/projects";

/**
 * What's genuinely at the root of a project-browsing session — the
 * gallery (or Home) a visitor originally left to get here — captured at
 * the moment of navigating INTO the first project so the pull-down-to-
 * go-back gesture (project-stack-swipe.tsx) can reveal a faithful mirror
 * of it behind the falling card instead of bare canvas, no matter how
 * many projects were swiped through since.
 *
 * The left/right peeks get their fidelity for free: sideways navigation
 * always lands a neighbour at the top of its page, so rendering the
 * neighbour's component IS the mirror. Back is different — it restores
 * wherever the visitor left (the gallery scrolled mid-grid, a filtered
 * view), which isn't derivable later. So the state that makes the mirror
 * exact is recorded here, keyed by the destination project's slug, at
 * click time — then propagated (see propagateBackTarget) to every
 * further project reached by swiping or the breadcrumb arrows, rather
 * than re-recorded as "the project before this one."
 *
 * That propagation is a deliberate product choice, not just the easy
 * implementation: "always reveal the gallery instead" of the immediately
 * previous project, per Josh, after confirming the immediate-predecessor
 * version worked exactly as designed (a swipe A→B, pulled down on B,
 * correctly showed A — because that IS what a single router.back() does
 * from B). Showing the gallery instead means a completed pull-down can
 * no longer be a plain one-step back() from anywhere but the first
 * project in the chain — see `steps` below, and its use in
 * project-stack-swipe.tsx's settle().
 *
 * sessionStorage, not module state: the record has to survive a reload
 * of the project page (history — and therefore what back restores —
 * survives one too), but shouldn't outlive the tab. Every access is
 * try/caught — storage can be unavailable (private mode quotas) and the
 * peek is pure garnish, so it degrades to the old plain-canvas fade
 * rather than ever throwing.
 */
export type BackPeekTarget = {
  /** /work standalone, or Home's embedded gallery — same shape either
   *  way, the two differ only in what (if anything) renders above the
   *  gallery. `anchorTop` is the document-Y offset of the recorded
   *  content's own top edge, measured relative to where that content
   *  would sit at scrollY 0 (nav height already backed out) — 0 for
   *  /work, since the gallery starts right at the page top; roughly
   *  the hero's rendered height for Home, since the gallery sits
   *  below DriftingHero + the Who/Clients sections. Rendering the
   *  peek then just means: draw the same content, translated up by
   *  `scrollY - anchorTop`, so whatever was under the nav at the
   *  moment of the click lands under the nav again here. */
  context: "work" | "home";
  scrollY: number;
  anchorTop: number;
  /** Active category pill ("All" when none). */
  category: string;
  /** Live search text (empty when none). */
  query: string;
  /** History entries between the current project and this record's own
   *  page — 1 the moment a gallery card is clicked, incremented by
   *  propagateBackTarget for every further project-to-project hop.
   *  `history.go(-steps)` is what actually gets a completed pull-down
   *  all the way back to the gallery in one native navigation, with the
   *  browser restoring that entry's real scroll position itself — the
   *  same mechanism a plain back() already relied on, just for however
   *  many steps this chain has grown to. */
  steps: number;
};

const STORAGE_KEY = "back-peek-targets";

/** Keyed by destination slug so a chain of sideways swipes keeps each
 *  page's own back-target intact (home→A stores A's, A→B stores B's —
 *  returning to A finds its record still correct). Pruned oldest-first;
 *  a handful is plenty for any realistic back-stack. */
const MAX_ENTRIES = 8;

function readMap(): Record<string, BackPeekTarget> {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, BackPeekTarget>;
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, BackPeekTarget>): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Storage full or unavailable — the peek just won't show.
  }
}

export function recordBackTarget(destinationSlug: string, target: BackPeekTarget): void {
  const map = readMap();
  // Delete-then-set keeps JSON key order as insertion order, so pruning
  // the first key really does drop the oldest record.
  delete map[destinationSlug];
  map[destinationSlug] = target;
  const keys = Object.keys(map);
  for (const key of keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) {
    delete map[key];
  }
  writeMap(map);
}

export function readBackTarget(destinationSlug: string): BackPeekTarget | null {
  const target = readMap()[destinationSlug];
  if (!target || typeof target !== "object") return null;
  if (typeof target.scrollY !== "number" || !Number.isFinite(target.scrollY)) return null;
  if (target.context !== "work" && target.context !== "home") return null;
  if (typeof target.anchorTop !== "number" || !Number.isFinite(target.anchorTop)) return null;
  if (typeof target.steps !== "number" || !Number.isFinite(target.steps) || target.steps < 1) {
    return null;
  }
  // A category that no longer exists (content changed since it was
  // recorded) would filter the peek's grid down to nothing — degrade to
  // the unfiltered view instead.
  const category = (PROJECT_CATEGORIES as readonly string[]).includes(target.category)
    ? target.category
    : "All";
  return { ...target, category, query: typeof target.query === "string" ? target.query : "" };
}

/**
 * Forwards `fromSlug`'s own recorded root (if it has one) to `toSlug`,
 * one step further back — used by every way of moving project-to-project
 * (the swipe gesture and the breadcrumb `<`/`>` arrows) instead of each
 * recording its own immediate predecessor. See BackPeekTarget's doc
 * comment for why the root is what a pull-down should always reveal.
 * A no-op when `fromSlug` has no record of its own (a direct link deep
 * into a chain, or storage that's been pruned/unavailable) — `toSlug`
 * simply gets no record either, same as any other unrecorded origin.
 */
export function propagateBackTarget(fromSlug: string, toSlug: string): void {
  const origin = readBackTarget(fromSlug);
  if (!origin) return;
  recordBackTarget(toSlug, { ...origin, steps: origin.steps + 1 });
}

/** Shared by the two recorders (work-gallery.tsx, project-content.tsx):
 *  resolves a click on a project link to its destination slug, or null for
 *  anything else — including /work itself and nested/query'd paths. */
export function projectSlugFromHref(href: string | null): string | null {
  if (!href || !href.startsWith("/work/")) return null;
  const slug = href.slice("/work/".length).split(/[?#]/)[0];
  if (!slug || slug.includes("/")) return null;
  return slug;
}

/** SSR-safe fallback for the nav's own rendered height, matching
 *  project-stack-swipe.tsx's own NAV_HEIGHT_FALLBACK (kept separate
 *  there, next to the long comment explaining it) — the two are the
 *  same physical measurement so they carry the same value, but this one
 *  is only ever a fallback for a live `getBoundingClientRect()` read
 *  below, never trusted on its own. */
const NAV_HEIGHT_FALLBACK = 88;

/** anchorTop for a gallery context, measured at record time — see the
 *  BackPeekTarget doc comment above for what this number means. "work"
 *  is always 0 (the gallery starts right at the page's own top); "home"
 *  is the #home-who section's document offset with the nav's own height
 *  backed out, i.e. roughly DriftingHero's rendered height. */
export function measureGalleryAnchorTop(context: "work" | "home"): number {
  if (context === "work") return 0;
  const who = document.getElementById("home-who");
  if (!who) return 0;
  const header = document.querySelector("header.sticky");
  const navHeight = header?.getBoundingClientRect().height ?? NAV_HEIGHT_FALLBACK;
  return who.getBoundingClientRect().top + window.scrollY - navHeight;
}
