/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
/* ᑲყᥣx settings — a engrenagem no canto

   Um botão fixo (por cima de tudo) abre uma janelinha com:
   - Time: AM (light) / PM (dark)          → theme.js
   - Colour: 3BIT, tudo em cinzento        → theme.js
   - Text size: A− / A+ (90 % a 137,5 %)    → font-size do <html>
   - Motion: reduzir movimento             → data-motion="reduce"
   - Cursor: cursor de pixel ou o do sistema → data-cursor="native"

   Tudo grava em localStorage e o <head> de cada página aplica antes da
   primeira pintura (o mesmo snippet em index, /work, arcade e 404), por isso
   as escolhas seguem a pessoa por todo o site. O markup é criado aqui, para
   não haver uma cópia por página. */

import { currentLang, setLang } from "./i18n.js?v=9c22e86b";

const SIZES = [90, 100, 112.5, 125, 137.5];
const root = document.documentElement;
const save = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* modo privado */ } };

const GEAR = `<svg viewBox="0 0 11 11" width="22" height="22" shape-rendering="crispEdges" aria-hidden="true" fill="currentColor">
  <path d="M4 0h3v2H4zM1 1h1v1H1zM9 1h1v1H9zM2 2h7v1H2zM2 3h2v1H2zM7 3h2v1H7zM0 4h3v3H0zM8 4h3v3H8zM2 7h2v1H2zM7 7h2v1H7zM2 8h7v1H2zM1 9h1v1H1zM9 9h1v1H9zM4 9h3v2H4z"/></svg>`;

export function buildSettings() {
  if (document.querySelector(".settings")) return;
  const wrap = document.createElement("div");
  wrap.className = "settings";
  wrap.innerHTML = `
    <button class="settings-btn" type="button" aria-expanded="false" aria-controls="settings-panel" aria-label="Settings">${GEAR}</button>
    <div class="settings-panel os-window" id="settings-panel" role="group" aria-labelledby="settings-title" hidden>
      <div class="os-titlebar">
        <span class="os-title" id="settings-title">SETTINGS</span>
        <span class="os-controls"><button class="os-btn os-close settings-close" type="button" aria-label="Close settings"></button></span>
      </div>
      <div class="settings-body">
        <div class="settings-row"><span class="settings-label">Time</span>
          <button class="time-toggle" type="button" aria-pressed="false" aria-label="Switch to AM (light mode)">
            <span class="time-am" aria-hidden="true">AM</span><span class="time-pm" aria-hidden="true">PM</span>
          </button></div>
        <div class="settings-row"><span class="settings-label">Colour</span>
          <button class="bit-toggle settings-switch" type="button" aria-pressed="false">3BIT</button></div>
        <div class="settings-row"><span class="settings-label" id="fs-label">Text size</span>
          <span class="settings-steps" role="group" aria-labelledby="fs-label">
            <button class="settings-switch" type="button" data-fs="-1" aria-label="Smaller text">A−</button>
            <output class="settings-value" aria-live="polite">100%</output>
            <button class="settings-switch" type="button" data-fs="1" aria-label="Larger text">A+</button>
          </span></div>
        <div class="settings-row"><span class="settings-label">Language</span>
          <button class="lang-toggle time-toggle" type="button" aria-label="Switch language (PT / EN)">
            <span class="lang-pt" aria-hidden="true">PT</span><span class="lang-en" aria-hidden="true">EN</span>
          </button></div>
        <div class="settings-row"><span class="settings-label">Motion</span>
          <button class="settings-switch" type="button" data-pref="motion" aria-pressed="false">REDUCE</button></div>
        <div class="settings-row"><span class="settings-label">Cursor</span>
          <button class="settings-switch" type="button" data-pref="cursor" aria-pressed="false">SYSTEM</button></div>
      </div>
    </div>`;
  document.body.prepend(wrap);
}

export function initSettings() {
  buildSettings();
  const wrap = document.querySelector(".settings");
  const btn = wrap.querySelector(".settings-btn");
  const panel = wrap.querySelector(".settings-panel");

  const open = (on) => {
    panel.hidden = !on;
    btn.setAttribute("aria-expanded", String(on));
    if (on) panel.querySelector(".time-toggle")?.focus();
  };
  btn.addEventListener("click", () => open(panel.hidden));
  wrap.querySelector(".settings-close").addEventListener("click", () => { open(false); btn.focus(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { open(false); btn.focus(); } });
  document.addEventListener("pointerdown", (e) => { if (!panel.hidden && !wrap.contains(e.target)) open(false); });

  /* Tamanho de letra: degraus fixos, para o layout ter sido visto em todos */
  const out = wrap.querySelector(".settings-value");
  const cur = () => { const v = parseFloat(root.style.fontSize) || 100; const i = SIZES.indexOf(v); return i < 0 ? 1 : i; };
  const renderFs = () => {
    const i = cur();
    out.textContent = `${SIZES[i]}%`;
    wrap.querySelector('[data-fs="-1"]').disabled = i === 0;
    wrap.querySelector('[data-fs="1"]').disabled = i === SIZES.length - 1;
  };
  for (const b of wrap.querySelectorAll("[data-fs]")) {
    b.addEventListener("click", () => {
      const i = Math.min(SIZES.length - 1, Math.max(0, cur() + Number(b.dataset.fs)));
      if (SIZES[i] === 100) { root.style.fontSize = ""; save("bylx:fs", null); }
      else { root.style.fontSize = `${SIZES[i]}%`; save("bylx:fs", String(SIZES[i])); }
      renderFs();
    });
  }
  renderFs();

  /* Língua: PT ⇄ EN; recarrega a página para traduzir tudo de uma vez */
  const lang = wrap.querySelector(".lang-toggle");
  lang.dataset.lang = currentLang();
  lang.addEventListener("click", () => setLang(currentLang() === "pt" ? "en" : "pt"));

  /* Interruptores simples: movimento e cursor */
  const PREFS = { motion: ["reduce", "bylx:motion"], cursor: ["native", "bylx:cursor"] };
  for (const b of wrap.querySelectorAll("[data-pref]")) {
    const [value, key] = PREFS[b.dataset.pref];
    const render = () => b.setAttribute("aria-pressed", String(root.dataset[b.dataset.pref] === value));
    b.addEventListener("click", () => {
      const on = root.dataset[b.dataset.pref] !== value;
      if (on) root.dataset[b.dataset.pref] = value; else delete root.dataset[b.dataset.pref];
      save(key, on ? value : null);
      render();
    });
    render();
  }
}
