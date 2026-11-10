/* ============================================================
   BYLX — script.js  (entry point)
   Import and initialise every feature module.
   ============================================================ */

import { initParallax }                             from "./js/parallax.js?v=95426145";
import { initCursor, initSakuraTrail }              from "./js/cursor.js?v=95426145";
import { initModals }                               from "./js/modals.js?v=95426145";
import { initDeeplink }                            from "./js/deeplink.js?v=95426145";
import { initGalleryViewer }                        from "./js/gallery.js?v=95426145";
import { initContactForm }                          from "./js/contact.js?v=95426145";
import { initAudio }                                from "./js/audio.js?v=95426145";
import { initMouseFlee, initKeyboardRgb, initTechPopovers, initDeskHint } from "./js/interactions.js?v=95426145";
import { initPixelFit }                          from "./js/pixelfit.js?v=95426145";
import { initDesktop }                              from "./js/desktop.js?v=95426145";
import { initProjectsFilter } from "./js/projects-filter.js?v=95426145";
import { initSceneCanvas }                          from "./js/scene-canvas.js?v=95426145";
import { initWindows }                              from "./js/windows.js?v=95426145";

/* Each module is independent, and a throw in one used to take every module
   after it down with it — silently, since nothing here catches. */
function start(name, init) {
  try {
    init();
  } catch (error) {
    console.error(`[bylx] ${name} failed to start`, error);
  }
}

/* A cena: o motor pinta o canvas e coloca por cima os botões que já estão no
   HTML (data-layer = o sprite que o botão cobre, data-rect = um rectângulo da
   grade). Os módulos abaixo ligam-se a esses botões como sempre. */
start("scene", () => {
  const root = document.getElementById("hero-scene");
  if (!root) return;
  const anchors = [...root.querySelectorAll("[data-layer], [data-rect]")].map((el) => ({
    el,
    layer: el.dataset.layer,
    rect: el.dataset.rect?.split(",").map(Number),
  }));
  /* Ecrã estreito: amplia até o monitor e a secretária caberem, e corta a janela */
  /* Sair da página a meio do fetch do sprites.json cancela-o: isso não é um erro */
  let leaving = false;
  addEventListener("pagehide", () => { leaving = true; });
  initSceneCanvas(root, { src: root.dataset.sceneSrc, anchors, hotspots: false, focus: [150, 140, 340, 240], cropTop: 10 })
    .catch((error) => { if (!leaving) console.error("[bylx] scene failed to start", error); });
});
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
start("windows", initWindows);
/* Last: it measures boxes, so everything that changes one has run. */
start("pixelfit", initPixelFit);
