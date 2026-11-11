/* Renders og-image.png (1200×630) from the live hero.
 *
 * The card is the scene itself rather than a mocked-up graphic, so it can
 * never drift from the site: re-run this whenever the hero art changes.
 *
 *   node scripts/make-og-image.mjs
 *
 * Needs the dev server on :4173 — `npx serve . -l 4173` in another shell,
 * or just run `npm run og`, which does both.
 */
import { chromium } from "playwright";

const URL = process.env.OG_URL ?? "http://localhost:4173/";
const OUT = "og-image.png";

const browser = await chromium.launch({ channel: process.env.OG_CHANNEL || undefined });
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
  // The scene's motion is decorative; a still card wants the static frame.
  reducedMotion: "reduce",
  // PM is the signature: a headless browser would otherwise pick AM and the
  // card would not look like the site people remember.
  colorScheme: "dark",
});

await page.goto(URL, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

// Chrome that belongs to the live site, not to a share card: the first-visit
// tip, the settings gear, the watermark and the drawn cursor (which otherwise
// renders parked at 0,0 — a stray arrow in the corner).
await page.addStyleTag({
  content: `.desk-hint, .os-tip, .settings, .watermark,
            .cursor, .sakura-cursor, .sakura-bit { display: none !important; }`,
});

// The scene is a canvas now: wait for the engine to say it has finished its
// opening, or the card catches the desk mid-assembly.
await page.waitForFunction(
  () => document.querySelector("#hero-scene")?.dataset.sceneReady === "1",
  null,
  { timeout: 15000 },
);

// Exactly 1200×630: the card is a crop of the top of the page, not of an
// element, because the hero section is taller than the card.
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();

console.log(`wrote ${OUT} (1200x630) from ${URL}`);
