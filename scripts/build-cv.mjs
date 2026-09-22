/* Renders the two CVs in assets/cv/ from scripts/cv/*.html.
 *
 *   node scripts/build-cv.mjs        # both
 *   node scripts/build-cv.mjs design # just one
 *
 * The HTML is the source of truth, not the PDF: the first pair of files was
 * exported from elsewhere, and editing them again meant reading the text back
 * out of the PDF with pdf.js, because the fonts go in subsetted with their own
 * encoding and every plain-text extractor returns mojibake.
 *
 * These are the PDFs the site links from the About section, so they carry no
 * phone number and no personal address — only geral@bylx.dev, which is already
 * public on the page. A file linked from a public page is a public file.
 */
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const CVS = [
  { src: "frontend.html", out: "aline-lopes-xavier-cv-frontend.pdf" },
  { src: "design.html", out: "aline-lopes-xavier-cv-design.pdf" },
];

const only = process.argv[2];
const wanted = only ? CVS.filter((cv) => cv.src.startsWith(only)) : CVS;
if (!wanted.length) {
  console.error(`No CV matches "${only}". Try: ${CVS.map((c) => c.src.replace(".html", "")).join(", ")}`);
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();

for (const { src, out } of wanted) {
  await page.goto(pathToFileURL(join(ROOT, "scripts", "cv", src)).href, { waitUntil: "load" });
  /* Screen and print are the same here, but Chromium only honours @page —
     the A4 size and the margins — once the print stylesheet is the live one. */
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: join(ROOT, "assets", "cv", out),
    printBackground: true,
    preferCSSPageSize: true,
  });
  console.log(`assets/cv/${out}`);
}

await browser.close();
