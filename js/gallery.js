/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _        
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  < 
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */ 
/* ᑲყᥣx gallery viewer */

export function initGalleryViewer() {
  const box = document.querySelector("#gallery-lightbox");
  const img = box?.querySelector(".lightbox-img");
  const caption = box?.querySelector("[data-lightbox-caption]");

  if (!box || !img || !caption) return;

  const openers = [...document.querySelectorAll(".gallery-open")];
  if (!openers.length) return;

  let index = -1;
  let lastFocus = null;

  function show(next) {
    index = (next + openers.length) % openers.length;

    const opener = openers[index];
    img.src = opener.dataset.full;
    img.alt = opener.querySelector("img")?.alt ?? "";
    caption.textContent = opener.dataset.caption ?? "";
  }

  function open(from) {
    lastFocus = from;
    show(openers.indexOf(from));
    box.hidden = false;
    document.documentElement.classList.add("modal-open");
    box.querySelector("[data-lightbox-close]")?.focus();
  }

  function close() {
    if (box.hidden) return;

    box.hidden = true;
    /* Só devolve o scroll se não houver um modal por baixo — o visor abre
       por cima do modal da galeria, que continua aberto atrás dele. */
    if (!document.querySelector(".modal.is-open")) {
      document.documentElement.classList.remove("modal-open");
    }
    lastFocus?.focus();
  }

  openers.forEach((opener) => {
    opener.addEventListener("click", () => open(opener));
  });

  box.addEventListener("click", (event) => {
    if (event.target.closest("[data-lightbox-close]")) return close();

    const step = event.target.closest("[data-lightbox-step]");
    if (step) return show(index + Number(step.dataset.lightboxStep));

    /* Clicar no fundo fecha; clicar na peça, não. */
    if (!event.target.closest(".lightbox-figure")) close();
  });

  window.addEventListener("keydown", (event) => {
    if (box.hidden) return;

    if (event.key === "Escape") {
      /* Consome a tecla: o modal da galeria por baixo também ouve Escape, e
         uma só tecla fechava os dois de uma vez. */
      event.preventDefault();
      close();
      return;
    }

    if (event.key === "ArrowRight") show(index + 1);
    if (event.key === "ArrowLeft") show(index - 1);

    /* O visor é o topo da pilha: Tab não pode sair para a página atrás. */
    if (event.key === "Tab") {
      const focusable = [...box.querySelectorAll("button")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !box.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}
