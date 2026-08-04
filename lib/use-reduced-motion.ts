"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/**
 * Server and first-hydration render report `true`.
 *
 * Motion is opt-in: a component renders its static variant until the client
 * confirms motion is actually allowed. The inverse default would briefly mount
 * an animated layout for someone who asked for none.
 */
function getServerSnapshot() {
  return true;
}

/**
 * Reads `prefers-reduced-motion` as a reactive value.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect` for two reasons:
 * it is hydration-safe by construction (React uses the server snapshot, then
 * syncs), and it responds when someone changes the OS setting mid-session
 * instead of latching whatever was true at mount.
 *
 * Components that only need to *skip* setting up an animation can read
 * `matchMedia` directly inside their effect — this hook is for the cases where
 * the answer changes what gets rendered.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
