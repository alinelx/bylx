/* ============================================================
   BYLX — script.js  (entry point)
   Import and initialise every feature module.
   ============================================================ */

import { initParallax }                             from "./js/parallax.js?v=8d10320d";
import { initCursor, initSakuraTrail }              from "./js/cursor.js?v=8d10320d";
import { initModals }                               from "./js/modals.js?v=8d10320d";
import { initContactForm }                          from "./js/contact.js?v=8d10320d";
import { initAudio }                                from "./js/audio.js?v=8d10320d";
import { initMouseFlee, initKeyboardRgb, initTechPopovers, initDeskHint } from "./js/interactions.js?v=8d10320d";
import { initDesktop }                              from "./js/desktop.js?v=8d10320d";

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
