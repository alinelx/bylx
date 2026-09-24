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
  // Two PNGs on the same 256 canvas, stacked: START lands on the screen
  // because that is where it was drawn. No positioning code at all.
  await expect(cabinet.locator("img")).toHaveCount(2);
  for (const art of await cabinet.locator("img").all()) {
    await expect(art).toHaveAttribute("width", "256");
  }

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

/* Three bugs the machine had that nothing caught, because none of them threw:
   Konva ignored a smoothing flag passed in the wrong place, stickers were
   resized away from the size they were drawn at, and an applied frame ate every
   click meant for the pen. */
test("the machine keeps pixel art on the grid, and lets the pen through", async ({ page }) => {
  await page.goto("/arcade/purikura/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#konvaContainer canvas").first()).toBeVisible();

  /* imageSmoothingEnabled is a LAYER property in Konva and defaults to true.
     Passed to a Konva.Image it is silently ignored, which is how every stretched
     sticker came out bilinear. The photo layer keeps smoothing: a photo is not
     pixel art. */
  expect(await page.evaluate(() =>
    Object.fromEntries(Konva.stages[0].getLayers().map((l) => [l.name(), l.imageSmoothingEnabled()]))
  )).toEqual({
    photoLayer: true,
    frameLayer: false,
    drawLayer: false,
    decorLayer: false,
    markLayer: false,
  });

  // Every built-in sticker is placed at the size it was drawn at.
  const thumbs = page.locator("#stickersBuiltIn .thumb");
  const n = await thumbs.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) await thumbs.nth(i).click();
  await page.waitForTimeout(400);

  const placed = await page.evaluate(() =>
    Konva.stages[0].find(".sticker").map((s) => [s.width(), s.height(), s.image().naturalWidth, s.image().naturalHeight])
  );
  expect(placed).toHaveLength(n);
  for (const [w, h, nw, nh] of placed) expect([w, h]).toEqual([nw, nh]);

  /* The watermark signs the print, so it is the last layer and it takes no
     clicks — a frame on top of it, or a click swallowed by it, both defeat it. */
  expect(await page.evaluate(() => {
    const layers = Konva.stages[0].getLayers();
    const mark = layers.at(-1);
    return { last: mark.name(), listening: mark.listening(), count: mark.getChildren().length };
  })).toEqual({ last: "markLayer", listening: false, count: 1 });

  /* A frame is a full-canvas image with a transparent middle. Konva hit-tests
     its BOX, so while one was applied it caught every click and the pen did
     nothing at all. */
  await page.locator("#framesBuiltIn .thumb").first().click();
  await page.waitForTimeout(400);

  expect(await page.evaluate(() => {
    const s = Konva.stages[0];
    const layer = s.getLayers().find((l) => l.name() === "drawLayer");
    const before = layer.getChildren().length;
    const box = s.container().getBoundingClientRect();
    s.setPointersPositions({ clientX: box.left + 200, clientY: box.top + 200 });
    s.fire("mousedown", { target: s, evt: {} }, true);
    for (let i = 0; i < 8; i++) {
      s.setPointersPositions({ clientX: box.left + 200 + i * 10, clientY: box.top + 200 + i * 6 });
      s.fire("mousemove", { evt: {} }, true);
    }
    s.fire("mouseup", { evt: {} }, true);
    return layer.getChildren().length - before;
  })).toBeGreaterThan(0);
});
