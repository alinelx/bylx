import { test, expect } from "@playwright/test";

/* The arcade is three surfaces: a cabinet on "/", a picker at /arcade/, and a
 * machine behind each card. What these guard is the boundary between them —
 * the homepage must not pay for a machine nobody opened, and a machine must
 * not reach for a CDN it does not control. */

test("the cabinet on the homepage costs the homepage nothing", async ({ page }) => {
  const outside = [];
  page.on("request", (r) => {
    const url = r.url();
    if (!url.startsWith("http://localhost") && !url.startsWith("http://127.0.0.1") && !url.includes("fonts.g")) {
      outside.push(url);
    }
  });

  await page.goto("/");

  const cabinet = page.locator(".arcade-cabinet");
  await expect(cabinet).toHaveAttribute("href", "/arcade/");
  await expect(cabinet.locator("img")).toHaveAttribute("width", "256");

  // Konva belongs to one machine; it has no business on the front page.
  expect(outside.filter((u) => u.includes("konva"))).toEqual([]);
  expect(await page.evaluate(() => typeof window.Konva)).toBe("undefined");
});

test("the picker lists real links, and hides controls it cannot use", async ({ page }) => {
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  const response = await page.goto("/arcade/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://bylx.dev/arcade/");

  // Cards are links, not click handlers on divs: they work with JS broken.
  const cards = page.locator(".deck-card a");
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  await expect(cards.first()).toHaveAttribute("href", /^\/arcade\/[a-z-]+\/$/);

  /* A control that can never do anything is worse than no control, so with one
     machine the arrows are removed rather than disabled. Delete this branch
     when a second machine lands — the other half already covers it. */
  const arrows = page.locator(".deck-arrow");
  if (count < 2) {
    await expect(arrows).toHaveCount(0);
  } else {
    await expect(arrows).toHaveCount(2);
    await expect(page.locator(".deck-card").first()).toHaveAttribute("data-active", "");
    await page.locator("[data-deck-next]").click();
    await expect(page.locator(".deck-card").nth(1)).toHaveAttribute("data-active", "");
  }

  await expect(page.locator(".cab-back")).toHaveAttribute("href", "/#arcade");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("the purikura machine runs, and asks nobody else for its parts", async ({ page }) => {
  const errors = [];
  const requests = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("request", (r) => requests.push(r.url()));

  const response = await page.goto("/arcade/purikura/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);

  // Konva is vendored. It arrived here from unpkg once and that is a dependency
  // on somebody else's uptime; the version is in the filename instead.
  expect(requests.filter((u) => u.includes("unpkg"))).toEqual([]);
  expect(requests.filter((u) => u.includes("/assets/vendor/konva-"))).toHaveLength(1);

  /* The built-in stickers and frames were hotlinked from stock-image sites,
     which both 403 and licence. Everything the editor offers is served from
     this domain now. */
  const foreign = requests.filter(
    (u) => !u.startsWith("http://localhost") && !u.startsWith("http://127.0.0.1") && !u.includes("fonts.g")
  );
  expect(foreign).toEqual([]);

  // The editor mounted: Konva draws its stage into the container as canvases.
  await expect(page.locator("#konvaContainer canvas").first()).toBeVisible();

  await expect(page.locator(".pk-back")).toHaveAttribute("href", "/arcade/");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});
