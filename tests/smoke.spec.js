import { test, expect } from "@playwright/test";

/* Smoke tests for bylx.dev.
 *
 * Scope is deliberately narrow: every assert here exists because the thing it
 * checks HAS broken before, not because it is easy to test.
 *   - the desk hotspots once shipped unclickable (a pointer-events cascade);
 *     nothing caught it because the CSS looked right. So these tests CLICK.
 *   - the hero used to anchor top, cropping the desk below the fold on short
 *     viewports, which put the interactive objects out of frame entirely.
 *   - the two funnel CTAs shipped at 2.53:1 contrast.
 * Assert on behaviour and geometry, not on class names. */

const shortViewport = { width: 1568, height: 718 };

/* Freeze the scene. It drifts forever by design, so Playwright's "stable"
   actionability check never settles and every click here times out. Costs
   these tests nothing: the regression they guard — hotspots swallowed by a
   pointer-events cascade — is about stacking, not movement, and
   tests/motion.spec.js covers the scene in motion.
   emulateMedia rather than `use: { reducedMotion }` in the config or
   test.use(): both of those read back correctly but never reach the browser
   (matchMedia stays false), which silently ran the whole suite against a
   moving scene. This actually applies. */
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
});

test("loads with no console errors and no page errors", async ({ page }) => {
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  expect(errors).toEqual([]);
});

test("the desk and its hotspots stay above the fold on a short viewport", async ({ page }) => {
  test.skip(test.info().project.name !== "desktop", "geometry assert is desktop-specific");
  await page.setViewportSize(shortViewport);

  // The scene is 16:9 and taller than this viewport: the sky must be what gets
  // cropped, never the desk. Every interactive object stays reachable.
  for (const sel of [".phone", ".mp3player", ".keyboard-board", ".monitor-power", ".instax"]) {
    const box = await page.locator(sel).first().boundingBox();
    expect(box, `${sel} should be laid out`).not.toBeNull();
    expect.soft(box.y + box.height, `${sel} must not be cut off below the fold`)
      .toBeLessThanOrEqual(shortViewport.height);
  }
});

test("the page never scrolls horizontally", async ({ page }) => {
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
  expect(overflows).toBe(false);
});

test("instax hotspot opens the gallery — by clicking it, not by dispatching", async ({ page }) => {
  // A real click is the point: it proves the sprite is actually hit-testable
  // and nothing above it is swallowing pointer events.
  await page.locator(".hotspot-instax").click();
  await expect(page.locator("#gallery-modal")).toHaveClass(/is-open/);
});

test("phone hotspot opens the contact form, and Escape closes it", async ({ page }) => {
  await page.locator(".hotspot-phone").click();
  await expect(page.locator("#contact-modal")).toHaveClass(/is-open/);

  await page.keyboard.press("Escape");
  await expect(page.locator("#contact-modal")).not.toHaveClass(/is-open/);
});

test("mp3 hotspot opens the player and the dial actually plays audio", async ({ page }) => {
  await page.locator(".hotspot-mp3").click();
  await expect(page.locator(".mp3-player")).toHaveClass(/is-on/);

  await page.locator(".mp3-play").click();

  // audio.js drives a detached `new Audio()`, so there is no <audio> in the DOM
  // to inspect. `is-playing` is still a real signal rather than a CSS guess:
  // only the media element's own "play" event handler ever adds it.
  await expect(page.locator(".mp3-player")).toHaveClass(/is-playing/, { timeout: 10_000 });
  await expect(page.locator("[data-mp3-state]")).toHaveText("▶");

  await page.keyboard.press("Escape");
  await expect(page.locator(".mp3-player")).not.toHaveClass(/is-on/);
});

test("Start menu opens, lines up with the START button, and Escape closes it", async ({ page }) => {
  test.skip(test.info().project.name !== "desktop", "the desk crop recomposes this on mobile");

  await page.locator(".start-btn").click();
  const menu = page.locator(".start-menu");
  await expect(menu).toBeVisible();

  // The toolbar rides the artboard, which is centred and can be wider than the
  // viewport — a viewport-relative % only lines up by coincidence.
  const menuBox = await menu.boundingBox();
  const btnBox = await page.locator(".start-btn").boundingBox();
  expect(Math.abs(menuBox.x - btnBox.x)).toBeLessThanOrEqual(2);

  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
});

test("fullscreen traps focus and Escape returns you", async ({ page }) => {
  await page.locator(".start-btn").click();
  await page.locator('[data-start-action="fullscreen"]').click();

  const fs = page.locator(".fullscreen-mode");
  await expect(fs).toBeVisible();

  // Nothing inside is focusable, so Tab must not hand focus to the page behind.
  await page.keyboard.press("Tab");
  const trapped = await fs.evaluate((el) => document.activeElement === el);
  expect(trapped).toBe(true);

  await page.keyboard.press("Escape");
  await expect(fs).toBeHidden();
});

test("the power pips on the CRT toggle the screen", async ({ page }) => {
  // Desktop only, and not an oversight: the mobile desk crop pulls the phone
  // in front of the monitor, and the phone sprite genuinely covers the pips
  // (opaque art, not a stray hitbox). Touch reaches power via the Start menu —
  // asserted separately below.
  test.skip(test.info().project.name !== "desktop", "phone occludes the pips in the desk crop");

  const scene = page.locator("#hero-scene");
  await page.locator(".monitor-power").click();
  await expect(scene).toHaveClass(/screen-off/);
  await page.locator(".monitor-power").click();
  await expect(scene).not.toHaveClass(/screen-off/);
});

test("the Start menu can toggle the monitor on any viewport", async ({ page }) => {
  const scene = page.locator("#hero-scene");

  await page.locator(".start-btn").click();
  await page.locator('[data-start-action="monitor"]').click();
  await expect(scene).toHaveClass(/screen-off/);

  await page.locator(".start-btn").click();
  await page.locator('[data-start-action="monitor"]').click();
  await expect(scene).not.toHaveClass(/screen-off/);
});

test("the window close tile closes the pixel window", async ({ page }) => {
  await page.locator(".pixel-window-close").click();
  await expect(page.locator(".pixel-window")).toHaveClass(/is-closed/);
});

test("both funnel CTAs clear WCAG AA contrast", async ({ page }) => {
  // These shipped at 2.53:1 (white on pink). Assert the ratio, not the hex, so
  // the test still means something if the palette moves.
  const ratio = async (selector) =>
    page.locator(selector).first().evaluate((el) => {
      const parse = (s) => s.match(/[\d.]+/g).slice(0, 3).map(Number);
      const lum = (c) => {
        const [r, g, b] = c.map((v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const cs = getComputedStyle(el);
      const a = lum(parse(cs.color)) + 0.05;
      const b = lum(parse(cs.backgroundColor)) + 0.05;
      return Math.max(a, b) / Math.min(a, b);
    });

  expect(await ratio(".hero-text a")).toBeGreaterThanOrEqual(4.5);
  expect(await ratio(".about-cta")).toBeGreaterThanOrEqual(4.5);
});

test("the contact form still posts without JavaScript", async ({ browser }) => {
  // A no-JS fallback is a project requirement, and it is the one path that
  // cannot be checked by poking the live DOM.
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");

  const form = page.locator("#contact-modal form");
  await expect(form).toHaveAttribute("action", /contact\.php/);
  await expect(form).toHaveAttribute("method", /post/i);
  await context.close();
});
