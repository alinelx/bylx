/* ============================================================
   BYLX — cursor.js
   Custom pixel cursor + sakura petal trail on mousemove/click.
   ============================================================ */

import { prefersReducedMotion } from "./utils.js";

export function initCursor() {
  const cursor = document.querySelector(".cursor");

  if (!cursor) return;

  window.addEventListener("mousemove", (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top  = `${event.clientY}px`;
  });

  document.addEventListener("mouseover", (event) => {
    if (event.target.closest("a, button, .clickable")) cursor.classList.add("hover");
  });

  document.addEventListener("mouseout", (event) => {
    if (event.target.closest("a, button, .clickable")) cursor.classList.remove("hover");
  });

  window.addEventListener("mousedown", () => cursor.classList.add("click"));
  window.addEventListener("mouseup",   () => cursor.classList.remove("click"));
}

export function initSakuraTrail() {
  const sakuraLayer = document.querySelector(".sakura-cursor");

  if (!sakuraLayer) return;

  const reduced = prefersReducedMotion();
  const TRAIL_INTERVAL = 70;
  const BURST_COUNT    = 12;
  const MAX_PETALS     = 90;

  let lastTrail = 0;
  let liveCount = 0;

  function spawnPetal(x, y, kind) {
    if (liveCount >= MAX_PETALS) return;

    const variant = Math.floor(Math.random() * 4) + 1;

    let angle, power, gravity, duration, size;

    if (kind === "burst") {
      angle    = Math.random() * Math.PI * 2;
      power    = 70 + Math.random() * 70;
      gravity  = 50;
      duration = 1200 + Math.random() * 700;
      size     = 14 + Math.random() * 16;
    } else {
      angle    = Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      power    = 10 + Math.random() * 20;
      gravity  = 90;
      duration = 1500 + Math.random() * 800;
      size     = 14 + Math.random() * 10;
    }

    const dx   = Math.cos(angle) * power;
    const dy   = Math.sin(angle) * power + gravity;
    const spin = -240 + Math.random() * 480;

    const petal = document.createElement("img");
    petal.className = "sakura-bit";
    petal.src = `assets/particles/sakura${variant}.png`;
    petal.alt = "";
    petal.style.left  = `${x}px`;
    petal.style.top   = `${y}px`;
    petal.style.width = `${size}px`;
    petal.style.setProperty("--dx",   `${dx.toFixed(1)}px`);
    petal.style.setProperty("--dy",   `${dy.toFixed(1)}px`);
    petal.style.setProperty("--spin", `${spin.toFixed(1)}deg`);
    petal.style.animationDuration = `${Math.round(duration)}ms`;

    sakuraLayer.appendChild(petal);
    liveCount += 1;

    let removed = false;
    const remove = () => {
      if (removed) return;
      removed = true;
      petal.remove();
      liveCount -= 1;
    };

    petal.addEventListener("animationend", remove, { once: true });
    setTimeout(remove, duration + 250);
  }

  window.addEventListener("mousemove", (event) => {
    if (reduced) return;

    const now = performance.now();
    if (now - lastTrail < TRAIL_INTERVAL) return;
    lastTrail = now;

    spawnPetal(event.clientX, event.clientY, "trail");
  }, { passive: true });

  window.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;

    const count = reduced ? 4 : BURST_COUNT;
    for (let i = 0; i < count; i += 1) {
      spawnPetal(event.clientX, event.clientY, "burst");
    }
  }, { passive: true });
}
