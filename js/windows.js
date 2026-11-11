/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
/* ᑲყᥣx windows — minimizar, maximizar e fechar as janelas das secções

   Fechar não apaga nada: a janela fica reduzida à barra de título, que diz
   "closed" e reabre com um clique — num portfolio, conteúdo que desaparece de
   vez é informação essencial escondida. Sem JS os botões não fazem nada e a
   janela fica aberta, que é o estado útil. */

export function initWindows() {
  for (const win of document.querySelectorAll("[data-window]")) {
    const title = win.querySelector(".os-title");
    const name = title?.textContent.trim() ?? "";
    const min = win.querySelector(".os-min");
    const max = win.querySelector(".os-max");
    const close = win.querySelector(".os-close");

    const set = (state) => {
      win.classList.toggle("is-minimized", state === "min");
      win.classList.toggle("is-closed", state === "closed");
      const open = state === "open";
      min?.setAttribute("aria-expanded", String(open));
      min?.setAttribute("aria-label", open ? `Minimize ${name}` : `Restore ${name}`);
      close?.setAttribute("aria-label", state === "closed" ? `Reopen ${name}` : `Close ${name}`);
      if (title) title.textContent = state === "closed" ? `${name} — closed` : name;
    };
    const state = () => (win.classList.contains("is-closed") ? "closed" : win.classList.contains("is-minimized") ? "min" : "open");

    min?.addEventListener("click", () => set(state() === "open" ? "min" : "open"));
    close?.addEventListener("click", () => set(state() === "closed" ? "open" : "closed"));
    max?.addEventListener("click", () => {
      const on = !win.classList.contains("is-maximized");
      win.classList.toggle("is-maximized", on);
      max.setAttribute("aria-pressed", String(on));
      max.setAttribute("aria-label", on ? `Restore ${name} size` : `Maximize ${name}`);
      if (state() !== "open") set("open");
    });
    /* Duplo clique na barra, como num sistema: maximiza/restaura */
    win.querySelector(".os-titlebar")?.addEventListener("dblclick", (e) => {
      if (!e.target.closest(".os-btn")) max?.click();
    });
  }

  /* A dica do hero só tem fechar */
  for (const tip of document.querySelectorAll(".os-tip")) {
    tip.querySelector(".os-close")?.addEventListener("click", () => { tip.hidden = true; });
  }

  initDrag();
}

/* ---------- Arrastar as janelas pela barra de título ----------
   Só com rato/caneta (pointer: fine): no toque a barra continua a deixar rolar
   a página. A barra nunca sai do ecrã. A janela agarrada passa para a frente
   das outras e fica lá.
   - Janelas no fluxo (as das secções): o vertical anda com margin-top, por isso
     a página cresce ou encolhe com o espaço que as janelas ocupam; o
     horizontal anda com `translate`.
   - Janelas posicionadas (hero, dica, modais): andam só com `translate`; as do
     hero, por serem absolutas sem corte, também alargam a página se descerem.
   Maximizar (ou fechar um modal) devolve a janela ao lugar. */
let topZ = 40;
const reset = (win) => {
  win.style.translate = "";
  if (win.dataset.baseMt !== undefined) win.style.marginTop = "";
  delete win.dataset.dx; delete win.dataset.dy;
};

function initDrag() {
  const fine = matchMedia("(pointer: fine)");
  const cursor = () => document.querySelector(".cursor");
  for (const bar of document.querySelectorAll(".os-titlebar, .modal-header")) {
    const win = bar.closest("[data-window], .os-window, .os-tip, .modal-window");
    if (!win) continue;
    bar.classList.add("is-draggable");
    bar.addEventListener("pointerenter", () => { if (fine.matches) cursor()?.classList.add("hover"); });
    bar.addEventListener("pointerleave", () => { if (!start) cursor()?.classList.remove("hover"); });
    let start = null;
    bar.addEventListener("pointerdown", (e) => {
      if (!fine.matches || e.button !== 0) return;
      if (e.target.closest("button, a, input, select, textarea")) return;
      if (win.classList.contains("is-maximized")) return;
      const pos = getComputedStyle(win).position;
      const flow = pos === "static" || pos === "relative";
      if (flow && win.dataset.baseMt === undefined) win.dataset.baseMt = parseFloat(getComputedStyle(win).marginTop) || 0;
      start = { x: e.clientX, y: e.clientY, dx: +win.dataset.dx || 0, dy: +win.dataset.dy || 0, flow, bar: bar.getBoundingClientRect() };
      win.classList.add("is-dragging", "is-moved");
      win.style.zIndex = String(++topZ);
      bar.setPointerCapture(e.pointerId);
      cursor()?.classList.add("dragging");
      e.preventDefault();
    });
    bar.addEventListener("pointermove", (e) => {
      if (!start) return;
      let mx = e.clientX - start.x, my = e.clientY - start.y;
      const b = start.bar, m = 40;
      mx = Math.min(Math.max(mx, m - b.right), innerWidth - m - b.left);
      my = Math.min(Math.max(my, -b.top), innerHeight - b.bottom);
      const dx = Math.round(start.dx + mx), dy = Math.round(start.dy + my);
      win.dataset.dx = dx; win.dataset.dy = dy;
      if (start.flow) {
        win.style.translate = `${dx}px 0px`;
        win.style.marginTop = `${+win.dataset.baseMt + dy}px`;
      } else {
        win.style.translate = `${dx}px ${dy}px`;
      }
    });
    const end = () => {
      if (!start) return;
      start = null;
      win.classList.remove("is-dragging");
      cursor()?.classList.remove("dragging");
    };
    bar.addEventListener("pointerup", end);
    bar.addEventListener("pointercancel", end);
  }
  for (const max of document.querySelectorAll(".os-max")) {
    max.addEventListener("click", () => { const w = max.closest("[data-window]"); if (w) reset(w); });
  }
  for (const close of document.querySelectorAll("[data-close-modal]")) {
    close.addEventListener("click", () => { const w = close.closest(".modal")?.querySelector(".modal-window"); if (w) reset(w); });
  }
}
