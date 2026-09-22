import { test, expect } from "@playwright/test";
import { readFileSync, existsSync, readdirSync } from "node:fs";

/* The case studies live in two places on purpose: as dialogs on "/" and as
 * pages under /work/<slug>/, generated from the same markup by
 * scripts/build-work-pages.mjs. Two surfaces, one source — so what needs
 * guarding is that they stay in step, and that opening a dialog still writes
 * a URL a visitor can copy.
 *
 * Reduced motion, like the smoke tests: the scene never settles otherwise and
 * every click times out. */

/* index.html is the source of truth, and it is always there. Reading the
   slugs from the generated folder instead would blow up at collection time on
   a fresh clone — before the first `npm run build` — with an error about a
   missing directory rather than about the thing that is actually wrong. */
const INDEX = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const SLUGS = [...INDEX.matchAll(/data-work-slug="([^"]+)"/g)].map((m) => m[1]);
const BUILT = existsSync(new URL("../work", import.meta.url))
  ? readdirSync(new URL("../work", import.meta.url))
  : [];

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("every case-study modal has a generated page, and vice versa", async () => {
  expect(SLUGS.length).toBeGreaterThan(0);
  /* Run `npm run build` if this fails: a modal without a page is a dead
     permalink, a page without a modal is copy nothing maintains. */
  expect([...SLUGS].sort()).toEqual([...BUILT].sort());
});

test("opening a case study writes its URL, closing it goes home", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "dark28.pt", exact: true }).click();
  await expect(page).toHaveURL(/\/work\/dark28\/$/);
  await expect(page.locator("#casestudy-dark28-modal")).toHaveClass(/is-open/);

  await page.keyboard.press("Escape");
  await expect(page.locator("#casestudy-dark28-modal")).not.toHaveClass(/is-open/);
  await expect(page).toHaveURL(/\/$/);
});

test("back and forward move through the case studies", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "irs-pt", exact: true }).click();
  await expect(page).toHaveURL(/\/work\/irs-pt\/$/);

  await page.goBack();
  await expect(page.locator("#casestudy-irspt-modal")).not.toHaveClass(/is-open/);

  await page.goForward();
  await expect(page.locator("#casestudy-irspt-modal")).toHaveClass(/is-open/);
});

for (const slug of SLUGS) {
  test(`/work/${slug}/ is a real page that stands on its own`, async ({ page }) => {
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));

    const response = await page.goto(`/work/${slug}/`);
    expect(response?.status()).toBe(200);

    /* A page nobody can read is not a page: title, one h1, a canonical that
       matches, and a way back into the site. */
    await expect(page).toHaveTitle(/bylx\.dev$/);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://bylx.dev/work/${slug}/`
    );
    await expect(page.locator(".work-back")).toBeVisible();

    /* h1 → h3 would be a skipped level: the section headings are <h3> inside
       the dialog, where the case-study title is an <h2>, and the generator
       demotes them for the page. */
    await expect(page.locator("h3.cs-heading")).toHaveCount(0);
    await expect(page.locator("h2.cs-heading").first()).toBeVisible();
    await expect(page.locator("footer.site-footer")).toBeVisible();
    await expect(page.locator(".case-study-body p").first()).not.toBeEmpty();

    /* The shell loads the real stylesheet, so a broken stamp shows up here as
       an unstyled sheet rather than in production. */
    await expect(page.locator(".work-sheet")).toHaveCSS("box-shadow", /rgb/);

    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });
}
