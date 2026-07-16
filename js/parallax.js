/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  <
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */
/* ᑲყᥣx parallax */

import { prefersReducedMotion, isWiderThan, lerp } from "./utils.js";

const LAYERS = [
  { selector: ".bg-skyline-left",  depth: 1  },
  { selector: ".bg-skyline-right", depth: 1  },
  { selector: ".morro",            depth: 2  },
  { selector: ".skyline",          depth: 3  },
  { selector: ".bg-wall-left",     depth: 1  },
  { selector: ".bg-wall-right",    depth: 1  },
  { selector: ".window-frame",     depth: 2  },
  { selector: ".table",            depth: 3  },
  { selector: ".win-bg",           depth: 5  },
  { selector: ".desktop-icons",    depth: 6  },
  { selector: ".pixel-window",     depth: 6  },
  { selector: ".paint",            depth: 7  },
  { selector: ".toolbar-strip",    depth: 7  },
  { selector: ".monitor",          depth: 8  },
  { selector: ".keyboard",         depth: 10 },
  { selector: ".instax",           depth: 11 },
  { selector: ".mp3player",        depth: 11 },
  { selector: ".phone",            depth: 12 },
  { selector: ".sushi",            depth: 9  },
  { selector: ".cocktail",         depth: 10 },
  { selector: ".bylx-logo",        depth: 8  },
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
  if (!isWiderThan(901))        return;
  if (prefersReducedMotion())   return;

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

  /* Pause the rAF loop entirely while the hero is scrolled off-screen */
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (rafId === null) rafId = requestAnimationFrame(step);
    } else if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  observer.observe(hero);
}
