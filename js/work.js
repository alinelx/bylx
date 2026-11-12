/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  <
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */
/* ᑲყᥣx work pages — entry point for /work/<slug>/

   A case-study page has no scene, no modals and no audio: the only thing it
   owes the visitor is the cursor, because base.css hides the native one for
   the whole document. Importing the real module keeps one implementation. */

import { initCursor, initSakuraTrail } from "./cursor.js?v=8aa01a31";
import { initI18n } from "./i18n.js?v=8aa01a31";
import { initSettings } from "./settings.js?v=8aa01a31";
import { initThemeToggle, initBitToggle } from "./theme.js?v=8aa01a31";

function start(name, init) {
  try {
    init();
  } catch (error) {
    console.error(`[bylx] ${name} failed to start`, error);
  }
}

/* A engrenagem (AM/PM, 3BIT, letra, movimento, cursor) segue para todas as páginas */
start("i18n", initI18n);
start("settings", () => { initSettings(); initThemeToggle(); initBitToggle(); });
start("cursor", initCursor);
start("sakura", initSakuraTrail);

/* Only now is there something drawn to replace the native cursor with. If
   either import above had thrown, the page keeps the system cursor. */
if (document.querySelector(".cursor")) {
  document.documentElement.classList.add("has-pixel-cursor");
}
