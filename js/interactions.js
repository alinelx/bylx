/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _        
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  < 
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */ 
/* ᑲყᥣx interactions */

export function initMouseFlee() {
  const mouseSprite = document.querySelector(".mouse");
  const hero        = document.querySelector("#hero");

  if (!mouseSprite || !hero) return;

  let scheduled = false;

  window.addEventListener("mousemove", (event) => {
    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;

      const rect   = mouseSprite.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = cx - event.clientX;
      const dy     = cy - event.clientY;
      const dist   = Math.hypot(dx, dy);
      const radius    = 220;
      const maxOffset = 45;

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

  const palette = ["#ff5dbb", "#59f3ff", "#5d3fd3", "#f7f2ff", "#ffd45d", "#5dff9b"];
  let glowTimeout;

  window.addEventListener("keydown", (event) => {
    const code = event.keyCode || event.which || 0;
    keyboardKeys.style.setProperty("--rgb-tint", palette[code % palette.length]);
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

  function closeTechPop() {
    if (!techPop) return;
    techPop.remove();
    techPop    = null;
    techPopKey = null;
  }

  function openTechPop(button) {
    const key  = button.dataset.tech;
    const info = TECH_INFO[key];
    if (!info) return;

    closeTechPop();

    const pop = document.createElement("div");
    pop.className = "tech-pop";
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-label", info.name);

    const close = document.createElement("button");
    close.type = "button";
    close.className = "tech-pop-close";
    close.setAttribute("aria-label", "Close");
    close.textContent = "×";

    const name = document.createElement("p");
    name.className = "tech-pop-name";
    name.textContent = info.name;

    const sub = document.createElement("p");
    sub.className = "tech-pop-sub";
    sub.textContent = info.sub;

    pop.append(close, name, sub);
    document.body.appendChild(pop);

    const rect    = button.getBoundingClientRect();
    const popRect = pop.getBoundingClientRect();
    let left = rect.right + 6;
    if (left + popRect.width > window.innerWidth - 8) {
      left = Math.max(8, rect.left - popRect.width - 6);
    }
    pop.style.left = `${left}px`;
    pop.style.top  = `${Math.max(popRect.height + 8, rect.top - 6)}px`;

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

      if (techPopKey === button.dataset.tech) {
        closeTechPop();
        return;
      }

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
