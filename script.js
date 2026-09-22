/* ============================================================
   BYLX — script.js  (entry point)
   Import and initialise every feature module.
   ============================================================ */

import { initParallax }                             from "./js/parallax.js?v=de1cf95c";
import { initCursor, initSakuraTrail }              from "./js/cursor.js?v=de1cf95c";
import { initModals }                               from "./js/modals.js?v=de1cf95c";
import { initGalleryViewer }                        from "./js/gallery.js?v=de1cf95c";
import { initContactForm }                          from "./js/contact.js?v=de1cf95c";
import { initAudio }                                from "./js/audio.js?v=de1cf95c";
import { initMouseFlee, initKeyboardRgb, initTechPopovers, initDeskHint } from "./js/interactions.js?v=de1cf95c";
import { initDesktop }                              from "./js/desktop.js?v=de1cf95c";

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
