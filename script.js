/* ============================================================
   BYLX — script.js  (entry point)
   Import and initialise every feature module.
   ============================================================ */

import { initParallax }                             from "./js/parallax.js?v=bb969af6";
import { initCursor, initSakuraTrail }              from "./js/cursor.js?v=bb969af6";
import { initModals }                               from "./js/modals.js?v=bb969af6";
import { initDeeplink }                            from "./js/deeplink.js?v=bb969af6";
import { initGalleryViewer }                        from "./js/gallery.js?v=bb969af6";
import { initContactForm }                          from "./js/contact.js?v=bb969af6";
import { initAudio }                                from "./js/audio.js?v=bb969af6";
import { initMouseFlee, initKeyboardRgb, initTechPopovers, initDeskHint } from "./js/interactions.js?v=bb969af6";
import { initPixelFit }                          from "./js/pixelfit.js?v=bb969af6";
import { initDesktop }                              from "./js/desktop.js?v=bb969af6";

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
/* Last: it measures boxes, so everything that changes one has run. */
start("pixelfit", initPixelFit);
