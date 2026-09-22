/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _        
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  < 
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */ 
/* ᑲყᥣx interactions */

import { screenRect } from "./utils.js?v=f8ff742b";

export function initMouseFlee() {
  const mouseSprite = document.querySelector(".mouse");
  const hero        = document.querySelector("#hero");

  /* Sem guarda de prefers-reduced-motion: fugir do cursor é a reação ao gesto
     de quem está a apontar, não movimento ambiente (ver o bloco no fim de
     css/responsive.css). */
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
  const keyboardGlow = document.querySelector(".keyboard-glow");

  if (!keyboardKeys) return;

  const targets = keyboardGlow ? [keyboardKeys, keyboardGlow] : [keyboardKeys];
  const palette = ["#ff5dbb", "#59f3ff", "#5d3fd3", "#f7f2ff", "#ffd45d", "#5dff9b"];
  let glowTimeout;

  window.addEventListener("keydown", (event) => {
    /* Typing into the contact form should not set the desk blinking */
    const target = event.target;
    if (target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

    const code = event.keyCode || event.which || 0;
    const tint = palette[code % palette.length];

    for (const el of targets) {
      el.style.setProperty("--rgb-tint", tint);
      el.classList.add("is-pressed");
    }

    clearTimeout(glowTimeout);
    glowTimeout = setTimeout(() => {
      for (const el of targets) el.classList.remove("is-pressed");
    }, 220);
  });
}

/* Shown once per session: the neutral hover policy means nothing signals that
   the desk objects are interactive until the pointer is already on one. Any
   click on the scene means the visitor found it — retire the hint early. */
export function initDeskHint() {
  const hint = document.querySelector(".desk-hint");
  const hero = document.querySelector("#hero");
  const KEY  = "bylx:desk-hint-seen";

  if (!hint || !hero) return;

  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === "1"; } catch { /* private mode */ }
  if (seen) return;

  let timer;

  function dismiss() {
    hint.hidden = true;
    clearTimeout(timer);
    hero.removeEventListener("pointerdown", dismiss);
    try { sessionStorage.setItem(KEY, "1"); } catch { /* private mode */ }
  }

  hint.hidden = false;
  timer = setTimeout(dismiss, 5000);
  hero.addEventListener("pointerdown", dismiss, { once: true });
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

    const screen = screenRect();

    /* A janela acompanha o ecrã: no CRT da cena tem ~170px, no cinema passa a
       ter um terço de um ecrã enorme. Sem isto ficava do mesmo tamanho nos
       dois e perdia-se no meio do cinema. */
    if (screen) {
      pop.style.width = `${Math.round(Math.min(Math.max(screen.width * 0.34, 170), 380))}px`;
    }

    const popRect = pop.getBoundingClientRect();

    /* Centrado no ecrã do CRT, como uma caixa de diálogo do sistema — e não
       colado ao ícone. Encostado ao ícone tinha de ser limitado dos quatro
       lados e acabava sempre num canto; ao centro cabe sempre e lê-se como
       uma janela que o ecrã abriu. Sem ecrã visível (recorte de telemóvel)
       centra no viewport, que é o ecrã que resta. */
    const bounds = screen ?? {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };

    /* Centrado na área ÚTIL: a barra de tarefas é chão do ecrã, não sítio
       para uma janela. */
    const bar = document.querySelector(".toolbar-strip")?.getBoundingClientRect();
    const usableBottom = bar && bar.top > bounds.top ? bar.top : bounds.top + bounds.height;
    const usableHeight = usableBottom - bounds.top;

    const left = bounds.left + (bounds.width - popRect.width) / 2;
    const top = bounds.top + (usableHeight - popRect.height) / 2;

    pop.style.left = `${Math.max(4, left)}px`;
    pop.style.top = `${Math.max(4, top)}px`;

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

  /* The popover is position:fixed and placed once from the icon's viewport
     rect, so any scroll or resize leaves it stranded — measured 300px adrift
     after one wheel gesture, and off-screen entirely after a narrow resize.
     Closing is the honest answer: it is a tooltip, not a dialog. */
  window.addEventListener("scroll", closeTechPop, { passive: true });
  window.addEventListener("resize", closeTechPop);
}
