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
   a página. A janela anda com a propriedade `translate`, que se soma ao
   transform que já tenha (os modais centram-se com transform). A barra nunca
   sai do ecrã. Maximizar (ou fechar um modal) devolve a janela ao lugar. */
function initDrag() {
  const fine = matchMedia("(pointer: fine)");
  const handles = document.querySelectorAll(".os-titlebar, .modal-header");
  for (const bar of handles) {
    const win = bar.closest("[data-window], .os-window, .os-tip, .modal-window");
    if (!win) continue;
    bar.classList.add("is-draggable");
    bar.addEventListener("pointerenter", () => { if (fine.matches) document.querySelector(".cursor")?.classList.add("hover"); });
    bar.addEventListener("pointerleave", () => { if (!start) document.querySelector(".cursor")?.classList.remove("hover"); });
    let start = null;
    bar.addEventListener("pointerdown", (e) => {
      if (!fine.matches || e.button !== 0) return;
      if (e.target.closest("button, a, input, select, textarea")) return;
      if (win.classList.contains("is-maximized")) return;
      const [dx, dy] = (win.style.translate || "0px 0px").split(" ").map(parseFloat);
      start = { x: e.clientX, y: e.clientY, dx: dx || 0, dy: dy || 0, bar: bar.getBoundingClientRect() };
      bar.setPointerCapture(e.pointerId);
      win.classList.add("is-dragging");
      document.querySelector(".cursor")?.classList.add("dragging");
      e.preventDefault();
    });
    bar.addEventListener("pointermove", (e) => {
      if (!start) return;
      let mx = e.clientX - start.x, my = e.clientY - start.y;
      /* a barra fica sempre pelo menos 40px dentro do ecrã */
      const b = start.bar, m = 40;
      mx = Math.min(Math.max(mx, m - b.right), innerWidth - m - b.left);
      my = Math.min(Math.max(my, -b.top), innerHeight - b.bottom);
      win.style.translate = `${Math.round(start.dx + mx)}px ${Math.round(start.dy + my)}px`;
    });
    const end = () => {
      if (!start) return;
      start = null;
      win.classList.remove("is-dragging");
      document.querySelector(".cursor")?.classList.remove("dragging");
    };
    bar.addEventListener("pointerup", end);
    bar.addEventListener("pointercancel", end);
  }
  /* maximizar devolve a janela ao lugar */
  for (const max of document.querySelectorAll(".os-max")) {
    max.addEventListener("click", () => { const w = max.closest("[data-window]"); if (w) w.style.translate = ""; });
  }
  /* um modal fechado volta a abrir no centro */
  for (const close of document.querySelectorAll("[data-close-modal]")) {
    close.addEventListener("click", () => { const w = close.closest(".modal")?.querySelector(".modal-window"); if (w) w.style.translate = ""; });
  }
}
