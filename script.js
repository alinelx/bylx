/* ============================================================
   BYLX — script.js  (entry point)
   Import and initialise every feature module.
   ============================================================ */

import { initParallax }                             from "./js/parallax.js?v=b109244f";
import { initCursor, initSakuraTrail }              from "./js/cursor.js?v=b109244f";
import { initModals }                               from "./js/modals.js?v=b109244f";
import { initGalleryViewer }                        from "./js/gallery.js?v=b109244f";
import { initContactForm }                          from "./js/contact.js?v=b109244f";
import { initAudio }                                from "./js/audio.js?v=b109244f";
import { initMouseFlee, initKeyboardRgb, initTechPopovers, initDeskHint } from "./js/interactions.js?v=b109244f";
import { initDesktop }                              from "./js/desktop.js?v=b109244f";

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
start("gallery", initGalleryViewer);
start("contact", initContactForm);
start("audio", initAudio);
start("mouseFlee", initMouseFlee);
start("keyboardRgb", initKeyboardRgb);
start("techPopovers", initTechPopovers);
start("deskHint", initDeskHint);
start("desktop", initDesktop);
