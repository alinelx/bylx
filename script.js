/* ============================================================
   BYLX — script.js  (entry point)
   Import and initialise every feature module.
   ============================================================ */

import { initParallax }                             from "./js/parallax.js?v=8d96f237";
import { initCursor, initSakuraTrail }              from "./js/cursor.js?v=8d96f237";
import { initModals }                               from "./js/modals.js?v=8d96f237";
import { initDeeplink }                            from "./js/deeplink.js?v=8d96f237";
import { initGalleryViewer }                        from "./js/gallery.js?v=8d96f237";
import { initContactForm }                          from "./js/contact.js?v=8d96f237";
import { initAudio }                                from "./js/audio.js?v=8d96f237";
import { initMouseFlee, initKeyboardRgb, initTechPopovers, initDeskHint } from "./js/interactions.js?v=8d96f237";
import { initPixelFit }                          from "./js/pixelfit.js?v=8d96f237";
import { initDesktop }                              from "./js/desktop.js?v=8d96f237";
import { initProjectsFilter } from "./js/projects-filter.js?v=8d96f237";
import { initSceneCanvas }                          from "./js/scene-canvas.js?v=8d96f237";
import { initWindows }                              from "./js/windows.js?v=8d96f237";
import { initThemeToggle, currentTheme }           from "./js/theme.js?v=8d96f237";
import { themeImages }                              from "./js/themed-img.js?v=8d96f237";

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
  themeImages(currentTheme());
  /* O interruptor não espera pela cena: o resto do site troca na mesma */
  let sceneApi = null;
  initThemeToggle((t) => { sceneApi?.setTheme(t); themeImages(t); });
  /* Sair da página a meio do fetch do sprites.json cancela-o: isso não é um erro */
  let leaving = false;
  addEventListener("pagehide", () => { leaving = true; });
  /* As paredes da cena continuam pelo site abaixo: o motor dá a imagem já
     pintada no tema e a escala, e o fundo da página repete-as na vertical,
     na mesma posição horizontal que têm no hero. */
  const page = document.documentElement.style;
  let lastWalls = "";
  const onScene = ({ u, ox, oy, base, layer, image }) => {
    /* Onde a mesa acaba, em px do topo do hero: a frase de baixo assenta aí */
    document.querySelector(".hero-scene")?.style.setProperty("--scene-bottom", `${(oy + base[1]) * u}px`);
    const parts = ["bg-wall-left", "bg-wall-right"].map((n) => ({ l: layer(n), img: image(n) }));
    if (parts.some((p) => !p.l || !p.img)) return;
    const urls = parts.map((p) => p.img.toDataURL());
    const key = urls.join() + u + ox;
    if (key === lastWalls) return;
    lastWalls = key;
    page.setProperty("--wall-l", `url(${urls[0]})`);
    page.setProperty("--wall-r", `url(${urls[1]})`);
    page.setProperty("--wall-lx", `${(ox + parts[0].l.x) * u}px`);
    page.setProperty("--wall-rx", `${(ox + parts[1].l.x) * u}px`);
    page.setProperty("--wall-w", `${parts[0].img.width * u}px`);
    /* A cor lisa do lado de dentro da parede: o fundo do meio da página, para
       as duas paredes emendarem nele */
    const px = parts[0].img.getContext("2d").getImageData(parts[0].img.width - 1, 0, 1, 1).data;
    page.setProperty("--wall-fill", `rgb(${px[0]} ${px[1]} ${px[2]})`);
  };
  /* Ecrã estreito: amplia até o monitor e a secretária caberem, e corta a janela */
  initSceneCanvas(root, { src: root.dataset.sceneSrc, anchors, hotspots: false, focus: [150, 140, 340, 240], cropTop: 10, onScene, theme: currentTheme(),
    // Abertura em degraus: a cidade, a janela, a mesa, os objectos, o ecrã
    intro: [["bg-"], ["morro", "ponte", "torre", "pao", "cristo"], ["window-frame"], ["table"],
            ["instax", "mouse", "phone", "cocktail", "sushi", "mp3player"], ["monitor", "keyboard", "win-bg"], ["icon-"]],
    // O LED de ligado do monitor pisca devagar
    blink: [{ rect: [378, 292, 3, 3], levels: [6, 4], ms: 900 }] })
    .then((scene) => { sceneApi = scene; })
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
