/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
/* ᑲყᥣx theme — o interruptor AM/PM

   AM = light, PM = dark. Sem escolha guardada o site segue o sistema (o CSS
   lê prefers-color-scheme); escolher grava em localStorage e põe data-theme
   no <html>, que os seletores :root[data-theme] em tokens.css e windows.css
   respeitam. O <head> aplica a escolha guardada antes da primeira pintura. */

const KEY = "bylx:theme";
const system = matchMedia("(prefers-color-scheme: light)");

export const currentTheme = () =>
  document.documentElement.dataset.theme ?? (system.matches ? "light" : "dark");

export function initThemeToggle(onChange) {
  const btn = document.querySelector(".time-toggle");
  if (!btn) return;

  const render = () => {
    const t = currentTheme();
    btn.setAttribute("aria-pressed", String(t === "light"));
    btn.setAttribute("aria-label", t === "light" ? "Switch to PM (dark mode)" : "Switch to AM (light mode)");
    btn.dataset.mode = t;
  };

  btn.addEventListener("click", () => {
    const next = currentTheme() === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch { /* modo privado */ }
    render();
    onChange?.(next);
  });

  /* Sem escolha guardada, uma troca no sistema também mexe no interruptor */
  system.addEventListener("change", () => {
    if (document.documentElement.dataset.theme) return;
    render();
    onChange?.(currentTheme());
  });

  render();
}
