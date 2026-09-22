import { test, expect } from "@playwright/test";

/* Motion tests — the scene in its default state: still until the pointer
 * moves. Ambient drift is switched off (see css/hero-positions.css); the
 * parallax, the fleeing mouse and the screen's own flickers are what move.
 *
 * These exist because of a bug that hid in plain sight for a long time:
 * every layer composed its transform as `var(--base-transform) translate3d(…)`
 * with `--base-transform: none` as the default. `none translate3d(…)` is a
 * parse error, so the whole declaration was dropped and those layers had NO
 * transform at all. The scene looked deliberate — it just never moved, and
 * neither the ambient float NOR the pointer parallax did anything except on
 * the handful of layers that happened to carry a flip or a rotate.
 *
 * Nothing caught it because nothing asserted that motion moves. That is what
 * these do. They are the only specs that opt out of the reduced-motion default
 * in playwright.config.js.
 */

const settle = (page) => page.waitForTimeout(1200);
const transformOf = (page, sel) =>
  page.locator(sel).first().evaluate((el) => getComputedStyle(el).transform);

/* Position relative to the artboard, rounded to a tenth. The artboard itself
   still breathes, so an absolute rect moves even when the prop on it does
   not — measuring against the board is the only way to ask "did THIS move". */
const relativeTo = (page, sel) =>
  page.locator(sel).first().evaluate((el) => {
    const art = document.querySelector(".hero-artboard").getBoundingClientRect();
    const box = el.getBoundingClientRect();
    return [+(box.left - art.left).toFixed(1), +(box.top - art.top).toFixed(1)];
  });

/* Explicit, and via emulateMedia rather than test.use(), which does not reach
   the browser — see the note in smoke.spec.js. These are the specs that must
   run with the scene moving, so being sure of the mode is the whole ballgame. */
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
});

test("no layer is left without a transform", async ({ page }) => {
  // The failure mode was silent: an invalid transform computes to `none`, so a
  // layer reports as fine while being immovable. Catch it by counting.
  const dead = await page.evaluate(() =>
    [...document.querySelectorAll(".layer, .bg, .screen-item")]
      .filter((el) => getComputedStyle(el).transform === "none")
      .map((el) => el.className)
  );
  expect(dead, "these layers can never float or parallax").toEqual([]);
});

test("the scene does not drift on its own", async ({ page }) => {
  // Ambient drift is off by default (css/hero-positions.css explains why).
  // Each prop must hold still until the pointer asks it to move — measured
  // against the artboard, since the artboard itself still breathes.
  for (const sel of [".cocktail", ".instax", ".ponte", ".table"]) {
    const before = await relativeTo(page, sel);
    await settle(page);
    const after = await relativeTo(page, sel);
    expect.soft(after, `${sel} should hold still`).toEqual(before);
  }
});

test("the drift engine is still wired, just switched off", async ({ page }) => {
  // The switch is one class: if this breaks, is-drifting no longer works and
  // the per-object --float-* values have quietly become dead weight.
  const moved = await page.evaluate(async () => {
    const scene = document.querySelector("#hero-scene");
    const el = document.querySelector(".cocktail");
    const art = document.querySelector(".hero-artboard");
    const rel = () => el.getBoundingClientRect().top - art.getBoundingClientRect().top;
    const before = rel();
    scene.classList.add("is-drifting");
    await new Promise((r) => setTimeout(r, 1200));
    const after = rel();
    scene.classList.remove("is-drifting");
    return Math.abs(after - before) > 0.5;
  });
  expect(moved, "adding .is-drifting should make the cocktail move again").toBe(true);
});

test("the parallax follows the pointer", async ({ page }) => {
  // Desktop only. In portrait js/parallax.js bails (the desk crop has nothing
  // to offset), so there is nothing to follow — this used to pass on mobile
  // only because the ambient drift moved the table between the two samples.
  test.skip(test.info().project.name !== "desktop", "parallax is off in the desk crop");

  await page.mouse.move(150, 150);
  await page.waitForTimeout(200);
  const leftBg = await transformOf(page, ".window-frame");
  const leftDesk = await transformOf(page, ".table");

  await page.mouse.move(1400, 600);
  await page.waitForTimeout(600);
  const rightBg = await transformOf(page, ".window-frame");
  const rightDesk = await transformOf(page, ".table");

  expect(leftBg, "the window should track the pointer").not.toBe(rightBg);

  // ...and the desk must not. Parallax is background-only (js/parallax.js):
  // the depth reads in the landscape, and nothing shifts under the cursor on
  // the way to a click.
  expect(leftDesk, "the table must hold still").toBe(rightDesk);
});

test("a hotspot steadies under the pointer", async ({ page }) => {
  test.skip(test.info().project.name !== "desktop", "no hover on touch");

  // Ambient drift ships switched off, so this guarantee is dormant — but the
  // rule must keep working for whoever turns it back on with .is-drifting.
  // A click target that drifts is a target that dodges. Reaching for it stops it.
  await page.evaluate(() => document.querySelector("#hero-scene").classList.add("is-drifting"));

  const instax = page.locator(".hotspot-instax");
  const box = await instax.boundingBox();

  // Raw mouse.move, not hover(): hover() waits for the element to be "stable"
  // first, and the whole point is that it is not stable until we arrive.
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(120);

  // animationPlayState is the ground truth for the float. Deliberately NOT
  // asserted via the composite transform: the parallax keeps lerping toward
  // its target for seconds after the pointer stops (LERP_FACTOR 0.05), so the
  // matrix goes on creeping long after the float is frozen — that is a
  // different feature working, not this one failing.
  expect(await instax.evaluate((el) => getComputedStyle(el).animationPlayState)).toBe("paused");

  // ...and the pause is this hotspot's, not a global freeze.
  const others = await page
    .locator(".hotspot-phone, .hotspot-mp3")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationPlayState));
  expect(others).toEqual(["running", "running"]);
});

test("prefers-reduced-motion leaves the scene genuinely still", async ({ page }) => {
  // Re-emulate on the fixture page rather than spinning a browser.newContext():
  // a hand-made context inherits none of the project's options (viewport,
  // baseURL), which made this flaky.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });

  const running = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === "running")
      .map((a) => a.animationName)
  );
  expect(running, "nothing may still be animating").toEqual([]);

  // Not merely "no animations declared" — actually not moving.
  const before = await transformOf(page, ".cocktail");
  await settle(page);
  expect(await transformOf(page, ".cocktail")).toBe(before);
});

test("no layer pins a compositor layer for the whole session", async ({ page }) => {
  // will-change: transform on all 28 layers held 28 GPU layers permanently, for
  // animations the browser promotes on its own for their duration anyway.
  const pinned = await page.evaluate(() =>
    [...document.querySelectorAll(".layer, .bg, .screen-item")]
      .filter((el) => getComputedStyle(el).willChange.includes("transform")).length
  );
  expect(pinned).toBe(0);
});
