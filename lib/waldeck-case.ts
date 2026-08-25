/**
 * The site's Waldeck brand-casing quirk, universal to every Waldeck
 * all-caps surface (project titles, section headers, chips, buttons):
 * every letter goes uppercase except 'e', 'j', 'k', 'g', 't' and 'y',
 * which stay real lowercase glyphs — the same pattern as the homepage
 * hero wordmark (jOSH / MCkeNNA, components/home/drifting-hero.tsx, left
 * hand-authored there rather than routed through this function).
 *
 * 'i' used to be in this set too, giving 'g' company so a lone lowercase
 * letter didn't read as a stray. Dropped it — with project titles now
 * rolling out regularly, several ("Voxi Pride", "La Pride") carry more
 * than one 'i' and the quirk was reading as broken rather than
 * deliberate. 'g' still has 't' for company.
 *
 * Two letters have a functional reason, not just a stylistic one:
 * - 'g' has no true descender in Waldeck (trial) — checked the glyph
 *   outlines directly, it bottoms out at y=0 like a capital letter — so a
 *   lone lowercase g just reads as an odd short letter. 't' gives it
 *   company so a run of lowercase letters together reads as deliberate
 *   rather than a single outlier.
 * - 'y' disambiguates a real rendering problem: the capital Y glyph is a
 *   blocky fork that reads as a "T" at display size (confirmed by
 *   rendering both letters at 300px and comparing); lowercase y has a
 *   real curved descender tail instead.
 *
 * Also spells out '&' as 'AND' — Waldeck (trial) has no ampersand glyph
 * at all (confirmed against the font's cmap), so a literal '&' silently
 * falls back to a different font mid-word.
 *
 * Callers using literal string constants (button labels, section
 * titles) write the already-transformed text directly rather than
 * calling this at render time — same reasoning "TALKS AND FEATURES" was
 * always literal in the JSX, not computed. This function exists for
 * text that comes from data (project titles, category names) where the
 * source content is normal-cased and the transform has to happen
 * somewhere.
 */
const LOWERCASE_LETTERS = new Set(["e", "j", "k", "g", "t", "y"]);

export function toWaldeckCase(text: string): string {
  return text
    .replace(/&/g, "AND")
    .split("")
    .map((char) =>
      LOWERCASE_LETTERS.has(char.toLowerCase())
        ? char.toLowerCase()
        : char.toUpperCase(),
    )
    .join("");
}
