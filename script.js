/* ============================================================
   BYLX — script.js  (entry point)
   Import and initialise every feature module.
   ============================================================ */

import { initParallax }                             from "./js/parallax.js?v=9c22e86b";
import { initCursor, initSakuraTrail }              from "./js/cursor.js?v=9c22e86b";
import { initModals }                               from "./js/modals.js?v=9c22e86b";
import { initDeeplink }                            from "./js/deeplink.js?v=9c22e86b";
import { initGalleryViewer }                        from "./js/gallery.js?v=9c22e86b";
import { initContactForm }                          from "./js/contact.js?v=9c22e86b";
import { initFeedbackForm }                        from "./js/feedback.js?v=9c22e86b";
import { initAudio }                                from "./js/audio.js?v=9c22e86b";
import { initMouseFlee, initKeyboardRgb, initTechPopovers, initDeskHint } from "./js/interactions.js?v=9c22e86b";
import { initPixelFit }                          from "./js/pixelfit.js?v=9c22e86b";
import { initDesktop }                              from "./js/desktop.js?v=9c22e86b";
import { initProjectsFilter } from "./js/projects-filter.js?v=9c22e86b";
import { initSceneCanvas }                          from "./js/scene-canvas.js?v=9c22e86b";
import { initI18n }                                 from "./js/i18n.js?v=9c22e86b";
import { initSettings }                             from "./js/settings.js?v=9c22e86b";
import { initWindows }                              from "./js/windows.js?v=9c22e86b";
import { initThemeToggle, currentTheme, initBitToggle, bitMode } from "./js/theme.js?v=9c22e86b";
import { themeImages }                              from "./js/themed-img.js?v=9c22e86b";

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
  /* traduzir primeiro: o observador apanha tudo o que os módulos escreverem depois */
  try { initI18n(); } catch (e) { console.error("[bylx] i18n failed to start", e); document.documentElement.classList.add("i18n-ready"); }
  /* a engrenagem cria os botões AM/PM e 3BIT antes de lhes ligarmos o comportamento */
  try { initSettings(); } catch (e) { console.error("[bylx] settings failed to start", e); }
  /* 3BIT: a cena pinta-se nos cinzas de referência (sem mapa de tema) */
  const sceneTheme = (t) => (bitMode() ? "gray" : t);
  initThemeToggle((t) => { sceneApi?.setTheme(sceneTheme(t)); themeImages(t); });
  initBitToggle(() => sceneApi?.setTheme(sceneTheme(currentTheme())));
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
    /* Origem e escala da cena, para o CSS pôr a janela do hero num ponto da
       cena (e não num canto do ecrã) */
    const hs = document.querySelector(".hero-scene")?.style;
    hs?.setProperty("--scene-ox", String(ox));
    hs?.setProperty("--scene-oy", String(oy));
    hs?.setProperty("--scene-u", String(u));
    const parts = ["bg-wall-left", "bg-wall-right"].map((n) => ({ l: layer(n), img: image(n) }));
    if (parts.some((p) => !p.l || !p.img)) return;
    const urls = parts.map((p) => p.img.toDataURL());
    /* As paredes seguem o ecrã: a escala do hero, mas nunca maior do que caiba
       uma de cada lado (em pixels inteiros de dispositivo, para o pontilhado
       não borrar). No telemóvel ficam mais estreitas que no hero. */
    const dpr = devicePixelRatio || 1;
    const w = parts[0].img.width;
    const k = Math.max(1, Math.min(Math.round(u * dpr), Math.floor((innerWidth * dpr) / (2 * w))));
    const uw = k / dpr;
    const key = urls.join() + uw + ox;
    if (key === lastWalls) return;
    lastWalls = key;
    page.setProperty("--wall-l", `url(${urls[0]})`);
    page.setProperty("--wall-r", `url(${urls[1]})`);
    page.setProperty("--wall-lx", `${(ox + parts[0].l.x) * u}px`);
    page.setProperty("--wall-rx", `${(ox + parts[1].l.x) * u}px`);
    page.setProperty("--wall-w", `${w * uw}px`);
    /* A cor lisa do lado de dentro da parede: o fundo do meio da página, para
       as duas paredes emendarem nele */
    const px = parts[0].img.getContext("2d").getImageData(parts[0].img.width - 1, 0, 1, 1).data;
    page.setProperty("--wall-fill", `rgb(${px[0]} ${px[1]} ${px[2]})`);
  };
  /* Ecrã estreito: amplia até o monitor e a secretária caberem, e corta a janela */
  initSceneCanvas(root, { src: root.dataset.sceneSrc, anchors, hotspots: false, focus: [150, 140, 340, 240], cropTop: 10, onScene, theme: sceneTheme(currentTheme()),
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
start("feedback", initFeedbackForm);
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
