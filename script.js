/* ============================================================
   BYLX — script.js  (entry point)
   Import and initialise every feature module.
   ============================================================ */

import { initParallax }                             from "./js/parallax.js?v=ffbb65de";
import { initCursor, initSakuraTrail }              from "./js/cursor.js?v=ffbb65de";
import { initModals }                               from "./js/modals.js?v=ffbb65de";
import { initDeeplink }                            from "./js/deeplink.js?v=ffbb65de";
import { initGalleryViewer }                        from "./js/gallery.js?v=ffbb65de";
import { initContactForm }                          from "./js/contact.js?v=ffbb65de";
import { initAudio }                                from "./js/audio.js?v=ffbb65de";
import { initMouseFlee, initKeyboardRgb, initTechPopovers, initDeskHint } from "./js/interactions.js?v=ffbb65de";
import { initPixelFit }                          from "./js/pixelfit.js?v=ffbb65de";
import { initDesktop }                              from "./js/desktop.js?v=ffbb65de";
import { initProjectsFilter } from "./js/projects-filter.js?v=ffbb65de";

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
start("projectsFilter", initProjectsFilter);
/* Last: it measures boxes, so everything that changes one has run. */
start("pixelfit", initPixelFit);
