import { PROJECT_CATEGORIES } from "@/lib/projects";

/**
 * What's genuinely behind a project page — the page `router.back()` will
 * land on, captured at the moment of navigating INTO the project so the
 * pull-down-to-go-back gesture (project-stack-swipe.tsx) can reveal a
 * faithful mirror of it behind the falling card instead of bare canvas.
 *
 * The left/right peeks get their fidelity for free: sideways navigation
 * always lands a neighbour at the top of its page, so rendering the
 * neighbour's component IS the mirror. Back is different — it restores
 * wherever the visitor left (the gallery scrolled mid-grid, a filtered
 * view, the previous project after a sideways swipe), none of which is
 * derivable later. So the state that makes the mirror exact is recorded
 * here, keyed by the destination project's slug, at click/swipe time.
 *
 * sessionStorage, not module state: the record has to survive a reload
 * of the project page (history — and therefore what back restores —
 * survives one too), but shouldn't outlive the tab. Every access is
 * try/caught — storage can be unavailable (private mode quotas) and the
 * peek is pure garnish, so it degrades to the old plain-canvas fade
 * rather than ever throwing.
 */
export type BackPeekTarget =
  | {
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
      kind: "gallery";
      context: "work" | "home";
      scrollY: number;
      anchorTop: number;
      /** Active category pill ("All" when none). */
      category: string;
      /** Live search text (empty when none). */
      query: string;
    }
  | {
      /** Another project page — reached by swiping sideways or tapping
       *  the breadcrumb `<` `>` arrows, so back pops to that project at
       *  the scroll position it was left at. A project page's content
       *  always starts at its own top, same reasoning as /work above, so
       *  this needs no anchorTop of its own. */
      kind: "project";
      slug: string;
      scrollY: number;
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
  if (target.kind === "project") {
    return typeof target.slug === "string" && target.slug ? target : null;
  }
  if (target.kind !== "gallery") return null;
  if (target.context !== "work" && target.context !== "home") return null;
  if (typeof target.anchorTop !== "number" || !Number.isFinite(target.anchorTop)) return null;
  // A category that no longer exists (content changed since it was
  // recorded) would filter the peek's grid down to nothing — degrade to
  // the unfiltered view instead.
  const category = (PROJECT_CATEGORIES as readonly string[]).includes(target.category)
    ? target.category
    : "All";
  return { ...target, category, query: typeof target.query === "string" ? target.query : "" };
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
