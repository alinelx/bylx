/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  <
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */
/* ᑲყᥣx desktop — monitor power, pixel-window close, start menu, fullscreen */

import { screenRect, clampToRect } from "./utils.js?v=0babd1ef";

export function initDesktop() {
  const scene = document.getElementById("hero-scene");

  /* ----- pixel window close (the X tile of nihon.bmp) ----- */
  const winClose    = document.querySelector(".pixel-window-close");
  const pixelWindow = document.querySelector(".pixel-window");

  if (winClose && pixelWindow) {
    winClose.addEventListener("click", () => {
      pixelWindow.classList.add("is-closed");
    });
  }

  /* O rectângulo do ecrã dentro da prancheta (.win-bg: 38%/42%, 24%x31%).
     Serve a dois donos: limita para onde a janela pode ser arrastada, e
     dá ao cinema a escala a que a prancheta preenche a moldura. */
  const SCREEN = { left: 38, top: 42, width: 24, height: 31 };

  /* ----- the window moves, because a window moves -----

     It is positioned in artboard percentages, so the drag is measured in them
     too: divide the pointer delta by the offset parent's width and the result
     is in the right units on both surfaces, including cinema mode, where the
     same node sits in a board about five times the size. Nobody has to know
     the scale.

     Sideways it stays on the desktop. Downwards it may slide under the
     monitor's own bezel — which is exactly what a window does when you push it
     off the bottom of a screen — but never so far that the bar you grabbed it
     by has gone with it. */
  const winBar = document.querySelector(".win-bar");

  if (winBar && pixelWindow) {
    const clamp = (value, low, high) => Math.min(Math.max(value, low), Math.max(low, high));

    /* Read, never assumed: the resting position lives in the CSS, and a copy
       of it here would be one more number to keep in step by hand. */
    function measure() {
      const parent = pixelWindow.offsetParent?.getBoundingClientRect();
      const box = pixelWindow.getBoundingClientRect();
      if (!parent?.width || !box.width) return null;
      return {
        parent,
        left: ((box.x - parent.x) / parent.width) * 100,
        top: ((box.y - parent.y) / parent.height) * 100,
        width: (box.width / parent.width) * 100,
        height: (box.height / parent.height) * 100,
      };
    }

    let home = null;
    let at = null;
    let from = null;

    function place(left, top) {
      const now = measure();
      if (!now) return;

      /* The whole window, not just the bar: nothing clips these layers, so a
         window pushed past the bottom of the screen is simply drawn on the
         desk. It may still slide under the taskbar, which paints after it. */
      at = {
        left: clamp(left, SCREEN.left, SCREEN.left + SCREEN.width - now.width),
        top: clamp(top, SCREEN.top, SCREEN.top + SCREEN.height - now.height),
      };
      pixelWindow.style.left = `${at.left}%`;
      pixelWindow.style.top = `${at.top}%`;
    }

    function start() {
      const now = measure();
      if (!now) return null;
      if (!home) home = { left: now.left, top: now.top };
      at = at ?? { left: now.left, top: now.top };
      return now;
    }

    winBar.addEventListener("pointerdown", (event) => {
      /* The three-button tile is inside this bar and it closes the window. */
      if (event.target.closest(".pixel-window-close")) return;

      const now = start();
      if (!now) return;

      from = { x: event.clientX, y: event.clientY, left: at.left, top: at.top, parent: now.parent };
      winBar.setPointerCapture(event.pointerId);
      pixelWindow.classList.add("is-dragging");
      /* No preventDefault: it suppresses the compatibility mouse events, and
         the pixel cursor is drawn from mousemove/mousedown — the arrow froze
         mid-drag and never took its pressed state. Selection and scrolling
         are already handled by user-select and touch-action on the bar. */
    });

    winBar.addEventListener("pointermove", (event) => {
      if (!from) return;
      place(
        from.left + ((event.clientX - from.x) / from.parent.width) * 100,
        from.top + ((event.clientY - from.y) / from.parent.height) * 100
      );
    });

    const drop = () => {
      from = null;
      pixelWindow.classList.remove("is-dragging");
    };
    winBar.addEventListener("pointerup", drop);
    winBar.addEventListener("pointercancel", drop);

    /* A drag is not the only way in (WCAG 2.5.7): the bar takes focus and the
       arrows move the window, Shift for a bigger step, Home to put it back. */
    winBar.addEventListener("keydown", (event) => {
      const step = event.shiftKey ? 4 : 1;
      const by = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      }[event.key];

      if (!start()) return;

      if (by) {
        event.preventDefault();
        place(at.left + by[0], at.top + by[1]);
      } else if (event.key === "Home") {
        event.preventDefault();
        place(home.left, home.top);
      }
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

    const screen = screenRect();

    /* Sem ecrã visível (recorte de telemóvel), o CSS centra-o e não há
       perímetro a respeitar. */
    if (deskCrop.matches || !screen) {
      menu.style.left = "";
      menu.style.top = "";
      menu.style.bottom = "";
      menu.style.width = "";
      menu.style.maxHeight = "";
      return;
    }

    /* Uma janela do sistema não sai do ecrã: largura, altura e as duas
       coordenadas são limitadas ao rectângulo do CRT, e o menu abre para cima
       a partir da barra de tarefas, como o Windows que imita. */
    /* 2px, not 2% of the screen. The percentage was invisible while the
       taskbar sat half a percent in from the left edge; once START moved flush
       with it, the menu could no longer line up with the button it opens from
       — it was held 7px to the right of its own trigger. A system menu opens
       in the corner. */
    const pad = 2;
    menu.style.width = `${Math.min(280, screen.width - pad * 2)}px`;
    menu.style.maxHeight = `${screen.height - pad * 2}px`;

    const bar = document.querySelector(".toolbar-strip")?.getBoundingClientRect();
    const bottom = bar ? bar.top : screen.bottom;

    /* offsetWidth/offsetHeight, não getBoundingClientRect: o menu abre com a
       animação start-pop-in, e durante esses 140ms o rectângulo devolvido é o
       da caixa a meio da animação — media-se pequeno e o menu assentava fora
       do sítio. As medidas de layout ignoram transformações. */
    const box = { width: menu.offsetWidth, height: menu.offsetHeight };
    const wanted = {
      left: startBtn.getBoundingClientRect().left,
      top: bottom - box.height - pad,
      width: box.width,
      height: box.height,
    };

    const { left, top } = clampToRect(wanted, screen, pad);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    /* O CSS ancora o menu por `bottom`. Com top E bottom definidos num
       elemento fixed a altura deixa de ser a do conteúdo e passa a ser o que
       sobra entre os dois — no cinema dava 111px para 194px de itens, e a
       lista saía pela caixa fora. */
    menu.style.bottom = "auto";
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
      /* Before closeMenu(): hiding the menu blurs the item, so grabbing
         lastFocus inside openFullscreen() only ever caught <body> and the
         restore on close was a no-op */
      const opener = document.activeElement;
      closeMenu();

      if      (action === "fullscreen") { openFullscreen(opener); }
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

  /* O cinema mode mostra o ECRÃ do monitor — wallpaper, ícones, a janela e a
     barra — e não uma fotografia do wallpaper.

     Os itens do ecrã estão posicionados em % da prancheta, por isso basta
     recriar a prancheta dentro da moldura do cinema, à escala em que o
     rectângulo do ecrã (.win-bg: 38%/42%, 24%x31%) a preenche por completo.
     A matemática é a mesma nas duas direcções: largura = 100%/0.24 e o
     desvio = -38%/0.24. */
  const CINEMA_ITEMS = [".win-bg", ".desktop-icons", ".pixel-window", ".toolbar-strip"];

  /* Os itens do ecrã são EMPRESTADOS ao cinema, não copiados: assim os ícones
     abrem os balões, o X fecha o Paint e o START abre o menu, porque são os
     mesmos nós com os mesmos listeners. Guardamos onde cada um estava para os
     devolver exactamente à mesma posição na ordem de pintura. */
  let borrowed = [];
  let cinemaResize = null;

  /* A prancheta do cinema é a prancheta real ao tamanho real, AMPLIADA com um
     transform. Redimensioná-la em percentagens não chegava: a moldura da
     janela do Paint (--tile: clamp(8px, 0.72vw, 16px)) e o tipo do título
     (clamp em vw) são medidos no viewport, não no contentor, por isso ficavam
     do tamanho de sempre enquanto o wallpaper crescia três vezes — a janela
     desalinhava e a barra de tarefas encolhia. Um scale() amplia tudo na
     mesma proporção, que é o que "aproximar o monitor" quer dizer. */
  function layoutCinemaBoard(board, stage) {
    const art = document.querySelector(".hero-artboard")?.getBoundingClientRect();
    const frame = stage.getBoundingClientRect();
    if (!art || !art.width || !frame.width) return;

    const scale = frame.width / (art.width * (SCREEN.width / 100));

    board.style.width = `${art.width}px`;
    board.style.height = `${art.height}px`;
    board.style.transformOrigin = "top left";
    board.style.transform = `scale(${scale})`;
    board.style.left = `${-art.width * (SCREEN.left / 100) * scale}px`;
    board.style.top = `${-art.height * (SCREEN.top / 100) * scale}px`;
  }

  function buildCinemaBoard(stage) {
    const board = document.createElement("div");
    board.className = "fullscreen-artboard";

    /* Um clique no fundo fecha o cinema; um clique no ecrã é do ecrã. */
    board.addEventListener("click", (event) => event.stopPropagation());

    for (const sel of CINEMA_ITEMS) {
      const node = document.querySelector(sel);
      if (!node) continue;

      borrowed.push({ node, parent: node.parentNode, next: node.nextSibling });
      board.appendChild(node);
    }

    stage.prepend(board);

    return board;
  }

  function returnScreenItems() {
    for (const { node, parent, next } of borrowed) {
      /* next may no longer be a child of parent — insertBefore throws then,
         and this runs on the way out of cinema mode, before the scroll lock
         comes off. One bad sibling left the whole page unscrollable. */
      if (next && next.parentNode === parent) parent.insertBefore(node, next);
      else parent.appendChild(node);
    }
    borrowed = [];
  }

  function openFullscreen(opener) {
    /* Already open: the Start menu is reachable from inside cinema mode and
       its first item still says "enter cinema mode". Entering twice borrowed
       the screen items into a second board while `borrowed` still pointed at
       the first, and putting them back afterwards threw — leaving the page
       scroll-locked with no way out. */
    if (!fsMode || !fsMode.hidden) return;
    const from = opener ?? document.activeElement;
    lastFocus = from && from !== document.body ? from : startBtn;

    const stage = fsMode.querySelector(".fullscreen-screen");
    const board = stage ? buildCinemaBoard(stage) : null;

    /* A página não rola por trás do cinema, como em qualquer modal */
    document.documentElement.classList.add("cinema-open");
    fsMode.hidden = false;

    /* A escala só se mede depois de visível: escondido, o rectângulo da
       moldura é zero e a conta saía toda a zero. */
    if (board && stage) {
      layoutCinemaBoard(board, stage);
      /* A moldura acompanha o viewport, portanto a ampliação também */
      cinemaResize = () => layoutCinemaBoard(board, stage);
      window.addEventListener("resize", cinemaResize, { passive: true });
    }
    if (fsHint) fsHint.hidden = false;
    fsMode.focus();

    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => { if (fsHint) fsHint.hidden = true; }, 4200);
  }

  function closeFullscreen() {
    if (!fsMode || fsMode.hidden) return;
    fsMode.hidden = true;
    if (cinemaResize) {
      window.removeEventListener("resize", cinemaResize);
      cinemaResize = null;
    }
    returnScreenItems();
    fsMode.querySelector(".fullscreen-artboard")?.remove();
    document.documentElement.classList.remove("cinema-open");
    closeMenu();
    clearTimeout(hintTimer);
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  if (fsMode) fsMode.addEventListener("click", closeFullscreen);

  window.addEventListener("keydown", (event) => {
    /* An Escape a modal already consumed is not ours (modals.js) */
    if (event.defaultPrevented) return;

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
