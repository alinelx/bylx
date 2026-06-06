/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  <
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */
/* ᑲყᥣx interactions */

import { prefersReducedMotion } from "./utils.js";

export function initMouseFlee() {
  if (prefersReducedMotion()) return;

  const mouseSprite = document.querySelector(".mouse");
  const hero        = document.querySelector("#hero");
  if (!mouseSprite || !hero) return;

  let scheduled = false;

  window.addEventListener("mousemove", (event) => {
    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;

      const rect      = mouseSprite.getBoundingClientRect();
      const cx        = rect.left + rect.width  / 2;
      const cy        = rect.top  + rect.height / 2;
      const dx        = cx - event.clientX;
      const dy        = cy - event.clientY;
      const dist      = Math.hypot(dx, dy);
      const radius    = 220;
      const maxOffset = 55;

      if (dist < radius && dist > 0.5) {
        const t  = (radius - dist) / radius;
        const ux = dx / dist;
        const uy = dy / dist;
        mouseSprite.style.setProperty("--flee-x",   `${(ux * maxOffset * t).toFixed(1)}px`);
        mouseSprite.style.setProperty("--flee-y",   `${(uy * maxOffset * t * 0.5).toFixed(1)}px`);
        mouseSprite.style.setProperty("--flee-rot", `${Math.max(-12, Math.min(12, ux * t * 14)).toFixed(1)}deg`);
      } else {
        mouseSprite.style.setProperty("--flee-x",   "0px");
        mouseSprite.style.setProperty("--flee-y",   "0px");
        mouseSprite.style.setProperty("--flee-rot", "0deg");
      }
    });
  }, { passive: true });
}

export function initKeyboardRgb() {
  const keyboardKeys = document.querySelector(".keyboard-keys");
  if (!keyboardKeys) return;

  const style   = getComputedStyle(document.documentElement);
  const palette = [
    style.getPropertyValue("--bylx-pink").trim()   || "#ff5dbb",
    style.getPropertyValue("--bylx-cyan").trim()   || "#59f3ff",
    style.getPropertyValue("--bylx-purple").trim() || "#5d3fd3",
    style.getPropertyValue("--bylx-text").trim()   || "#f7f2ff",
    "#ffd45d",
    "#5dff9b",
  ];
  let glowTimeout;

  window.addEventListener("keydown", (event) => {
    const digits = event.code ? event.code.replace(/\D/g, "") : "0";
    const idx    = (parseInt(digits, 10) || 0) % palette.length;
    keyboardKeys.style.setProperty("--rgb-tint", palette[idx]);
    keyboardKeys.classList.add("is-pressed");
    clearTimeout(glowTimeout);
    glowTimeout = setTimeout(() => keyboardKeys.classList.remove("is-pressed"), 220);
  });
}

const TECH_INFO = {
  html:  { name: "HTML",       sub: "Markup, semantics first." },
  css:   { name: "CSS",        sub: "Pixel-perfect layout & motion." },
  js:    { name: "JavaScript", sub: "Interactivity & DOM." },
  ts:    { name: "TypeScript", sub: "Types when the stakes are real." },
  react: { name: "React",      sub: "Component-driven UI." },
  node:  { name: "Node.js",    sub: "Server-side & tooling." },
  figma: { name: "Figma",      sub: "UX & design specs." },
  wp:    { name: "WordPress",  sub: "CMS for content sites." },
};

export function initTechPopovers() {
  let techPop    = null;
  let techPopKey = null;
  const scene    = document.querySelector(".scene");

  function closeTechPop() {
    if (!techPop) return;
    techPop.remove();
    techPop    = null;
    techPopKey = null;
  }

  function openTechPop(button) {
    const key  = button.dataset.tech;
    const info = TECH_INFO[key];
    if (!info || !scene) return;

    closeTechPop();

    // Win9x-style mini window — lives inside .scene (z-index 9, framed by monitor at z-index 10)
    const pop = document.createElement("div");
    pop.className = "tech-pop";

    const titlebar = document.createElement("div");
    titlebar.className = "tech-pop-titlebar";

    const titleText = document.createElement("span");
    titleText.className = "tech-pop-titletext";
    titleText.textContent = info.name.toUpperCase();

    const close = document.createElement("button");
    close.type = "button";
    close.className = "tech-pop-close";
    close.setAttribute("aria-label", "Close");
    close.textContent = "×";

    titlebar.append(titleText, close);

    const body = document.createElement("div");
    body.className = "tech-pop-body";

    const sub = document.createElement("p");
    sub.className = "tech-pop-sub";
    sub.textContent = info.sub;

    body.appendChild(sub);
    pop.append(titlebar, body);

    // Append to scene so monitor bezel (z-index 10) naturally frames it
    pop.style.left = "0px";
    pop.style.top  = "0px";
    scene.appendChild(pop);

    const sceneRect   = scene.getBoundingClientRect();
    const btnRect     = button.getBoundingClientRect();
    const popW        = pop.offsetWidth  || 160;
    const popH        = pop.offsetHeight || 60;

    // Clamp within the CRT screen area (roughly the inner 35%–65% × 40%–70% of artboard)
    // Use the monitor element bounds if available, otherwise fall back to scene
    const monitor = document.querySelector(".monitor");
    const clampEl = monitor || scene;
    const clampRect = clampEl.getBoundingClientRect();
    // Add a small inset so the pop stays visually inside the screen
    const inset = 8;
    const clampLeft   = clampRect.left   - sceneRect.left + inset;
    const clampTop    = clampRect.top    - sceneRect.top  + inset;
    const clampRight  = clampRect.right  - sceneRect.left - inset;
    const clampBottom = clampRect.bottom - sceneRect.top  - inset;

    let left = btnRect.right - sceneRect.left + 4;
    let top  = btnRect.top   - sceneRect.top  - popH / 2;

    left = Math.max(clampLeft, Math.min(clampRight  - popW, left));
    top  = Math.max(clampTop,  Math.min(clampBottom - popH, top));

    pop.style.left = `${left}px`;
    pop.style.top  = `${top}px`;

    close.addEventListener("click", (event) => {
      event.stopPropagation();
      closeTechPop();
    });

    techPop    = pop;
    techPopKey = key;
  }

  document.querySelectorAll(".icon-btn[data-tech]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (techPopKey === button.dataset.tech) { closeTechPop(); return; }
      openTechPop(button);
    });
  });

  document.addEventListener("click", (event) => {
    if (!techPop) return;
    if (event.target.closest(".tech-pop") || event.target.closest(".icon-btn")) return;
    closeTechPop();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTechPop();
  });
}
