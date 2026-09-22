/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  <
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */
/* ᑲყᥣx deeplink — gives each open case study a URL worth sharing.

   The case studies are dialogs, so every one of them lived at "/". You could
   not link one in an application, post one on LinkedIn, or have Google index
   it. Opening a case study now writes /work/<slug>/ into the address bar, and
   that URL is a real page on disk (scripts/build-work-pages.mjs) — so a
   reload, a share or a crawler all land on the same copy.

   It talks to js/modals.js only through events: this module never touches
   .is-open itself, and modals.js knows nothing about routes. */

const HOME = "/";

export function initDeeplink() {
  const modals = [...document.querySelectorAll(".modal[data-work-slug]")];
  if (!modals.length || !window.history?.pushState) return;

  const bySlug = new Map(modals.map((modal) => [modal.dataset.workSlug, modal]));
  const homeTitle = document.title;

  /* Set while the URL is driving the UI, so the UI does not drive the URL
     back and push a second entry for the same state. */
  let syncing = false;

  const pathOf = (slug) => `${HOME}work/${slug}/`;
  const slugFromPath = () => {
    const match = location.pathname.match(/^\/work\/([a-z0-9-]+)\/?$/i);
    return match ? match[1] : null;
  };

  const titleOf = (modal) =>
    `${modal.dataset.workTitle || modal.querySelector("h2")?.textContent || "Case study"} · bylx.dev`;

  function openBySlug(slug) {
    const modal = bySlug.get(slug);
    if (!modal || modal.classList.contains("is-open")) return;
    syncing = true;
    document.dispatchEvent(new CustomEvent("bylx:open-modal", { detail: { id: modal.id } }));
    syncing = false;
  }

  function closeAllWork() {
    modals
      .filter((modal) => modal.classList.contains("is-open"))
      .forEach((modal) => {
        syncing = true;
        document.dispatchEvent(new CustomEvent("bylx:close-modal", { detail: { id: modal.id } }));
        syncing = false;
      });
  }

  document.addEventListener("bylx:modal-open", (event) => {
    const modal = event.target;
    if (syncing || !modal.dataset?.workSlug) return;

    const path = pathOf(modal.dataset.workSlug);
    /* Re-opening the modal that is already the current URL would stack a
       second identical entry, and Back would then appear to do nothing. */
    if (location.pathname !== path) {
      history.pushState({ bylxWork: modal.dataset.workSlug }, "", path);
    }
    document.title = titleOf(modal);
  });

  document.addEventListener("bylx:modal-close", (event) => {
    const modal = event.target;
    if (syncing || !modal.dataset?.workSlug) return;

    document.title = homeTitle;

    /* Going back keeps the history clean: closing a dialog should undo the
       entry that opening it made, not stack a second one on top. When the
       entry is not ours (a deep link opened in a fresh tab), rewrite in
       place instead, so Back still leaves the site as the visitor expects. */
    if (history.state?.bylxWork) history.back();
    else history.replaceState({}, "", HOME);
  });

  window.addEventListener("popstate", () => {
    const slug = slugFromPath();
    if (slug && bySlug.has(slug)) {
      closeAllWork();
      openBySlug(slug);
      document.title = titleOf(bySlug.get(slug));
    } else {
      closeAllWork();
      document.title = homeTitle;
    }
  });

  /* Landing on /work/<slug>/ normally serves the static page, which does not
     load this module. This only fires when something rewrites the route back
     onto "/" — and it costs one lookup to be right in that case too. */
  const initial = slugFromPath();
  if (initial && bySlug.has(initial)) {
    /* No bylxWork marker on purpose: this entry was the visitor's arrival, not
       something opening a dialog pushed. Marking it would make the close
       handler call history.back() and walk them off the site. */
    openBySlug(initial);
    document.title = titleOf(bySlug.get(initial));
  }
}
