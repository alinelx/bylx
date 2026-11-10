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
}
