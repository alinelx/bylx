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

test("the Cute Gal machine runs, and asks nobody else for its parts", async ({ page }) => {
  const errors = [];
  const requests = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("request", (r) => requests.push(r.url()));

  const response = await page.goto("/arcade/cutegal/");
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
  await page.goto("/arcade/cutegal/");
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

  // Every built-in sticker is placed at the size it was drawn at. They live
  // behind step 3 now, so the tab has to be opened before they can be clicked.
  await page.locator("#tab-stickers").click();
  const thumbs = page.locator("#stickersBuiltIn .thumb");
  const n = await thumbs.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) await thumbs.nth(i).click();
  await page.waitForTimeout(400);

  const placed = await page.evaluate(() =>
    Konva.stages[0].find(".sticker").map((s) => [s.width(), s.height(), s.image().naturalWidth, s.image().naturalHeight])
  );
  expect(placed).toHaveLength(n);
  /* 1:1, with no exception. Three of these — the window, the desktop, the
     start bar — are wider than the canvas and stay 1:1 anyway: halving pixel
     art drops every second row, which on Win98 chrome is the line that makes
     it chrome. Only art from outside is divided down, and by a whole number. */
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
  await page.locator("#tab-frame").click();
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

test("the booth is one step at a time, and fits a phone", async ({ page }) => {
  await page.goto("/arcade/cutegal/");
  await page.waitForLoadState("networkidle");

  /* Five numbered steps, one panel open. Everything used to be open at once in
     three columns above the canvas, which put the artwork below the fold. */
  await expect(page.locator('[role="tab"]')).toHaveCount(5);
  await expect(page.locator(".tabpanel:not(.collapsed)")).toHaveCount(1);
  await expect(page.locator("#panel-photo")).toBeVisible();

  // A tablist owes the keyboard arrow keys, not five separate tab stops.
  await page.locator("#tab-photo").focus();
  await page.keyboard.press("ArrowRight");
  expect(await page.evaluate(() => document.activeElement.id)).toBe("tab-frame");
  await expect(page.locator("#panel-frame")).toBeVisible();
  await expect(page.locator("#panel-photo")).toBeHidden();

  // Every sprite the site is drawn with, and every one of them actually loads.
  await page.locator("#tab-stickers").click();
  await expect(page.locator(".sticker-group")).toHaveCount(7);
  expect(await page.locator("#stickersBuiltIn .thumb").count()).toBeGreaterThan(30);

  /* The keyboard, its keys and the table are deliberately absent: at native
     size they are 512 and 1024 wide strips that cover the canvas edge to edge,
     which is a wall, not a sticker. */
  expect(await page.evaluate(() =>
    [...document.querySelectorAll("#stickersBuiltIn img")].map((i) => i.src).filter((u) => /keyboard|table/.test(u))
  )).toEqual([]);
  await page.waitForTimeout(600);
  expect(await page.evaluate(() =>
    [...document.querySelectorAll("#stickersBuiltIn img")].filter((i) => !i.naturalWidth).map((i) => i.src)
  )).toEqual([]);

  /* The stage is always 512 and only its presentation shrinks, so the canvas
     stays square and the page never scrolls sideways. A 512 canvas on a 390
     phone did both wrong. */
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 860 });
    await page.waitForTimeout(250);
    const seen = await page.evaluate(() => {
      const de = document.documentElement;
      const box = (n) => { const r = n.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; };
      const container = document.getElementById("konvaContainer");
      return {
        sideways: de.scrollWidth > de.clientWidth,
        container: box(container),
        canvas: box(container.querySelector("canvas")),
        /* The canvas ATTRIBUTE is 512 x devicePixelRatio, so ask the stage:
           that is the number the artwork and the export are drawn in. */
        stage: [Konva.stages[0].width(), Konva.stages[0].height()],
      };
    });
    expect(seen.sideways, `sideways scroll at ${width}`).toBe(false);
    expect(seen.container[0], `square at ${width}`).toBe(seen.container[1]);
    expect(seen.canvas).toEqual(seen.container);
    expect(seen.stage).toEqual([512, 512]);
  }
});

test("undo steps back one stroke, and text gets the font it asked for", async ({ page }) => {
  await page.goto("/arcade/cutegal/");
  await page.waitForLoadState("networkidle");
  await page.locator("#tab-pen").click();

  // Nothing drawn, nothing to undo — the empty canvas is history[0].
  await expect(page.locator("#btnDrawUndo")).toBeDisabled();

  const canvas = page.locator("#konvaContainer canvas").first();
  const box = await canvas.boundingBox();
  const strokes = await page.evaluate(() =>
    Konva.stages[0].getLayers().find((l) => l.name() === "drawLayer").getChildren().length
  );
  expect(strokes).toBe(0);

  for (const y of [100, 160, 220, 280]) {
    await page.mouse.move(box.x + 60, box.y + y);
    await page.mouse.down();
    await page.mouse.move(box.x + 300, box.y + y, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(120);
  }

  const count = () => page.evaluate(() =>
    Konva.stages[0].getLayers().find((l) => l.name() === "drawLayer").getChildren().length
  );
  expect(await count()).toBe(4);

  /* One at a time. getChildren() is a live collection and add() removes the
     node from its old parent, so restoring by iterating it dropped every second
     stroke: four strokes, one undo, two left. */
  for (const left of [3, 2, 1, 0]) {
    await page.locator("#btnDrawUndo").click();
    await page.waitForTimeout(180);
    expect(await count()).toBe(left);
  }
  await expect(page.locator("#btnDrawUndo")).toBeDisabled();

  for (const back of [1, 2, 3, 4]) {
    await page.locator("#btnDrawRedo").click();
    await page.waitForTimeout(180);
    expect(await count()).toBe(back);
  }

  /* A canvas paints with whatever font is loaded at that instant and nothing
     reflows when a webfont lands later, so text drew in a fallback and stayed
     there. Each face has to be loaded AND measurably its own. */
  await page.locator("#tab-text").click();
  const widths = new Set();
  for (const font of ["Cute Font", "Mochiy Pop P One", "Potta One", "Dela Gothic One", "Short Stack"]) {
    await page.selectOption("#selFont", font);
    await page.locator("#btnAddText").click();
    await page.waitForTimeout(600);
    const seen = await page.evaluate(() => {
      const t = Konva.stages[0].findOne("Transformer").nodes()[0].findOne(".tFill");
      return { font: t.fontFamily(), width: Math.round(t.width()), loaded: document.fonts.check('56px "' + t.fontFamily() + '"') };
    });
    expect(seen.font).toBe(font);
    expect(seen.loaded, font + " never loaded").toBe(true);
    widths.add(seen.width);
  }
  // Five faces that all fell back to the same one would share a width.
  expect(widths.size).toBe(5);
});

test("the deck backdrop stays the size it was drawn for, at whole device pixels", async ({ page }) => {
  await page.goto("/arcade/");
  await page.waitForLoadState("networkidle");

  /* card-bg.png is 88x53 and is drawn for x10 — 880 wide. js/pixelfit.js picks
     the largest whole multiple that fits the room it is given, so without
     data-pixel-max it took the whole 1100 column and reached x15 on a 1.25 DPR
     screen: 1056x636, a fifth bigger than intended. The cap holds the size
     while pixelfit still guarantees whole DEVICE pixels at any ratio. */
  for (const [width, dpr] of [[1280, 1], [1600, 1], [2560, 1]]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(250);

    const seen = await page.evaluate(() => {
      const deck = document.querySelector(".deck");
      const box = deck.getBoundingClientRect();
      const card = document.querySelector(".deck-card a").getBoundingClientRect();
      return {
        hasBackdrop: getComputedStyle(deck).backgroundImage !== "none",
        cssWidth: box.width,
        deviceMultiple: (box.width * devicePixelRatio) / 88,
        heightMultiple: (box.height * devicePixelRatio) / 53,
        cardInside: card.top >= box.top - 1 && card.bottom <= box.bottom + 1,
      };
    });

    expect(seen.hasBackdrop, `backdrop at ${width}`).toBe(true);
    // Never grows past what the art was drawn for, however wide the screen is.
    expect(seen.cssWidth).toBeLessThanOrEqual(880);
    const k = Math.round(seen.deviceMultiple);
    expect(Math.abs(seen.deviceMultiple - k), `whole multiple at ${width}`).toBeLessThan(0.01);
    expect(Math.abs(seen.heightMultiple - k), `same multiple both axes at ${width}`).toBeLessThan(0.01);
    expect(seen.cardInside, `card sits on the backdrop at ${width}`).toBe(true);
  }

  /* Below 900px no multiple of 88 is both wide enough for a 304px card and
     narrow enough to fit, so the rule drops out and pixelfit hands the element
     back to the stylesheet rather than sizing a background that is not there. */
  await page.setViewportSize({ width: 700, height: 900 });
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => {
    const deck = document.querySelector(".deck");
    return { backdrop: getComputedStyle(deck).backgroundImage !== "none", inline: deck.style.width };
  })).toEqual({ backdrop: false, inline: "" });
});

test("the tarot deals, teaches, and prints", async ({ page }) => {
  const errors = [];
  const foreign = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("request", (r) => {
    const url = r.url();
    if (!url.startsWith("http://localhost") && !url.startsWith("http://127.0.0.1") && !url.includes("fonts.g")) foreign.push(url);
  });

  const response = await page.goto("/arcade/tarot/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);

  /* Ported from a React bundle that imported 26 icons from lucide-react and
     shipped 378KB. None of that came with it: a major shows its numeral, a
     minor its suit mark, and the page asks nobody for anything. */
  expect(foreign).toEqual([]);
  expect(await page.evaluate(() => typeof window.React)).toBe("undefined");

  // The manual's 22 spreads, not the six the first port had.
  await expect(page.locator("[data-spread]")).toHaveCount(22);

  await page.locator('[data-spread="cruz-celta"]').click();
  await page.locator('[data-pick="random"]').click();
  await page.locator("[data-go]").click();
  await expect(page.locator(".face")).toHaveCount(10);

  /* Pin the language: the page opens in whatever the browser asks for, so the
     default is not something a test may assume. */
  await page.locator('[data-lang="pt"]').click();
  expect(await page.evaluate(() => document.documentElement.lang)).toBe("pt");
  const ptChrome = await page.locator(".modes button").first().textContent();
  await page.locator('[data-lang="en"]').click();
  await expect(page.locator(".face")).toHaveCount(10);
  expect(await page.locator(".modes button").first().textContent()).not.toBe(ptChrome);
  expect(await page.evaluate(() => document.documentElement.lang)).toBe("en");

  // The whole deck, not a sample of it.
  await page.locator("[data-reset]").click();
  await page.locator('[data-spread="carta-do-dia"]').click();
  await page.locator('[data-pick="manual"]').click();
  await page.locator("[data-go]").click();
  await expect(page.locator(".back")).toHaveCount(78);
  await page.locator(".back").first().click();
  await expect(page.locator(".face")).toHaveCount(1);

  /* The manual: five sections, and the counts are the deck's own. */
  await page.locator('[data-mode="learn"]').click();
  await expect(page.locator("[data-section]")).toHaveCount(5);
  for (const [section, n] of [["majors", 22], ["courts", 16], ["numbers", 40], ["suits", 4], ["spreads", 22]]) {
    await page.locator(`[data-section="${section}"]`).click();
    await expect(page.locator(".entry")).toHaveCount(n);
  }

  /* A spread entry deals itself — the reason the two modes share a page. */
  await page.locator(".entry").first().click();
  await expect(page.locator(".map i")).toHaveCount(1);
  await page.locator("[data-deal]").click();
  await expect(page.locator("[data-go]")).toHaveCount(1);

  /* Saving as PDF is the browser's print dialogue, so the print stylesheet is
     the document: no controls, the reading intact, ink on white. */
  await page.locator('[data-pick="random"]').click();
  await page.locator("[data-go]").click();
  await expect(page.locator(".face").first()).toBeVisible();
  await page.emulateMedia({ media: "print" });
  expect(await page.evaluate(() => {
    const gone = (sel) => getComputedStyle(document.querySelector(sel)).display === "none";
    return { controls: gone(".actions"), topbar: gone(".topbar"), modes: gone(".modes"),
             reading: !gone(".synthesis"), background: getComputedStyle(document.body).backgroundColor };
  })).toEqual({ controls: true, topbar: true, modes: true, reading: true, background: "rgb(255, 255, 255)" });
  await page.emulateMedia({ media: "screen" });

  await expect(page.locator(".back-link")).toHaveAttribute("href", "/arcade/");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test.describe("supporting the arcade", () => {
  for (const path of ["/arcade/cutegal/", "/arcade/tarot/"]) {
    test(`${path} offers a way to say thanks without begging`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const kofi = page.locator('a[href*="ko-fi.com"]');
      await expect(kofi).toHaveCount(1);
      await expect(kofi).toBeVisible();
      await expect(kofi).toHaveAttribute("href", "https://ko-fi.com/alinelx");

      /* An external link opened in a new tab must not hand the opener over. */
      const rel = (await kofi.getAttribute("rel")) || "";
      expect(rel).toContain("noopener");
      expect(await kofi.getAttribute("target")).toBe("_blank");

      // The way out still works, and is not the thing that got replaced.
      await expect(page.locator('a[href="/arcade/"]').first()).toBeVisible();

      /* Nothing about it may move. The rule against motion that asks to be
         clicked applies here more than anywhere else on the site. */
      expect(await kofi.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { animation: cs.animationName, transition: cs.transitionProperty.includes("transform") };
      })).toEqual({ animation: "none", transition: false });
    });
  }

  test("the saved reading does not ask for money", async ({ page }) => {
    await page.goto("/arcade/tarot/");
    await page.locator("[data-go]").click();
    await expect(page.locator(".face").first()).toBeVisible();

    /* A donation button inside a PDF someone keeps is a different object from
       a quiet link under the reading. The print stylesheet drops it. */
    await page.emulateMedia({ media: "print" });
    await expect(page.locator('a[href*="ko-fi.com"]')).toBeHidden();
    await page.emulateMedia({ media: "screen" });
    await expect(page.locator('a[href*="ko-fi.com"]')).toBeVisible();
  });
});
