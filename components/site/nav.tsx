"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { navLinks } from "@/lib/site";
import { getActiveCategories } from "@/lib/projects";
import { CartIcon } from "@/components/ui/social-icons";

/**
 * Floating nav, three separate shapes sharing one frost treatment: a jM
 * circle (home link) pinned to the left edge of the content frame, the
 * Work/Shop/Info/Contact pill genuinely centered in the viewport, a Cart
 * circle (placeholder icon, see CartIcon) pinned to the right edge,
 * mirroring jM. Client-side only for `usePathname` and the scroll-driven
 * frost state; the active link (purple, bold) is the other piece of
 * state here.
 *
 * Five passes to get here, each change driven by Josh watching the
 * previous one live:
 *   1. One long pill, scrolled-only — resting state kept the old
 *      edge-to-edge/justify-between bar.
 *   2. Resting state reworked to match the pill's centered layout and
 *      larger type too — position/size/layout became identical in both
 *      states, `scrolled` only toggling frost chrome.
 *   3. A single centered jM broke the "logo sits top-left" convention,
 *      so it split into three shapes (circles) instead of one pill —
 *      jM/Cart still sat close to the main pill though, plus an SVG goo
 *      filter meant to fuse them together on mount broke backdrop-blur
 *      across the entire page in a real browser (see git history) and
 *      was reverted.
 *   4. jM/Cart moved to a real 3-column grid so they sit at the content
 *      frame's actual left/right edges, not just left of centre — and
 *      briefly reshaped from circles into asymmetric blobs ("the circles
 *      look a bit too perfect, can there be an odd gloopy frost shape?").
 *      The mount slide-in animation from pass 3 was dropped here too:
 *      with jM/Cart now genuinely far from the main pill, motion implying
 *      they'd travelled in from it stopped making sense — Josh's own
 *      observation.
 *   5. (current) Blobs reverted back to plain circles, per Josh — no
 *      reason given, just "put them back to circle." Grid layout and
 *      dropped animation from pass 4 both stayed.
 *
 * `position: sticky`, not `fixed` — sits in normal document flow, so a
 * spacer div is no longer needed to reserve its space. This used to be
 * `fixed` specifically to avoid a `sticky` header's height-change forcing
 * a reflow on every frame of an animated resize -- but the header no
 * longer resizes at all, so that concern doesn't apply and `sticky` is
 * simpler. It does NOT, on its own, stop content from scrolling
 * underneath it: a sticky element only stays in-flow while scrollY is
 * less than its own offset from the top of the document, which for the
 * very first element on the page is 0 -- it's effectively pinned from the
 * first pixel of scroll, same as `fixed` was. What actually fixed the
 * header-over-content smudge was the frost threshold below.
 *
 * The <header> itself is always 88px, never shrinks, and never carries a
 * border or background — that's all on the three shapes now, sharing one
 * `frostClass` string so they never drift out of sync with each other.
 * <nav> is a `grid-cols-[1fr_auto_1fr]` spanning max-w-frame (the site's
 * usual content width) rather than a flex row with a gap — jM and Cart
 * sit in the two `1fr` tracks (`justify-self-start`/`-end`), the main
 * pill in the `auto` middle track, which stays centred in the viewport
 * regardless of jM/Cart's own width since both flanking tracks are equal.
 * `items-start` on <header> plus `mt-5` on <nav> sits the row a bit below
 * the very top of the 88px band rather than dead-centered — "bring it
 * lower a little," per Josh. Each shape's `border` is present at rest too,
 * colour transparent — same width always, so frost never causes a layout
 * shift when it toggles on.
 *
 * What scrolling still changes: past 24px of scroll (back below 4px to
 * undo — hysteresis, so it doesn't flicker at the boundary on trackpad
 * rubber-banding), all three shapes pick up border-hairline, bg-canvas/15
 * and backdrop-blur-md (the same colourless frosted-glass treatment as
 * the hero's floating-object hover cards) plus a one-shot "stuck, then
 * unstuck" squash-and-stretch settle (`nav-pill-pop` keyframe,
 * globals.css — see its own doc comment for the full breakdown; Josh's
 * brief was "there's some weight to the nav bars... they got stuck as
 * you start to scroll, then they get unstuck and bounce a little.
 * liquid, gloopy vibe"). Reverting to resting plays its own matching
 * settle too now (`nav-pill-landing`, a separate identically-shaped
 * keyframe -- see its doc comment in globals.css for why it can't just
 * reuse nav-pill-pop's name) -- "as if the nav bars have hit the top of
 * the page and bounced," per Josh, gated so it never fires on initial
 * page load, only on a genuine scrolled-back-to-top. Because only
 * these shapes ever carry the frost, content behind the header is
 * blurred directly behind them and reads completely normally everywhere
 * else across the 88px band. Small fixed px scroll thresholds, not
 * viewport-relative — Josh wants the frost on the first scroll gesture,
 * not once you're meaningfully deep into the page. A mid-range threshold
 * (120px, tried previously) happened to land exactly where Work's
 * illustration row sits (~120-235px), so frost switching on coincided
 * visually with that row passing under the header. Near-zero doesn't have
 * that problem — frost is already on well before any near-top content
 * reaches the header.
 *
 * jM/Cart are plain `rounded-full` circles again (pass 4's asymmetric-
 * border-radius blob shape was reverted). The literal liquid-fuse-on-
 * scroll look Josh originally asked for ("gloop") is still an open want,
 * not abandoned — doing it safely would mean isolating that merge effect
 * onto a separate solid-fill layer behind the real (backdrop-blurred)
 * shapes, never combining `filter` and `backdrop-filter` on the same
 * element (see pass 3's revert, above, for why that combination broke).
 *
 * Link text 17/22px in both states -- was 14px resting-only, then 15/17px
 * unified across both states, then bumped to 18/24px along with the
 * pill's own padding (py-5/6, up from py-2.5/3) so the main pill reads as
 * the nav's biggest, most prominent shape rather than the two circles
 * flanking it, then eased back down one notch to 17/22px, "just a smidge
 * smaller." jM was 24/28px text at the same two breakpoints before it
 * became an image -- h-8/9 at first (roughly the old text's footprint),
 * bumped to h-10/11 ("make it bigger"), then to h-11/14 again along with
 * the jM/Cart circles themselves growing (h-14/16 -> h-16/20) "to better
 * match the centre nav." Desktop pill padding (py-5/6) was later replaced
 * outright with a fixed md:h-20 -- "match the radius of the corners to
 * the circles... make sure the height of the centre nav bar is the same
 * as the circles," per Josh. Padding alone only ever landed close (a
 * couple of px off depending on line-height), which meant rounded-full's
 * corner radius (always exactly half the box's own height) was a couple
 * of px off too, however close the heights got. A literal shared height
 * makes both guarantees exact instead of approximate. md:py-0 on the
 * pill since h-20 now owns the height outright, items-center still
 * centres the text inside it.
 *
 * On "/" only, the active highlight is also scroll-position-driven: the
 * homepage embeds the real Work gallery inline (see app/page.tsx's
 * #home-work section), so scrolling past Home's own content flows
 * straight into Work with no navigation. Once that section has scrolled
 * under the header, "Work" borrows the active highlight from "Home" — the
 * URL never changes, only the nav's read of where you are. Every other
 * route's active-state stays pure pathname-matching, untouched by this.
 * Info used to merge into Contact the same way; that embed was removed
 * per Josh, so "/about" is back to plain pathname-matching too.
 */

// getBoundingClientRect().top thresholds, px, for handing the nav's active
// highlight from Home to the embedded Work section on "/". Two thresholds,
// not one — mirrors the frost hysteresis below; a single threshold
// flickers when the section's top edge hovers right at the boundary
// (trackpad rubber-banding, a stray scroll tick).
const MERGE_ENTER = 96; // just past the 88px header
const MERGE_EXIT = 160;

/** The nav's own copy of the Work search, inside the hover drop-down. Used
 * to render full-width unconditionally — "the search is the full length,
 * not the smaller circle with mag like it is at the top of the page," per
 * Josh, comparing it to the in-page pill (work-gallery.tsx) it's meant to
 * echo. A standalone component rather than inline JSX so its own `open`
 * state remounts fresh (collapsed) every time the drop-down itself mounts
 * on hover — no effect needed to reset it back to closed between opens. */
function NavWorkSearch({ delayMs }: { delayMs: number }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="group/navsearch relative inline-flex animate-[pill-woosh_550ms_var(--ease-bounce)_both] items-center"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className={`pointer-events-none absolute left-0 h-3 w-3 transition-[translate,color] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/navsearch:text-brand ${
          open ? "translate-x-[14px] text-brand" : "translate-x-[11px] text-ink"
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="6.5" cy="6.5" r="4.75" />
        <path d="m10.5 10.5 3.5 3.5" />
      </svg>
      <input
        type="search"
        aria-label="Search work"
        onFocus={() => setOpen(true)}
        onBlur={(event) => {
          if (!event.target.value.trim()) setOpen(false);
        }}
        onChange={(event) =>
          window.dispatchEvent(new CustomEvent("worklist:search", { detail: event.target.value }))
        }
        className={`font-grotesque rounded-full border bg-canvas py-[9.5px] text-[11px] leading-none font-semibold uppercase tracking-[0.02em] text-ink shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] outline-none [&::-webkit-search-cancel-button]:hidden ${
          open
            ? "w-40 border-brand pr-4 pl-8"
            : "w-[34px] cursor-pointer border-ink px-0 hover:border-brand"
        }`}
      />
    </span>
  );
}

export function Nav() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [homeWorkActive, setHomeWorkActive] = useState(false);
  // Trial — hovering Work drops the category menu out of the nav pill
  // itself, wherever you are on whatever page ("even if the user is
  // halfway down the page or browsing the Work page, a hover over work
  // brings up the category menu," per Josh). Opens on the Work link's
  // mouseenter, closes when the cursor leaves the pill+menu block as a
  // whole. Hover-only for now — touch already has the in-page filter
  // row, which keeps its own scroll-in entrance.
  const [workMenuOpen, setWorkMenuOpen] = useState(false);
  // Any route change closes it — the nav outlives navigations, so an
  // open menu would otherwise ride along onto the next page.
  useEffect(() => {
    setWorkMenuOpen(false);
  }, [pathname]);
  // (The `overLightBg` blue-goes-white contrast swap lived here — the
  // whole navContrastLight mechanism was removed 2026-09-04, "lets remove
  // that rule and I will make a new rule tomorrow," per Josh.)
  // Latches true the first time `scrolled` goes true, so the landing bounce
  // below (nav-pill-landing) never fires on initial page load -- only once
  // there's been a real frost-in to "land" back down from. State, not a
  // ref: React's compiler-backed lint (react-hooks/refs) now flags reading
  // or writing ref.current during render, since a ref mutation there isn't
  // guaranteed to survive a discarded/replayed render the way a state
  // update is. Set via the same "adjust state during render" pattern as
  // prevPathname below, rather than in an effect, which would trail a
  // frame behind and risk the very first return-to-top after a fresh page
  // load missing its bounce.
  const [hasFrostedOnce, setHasFrostedOnce] = useState(false);
  // Whether scroll has reached the very bottom of the page -- "make the
  // bounce thing happen when I hit the bottom too," per Josh. Reuses the
  // exact same nav-pill-landing keyframe the top-of-page return already
  // plays, just on a different trigger.
  const [atBottom, setAtBottom] = useState(false);
  // (A `swipeFrost` state used to live here, forcing the frosted state
  // for the duration of a ProjectStackSwipe drag via custom
  // "stackswipe:start"/"stackswipe:end" window events -- asked for when
  // project pages still ran edge-to-edge and the plain resting nav read
  // as disconnected from the page sliding underneath it. Removed per
  // Josh once the mobile card redesign landed: "when swiping across
  // (next/previous) the blue bubble doesnt need to appear, the header
  // doesnt need to bounce or anything. only the moves on the nav bar
  // should be active when it touches the card" -- the card sits inset
  // on its own background now, so at scrollY 0 the nav is over plain
  // canvas and frosting it mid-swipe just added a bounce and a blue
  // wash with nothing underneath to justify them. Frost is purely
  // scroll-driven again; a swipe that starts mid-scroll keeps whatever
  // frost state scroll already earned, since preventDefault on the
  // drag means scrollY doesn't move.)

  // Nav never unmounts across a client-side route change (it lives in the
  // root layout), so `scrolled` could otherwise keep carrying the
  // scrolled-down state from whichever page you clicked away from. A
  // fresh navigation always lands at the top of the new page, so reset
  // here the moment `pathname` changes -- React's documented pattern for
  // adjusting state during render rather than in an effect (which would
  // trail a frame behind and risk a one-frame flash of frost on the new
  // page). Bypasses the update()/scroll-listener path below entirely, so
  // there's no dependency on a 'scroll' event actually firing to correct
  // it. hasFrostedOnce resets here too, on the same schedule, so
  // navigating to a fresh page never plays a landing bounce on its own --
  // only an actual scroll-triggered return to the top does.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setScrolled(false);
    setHasFrostedOnce(false);
    setAtBottom(false);
  }

  if (scrolled && !hasFrostedOnce) setHasFrostedOnce(true);

  useEffect(() => {
    let raf = 0;
    let queued = false;

    // Hysteresis: frosted past FROST_ENTER, clear again only below
    // FROST_EXIT -- a single threshold flickers on trackpad rubber-banding
    // at the very top. Small fixed px values, not viewport-relative: Josh
    // wants the frost as soon as the first scroll gesture, not once you're
    // meaningfully deep into the page. A mid-range threshold (120px, tried
    // previously) landed exactly where Work's illustration row sits
    // (~120-235px), so frost switching on coincided with that row passing
    // under the header and looked like a glitch. A near-zero threshold
    // doesn't have that problem -- frost is already on well before any
    // near-top content reaches the header.
    const FROST_ENTER = 24;
    const FROST_EXIT = 4;
    // Same hysteresis idea as the frost threshold above, at the opposite
    // end of the page -- overscroll/rubber-banding right at the bottom
    // edge would otherwise flicker a single threshold in and out.
    const BOTTOM_ENTER = 4;
    const BOTTOM_EXIT = 40;
    const update = () => {
      queued = false;
      setScrolled((current) => {
        if (current) return window.scrollY > FROST_EXIT;
        return window.scrollY > FROST_ENTER;
      });

      const distanceFromBottom =
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      setAtBottom((current) => {
        if (current) return distanceFromBottom < BOTTOM_EXIT;
        return distanceFromBottom <= BOTTOM_ENTER;
      });

      // The embedded Work gallery on "/" has no route of its own, so its
      // nav highlight is scroll-position-driven instead of
      // usePathname()-driven. Gated to its own route — every other
      // route's isActive() below stays pure route-matching, untouched by
      // this.
      if (pathname === "/") {
        const section = document.getElementById("home-work");
        const top = section?.getBoundingClientRect().top ?? Infinity;
        setHomeWorkActive((current) =>
          current ? top < MERGE_EXIT : top <= MERGE_ENTER,
        );
      } else {
        setHomeWorkActive(false);
      }

    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
    // Nav lives in the root layout and persists across client-side
    // navigations, so this must re-run per pathname — a []-scoped closure
    // would freeze whatever pathname was true at first mount and never see
    // route changes again. Re-subscribing once per navigation (not per
    // scroll frame) doesn't reintroduce a layout-thrash problem — nothing
    // here animates a layout property every frame, only a background/
    // border colour.
  }, [pathname]);

  // On "/", only Work can ever be active (once the embedded gallery has
  // scrolled under the header) — the wordmark isn't in navLinks, so there's
  // no "Home" case to handle here any more.
  // Same Next.js quirk as jM below: a <Link> to the route you're already on
  // triggers no route change, so Next's own navigation-scroll-restoration
  // never fires -- clicking Work again while scrolled down on /work did
  // nothing without this. window.scrollTo(0, 0) alone is enough to pick up
  // the sitewide scroll-behavior: smooth (and its prefers-reduced-motion:
  // auto override) from globals.css. Unrelated to the data-scroll-behavior
  // fix on <html> -- that only governs Next's own router-triggered scroll,
  // not a manual scrollTo() outside of a route change.
  const scrollToTopIfCurrent = (href: string) => {
    if (pathname === href) window.scrollTo(0, 0);
  };

  const isActive = (href: string) => {
    if (pathname === "/") {
      return href === "/work" && homeWorkActive;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Fourth pass at the "floating pill" idea (see memory/project notes).
  // Josh's reaction after seeing the three-shape split live: jM/Cart still
  // read too close to the main pill to feel like real corner marks. Moved
  // from "three flex children with a big gap" to a genuine 3-column grid
  // (1fr / auto / 1fr) spanning the site's usual max-w-frame content
  // width -- jM and Cart now sit at the actual left/right edges of that
  // frame, the same edges the very first (pre-pill) nav had them at,
  // while the middle column's `1fr` tracks being equal width keeps the
  // main pill genuinely centered in the viewport regardless of jM/Cart's
  // own size. Also dropped the mount slide-in animation the previous pass
  // had on jM/Cart (sliding in "from the main pill") -- Josh's own
  // observation once they moved to the true edges: with that much
  // distance between them now, motion implying they came from the pill
  // no longer reads as sensible. No replacement animation yet.
  //
  // frostClass is shared across all three shapes so the frost (border
  // colour, background, blur, the one-shot "stuck, then unstuck" settle)
  // stays byte-identical between them -- all three squash/stretch/settle
  // in lockstep, not staggered. 650ms, up from an original 500ms flat
  // scale-pop -- the new keyframe (globals.css) needs the extra room to
  // read as a hold-then-release rather than a single quick pop.
  //
  // The resting branch plays its own bounce too now -- nav-pill-landing,
  // "as if the nav bars have hit the top of the page and bounced," per
  // Josh -- gated behind hasFrostedOnce so it never plays on first mount,
  // only on a genuine scrolled-back-to-top transition. It has to be a
  // second, distinctly-named keyframe rather than reusing nav-pill-pop:
  // an animation only replays when the browser sees animation-name
  // actually change value, and alternating between two different names
  // on every scrolled flip (pop going down, landing coming back up) is
  // what makes it replay reliably in both directions, indefinitely --
  // reusing one name would only ever fire on the first transition.
  //
  // Same nav-pill-landing bounce also plays at the *bottom* of the page
  // now, even while still scrolled/frosted -- "make the fun bounce thing
  // happen when I hit the bottom too," per Josh. atBottom overrides which
  // animation the scrolled branch requests (landing instead of pop) purely
  // by swapping the name; since nav-pill-pop already finished playing by
  // the time you've scrolled all the way down, switching to a different
  // name still counts as a change and fires. Scrolling back up off the
  // bottom (still frosted) flips it back to nav-pill-pop, which — same
  // logic — plays again too, a small bounce on the way off the bottom
  // edge, not just onto it.
  // Trial (2nd pass): a flat blend-mode ring read as a plain thin outline,
  // not glass -- "not quite a cooler highlight or glassy reflective state,"
  // per Josh. Real glass reads as reflective from an *asymmetric* highlight
  // (bright along the top inner edge where light catches it, near-invisible
  // at the bottom), not a uniform ring -- the classic inset-shadow
  // glassmorphism technique, not a border at all. backdrop-saturate-150
  // alongside it so the blurred colour underneath actually reads as richer
  // colour, not just softened -- closer to "mimics the colour it's passing
  // over" than a white ring ever was, since it's the real backdrop colour
  // showing through more vividly rather than a synthetic overlay tint.
  // A third, brand-blue inset wash rides alongside the two white highlight
  // layers -- back-to-top.tsx got this first ("doesn't stand out" against a
  // plain canvas background, then "try blue" once accent-purple was tried),
  // ported here so mobile and desktop share the same tinted-glass look
  // rather than back-to-top being the only frosted surface with colour in
  // it. Same colour-mix(...) against var(--color-brand) approach, no raw
  // hex. Lives only in the `scrolled` branch, same as the white highlights
  // -- resting state has no surface at all to tint.
  //
  // Purely scroll-driven -- a `|| swipeFrost` used to force this branch
  // during a ProjectStackSwipe drag too; removed per Josh, see the note
  // where that state used to be declared above.
  const frostClass = scrolled
    ? `${atBottom ? "animate-[nav-pill-landing_650ms_ease-in-out]" : "animate-[nav-pill-pop_650ms_ease-in-out]"} border-transparent bg-canvas/15 shadow-[inset_0_1px_8px_rgba(255,255,255,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3),inset_0_0_22px_color-mix(in_srgb,var(--color-brand)_32%,transparent)] backdrop-blur-md backdrop-saturate-150`
    : hasFrostedOnce
      ? "animate-[nav-pill-landing_650ms_ease-in-out] border-transparent bg-transparent"
      : "border-transparent bg-transparent";

  return (
    <>
      {/* min-h-[88px], not a fixed h-[88px] -- pt-[env(safe-area-inset-top)]
          (see app/layout.tsx's viewportFit: "cover" for the other half of
          this) pushes the jM/pill/Cart shapes down clear of a notch/
          Dynamic Island/status bar instead of letting them render behind
          it. With box-sizing: border-box (Tailwind's own preflight), a
          *fixed* height would have had that padding eat into the existing
          88px budget instead of adding to it, squeezing the real nav
          content into less room -- min-height instead lets the whole
          header grow taller only on devices that actually have a safe
          area (0px everywhere else, so h-[88px]'s old behaviour is
          untouched on any non-notched phone, tablet or desktop). NAV_HEIGHT
          above already reads this element's own live rendered height for
          exactly this reason -- a hardcoded 88 would undercount on
          whichever devices this padding actually does something. */}
      <header ref={headerRef} className="sticky top-0 z-40 flex min-h-[88px] items-start justify-center pt-[env(safe-area-inset-top)]">
        <nav
          aria-label="Primary"
          className="mx-auto mt-5 grid w-full max-w-frame grid-cols-[1fr_auto_1fr] items-center px-6 md:px-gutter"
        >
          {/* jM circle -- pinned to the frame's left edge (justify-self:
              start), the same edge the pre-pill nav always had it at.
              hover:/active: animate the same squash-and-stretch shape the
              scroll-in frost uses (globals.css) -- "apply that same
              gloopy bounce when you hover over the nav buttons too," per
              Josh -- but its own distinctly-named keyframe,
              nav-pill-hover, not a reuse of nav-pill-pop: reusing it
              meant hovering while frosted asked for the same
              animation-name the frosted base class already had applied,
              so the browser saw no change and never replayed it ("when
              the frost pill is activated (on hover) the movement is not
              as animate or fun," per Josh). A third distinct name always
              differs from whatever the base is currently playing, so it
              retriggers every hover regardless of scroll state.
              Unconditional (outside frostClass, which only covers the
              scroll-driven state) so it plays on every fresh hover/tap
              regardless of whether the pill is currently frosted or
              not. */}
          <div className="justify-self-start">
            <Link
              href="/"
              aria-label="Josh McKenna — home"
              onClick={() => scrollToTopIfCurrent("/")}
              className={`flex h-[53px] w-[53px] shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,backdrop-filter] duration-300 ease-in-out hover:animate-[nav-pill-hover_650ms_ease-in-out] active:animate-[nav-pill-hover_650ms_ease-in-out] md:h-20 md:w-20 ${frostClass}`}
            >
              {/* Home link -- always routes to "/", every page, every
                  state. Josh's own jM logomark now (public/icons/
                  jm-logomark.png), replacing the styled "jM" text this
                  used to render -- a transparent PNG, already brand-blue
                  baked into the artwork, so no CartIcon-style
                  currentColor masking is needed here (jM's colour never
                  changes; Cart's does, between text-ink and text-accent).
                  next/image with explicit width/height rather than Plate
                  -- the same drifting-hero-cutout exception CLAUDE.md
                  already carves out for transparent-PNG marks that
                  aren't framed artwork, just applied to a second, much
                  smaller case. width/height (72) are a fixed intrinsic
                  size for Next's optimizer, not the rendered size --
                  className's h-8/h-9 controls what actually shows, same
                  pattern as sizing any next/image via CSS. Same
                  BackToTop-family easing as every pill/chip/button on
                  the site (duration-500
                  ease-[cubic-bezier(0.34,1.56,0.64,1)]), but bigger and
                  with a tilt -- jM is the one brand mark, not a utility
                  pill, so it gets a more pronounced version of the same
                  bounce rather than the exact scale-105. active: mirrors
                  hover: exactly -- touch devices never trigger Tailwind's
                  hover: variant (it's scoped to @media (hover: hover)
                  precisely so a tap doesn't leave a stuck hover state),
                  so without this a tap here would have no visible
                  feedback at all, just the navigation.

                  The explicit scroll-to-top (scrollToTopIfCurrent below)
                  handles a Next.js quirk: a <Link> to the route you're
                  already on doesn't trigger Next's own navigation-scroll-
                  restoration (no route change actually happens), so
                  clicking jM while already on "/" did nothing if you'd
                  scrolled down. Every primary nav link gets the same
                  treatment now. */}
              {/* brightness-0 flattens the blue mark to a black silhouette
                  (alpha preserved), invert flips it white — so the same
                  PNG goes white over flagged blue artwork with no second
                  asset needed from Josh. transition-transform, not the
                  old transition-all: the hover tilt/scale keeps its
                  bounce while the white swap snaps instantly in both
                  directions, per Josh.

                  The invert conditional is interpolated as its own
                  space-separated token — a first cut appended `${…}` flush
                  against md:w-14, fusing them into one unscannable token
                  for Tailwind's static extractor, so md:w-14's CSS was
                  never generated and the mark rendered 40×56: the
                  "stretched too tall" jM. */}
              <Image
                src="/icons/jm-logomark.png"
                alt=""
                aria-hidden="true"
                width={112}
                height={112}
                sizes="56px"
                priority
                className="h-10 w-10 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-rotate-6 hover:scale-125 active:-rotate-6 active:scale-125 md:h-14 md:w-14"
              />
            </Link>
          </div>

          {/* Main pill -- centered in the grid's middle column, which
              stays genuinely viewport-centered because both flanking
              columns are equal `1fr` tracks regardless of jM/Cart's own
              width. Originally sized to clearly outsize jM/Cart's
              (then-)56/64px circles (py-5/md:py-6 + text-[17px]/
              md:text-[22px] lands the pill noticeably taller at both
              breakpoints) -- Josh: "increase the size of the nav bar so
              it's bigger than the jM and cart... it should be the main
              focus." Previously the circles were incidentally *taller*
              than the pill (56/64px vs a ~40/48px pill), backwards from
              what he wanted -- the pill got bigger to fix that, then the
              circles grew too (now 64/80px, see jM/Cart below) "to
              better match the centre nav." Text
              nudged back down slightly from an initial 18/24px -- "I
              like it but just a smidge smaller."

              hover:/active: make the pill itself bounce too when
              hovered/tapped anywhere within it, not just the word under
              the cursor -- "can the words affect the pill a bit more?
              like the way jM does to it's own circle," per Josh. First
              cut used has-[a:hover] to react specifically to a *word's*
              hover state, since the pill and its words are two
              different nodes and jM/Cart's self-bounce (circle *is* the
              Link) doesn't apply directly here -- but moving the cursor
              from one word to the next crosses the real gap between
              them, so :has(a:hover) dropped out and back in on every
              crossing, restarting the animation each time ("it starts
              to bug a little when going from one word to the other," /
              "it's still a little jittery sometimes" after dialing the
              amplitude down twice). The actual fix wasn't amplitude, it
              was the trigger: plain hover:/active: on the pill itself,
              same mechanism as jM/Cart, fires once and stays true for as
              long as the cursor is anywhere inside the pill's own box --
              including the gaps between words -- so there's no
              off-then-on cycle crossing between them, matching Josh's
              own read of the bug ("shouldn't be an on and off
              sequence"). Kept at nav-pill-hover-soft's reduced
              amplitude regardless, rather than restoring full strength
              now that the flicker's gone -- Josh asked to scale it back
              twice before the cause was clear; worth leaving it quieter
              unless he asks for more. */}
          <div
            // relative + onMouseLeave: anchors the Work category
            // drop-down below and keeps it open while the cursor is
            // anywhere over pill or menu (the menu's own pt-3 bridges
            // the visual gap so crossing down never leaves this box).
            onMouseLeave={() => setWorkMenuOpen(false)}
            className={`relative flex items-center gap-3 rounded-full border px-3.5 py-3 transition-[background-color,border-color,backdrop-filter] duration-300 ease-in-out hover:animate-[nav-pill-hover-soft_650ms_ease-in-out] active:animate-[nav-pill-hover-soft_650ms_ease-in-out] md:h-20 md:gap-10 md:px-12 md:py-0 ${frostClass}`}
          >
            {workMenuOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
                {/* Same drop/woosh entrance as the in-page filter row —
                    mount-on-open is what plays it fresh each hover. Solid
                    bg-canvas pills (no frost, per Josh) so they read over
                    whatever content is behind them. */}
                <div className="flex w-max max-w-[92vw] flex-wrap justify-center gap-2">
                  {["All", ...getActiveCategories()].map((option, index) => (
                    <span
                      key={option}
                      className={
                        index === 0
                          ? "animate-[pill-drop_500ms_var(--ease-bounce)_both]"
                          : "animate-[pill-woosh_550ms_var(--ease-bounce)_both]"
                      }
                      style={{ animationDelay: `${index * 55}ms` }}
                    >
                      <Link
                        href={option === "All" ? "/work" : `/work?category=${encodeURIComponent(option)}`}
                        // The empty search dispatch mirrors the in-page
                        // pills: picking any category (All included, whose
                        // URL may not even change) ends a live search.
                        onClick={() => {
                          setWorkMenuOpen(false);
                          window.dispatchEvent(new CustomEvent("worklist:search", { detail: "" }));
                        }}
                        className="font-grotesque inline-block rounded-full border border-ink bg-canvas px-4 py-[9.5px] text-[11px] leading-none font-semibold uppercase tracking-[0.02em] text-ink-muted text-trim-caps shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:border-brand hover:text-brand"
                      >
                        {option}
                      </Link>
                    </span>
                  ))}
                  {/* Search rides the menu's stagger too, /work only —
                      "include the new search bar in the drop down work
                      hover menu when anywhere on the work screen," per
                      Josh. It feeds the gallery's own query state via a
                      window event (different tree), which also pops the
                      in-page pill open so the query stays visible after
                      this menu closes. Uncontrolled here — each open
                      starts a fresh input, the gallery keeps the state.
                      NavWorkSearch (above Nav) owns the collapsed/open
                      sizing itself, mirroring work-gallery.tsx's pill. */}
                  {pathname === "/work" && (
                    <NavWorkSearch delayMs={(getActiveCategories().length + 1) * 55} />
                  )}
                </div>
              </div>
            )}
            <ul className="flex items-center gap-3 md:gap-10">
              {navLinks.map((link) => (
                <li key={link.href}>
                  {/* Same nav-pill-hover squash-and-stretch as jM/Cart's
                      circles, not the plain hover:scale-105 this used to
                      have -- "apply that effect to the hover of the
                      words in the centre nav too," per Josh, once he saw
                      it on the circles. active: mirrors hover: for the
                      same touch-accessibility reason jM/Cart's does
                      (Tailwind's hover: variant never fires on a tap).
                      inline-block so the animation's transform actually
                      renders (inline elements can ignore it in some
                      browsers). transition-[font-weight] only now --
                      transform is driven by the keyframe, not a CSS
                      transition, so it's dropped from this list rather
                      than fighting the animation for control of the
                      property; `color` was dropped too so the white swap
                      over flagged blue artwork lands instantly in both
                      directions ("make sure the switch between black and
                      white is instant," per Josh) rather than fading
                      through unreadable in-betweens.

                      px-1/md:px-2 py-1/md:py-1.5 with matching negative
                      margins grows the actual hoverable box past the
                      glyphs themselves, without moving anything visually
                      -- padding enlarges the box, the matching negative
                      margin pulls its outer edges back to where they'd
                      sit without the padding, so neighbouring words keep
                      the same visual gap while each word's hit area now
                      reaches into part of that gap. Same "twittering" as
                      the pill's own fix above, one node down: a tight hit
                      box right at the text's edges means small mouse
                      jitter flickers in and out of :hover and keeps
                      restarting the bounce -- "can you make the area
                      where the mouse hovers over the words a little bit
                      larger so they engage sooner? ... there is some
                      buggy twittering," per Josh. gap-3/gap-10 (12/40px)
                      leaves enough room for the smaller mobile padding
                      (4px each side) without two words' extended hit areas
                      ever touching. Mobile went through several rounds:
                      shrunk first to stop it overflowing narrow phone
                      viewports ("the nav bar and two circles either side
                      seem too large and they go off screen"), sized back
                      up once that read as too small and matched to
                      back-to-top's mobile scale, given more room around
                      the edge words and between them once Josh saw it
                      live, increased again on both counts the following
                      night, then text/gap increased once more after that
                      still read "a little too small and close together."
                      Link text and the word gap both shrank repeatedly
                      through these rounds purely to keep fitting a strict
                      320px budget (15px -> 14px -> 13px, back up to 15px
                      here; gap-6 -> ... -> gap-2, back up to gap-3) --
                      each round of "make X bigger" was paid for by
                      shrinking something else to stay under that width,
                      which is why the same numbers kept bouncing instead
                      of settling. This pass breaks that cycle: 320px
                      (iPhone 5/SE-1st-gen, discontinued years ago) is left
                      to overflow slightly rather than shrinking legible
                      text again -- verified 360px (the common Android
                      floor) and 375px+ both still fit cleanly, which
                      covers every device actually in use today. jM/Cart's
                      circle size (h-[53px]/w-[53px] below) started out
                      picked to land on this pill's own rendered height
                      exactly -- "prefer to be same height," per Josh --
                      then nudged slightly past it ("slightly increase the
                      jM and cart circles to better match the centre nav
                      pill") rather
                      than staying pinned to an exact match. md: restores
                      the original desktop sizing throughout this pill and
                      both circles regardless. */}
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    // Closing the menu on click matters even without a
                    // route change: clicking Work while scrolled on
                    // /work scroll-restores to the top, where the page's
                    // own row appears under a menu that mouseleave never
                    // closed (the cursor hasn't moved) — "you click
                    // WORK... the hover is doubling up the pills," per
                    // Josh. The pathname effect below covers arrivals
                    // from other pages the same way.
                    onClick={() => {
                      scrollToTopIfCurrent(link.href);
                      setWorkMenuOpen(false);
                    }}
                    // Twice guarded: /work only ("hover state should only
                    // be available when inside the work page," per Josh —
                    // it was opening on project pages and everywhere
                    // else too), and even there only once the page's own
                    // filter row has scrolled out of the viewport, since
                    // at the top the menu dropped directly over the real
                    // row as a doubled stack ("make sure this doesnt
                    // happen on return to top").
                    onMouseEnter={
                      link.href === "/work" && pathname === "/work"
                        ? () => {
                            const row = document.querySelector(
                              '[aria-label="Filter work by discipline"]',
                            );
                            if (row) {
                              const rect = row.getBoundingClientRect();
                              if (rect.bottom > 0 && rect.top < window.innerHeight) return;
                            }
                            setWorkMenuOpen(true);
                          }
                        : undefined
                    }
                    className={`-mx-1 -my-1 inline-block px-1 py-1 font-body text-[15px] transition-[font-weight] duration-200 ease-in-out hover:animate-[nav-pill-hover_650ms_ease-in-out] active:animate-[nav-pill-hover_650ms_ease-in-out] md:-mx-2 md:-my-1.5 md:px-2 md:py-1.5 md:text-[22px] ${
                      isActive(link.href)
                        ? "font-bold text-accent"
                        : "text-ink-muted hover:font-bold hover:text-accent"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cart circle -- mirrors jM: pinned to the frame's right edge
              (justify-self: end), same size, same frost, same
              hover:/active: nav-pill-hover bulge (see jM's comment above
              for why it's its own keyframe, not nav-pill-pop --
              unconditional, plays on every fresh hover/tap regardless
              of scroll/frost state). Josh's own bag icon now
              (public/icons/cart.png via CartIcon), not the placeholder
              outline this used to render. */}
          <div className="justify-self-end">
            <Link
              href="/shop"
              aria-current={isActive("/shop") ? "page" : undefined}
              aria-label="Cart"
              onClick={() => scrollToTopIfCurrent("/shop")}
              className={`group flex h-[53px] w-[53px] shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,backdrop-filter] duration-300 ease-in-out hover:animate-[nav-pill-hover_650ms_ease-in-out] active:animate-[nav-pill-hover_650ms_ease-in-out] md:h-20 md:w-20 ${frostClass}`}
            >
              {/* group-hover (keyed to the circle <Link> above, via
                  `group`), not a plain hover: on the icon itself -- the
                  icon glyph is much smaller than the circle, so a
                  self-only hover: left most of the circle's area unable
                  to trigger it. Same split as jM above otherwise (circle
                  stays put, only the mark inside it moves) and the same
                  transition recipe as the footer's social icons
                  (transition-[color,transform] duration-200 ease-in-out,
                  group-hover:duration-300 group-hover:ease-drift). Blue
                  specifically (text-brand), not text-accent -- purple is
                  reserved for the active-page state, this is a distinct
                  hover cue. CartIcon's own internal crossfade
                  (cart.png -> cart-hover.png) is also group-hover-driven
                  off this same circle now, for the same reason.
                  group-hover:rotate-6 is jM's own "sideways fun" tilt
                  (hover:-rotate-6 on its image), applied here too per
                  Josh so both marks share the same playful wobble --
                  mirrored to the opposite direction (positive, not
                  negative) since jM sits on the left and Cart on the
                  right; tilting the same way as jM read wrong, per
                  Josh, tilting outward/away from center reads right.
                  group-active: mirrors every group-hover: here for the
                  same touch-accessibility reason jM's active: does --
                  Cart didn't have this before; added it now while
                  already touching this hover treatment rather than
                  leaving the gap. */}
              <CartIcon
                className={`h-5 w-5 transition-transform duration-200 ease-in-out group-hover:rotate-6 group-hover:scale-110 group-hover:duration-300 group-hover:ease-drift group-active:rotate-6 group-active:scale-110 md:h-7 md:w-7 group-hover:text-brand group-active:text-brand ${
                  isActive("/shop") ? "text-accent" : "text-ink"
                }`}
              />
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}
