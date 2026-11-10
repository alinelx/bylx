// ✧ bylx — build-sprites
// PNGs-fonte (assets/scene/src, desenhados na grade de 640x360) → assets/scene/sprites.json
// Cada sprite vira paleta + índices em RLE. O PNG continua a ser o ficheiro que se edita
// (Aseprite, Photoshop); a matriz é só o que o site carrega.
//
//   npm run sprites            gera
//   npm run sprites -- --check falha se sprites.json não corresponder aos PNGs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // fileURLToPath: no Windows, .pathname dava "/C:/…"
const DIR = path.join(ROOT, "assets/scene");
const SRC = path.join(DIR, "src");
const OUT = path.join(DIR, "sprites.json");

/* PNG mínimo: 8 bits por canal, sem entrelaçamento — RGBA, RGB, cinzento e indexado.
   É o que o Aseprite e o Photoshop exportam para arte de pixel. */
function readPng(file) {
  const buf = fs.readFileSync(file);
  let p = 8, w, h, depth, type, interlace, plte, trns;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), kind = buf.toString("ascii", p + 4, p + 8);
    const data = buf.subarray(p + 8, p + 8 + len);
    if (kind === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; type = data[9]; interlace = data[12]; }
    else if (kind === "PLTE") plte = data;
    else if (kind === "tRNS") trns = data;
    else if (kind === "IDAT") idat.push(data);
    p += 12 + len;
  }
  if (depth !== 8 || interlace) throw new Error(`${path.basename(file)}: só PNG de 8 bits sem entrelaçamento (veio ${depth} bits${interlace ? ", entrelaçado" : ""})`);
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[type];
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * ch, px = Buffer.alloc(stride * h), out = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? px[y * stride + x - ch] : 0, b = y ? px[(y - 1) * stride + x] : 0;
      const c = x >= ch && y ? px[(y - 1) * stride + x - ch] : 0;
      let v = row[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[y * stride + x] = v & 255;
    }
  }
  for (let i = 0; i < w * h; i++) {
    const s = i * ch, o = i * 4;
    if (type === 6) { out[o] = px[s]; out[o + 1] = px[s + 1]; out[o + 2] = px[s + 2]; out[o + 3] = px[s + 3]; }
    else if (type === 2) { out[o] = px[s]; out[o + 1] = px[s + 1]; out[o + 2] = px[s + 2]; out[o + 3] = 255; }
    else if (type === 0) { out[o] = out[o + 1] = out[o + 2] = px[s]; out[o + 3] = 255; }
    else if (type === 4) { out[o] = out[o + 1] = out[o + 2] = px[s]; out[o + 3] = px[s + 1]; }
    else { const k = px[s]; out[o] = plte[k * 3]; out[o + 1] = plte[k * 3 + 1]; out[o + 2] = plte[k * 3 + 2]; out[o + 3] = trns && k < trns.length ? trns[k] : 255; }
  }
  return { w, h, rgba: out };
}

const hex = (r, g, b, a) => "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("") + (a === 255 ? "" : a.toString(16).padStart(2, "0"));

/* Índice 0 é sempre transparente. Semitransparente (< 32) conta como transparente:
   arte de pixel não tem meia-sombra, e os vidros da janela (146, 209) ficam. */
function encode({ w, h, rgba }, erase = null) {
  const palette = [null], seen = new Map(), idx = new Uint16Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const a = rgba[i * 4 + 3];
    if (a < 32 && !erase?.[i]) continue;
    const key = erase?.[i] ? "#00000000" : hex(rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2], a);
    if (!seen.has(key)) { seen.set(key, palette.length); palette.push(key); }
    idx[i] = seen.get(key);
  }
  // Duas formas, fica a mais pequena: RLE (corridas de cor chapada) ou índices empacotados
  // a 1/2/4/8 bits (dither, onde as corridas têm 1 pixel e o RLE dobra o tamanho).
  const wide = palette.length > 256, rle = [];
  for (let i = 0; i < idx.length;) {
    let run = 1;
    while (run < 255 && i + run < idx.length && idx[i + run] === idx[i]) run++;
    rle.push(run);
    if (wide) rle.push(idx[i] >> 8);
    rle.push(idx[i] & 255);
    i += run;
  }
  const bits = [1, 2, 4, 8, 16].find(b => palette.length <= 2 ** b);
  const packed = Buffer.alloc(Math.ceil(idx.length * bits / 8));
  if (bits === 16) idx.forEach((v, i) => packed.writeUInt16BE(v, i * 2));
  else idx.forEach((v, i) => { const bit = i * bits; packed[bit >> 3] |= v << (8 - bits - (bit & 7)); });
  const base = { w, h, palette: palette.slice(1) };
  return packed.length < rle.length
    ? { ...base, bits, packed: packed.toString("base64") }
    : { ...base, wide, rle: Buffer.from(rle).toString("base64") };
}

const scene = JSON.parse(fs.readFileSync(path.join(DIR, "scene.json"), "utf8"));
const names = new Set();
for (const l of scene.layers) { names.add(l.name); for (const f of l.frames?.names ?? []) names.add(f); }
/* Peças simétricas. O PNG continua inteiro (é o que se edita); aqui escolhe-se a forma
   mais curta de o guardar, sem mudar um pixel:
     · espelho de outro sprite do mesmo tamanho  { mirrorOf, detail }
     · metade esquerda + o seu espelho            { half, detail }
   "detail" são só os pixels onde a reconstrução não bate com o desenho (e "#00000000" apaga). */
const op = (img, i) => img.rgba[i * 4 + 3] >= 32;
const same = (a, b, i) => op(a, i) === op(b, i) && (!op(a, i) || [0, 1, 2, 3].every(k => a.rgba[i * 4 + k] === b.rgba[i * 4 + k]));
function flipH(img) {
  const { w, h } = img, out = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) out.set(img.rgba.subarray((y * w + x) * 4, (y * w + x) * 4 + 4), (y * w + (w - 1 - x)) * 4);
  return { w, h, rgba: out };
}
function crop(img, cw) {
  const out = new Uint8Array(cw * img.h * 4);
  for (let y = 0; y < img.h; y++) out.set(img.rgba.subarray(y * img.w * 4, (y * img.w + cw) * 4), y * cw * 4);
  return { w: cw, h: img.h, rgba: out };
}
function mirrorHalf(img) {
  const { w, h } = img, hw = Math.ceil(w / 2), out = new Uint8Array(img.rgba);
  for (let y = 0; y < h; y++) for (let x = hw; x < w; x++) out.set(img.rgba.subarray((y * w + (w - 1 - x)) * 4, (y * w + (w - 1 - x)) * 4 + 4), (y * w + x) * 4);
  return { w, h, rgba: out };
}
function detail(img, recon) {
  const n = img.w * img.h, d = new Uint8Array(n * 4), erase = new Uint8Array(n);
  let count = 0;
  for (let i = 0; i < n; i++) if (!same(img, recon, i)) {
    count++;
    if (op(img, i)) d.set(img.rgba.subarray(i * 4, i * 4 + 4), i * 4); else erase[i] = 1;
  }
  return { enc: encode({ w: img.w, h: img.h, rgba: d }, erase), count };
}
const size = o => JSON.stringify(o).length;
const imgs = {}, sprites = {}, tiles = [];
for (const n of [...names].sort()) {
  const file = path.join(SRC, `${n}.png`);
  if (!fs.existsSync(file)) throw new Error(`falta assets/scene/src/${n}.png (citado em scene.json)`);
  const img = imgs[n] = readPng(file);
  let best = encode(img), how = null;
  for (const [m, other] of Object.entries(imgs)) {
    if (m === n || other.w !== img.w || other.h !== img.h || sprites[m].mirrorOf) continue;
    const { enc, count } = detail(img, flipH(other));
    const cand = { w: img.w, h: img.h, mirrorOf: m, detail: enc };
    if (size(cand) < size(best)) { best = cand; how = `espelho de ${m} (${count} px de detalhe)`; }
  }
  const hw = Math.ceil(img.w / 2), { enc, count } = detail(img, mirrorHalf(img));
  const half = { w: img.w, h: img.h, half: encode(crop(img, hw)), detail: enc };
  if (size(half) < size(best)) { best = half; how = `metade + espelho (${count} px de detalhe)`; }
  if (how) tiles.push(`${n}: ${how}, ${(100 - size(best) / size(encode(img)) * 100).toFixed(0)}% menor`);
  sprites[n] = best;
}
for (const t of tiles) console.log("  ⇋ " + t);
/* Paleta (assets/scene/palette.json): os sprites desenham-se em níveis de cinza — a referência.
   Cada tema (dark, light) é um mapa cinza → cor com a mesma luminosidade. Avisa, sem falhar,
   de cinzentos fora da lista: um nível novo é uma decisão, mas tem de ganhar cor nos temas. */
const masterFile = path.join(DIR, "palette.json");
const themes = {};
if (fs.existsSync(masterFile)) {
  const palJson = JSON.parse(fs.readFileSync(masterFile, "utf8")), levels = palJson.levels;
  const known = new Set(levels.map(l => l.grey));
  /* Temas finais: 7 cores. Cada cinza de referência (ou cinza antigo) cai num de 7 grupos;
     dark = roxo → rosa, light = azul → ciano → verde-água com mais contraste. */
  const V = palJson.variants ?? {};
  for (const [t, v] of [["dark", V["dark-7"]], ["light", V["light-contraste-7"]]])
    if (v) themes[t] = Object.fromEntries(Object.entries(v.groups).map(([g, i]) => [g, v.colours[i]]));
  for (const [n, s] of Object.entries(sprites)) {
    const pals = [s.palette, s.half?.palette, s.detail?.palette].filter(Boolean).flat().filter(h => h !== "#00000000");
    const out = [...new Set(pals)].filter(h => !known.has(h.slice(0, 7)));
    if (out.length) console.warn(`aviso: ${n} usa ${out.length} cinzento(s) fora da paleta: ${out.slice(0, 6).join(" ")}${out.length > 6 ? " …" : ""}`);
  }
}
const json = JSON.stringify({ ...scene, themes, sprites });

/* O edge da Hostinger guarda ficheiros pelo URL (ver CLAUDE.md § Cache): o
   index.html leva o sprites.json com o hash do próprio conteúdo. */
const INDEX = path.join(DIR, "..", "..", "index.html");
const hash = (await import("node:crypto")).createHash("sha256").update(json).digest("hex").slice(0, 8);
const srcAttr = `data-scene-src="assets/scene/sprites.json?v=${hash}"`;
const indexHtml = fs.existsSync(INDEX) ? fs.readFileSync(INDEX, "utf8") : null;
const stampedIndex = indexHtml?.replace(/data-scene-src="assets\/scene\/sprites\.json(\?v=[0-9a-f]+)?"/, srcAttr);

if (process.argv.includes("--check")) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (cur !== json) { console.error("sprites.json está desactualizado: corre `npm run sprites`"); process.exit(1); }
  if (indexHtml && stampedIndex !== indexHtml) { console.error("index.html aponta para um sprites.json antigo: corre `npm run sprites`"); process.exit(1); }
  console.log("sprites.json em dia");
} else {
  fs.writeFileSync(OUT, json);
  if (indexHtml && stampedIndex !== indexHtml) fs.writeFileSync(INDEX, stampedIndex);
  const colours = Object.values(sprites).reduce((s, x) => s + (x.palette ?? x.half?.palette ?? []).length + (x.detail?.palette.length ?? 0), 0);
  console.log(`${Object.keys(sprites).length} sprites, ${colours} cores em paletas, ${(json.length / 1024).toFixed(1)} KB → assets/scene/sprites.json`);
}
