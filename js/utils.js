/* ============================================================
   BYLX — utils.js
   Shared utilities. No side effects — nothing runs on import.
   ============================================================ */

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isWiderThan(minWidth = 901) {
  return window.matchMedia(`(min-width: ${minWidth}px)`).matches;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}
