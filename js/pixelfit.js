/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  <
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */
/* ᑲყᥣx pixelfit — pixel art scaled by whole DEVICE pixels

   CSS can only size things in CSS pixels, and on a screen at 125% one CSS
   pixel is 1.25 device pixels. So a 88px sprite shown at 880 CSS px — a tidy
   10× — actually lands as 1100 device pixels, which is 12.5× of the source:
   every second block a pixel wider than the last. Measured on a 1920 laptop at
   125%, that is what "it rendered horribly" looked like.

   This picks the largest whole multiple that FITS in device pixels, then works
   backwards to the CSS size that produces it. At 125% the answer for that same
   sprite is 8× — 704 device pixels, 563.2 CSS — and every block is identical.

   It runs on the elements that carry data-pixel-w / data-pixel-h, re-runs when
   the window resizes or the page moves to a screen with a different ratio, and
   is entirely optional: without it the CSS fallback still shows everything,
   just at whatever multiple the stylesheet guessed. */

const WATCHED = "[data-pixel-w][data-pixel-h]";

export function initPixelFit() {
  const parts = [...document.querySelectorAll(WATCHED)];
  if (!parts.length) return;

  function fit() {
    const dpr = window.devicePixelRatio || 1;

    for (const el of parts) {
      const w = Number(el.dataset.pixelW);
      const h = Number(el.dataset.pixelH);
      if (!w || !h) continue;

      /* A backdrop the stylesheet has turned off at this width must not be
         sized for: leave the element to the CSS entirely. */
      if (el.dataset.pixelBg !== undefined && getComputedStyle(el).backgroundImage === "none") {
        el.style.removeProperty("width");
        el.style.removeProperty("height");
        el.style.removeProperty("background-size");
        continue;
      }

      /* How much room there is, in device pixels. The element's own box is no
         use — it is what we are about to set — so ask its parent, and never
         exceed the cap the markup asked for. The parent must not be a box that
         shrink-wraps this element, or the measurement chases itself. */
      const room = el.parentElement?.getBoundingClientRect().width ?? 0;
      const cap = Number(el.dataset.pixelMax) || Infinity;
      const availableDevice = Math.min(room, cap) * dpr;

      const k = Math.max(1, Math.floor(availableDevice / w));

      /* The CSS size that lands on exactly k×w device pixels. Fractional on
         purpose: 563.2px is right where 563px would be half a block short. */
      el.style.width = `${(k * w) / dpr}px`;
      el.style.height = `${(k * h) / dpr}px`;
      el.style.setProperty("--pixel-scale", k);

      /* Background-image elements need the same number told twice. */
      if (el.dataset.pixelBg !== undefined) {
        el.style.backgroundSize = `${(k * w) / dpr}px ${(k * h) / dpr}px`;
      }
    }
  }

  fit();

  window.addEventListener("resize", fit, { passive: true });

  /* Moving a window between a laptop screen and an external monitor changes
     devicePixelRatio without resizing anything, and resize does not fire. */
  let ratioWatch;
  function watchRatio() {
    ratioWatch?.removeEventListener("change", onRatio);
    ratioWatch = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    ratioWatch.addEventListener("change", onRatio);
  }
  function onRatio() {
    fit();
    watchRatio();
  }
  watchRatio();
}
