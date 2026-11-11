/* A galeria é um índice de projetos. Cada cartão abre o seu painel de slides
   dentro da mesma janela, com um botão de voltar — em vez de trocar a janela
   inteira, que perderia o sítio onde a pessoa estava. */

const INDEX = ".proj-index";

export function initGalleryProjects() {
  const root = document.querySelector("#gallery-modal");
  if (!root) return;

  const index = root.querySelector(INDEX);
  const panels = [...root.querySelectorAll(".proj-panel")];
  const intro = root.querySelector(".gallery-intro");
  const scroller = root.querySelector(".modal-window") || root;
  if (!index || !panels.length) return;

  const show = (slug) => {
    const panel = panels.find((p) => p.id === "proj-" + slug);
    if (!panel) return;
    index.hidden = true;
    if (intro) intro.hidden = true;
    panels.forEach((p) => { p.hidden = p !== panel; });
    scroller.scrollTop = 0;
    /* O título é o primeiro alvo de leitura; sem tabindex o foco ficaria no
       botão que já não está visível. */
    const h = panel.querySelector(".proj-title");
    if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  };

  const back = () => {
    const open = panels.find((p) => !p.hidden);
    panels.forEach((p) => { p.hidden = true; });
    index.hidden = false;
    if (intro) intro.hidden = false;
    scroller.scrollTop = 0;
    if (open) {
      const card = index.querySelector('[data-proj="' + open.id.slice(5) + '"]');
      if (card) card.focus({ preventScroll: true });
    }
  };

  root.addEventListener("click", (e) => {
    const card = e.target.closest(".proj-card");
    if (card) { show(card.dataset.proj); return; }
    if (e.target.closest(".proj-back")) back();
  });

  /* Escape fecha o painel antes de fechar a janela, se houver um aberto. */
  root.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (panels.some((p) => !p.hidden)) { e.stopPropagation(); back(); }
  }, true);

  /* Reabrir a galeria volta sempre ao índice. */
  document.addEventListener("click", (e) => {
    if (e.target.closest('[data-modal-target="gallery-modal"]')) back();
  });
}
