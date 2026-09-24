/* Stamps a content hash onto every first-party CSS/JS URL.
 *
 *   node scripts/stamp-assets.mjs        # rewrite in place
 *   node scripts/stamp-assets.mjs --check # exit 1 if the stamp is stale
 *
 * WHY THIS EXISTS, given CLAUDE.md used to say the opposite:
 *
 * The old note said a ?v= was pointless because .htaccess sends
 * Cache-Control: no-cache for every css/js and ETags make the partials cheap
 * 304s. That is true of the origin — and irrelevant, because Hostinger's CDN
 * sits in front of it and serves its own copies regardless. Measured on
 * 2026-09-22, hours after a deploy: the browser got css/responsive.css with
 * `age: 27075` and `last-modified` seven hours before the deploy, while curl
 * against the same URL got the current file. A request with any query string
 * came back with no age and the new bytes. So the edge keys on the URL and
 * ignores the origin's no-cache: a new URL is the only reliable way to make a
 * deploy visible.
 *
 * The stamp is a hash of the files' own contents, not a number someone has to
 * remember to bump: same bytes, same URL, so the cache still works between
 * deploys that change nothing.
 *
 * The chain matters. index.html is not cached by the edge (it came back fresh
 * in the same measurement), so stamping the entry points there makes
 * styles.css / script.js new URLs, and stamping the specifiers inside them
 * makes every partial and module a new URL in turn.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const CHECK = process.argv.includes("--check");

const cssFiles = readdirSync(join(ROOT, "css")).filter((f) => f.endsWith(".css")).sort();
const jsFiles = readdirSync(join(ROOT, "js")).filter((f) => f.endsWith(".js")).sort();

/* The hash covers everything the stamp is meant to invalidate, entry points
   included — stripped of any existing stamp, or the hash would chase itself.
   Line endings are normalised first. .gitattributes stores LF and checks out
   CRLF on Windows, so hashing the raw bytes produced one stamp on that
   machine and another in CI from identical content — b755f4b3 here against
   922772a2 on Linux — and --check could never pass anywhere but the machine
   that last ran it. The stamp is about content changing, and a carriage
   return is not content. */
const strip = (text) => text.replace(/\r\n/g, "\n").replace(/(\.(?:css|js))\?v=[a-z0-9]+/g, "$1");

const hash = createHash("sha256");
for (const f of [...cssFiles.map((f) => join("css", f)), ...jsFiles.map((f) => join("js", f)), "styles.css", "script.js"]) {
  hash.update(strip(readFileSync(join(ROOT, f), "utf8")));
}
const stamp = hash.digest("hex").slice(0, 8);

/* The CVs get their own stamp, one per file. They are not part of the import
   chain — nothing @imports a PDF — but they ARE edge-cached by URL, and the
   pair that shipped first carried a phone number. Overwriting the file at the
   same URL leaves the edge handing out the old bytes for as long as it likes;
   a new URL is what actually retires them. */
const pdfFiles = readdirSync(join(ROOT, "assets", "cv")).filter((f) => f.endsWith(".pdf")).sort();
const pdfStamp = Object.fromEntries(
  pdfFiles.map((f) => [f, createHash("sha256").update(readFileSync(join(ROOT, "assets", "cv", f))).digest("hex").slice(0, 8)])
);

const targets = [
  {
    file: "index.html",
    pattern: /(href="assets\/cv\/([a-z0-9-]+\.pdf))(\?v=[a-z0-9]+)?/g,
    replace: (_, head, name) => `${head}?v=${pdfStamp[name] ?? "missing"}`,
  },
  { file: "index.html", pattern: /(href="styles\.css|src="script\.js)(\?v=[a-z0-9]+)?/g },
  { file: "styles.css", pattern: /(@import "(?:\.\/)?css\/[a-z-]+\.css)(\?v=[a-z0-9]+)?/g },
  { file: "script.js", pattern: /(from "\.\/js\/[a-z-]+\.js)(\?v=[a-z0-9]+)?/g },

  /* The arcade picker is a page of its own: it loads the site stylesheet and
     imports two modules by absolute path. Without this it would serve whatever
     CSS the edge happened to keep, for as long as it felt like keeping it. The
     Cute Gal machine needs nothing here — its CSS and JS are inline, and Konva
     carries its version in the filename. */
  { file: join("arcade", "index.html"), pattern: /(href="\/styles\.css|from "\/js\/[a-z-]+\.js)(\?v=[a-z0-9]+)?/g },
  /* The machine borrows one file from the site: the palette. */
  { file: join("arcade", "cutegal", "index.html"), pattern: /(href="\/css\/tokens\.css)(\?v=[a-z0-9]+)?/g },
  ...jsFiles.map((f) => ({ file: join("js", f), pattern: /(from "\.\/[a-z-]+\.js)(\?v=[a-z0-9]+)?/g })),
];

let stale = false;

for (const { file, pattern, replace } of targets) {
  const path = join(ROOT, file);
  const before = readFileSync(path, "utf8");
  const after = before.replace(pattern, replace ?? ((_, head) => `${head}?v=${stamp}`));
  if (after === before) continue;

  stale = true;
  if (!CHECK) writeFileSync(path, after);
  console.log(`${CHECK ? "stale" : "stamped"}  ${file}`);
}

if (CHECK && stale) {
  console.error(`\nAssets are not stamped with ${stamp}. Run: node scripts/stamp-assets.mjs`);
  process.exit(1);
}

console.log(stale ? `\nstamp: ${stamp}` : `already stamped: ${stamp}`);
