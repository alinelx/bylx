/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
/* ᑲყᥣx themed-img — pinta uma imagem com as 7 cores do modo, como a cena

   Para imagens fora do canvas que aparecem grandes (o leitor de MP3): cada
   pixel vai para o nível de cinza de referência com a luminosidade mais
   próxima, e o nível para a cor do tema. É o mesmo mapa que a cena usa
   (assets/scene/palette.json → variants dark-7 / light-contraste-7). */

const LEVELS_L = [3, 26, 39, 64, 71, 84, 97]; // L* dos cinzas #0b0b0b … #f5f5f5
const THEMES = {
  dark: ["#09051b", "#5c05a6", "#9319c8", "#ee5afc", "#fe7ee2", "#ffbedd", "#f7f2ff"],
  light: ["#09051b", "#04468d", "#0a7194", "#18c1cd", "#02dbc4", "#b3fed6", "#f7f2ff"],
};

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lstar = (r, g, b) => {
  const y = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return y > 0.008856 ? 116 * Math.cbrt(y) - 16 : 903.3 * y;
};

const originals = new WeakMap();

function paint(img, theme) {
  const src = originals.get(img);
  const c = document.createElement("canvas");
  c.width = src.naturalWidth; c.height = src.naturalHeight;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(src, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const pal = THEMES[theme].map(hex);
  const cache = new Map();
  for (let i = 0; i < d.data.length; i += 4) {
    if (d.data[i + 3] === 0) continue;
    const key = (d.data[i] << 16) | (d.data[i + 1] << 8) | d.data[i + 2];
    let col = cache.get(key);
    if (!col) {
      const L = lstar(d.data[i], d.data[i + 1], d.data[i + 2]);
      let k = 0;
      for (let j = 1; j < LEVELS_L.length; j++) if (Math.abs(LEVELS_L[j] - L) < Math.abs(LEVELS_L[k] - L)) k = j;
      col = pal[k]; cache.set(key, col);
    }
    d.data[i] = col[0]; d.data[i + 1] = col[1]; d.data[i + 2] = col[2]; d.data[i + 3] = 255;
  }
  ctx.putImageData(d, 0, 0);
  img.src = c.toDataURL();
}

/* themeImages(theme): pinta (ou volta a pintar) todas as img[data-themed] */
export function themeImages(theme) {
  for (const img of document.querySelectorAll("img[data-themed]")) {
    const run = () => paint(img, theme);
    if (originals.has(img)) { run(); continue; }
    const src = new Image();
    src.onload = () => { originals.set(img, src); run(); };
    src.src = img.currentSrc || img.src;
  }
}
