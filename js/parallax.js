/* ============================================================
   BYLX — parallax.js
   Mouse-driven parallax for the hero scene.

   How it works:
     - Each layer has a `depth` value.
     - On mousemove, cursor position is normalised to [-0.5, 0.5].
     - Each frame, current position lerps toward target (0.08 factor).
     - The offset applied = normalised position × depth (in px).
     - CSS custom properties --move-x / --move-y carry the value.
   ============================================================ */

import { prefersReducedMotion, isWiderThan, lerp } from "./utils.js";

const LAYERS = [
  { selector: ".bg-skyline-left",  depth: 1  },
  { selector: ".bg-skyline-right", depth: 1  },
  { selector: ".morro",            depth: 2  },
  { selector: ".skyline",          depth: 4  },
  { selector: ".bg-wall-left",     depth: 1  },
  { selector: ".bg-wall-right",    depth: 1  },
  { selector: ".window-frame",     depth: 2  },
  { selector: ".table",            depth: 3  },
  { selector: ".win-bg",           depth: 6  },
  { selector: ".desktop-icons",    depth: 8  },
  { selector: ".pixel-window",     depth: 9  },
  { selector: ".paint",            depth: 10 },
  { selector: ".toolbar-strip",    depth: 11 },
  { selector: ".monitor",          depth: 12 },
  { selector: ".keyboard",         depth: 15 },
  { selector: ".instax",           depth: 16 },
  { selector: ".mp3player",        depth: 17 },
  { selector: ".phone",            depth: 18 },
  { selector: ".sushi",            depth: 14 },
  { selector: ".cocktail",         depth: 15 },
  { selector: ".mouse",            depth: 18 },
  { selector: ".bylx-logo",        depth: 8  },
];

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

function applyOffsets(layerMap) {
  currentX = lerp(currentX, targetX, 0.08);
  currentY = lerp(currentY, targetY, 0.08);

  for (const { depth, elements } of layerMap) {
    const moveX = currentX * depth * 4;
    const moveY = currentY * depth * 4;

    for (const el of elements) {
      el.style.setProperty("--move-x", `${moveX}px`);
      el.style.setProperty("--move-y", `${moveY}px`);
    }
  }

  requestAnimationFrame(() => applyOffsets(layerMap));
}

function onPointerMove(event, hero) {
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
}

export function initParallax() {
  const hero = document.querySelector("#hero");

  if (!hero)               return;
  if (!isWiderThan(901))   return;

  const layerMap = buildLayerMap();

  window.addEventListener("pointermove", (e) => onPointerMove(e, hero));
  hero.addEventListener("pointerleave",  () => { targetX = 0; targetY = 0; });
  window.addEventListener("blur",        () => { targetX = 0; targetY = 0; });

  applyOffsets(layerMap);
}
