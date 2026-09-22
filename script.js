/* ============================================================
   BYLX — script.js  (entry point)
   Import and initialise every feature module.
   ============================================================ */

import { initParallax }                             from "./js/parallax.js?v=f04a4c83";
import { initCursor, initSakuraTrail }              from "./js/cursor.js?v=f04a4c83";
import { initModals }                               from "./js/modals.js?v=f04a4c83";
import { initContactForm }                          from "./js/contact.js?v=f04a4c83";
import { initAudio }                                from "./js/audio.js?v=f04a4c83";
import { initMouseFlee, initKeyboardRgb, initTechPopovers, initDeskHint } from "./js/interactions.js?v=f04a4c83";
import { initDesktop }                              from "./js/desktop.js?v=f04a4c83";

/* Each module is independent, and a throw in one used to take every module
   after it down with it — silently, since nothing here catches. */
function start(name, init) {
  try {
    init();
  } catch (error) {
    console.error(`[bylx] ${name} failed to start`, error);
  }
}

start("parallax", initParallax);
start("cursor", initCursor);
start("sakura", initSakuraTrail);
start("modals", initModals);
start("contact", initContactForm);
start("audio", initAudio);
start("mouseFlee", initMouseFlee);
start("keyboardRgb", initKeyboardRgb);
start("techPopovers", initTechPopovers);
start("deskHint", initDeskHint);
start("desktop", initDesktop);
