/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  <
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */
/* ᑲყᥣx modals */

export function initModals() {
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    const firstFocusable = modal.querySelector("button, input, textarea, a");
    if (firstFocusable) firstFocusable.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll("[data-modal-target]").forEach((trigger) => {
    trigger.addEventListener("click", () => openModal(trigger.dataset.modalTarget));
  });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => closeModal(button.closest(".modal")));
  });

  // Clicking a project card (outside its action links) opens the case study
  document.querySelectorAll(".project-card[data-card-modal]").forEach((card) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", (event) => {
      // Let <a href> links and explicit modal-target buttons handle themselves
      if (event.target.closest("a[href]"))          return;
      if (event.target.closest("[data-modal-target]")) return;
      openModal(card.dataset.cardModal);
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll(".modal.is-open").forEach(closeModal);
  });
}
