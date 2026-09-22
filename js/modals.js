/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  <
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */
/* ᑲყᥣx modals */

/* Anything that can hold focus inside an open dialog. Kept in one place
   because the trap and the initial focus must agree on what "focusable"
   means, or Tab escapes through something the opener skipped. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function initModals() {
  /* The element that opened each modal, so focus can go home on close.
     A map, not a single variable: the start menu can open the contact modal
     while another is already open. */
  const openedBy = new WeakMap();

  function focusables(modal) {
    return [...modal.querySelectorAll(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    );
  }

  function openModal(id, trigger) {
    const modal = document.getElementById(id);
    if (!modal) return;

    openedBy.set(modal, trigger ?? null);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    /* The page behind a dialog must not scroll under it */
    document.documentElement.classList.add("modal-open");

    focusables(modal)[0]?.focus();
  }

  function closeModal(modal) {
    if (!modal || !modal.classList.contains("is-open")) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    if (!document.querySelector(".modal.is-open")) {
      document.documentElement.classList.remove("modal-open");
    }

    /* Back to the control that opened it. Without this, closing dropped
       focus on <body> and a keyboard visitor restarted from the top. */
    const trigger = openedBy.get(modal);
    openedBy.delete(modal);
    if (trigger && document.contains(trigger) && typeof trigger.focus === "function") {
      trigger.focus();
    }
  }

  document.querySelectorAll("[data-modal-target]").forEach((trigger) => {
    trigger.addEventListener("click", () => openModal(trigger.dataset.modalTarget, trigger));
  });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => closeModal(button.closest(".modal")));
  });

  window.addEventListener("keydown", (event) => {
    const open = [...document.querySelectorAll(".modal.is-open")].pop();
    if (!open) return;

    if (event.key === "Escape") {
      /* Consume the key: the mp3 player and the fullscreen monitor also
         listen for Escape, and without this one press closed all three. */
      event.preventDefault();
      document.querySelectorAll(".modal.is-open").forEach(closeModal);
      return;
    }

    /* aria-modal="true" is a promise to assistive tech, not a behaviour —
       the browser still tabs straight out of the dialog into the page
       behind it unless the cycle is closed by hand. */
    if (event.key === "Tab") {
      const items = focusables(open);
      if (!items.length) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (!open.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}
