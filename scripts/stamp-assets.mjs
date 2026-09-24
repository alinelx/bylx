/* Stamps a content hash onto every first-party asset URL.
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
 * THE CHAIN, and there are two of them.
 *
 * CSS and JS share ONE stamp. index.html is not cached by the edge (it came
 * back fresh in the same measurement), so stamping the entry points there
 * makes styles.css / script.js new URLs, and stamping the specifiers inside
 * them makes every partial and module a new URL in turn. One stamp is right
 * here because they are one graph: a changed module can change what any page
 * does, and they are a few KB each.
 *
 * Images, fonts and the CVs get a hash EACH. They are not a graph — nothing
 * imports a sprite — and one shared stamp would mean editing one sprite gave
 * new URLs to all 141 of them, throwing away a warm cache for the whole
 * diorama to fix one picture.
 *
 * Why images need this at all, measured 2026-09-24: the edge holds them for a
 * week by URL (`age: 6200` on cute-gal-logo.png hours after a deploy that
 * changed how it is served). Redrawing a sprite and keeping its name leaves
 * every visitor on the old art until that expires. It is the same trap the CVs
 * were stamped for, and the same one that made a fixed image keep arriving
 * broken.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, posix } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const CHECK = process.argv.includes("--check");

const cssFiles = readdirSync(join(ROOT, "css")).filter((f) => f.endsWith(".css")).sort();
const jsFiles = readdirSync(join(ROOT, "js")).filter((f) => f.endsWith(".js")).sort();

/* Stamped extensions, minus css/js which have their own shared stamp above.
   mp3 is deliberately absent: the stamp protects against a file being edited
   in place under the same name, and the 17 tracks are never redrawn — hashing
   64MB on every build to protect against something that does not happen. */
const ASSET_EXT = "png|jpg|jpeg|gif|webp|avif|svg|ico|ttf|woff2?";

/* The hash covers everything the shared stamp is meant to invalidate, entry
   points included — stripped of EVERY existing stamp, or the hash chases
   itself and, worse, changing one sprite would change the CSS URL too.

   Line endings are normalised first. .gitattributes stores LF and checks out
   CRLF on Windows, so hashing the raw bytes produced one stamp on that machine
   and another in CI from identical content — b755f4b3 here against 922772a2 on
   Linux — and --check could never pass anywhere but the machine that last ran
   it. The stamp is about content changing, and a carriage return is not
   content. */
const STAMPED_EXT = new RegExp(`(\\.(?:css|js|${ASSET_EXT}))\\?v=[a-z0-9]+`, "gi");
const strip = (text) => text.replace(/\r\n/g, "\n").replace(STAMPED_EXT, "$1");

const hash = createHash("sha256");
for (const f of [...cssFiles.map((f) => join("css", f)), ...jsFiles.map((f) => join("js", f)), "styles.css", "script.js"]) {
  hash.update(strip(readFileSync(join(ROOT, f), "utf8")));
}
const stamp = hash.digest("hex").slice(0, 8);

/* One hash per file, keyed by the repo-relative path the markup writes. */
function walk(dir, out = []) {
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const rel = posix.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out;
}

const fileStamp = new Map();

/* The tarot keeps its 78 cards in a JSON file beside its page rather than
   inline: 108KB of prose has no business in front of the first paint. It is
   edge-cached by URL like everything else, so a corrected card would sit
   behind the old bytes for a week without a stamp of its own. */
const DECK = join("arcade", "tarot", "deck.json");
fileStamp.set("arcade/tarot/deck.json", createHash("sha256").update(readFileSync(join(ROOT, DECK))).digest("hex").slice(0, 8));
for (const rel of walk("assets")) {
  if (!new RegExp(`\\.(?:${ASSET_EXT}|pdf)$`, "i").test(rel)) continue;
  fileStamp.set(rel, createHash("sha256").update(readFileSync(join(ROOT, rel))).digest("hex").slice(0, 8));
}

/* Matches an asset path however the file happens to write it: "assets/x.png"
   under <base href="/">, "/assets/x.png" from the arcade pages, "../assets/…"
   from inside css/, and the tail of an absolute https://bylx.dev/assets/… in
   an OG tag. Whatever the prefix, the lookup key is what follows "assets/". */
const ASSET_REF = new RegExp(
  `((?:\\.\\.\\/|\\.\\/|\\/)?assets\\/[A-Za-z0-9._\\/-]+?\\.(?:${ASSET_EXT}|pdf))(\\?v=[a-z0-9]+)?`,
  "gi"
);

function stampAssets(text) {
  return text.replace(ASSET_REF, (whole, ref) => {
    const key = "assets/" + ref.split("assets/").pop();
    const h = fileStamp.get(key);
    /* An unknown path is a broken reference, not something to invent a hash
       for. Leave it exactly as written so it stays visible. */
    return h ? `${ref}?v=${h}` : whole;
  });
}

/* Every file that ships and names an asset. The /work/ pages are absent on
   purpose: build-work-pages.mjs regenerates them from index.html, which is
   stamped here first — npm run build runs the two in that order. */
const assetTargets = [
  "index.html",
  "404.html",
  join("arcade", "index.html"),
  join("arcade", "cutegal", "index.html"),
  join("arcade", "tarot", "index.html"),
  ...cssFiles.map((f) => join("css", f)),
  ...jsFiles.map((f) => join("js", f)),
];

const targets = [
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
  {
    file: join("arcade", "tarot", "index.html"),
    pattern: /(DECK_URL = "deck\.json)(\?v=[a-z0-9]+)?/g,
    replace: (_, head) => `${head}?v=${fileStamp.get("arcade/tarot/deck.json")}`,
  },
  ...jsFiles.map((f) => ({ file: join("js", f), pattern: /(from "\.\/[a-z-]+\.js)(\?v=[a-z0-9]+)?/g })),
];

let stale = false;

function apply(file, rewrite) {
  const path = join(ROOT, file);
  const before = readFileSync(path, "utf8");
  const after = rewrite(before);
  if (after === before) return;

  stale = true;
  if (!CHECK) writeFileSync(path, after);
  console.log(`${CHECK ? "stale" : "stamped"}  ${file}`);
}

/* Per-file stamps first: they change the text that the shared stamp is then
   written into, and strip() keeps the shared hash independent of both. */
for (const file of assetTargets) apply(file, stampAssets);

for (const { file, pattern, replace } of targets) {
  apply(file, (text) => text.replace(pattern, replace ?? ((_, head) => `${head}?v=${stamp}`)));
}

if (CHECK && stale) {
  console.error(`\nAssets are not stamped with ${stamp}. Run: node scripts/stamp-assets.mjs`);
  process.exit(1);
}

console.log(
  `${stale ? "stamp" : "already stamped"}: ${stamp}  ·  ${fileStamp.size} files hashed individually`
);
