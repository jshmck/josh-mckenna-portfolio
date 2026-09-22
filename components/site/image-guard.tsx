"use client";

import { useEffect } from "react";

/**
 * Blocks the right-click context menu on every <img> sitewide — the
 * "Save image as" path. A deterrent, not protection (the URL is still
 * in the network tab); it pairs with ProjectVideo's own onContextMenu
 * guard, which exists because video needs the whole element covered,
 * not just the IMG tag.
 *
 * One delegated document listener instead of a handler per Plate:
 * Plate is a server component, and event handlers would force it — and
 * every tree that renders it — into the client bundle. The context
 * menu stays available everywhere else (links, text, the page itself).
 */
export function ImageGuard() {
  useEffect(() => {
    const block = (event: MouseEvent) => {
      if (event.target instanceof HTMLImageElement) event.preventDefault();
    };
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, []);

  return null;
}
