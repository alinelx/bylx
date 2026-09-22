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
  const modals = document.querySelectorAll(".modal");
  if (!modals.length) return;

  let activeModal = null;
  let lastFocusedElement = null;

  function setModalState(modal, isOpen) {
    if (!modal) return;

    modal.classList.toggle("is-open", isOpen);
    modal.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("modal-open", isOpen);
    document.documentElement.classList.toggle("modal-open", isOpen);
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    if (activeModal && activeModal !== modal) {
      setModalState(activeModal, false);
    }

    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    activeModal = modal;
    setModalState(modal, true);

    const firstFocusable = modal.querySelector(
      "button, input, textarea, a, [tabindex]:not([tabindex='-1'])"
    );

    if (firstFocusable instanceof HTMLElement) {
      firstFocusable.focus();
    }
  }

  function closeModal(modal) {
    if (!modal) return;

    setModalState(modal, false);

    if (activeModal === modal) {
      activeModal = null;
    }

    if (lastFocusedElement && document.contains(lastFocusedElement)) {
      lastFocusedElement.focus();
    }
  }

  document.querySelectorAll("[data-modal-target]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openModal(trigger.dataset.modalTarget);
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeModal(button.closest(".modal"));
    });
  });

  modals.forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.classList.contains("modal-backdrop")) {
        closeModal(modal);
      }
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (activeModal) closeModal(activeModal);
  });
}
