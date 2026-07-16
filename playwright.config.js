import { defineConfig, devices } from "@playwright/test";

/* Static site — `npx serve .` is the same thing Hostinger does, minus PHP.
   Nothing here builds: the tests run against the source files as shipped. */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  /* Motion mode is declared per spec file with test.use(), not here: setting
     reducedMotion in this config is read back correctly but never reaches the
     browser (matchMedia stays false), which silently ran the suite against a
     moving scene. */
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1568, height: 718 } },
    },
    // Pixel 5 is Chromium: keeps the toolchain to one browser download. Real
    // iOS Safari (svh, audio autoplay) still needs a device — see CLAUDE.md.
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "npx serve . -l 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
