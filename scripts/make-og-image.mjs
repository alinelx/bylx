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

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
  // The scene's motion is decorative; a still card wants the static frame.
  reducedMotion: "reduce",
});

await page.goto(URL, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

// The hint is a first-visit nudge, not part of the brand card. The custom
// cursor otherwise renders parked at 0,0 — a stray arrow in the corner.
await page.addStyleTag({
  content: ".desk-hint, .cursor, .sakura-bit { display: none !important; }",
});

// Every sprite decoded, or the card ships with holes in the desk.
await page.evaluate(async () => {
  const imgs = [...document.querySelectorAll("#hero img")];
  await Promise.all(imgs.map((i) => (i.complete ? null : i.decode().catch(() => null))));
});

await page.locator("#hero").screenshot({ path: OUT });
await browser.close();

console.log(`wrote ${OUT} (1200x630) from ${URL}`);
