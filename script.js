/* ============================================================
   BYLX — script.js  (entry point)
   Import and initialise every feature module.
   ============================================================ */

import { initParallax }                             from "./js/parallax.js?v=d18876d7";
import { initCursor, initSakuraTrail }              from "./js/cursor.js?v=d18876d7";
import { initModals }                               from "./js/modals.js?v=d18876d7";
import { initDeeplink }                            from "./js/deeplink.js?v=d18876d7";
import { initGalleryViewer }                        from "./js/gallery.js?v=d18876d7";
import { initContactForm }                          from "./js/contact.js?v=d18876d7";
import { initAudio }                                from "./js/audio.js?v=d18876d7";
import { initMouseFlee, initKeyboardRgb, initTechPopovers, initDeskHint } from "./js/interactions.js?v=d18876d7";
import { initDesktop }                              from "./js/desktop.js?v=d18876d7";

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
/* After modals: it opens by dispatching an event modals must already hear. */
start("deeplink", initDeeplink);
start("gallery", initGalleryViewer);
start("contact", initContactForm);
start("audio", initAudio);
start("mouseFlee", initMouseFlee);
start("keyboardRgb", initKeyboardRgb);
start("techPopovers", initTechPopovers);
start("deskHint", initDeskHint);
start("desktop", initDesktop);
