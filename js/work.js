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

import { initCursor, initSakuraTrail } from "./cursor.js?v=f8d36fb6";

function start(name, init) {
  try {
    init();
  } catch (error) {
    console.error(`[bylx] ${name} failed to start`, error);
  }
}

start("cursor", initCursor);
start("sakura", initSakuraTrail);

/* Only now is there something drawn to replace the native cursor with. If
   either import above had thrown, the page keeps the system cursor. */
if (document.querySelector(".cursor")) {
  document.documentElement.classList.add("has-pixel-cursor");
}
