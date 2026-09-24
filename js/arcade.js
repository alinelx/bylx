/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  <
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */
/* ᑲყᥣx arcade — the machine picker at /arcade/

   The deck is a list of links first and a coverflow second. This file never
   creates a card, never changes an href and never decides what a card says: it
   only moves an index and writes --i on each card, so the markup stays the
   source of truth and the page still works with this script missing. */

export function initArcade() {
  const deck = document.querySelector("[data-deck]");
  if (!deck) return;

  const cards = [...deck.querySelectorAll(".deck-card")];
  if (!cards.length) return;

  const prev = deck.querySelector("[data-deck-prev]");
  const next = deck.querySelector("[data-deck-next]");
  const status = document.querySelector("[data-deck-status]");

  /* One machine is not a carousel. Remove the controls rather than disable
     them — a control that can never do anything is worse than no control. */
  if (cards.length < 2) {
    prev?.remove();
    next?.remove();
  }

  let at = 0;

  function show(index) {
    at = Math.min(Math.max(index, 0), cards.length - 1);

    cards.forEach((card, i) => {
      const offset = i - at;
      card.style.setProperty("--i", offset);
      card.toggleAttribute("data-active", offset === 0);
      card.toggleAttribute("data-far", Math.abs(offset) > 1);
      /* Out of frame means out of reach: a link nobody can see should not be
         the next thing Tab lands on. */
      card.querySelector("a")?.setAttribute("tabindex", Math.abs(offset) > 1 ? "-1" : "0");
    });

    if (prev) prev.disabled = at === 0;
    if (next) next.disabled = at === cards.length - 1;

    if (status && cards.length > 1) {
      const name = cards[at].querySelector(".deck-name")?.textContent.trim() ?? "";
      status.textContent = `${at + 1} of ${cards.length} · ${name}`;
    }
  }

  prev?.addEventListener("click", () => show(at - 1));
  next?.addEventListener("click", () => show(at + 1));

  /* Focus and the animation must never disagree about which machine you are
     on: tabbing to a card makes it the active one. */
  cards.forEach((card, i) => {
    card.addEventListener("focusin", () => show(i));
  });

  deck.addEventListener("keydown", (event) => {
    const by = { ArrowLeft: -1, ArrowRight: 1, Home: -cards.length, End: cards.length }[event.key];
    if (by === undefined) return;
    event.preventDefault();
    show(at + by);
    cards[at].querySelector("a")?.focus();
  });

  /* Swipe. Measured against the card, not the viewport, so the gesture feels
     the same on a phone and on a desk. */
  let from = null;

  deck.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType === "mouse") return;
      from = { x: event.clientX, width: cards[0].getBoundingClientRect().width };
    },
    { passive: true }
  );

  deck.addEventListener(
    "pointerup",
    (event) => {
      if (!from) return;
      const moved = event.clientX - from.x;
      if (Math.abs(moved) > from.width * 0.18) show(at + (moved < 0 ? 1 : -1));
      from = null;
    },
    { passive: true }
  );

  deck.addEventListener("pointercancel", () => { from = null; }, { passive: true });

  show(0);
}
