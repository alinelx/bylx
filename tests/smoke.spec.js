import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

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

  // ...and the layout viewport is the screen. A phone browser answers overflow
  // by widening the layout viewport and shrinking the whole page to fit, which
  // leaves scrollWidth == innerWidth and this test green while the page is
  // quietly zoomed out — and anything position:fixed lands off-screen. Caught
  // exactly that: 688px of layout on a 393px screen.
  const { layout, visual } = await page.evaluate(() => ({
    layout: window.innerWidth,
    visual: Math.round(window.visualViewport?.width ?? window.innerWidth),
  }));
  expect(layout, "layout viewport must match the screen").toBeLessThanOrEqual(visual + 1);
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
  // 20s, not 10: this is the only assertion in the suite waiting on a real
  // media decode, and under the full parallel run it is the one that loses the
  // race. It passes alone every time, which is the signature of the machine
  // being busy rather than the player being broken.
  await expect(page.locator(".mp3-player")).toHaveClass(/is-playing/, { timeout: 20_000 });
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

test("the published CVs carry no personal contact details", async ({ page }) => {
  // The About section links two PDFs, which makes them public files on a
  // public domain. They must reach a reader the same way the site does —
  // through geral@bylx.dev — and never through a phone number or a private
  // inbox. The first pair shipped with both.
  const sources = ["scripts/cv/frontend.html", "scripts/cv/design.html"];

  for (const source of sources) {
    const html = readFileSync(new URL(`../${source}`, import.meta.url), "utf8");
    expect(html, `${source} must not print a phone number`).not.toMatch(/\+351|\d{3} \d{3} \d{3}/);
    expect(html, `${source} must not print a private inbox`).not.toMatch(/yahoo|gmail|hotmail|outlook/i);
    expect(html, `${source} must offer the public address`).toContain("geral@bylx.dev");
  }

  // And the links themselves still resolve — a CV button pointing at a 404 is
  // the same failure as no CV at all.
  await page.goto("/");
  for (const href of await page.locator('a[href$=".pdf"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")))) {
    const res = await page.request.head(href);
    expect(res.status(), href).toBe(200);
  }
});

test("the cocktail and the sushi open their panels", async ({ page }) => {
  // Two more props that do what they look like they do. They are buttons over
  // sprites with transparent corners, so these click rather than dispatch.
  await page.goto("/");

  for (const [label, modal, heading] of [
    ["Open: two cities", "#cities-modal", "Two cities"],
    ["Open: how this desk was drawn", "#craft-modal", "How this desk was drawn"],
  ]) {
    await page.getByRole("button", { name: label }).click();
    await expect(page.locator(modal)).toHaveClass(/is-open/);
    await expect(page.locator(`${modal} h2`)).toHaveText(heading);

    await page.keyboard.press("Escape");
    await expect(page.locator(modal)).not.toHaveClass(/is-open/);
  }

  // They are panels, not case studies: no slug, so no generated page and no
  // sitemap entry.
  const slugs = await page.locator("[data-work-slug]").evaluateAll((els) =>
    els.map((el) => el.id)
  );
  expect(slugs).not.toContain("cities-modal");
  expect(slugs).not.toContain("craft-modal");
});

test("cinema mode cannot be entered twice, and always gives the scroll back", async ({ page }) => {
  // The Start menu is reachable from inside cinema mode and its first item
  // still says "enter cinema mode". Entering twice borrowed the screen items
  // into a second board while the bookkeeping still pointed at the first, so
  // putting them back threw — and the throw happened before the scroll lock
  // came off, leaving the page stuck with no way out.
  await page.goto("/");

  const locked = () =>
    page.evaluate(() => getComputedStyle(document.documentElement).overflow === "hidden");

  const enter = async () => {
    await page.locator(".start-btn").click();
    await page.locator('.start-menu [data-start-action="fullscreen"]').click();
  };

  await enter();
  expect(await locked()).toBe(true);

  await enter(); // the second one must be a no-op
  await page.keyboard.press("Escape");

  await expect(page.locator(".fullscreen-mode")).toBeHidden();
  expect(await locked()).toBe(false);
  await expect(page.locator(".fullscreen-artboard")).toHaveCount(0);

  // and the borrowed furniture is back on the desk
  await expect(page.locator("#hero-scene .desktop-icons")).toHaveCount(1);
  await expect(page.locator("#hero-scene .toolbar-strip")).toHaveCount(1);
});

test("every image the site loads carries its own cache stamp", async ({ page }) => {
  /* The edge holds images for a week by URL, so redrawing a sprite and keeping
     its name leaves every visitor on the old art until it expires — measured
     2026-09-24, when a fixed image kept arriving broken with age: 6200. The
     stamp is a hash of each file on its own, not one shared number: a shared
     one would give new URLs to all 140-odd sprites every time a single picture
     changed, throwing away a warm cache for the whole diorama. */
  const bad = [];
  page.on("response", (r) => r.status() >= 400 && bad.push(r.status() + " " + new URL(r.url()).pathname));

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Trail some petals: their path used to be built at runtime, which is the one
  // shape the stamper cannot see.
  for (let i = 0; i < 10; i++) await page.mouse.move(300 + i * 40, 400 + i * 12);
  await page.waitForTimeout(400);
  expect(await page.locator(".sakura-bit").count()).toBeGreaterThan(0);

  const unstamped = await page.evaluate(() => {
    const out = [];
    for (const img of document.images) {
      const src = img.getAttribute("src");
      if (src && src.includes("assets/") && !/\?v=[a-z0-9]+/.test(src)) out.push(src);
    }
    for (const el of document.querySelectorAll("*")) {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg.includes("assets/") && !/\?v=[a-z0-9]+/.test(bg)) out.push(bg.slice(0, 90));
    }
    return [...new Set(out)];
  });
  expect(unstamped).toEqual([]);

  // A stamp that points at nothing is worse than no stamp.
  expect(bad).toEqual([]);
});

test("the projects filter narrows the grid without stranding anything", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const cards = page.locator(".project-card");
  const total = await cards.count();

  /* Three at a time, so the grid stays a grid. Seven cards is two rows and an
     orphan, which is why Workspace Automations came out. */
  expect(total % 3).toBe(0);

  // Every card declares at least one of the four kinds, or the filter lies.
  const kinds = await cards.evaluateAll((els) => els.map((e) => (e.dataset.kind || "").split(/\s+/).filter(Boolean)));
  const ALLOWED = ["product", "client", "tool", "design"];
  for (const list of kinds) {
    expect(list.length).toBeGreaterThan(0);
    for (const k of list) expect(ALLOWED).toContain(k);
  }

  const bar = page.locator("#projects-filter");
  await expect(bar).toBeVisible();

  for (const kind of ALLOWED) {
    const button = bar.locator(`[data-filter="${kind}"]`);
    const expected = kinds.filter((list) => list.includes(kind)).length;

    // A button for a kind nothing carries is removed rather than left dead.
    if (expected === 0) {
      await expect(button).toHaveCount(0);
      continue;
    }

    await expect(button).toContainText(String(expected));
    await button.click();

    await expect(cards.locator("visible=true")).toHaveCount(expected);
    await expect(button).toHaveAttribute("aria-pressed", "true");

    /* hidden, not display:none in a class: a card you cannot see must not stay
       in the tab order either. */
    const focusable = await page.evaluate(() =>
      [...document.querySelectorAll(".project-card[hidden]")].filter((c) => c.offsetParent !== null).length
    );
    expect(focusable).toBe(0);
  }

  await bar.locator('[data-filter="all"]').click();
  await expect(cards.locator("visible=true")).toHaveCount(total);
});

test("the project count is not glued to the first row of cards", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.locator("#projects").scrollIntoViewIfNeeded();

  // It read as a label stuck on the grid rather than a status line about it.
  const gap = await page.evaluate(() => {
    const count = document.querySelector(".projects-count").getBoundingClientRect();
    const grid = document.querySelector(".projects-grid").getBoundingClientRect();
    return grid.top - count.bottom;
  });
  expect(gap).toBeGreaterThanOrEqual(16);
});
