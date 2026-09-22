import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";

/* The case studies live in two places on purpose: as dialogs on "/" and as
 * pages under /work/<slug>/, generated from the same markup by
 * scripts/build-work-pages.mjs. Two surfaces, one source — so what needs
 * guarding is that they stay in step, and that opening a dialog still writes
 * a URL a visitor can copy.
 *
 * Reduced motion, like the smoke tests: the scene never settles otherwise and
 * every click times out. */

const SLUGS = readdirSync(new URL("../work", import.meta.url));

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("every case-study modal has a generated page", async () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const slugs = [...html.matchAll(/data-work-slug="([^"]+)"/g)].map((m) => m[1]).sort();

  expect(slugs.length).toBeGreaterThan(0);
  expect(slugs).toEqual([...SLUGS].sort());
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
    await expect(page.locator(".case-study-body p").first()).not.toBeEmpty();

    /* The shell loads the real stylesheet, so a broken stamp shows up here as
       an unstyled sheet rather than in production. */
    await expect(page.locator(".work-sheet")).toHaveCSS("box-shadow", /rgb/);

    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });
}
