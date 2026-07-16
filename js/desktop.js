/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  <
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */
/* ᑲყᥣx desktop — monitor power, pixel-window close, start menu, fullscreen */

export function initDesktop() {
  const scene = document.getElementById("hero-scene");

  /* ----- pixel window close (the X tile of nihon.bmp) ----- */
  const winClose    = document.querySelector(".pixel-window-close");
  const pixelWindow = document.querySelector(".pixel-window");
  const paint       = document.querySelector(".paint");

  if (winClose && pixelWindow) {
    winClose.addEventListener("click", () => {
      pixelWindow.classList.add("is-closed");
      if (paint) paint.classList.add("is-closed");
    });
  }

  /* ----- monitor power ----- */
  const powerBtn     = document.querySelector(".monitor-power");
  const monitorItem  = document.querySelector('[data-start-action="monitor"] .label');
  let screenOff = false;

  function setScreen(off) {
    screenOff = off;
    const label = off ? "Turn monitor on" : "Turn monitor off";

    if (scene) scene.classList.toggle("screen-off", off);
    if (monitorItem) monitorItem.textContent = label;

    if (powerBtn) {
      powerBtn.setAttribute("aria-label", label);
      powerBtn.setAttribute("aria-pressed", String(off));
    }
  }

  if (powerBtn) powerBtn.addEventListener("click", () => setScreen(!screenOff));

  /* ----- start menu ----- */
  const startBtn = document.querySelector(".start-btn");
  const menu     = document.querySelector(".start-menu");

  /* Below this the hero switches to the desk crop and CSS centres the menu
     on the visible band instead of anchoring it to the toolbar */
  const deskCrop = window.matchMedia(
    "(max-width: 900px), (orientation: portrait) and (max-width: 1200px)"
  );

  function menuItems() {
    return [...menu.querySelectorAll('[role="menuitem"]')];
  }

  /* The toolbar rides the artboard, which is centred and can be wider than
     the viewport — a viewport-relative % only lines up by luck */
  function positionMenu() {
    if (menu.hidden) return;

    if (deskCrop.matches) {
      menu.style.left = "";
      return;
    }

    const left  = startBtn.getBoundingClientRect().left;
    const limit = window.innerWidth - menu.offsetWidth - 8;
    menu.style.left = `${Math.max(8, Math.min(left, limit))}px`;
  }

  function openMenu() {
    menu.hidden = false;
    startBtn.setAttribute("aria-expanded", "true");
    positionMenu();
    const first = menuItems()[0];
    if (first) first.focus();
  }

  function closeMenu({ refocus = false } = {}) {
    if (menu.hidden) return;
    menu.hidden = true;
    startBtn.setAttribute("aria-expanded", "false");
    if (refocus) startBtn.focus();
  }

  if (startBtn && menu) {
    startBtn.addEventListener("click", () => {
      menu.hidden ? openMenu() : closeMenu();
    });

    window.addEventListener("resize", positionMenu, { passive: true });

    document.addEventListener("pointerdown", (event) => {
      if (menu.hidden) return;
      if (event.target.closest(".start-menu") || event.target.closest(".start-btn")) return;
      closeMenu();
    });

    menu.addEventListener("keydown", (event) => {
      const items = menuItems();
      const index = items.indexOf(document.activeElement);

      if (event.key === "ArrowDown") {
        event.preventDefault();
        items[(index + 1) % items.length]?.focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        items[(index - 1 + items.length) % items.length]?.focus();
      }
    });

    menu.addEventListener("click", (event) => {
      const item = event.target.closest("[data-start-action]");
      if (!item) return;

      const action = item.dataset.startAction;
      closeMenu();

      if      (action === "fullscreen") { openFullscreen(); }
      else if (action === "music")      { document.dispatchEvent(new CustomEvent("bylx:mp3-open")); }
      else if (action === "monitor")    { setScreen(!screenOff); }
      /* "contact" opens via its data-modal-target — handled by modals.js */
    });
  }

  /* ----- fullscreen monitor (cinema mode) ----- */
  const fsMode = document.querySelector(".fullscreen-mode");
  const fsHint = document.querySelector(".fullscreen-hint");
  let hintTimer;
  let lastFocus = null;

  function openFullscreen() {
    if (!fsMode) return;
    lastFocus = document.activeElement;
    fsMode.hidden = false;
    if (fsHint) fsHint.hidden = false;
    fsMode.focus();

    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => { if (fsHint) fsHint.hidden = true; }, 4200);
  }

  function closeFullscreen() {
    if (!fsMode || fsMode.hidden) return;
    fsMode.hidden = true;
    clearTimeout(hintTimer);
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  if (fsMode) fsMode.addEventListener("click", closeFullscreen);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu && !menu.hidden) {
      closeMenu({ refocus: true });
      return;
    }

    if (fsMode && !fsMode.hidden) {
      if (event.key === "Escape" || event.key === "F11") {
        event.preventDefault();
        closeFullscreen();
        return;
      }

      /* Nothing inside the dialog is focusable, so the trap is just: Tab
         keeps focus on the dialog instead of escaping behind the overlay */
      if (event.key === "Tab") {
        event.preventDefault();
        fsMode.focus();
      }
    }
  });
}
