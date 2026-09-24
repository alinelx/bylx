/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  <
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */
/* ᑲყᥣx projects filter — Product · Client · Tool · Design

   Four kinds, and a card can be more than one: konochan was a product AND the
   brand around it, luparoad was client work AND a rebrand. data-kind holds a
   space-separated list rather than a single value, because forcing one label
   per project would file half of them under something that is only half true.

   The markup ships the filter bar with `hidden` and this removes it. Without
   JS the grid is simply all six cards, which is the honest fallback: a control
   that cannot do anything is worse than no control — the same rule that drops
   the arcade's arrows when there is one machine.

   Filtering uses the `hidden` attribute, not display:none in a class, so a
   filtered-out card leaves the accessibility tree and the tab order together.
   A card you cannot see but can still Tab into is the bug this avoids. */

export function initProjectsFilter() {
  const bar = document.getElementById("projects-filter");
  const grid = document.querySelector(".projects-grid");
  const count = document.getElementById("projects-count");
  if (!bar || !grid) return;

  const cards = [...grid.querySelectorAll(".project-card")];
  const buttons = [...bar.querySelectorAll("[data-filter]")];
  if (!cards.length || !buttons.length) return;

  const kindsOf = (card) => (card.dataset.kind || "").split(/\s+/).filter(Boolean);

  /* A button for a kind nothing carries can never do anything, so it goes —
     and the counts come from the cards themselves, so they cannot drift out of
     step with the grid the way a number typed into the markup would. */
  for (const button of buttons) {
    const kind = button.dataset.filter;
    const n = kind === "all" ? cards.length : cards.filter((c) => kindsOf(c).includes(kind)).length;
    if (!n) {
      button.remove();
      continue;
    }
    button.insertAdjacentHTML("beforeend", ` <span class="filter-count">${n}</span>`);
  }

  function show(kind) {
    let visible = 0;
    for (const card of cards) {
      const on = kind === "all" || kindsOf(card).includes(kind);
      card.hidden = !on;
      if (on) visible++;
    }
    for (const button of bar.querySelectorAll("[data-filter]")) {
      button.setAttribute("aria-pressed", button.dataset.filter === kind ? "true" : "false");
    }
    if (count) {
      count.textContent = kind === "all"
        ? `${visible} projects`
        : `${visible} ${visible === 1 ? "project" : "projects"} · ${kind}`;
    }
  }

  bar.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    show(button.dataset.filter);
  });

  bar.hidden = false;
  show("all");
}
