/* ============================================================
   BYLX — script.js  (entry point)
   Import and initialise every feature module.
   ============================================================ */

import { initParallax }                             from "./js/parallax.js";
import { initCursor, initSakuraTrail }              from "./js/cursor.js";
import { initModals }                               from "./js/modals.js";
import { initAudio }                                from "./js/audio.js";
import { initMouseFlee, initKeyboardRgb, initTechPopovers } from "./js/interactions.js";

initParallax();
initCursor();
initSakuraTrail();
initModals();
initAudio();
initMouseFlee();
initKeyboardRgb();
initTechPopovers();
