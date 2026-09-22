/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _        
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  < 
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */ 
/* ᑲყᥣx utils */

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isWiderThan(minWidth = 901) {
  return window.matchMedia(`(min-width: ${minWidth}px)`).matches;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/* O rectângulo do ecrã do CRT, em coordenadas de viewport. Tudo o que é
   "janela do sistema" — o menu Start, os balões dos ícones — vive dentro
   dele: um pop-up que sai do monitor deixa de ser um ecrã e passa a ser um
   autocolante sobre a cena. Devolve null quando o ecrã não está visível
   (recorte de telemóvel, monitor desligado). */
export function screenRect() {
  const screen = document.querySelector(".win-bg");
  if (!screen) return null;

  const box = screen.getBoundingClientRect();
  if (box.width < 40 || box.height < 30) return null;

  return box;
}

/* Encosta uma caixa ao rectângulo, sem a deixar transbordar. */
export function clampToRect(box, rect, pad = 4) {
  const left = Math.min(Math.max(box.left, rect.left + pad), rect.right - box.width - pad);
  const top = Math.min(Math.max(box.top, rect.top + pad), rect.bottom - box.height - pad);
  return { left: Math.max(rect.left + pad, left), top: Math.max(rect.top + pad, top) };
}
