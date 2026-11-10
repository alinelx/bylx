import { test, expect } from "@playwright/test";

/* A cena é um <canvas> desde 2026-11-10 (js/scene-canvas.js). Os testes de
   movimento da cena em DOM (drift, parallax por camada, transforms) saíram com
   ela: aqui fica o que a cena nova promete — pinta, amplia por inteiros,
   segue o tema do sistema e não se mexe sozinha. */

async function scene(page) {
  await page.goto("/");
  await page.waitForFunction(() => document.querySelector("#hero-scene canvas")?.width > 0);
  return page.locator("#hero-scene canvas");
}

test("the scene paints, at a whole multiple of the grid", async ({ page }) => {
  await scene(page);
  const r = await page.evaluate(() => {
    const c = document.querySelector("#hero-scene canvas");
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    const colours = new Set();
    for (let i = 0; i < d.length; i += 4) colours.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
    const k = (parseFloat(c.style.width) * devicePixelRatio) / c.width;
    return { colours: colours.size, k };
  });
  expect(r.colours).toBe(7); // 7 cores por tema
  expect(Number.isInteger(Math.round(r.k * 1000) / 1000)).toBe(true);
});

for (const scheme of ["dark", "light"]) {
  test(`the scene follows a ${scheme} system theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await scene(page);
    await expect(page.locator("#hero-scene")).toHaveAttribute("data-scene-theme", scheme);
  });
}

test("the scene does not move on its own", async ({ page }) => {
  await scene(page);
  const grab = () => page.evaluate(() => document.querySelector("#hero-scene canvas").toDataURL());
  const a = await grab();
  await page.waitForTimeout(1500);
  expect(await grab()).toBe(a);
});
