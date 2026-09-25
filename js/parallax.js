/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  <
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */
/* ᑲყᥣx parallax */

import { prefersReducedMotion, lerp } from "./utils.js?v=0babd1ef";

/* Só o fundo — o que se vê pela janela. A mesa e tudo o que está em cima dela
   ficam parados (decidido 2026-09-22): a profundidade lê-se na paisagem, e os
   objectos que o visitante quer clicar não se mexem debaixo do cursor. A mesa
   levava 2px, o telefone 8px; agora levam zero.

   O motor não mudou: quem quiser a mesa de volta acrescenta aqui a linha e o
   `.layer` já consome --move-x/--move-y. */
const LAYERS = [
  { selector: ".bg-skyline-left",  depth: 1  },
  { selector: ".bg-skyline-right", depth: 1  },
  { selector: ".morro",            depth: 2  },
  { selector: ".skyline",          depth: 3  },
  { selector: ".bg-wall-left",     depth: 1  },
  { selector: ".bg-wall-right",    depth: 1  },
  { selector: ".window-frame",     depth: 2  },
];

/* User-perceived speed ~half of the original (was depth × 4, ease 0.08) */
const MULTIPLIER  = 1.8;
const LERP_FACTOR = 0.05;
const WRITE_INTERVAL_MS = 28; /* throttle DOM writes to ~30fps */
const SETTLE_EPSILON = 0.0005;

let currentX = 0;
let currentY = 0;
let targetX  = 0;
let targetY  = 0;

function buildLayerMap() {
  return LAYERS.map(({ selector, depth }) => ({
    depth,
    elements: [...document.querySelectorAll(selector)],
  }));
}

export function initParallax() {
  const hero = document.querySelector("#hero");

  if (!hero)                    return;
  if (prefersReducedMotion())   return;

  /* Same query js/desktop.js calls deskCrop: below it the hero is the desk
     crop and the parallax has nothing to offset. It is watched, not read
     once — the gate used to be evaluated at load, so a window resized up
     from phone width never started the parallax, and one resized down never
     stopped it. */
  const deskCrop = window.matchMedia(
    "(max-width: 900px), (orientation: portrait) and (max-width: 1200px)"
  );

  const layerMap = buildLayerMap();

  let rafId     = null;
  let lastWrite = 0;
  let isSettled = false;

  function step(now) {
    rafId = requestAnimationFrame(step);

    if (now - lastWrite < WRITE_INTERVAL_MS) return;

    const settled =
      Math.abs(currentX - targetX) < SETTLE_EPSILON &&
      Math.abs(currentY - targetY) < SETTLE_EPSILON;

    if (settled && isSettled) return;
    isSettled = settled;

    currentX = settled ? targetX : lerp(currentX, targetX, LERP_FACTOR);
    currentY = settled ? targetY : lerp(currentY, targetY, LERP_FACTOR);

    for (const { depth, elements } of layerMap) {
      const moveX = `${(currentX * depth * MULTIPLIER).toFixed(2)}px`;
      const moveY = `${(currentY * depth * MULTIPLIER).toFixed(2)}px`;

      for (const el of elements) {
        el.style.setProperty("--move-x", moveX);
        el.style.setProperty("--move-y", moveY);
      }
    }

    lastWrite = now;
  }

  let pointerScheduled = false;

  function onPointerMove(event) {
    if (pointerScheduled) return;
    pointerScheduled = true;

    requestAnimationFrame(() => {
      pointerScheduled = false;
      const rect = hero.getBoundingClientRect();

      const isOutside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top  ||
        event.clientY > rect.bottom;

      if (isOutside) {
        targetX = 0;
        targetY = 0;
        return;
      }

      targetX = (event.clientX - rect.left) / rect.width  - 0.5;
      targetY = (event.clientY - rect.top)  / rect.height - 0.5;
    });
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  hero.addEventListener("pointerleave", () => { targetX = 0; targetY = 0; });
  window.addEventListener("blur",       () => { targetX = 0; targetY = 0; });

  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    /* Leave the scene where it stands rather than mid-offset */
    targetX = 0;
    targetY = 0;
    currentX = 0;
    currentY = 0;
    for (const { elements } of layerMap) {
      for (const el of elements) {
        el.style.removeProperty("--move-x");
        el.style.removeProperty("--move-y");
      }
    }
  }

  /* Pause the rAF loop entirely while the hero is scrolled off-screen, or
     while the viewport is in the desk crop */
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !deskCrop.matches) {
      if (rafId === null) rafId = requestAnimationFrame(step);
    } else {
      stop();
    }
  });

  observer.observe(hero);

  deskCrop.addEventListener("change", () => {
    if (deskCrop.matches) stop();
    else if (rafId === null) rafId = requestAnimationFrame(step);
  });
}
