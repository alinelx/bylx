/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
   ᑲყᥣx scene canvas
   A cena inteira numa grade de 640x360, desenhada num <canvas> e ampliada por
   número inteiro de pixels de DISPOSITIVO (×2, ×3, ×4…): nunca há sprite
   reamostrado. O que sobra do ecrã à volta da grade é cena desenhada para lá da
   prancheta (paredes) ou a cor de fundo — nunca esticamento.

   Os sprites chegam como paleta + índices (assets/scene/sprites.json, gerado
   por scripts/build-sprites.mjs a partir dos PNGs em assets/scene/src). Trocar
   a paleta é redesenhar a cena noutra luz sem tocar num pixel do desenho.

   As hotspots continuam a ser <button> HTML por cima do canvas: teclado, foco e
   leitor de ecrã não sabem que o desenho mudou de técnica.
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */

import { prefersReducedMotion } from "./utils.js?v=8d96f237";

/* O contorno de "seleccionado" dos jogos: ciano no dark, rosa no light */
const OUTLINE = { dark: "#59f3ff", light: "#ff5dbb" };

function b64(s) {
  const bin = atob(s), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function parseHex(h) {
  return [1, 3, 5, 7].map(i => (i < h.length ? parseInt(h.slice(i, i + 2), 16) : 255));
}

/* Índices → Uint16Array (0 = transparente). Uma vez por sprite; trocar de paleta
   reaproveita os índices. */
function decodeIndices(s) {
  const n = s.w * s.h, idx = new Uint16Array(n);
  if (s.packed) {
    const b = b64(s.packed), bits = s.bits;
    if (bits === 16) for (let i = 0; i < n; i++) idx[i] = (b[i * 2] << 8) | b[i * 2 + 1];
    else for (let i = 0; i < n; i++) {
      const bit = i * bits;
      idx[i] = (b[bit >> 3] >> (8 - bits - (bit & 7))) & ((1 << bits) - 1);
    }
  } else {
    const b = b64(s.rle);
    for (let p = 0, i = 0; p < b.length;) {
      const run = b[p++], v = s.wide ? (b[p++] << 8) | b[p++] : b[p++];
      idx.fill(v, i, i + run); i += run;
    }
  }
  return idx;
}

/* Sprite → RGBA. Peças simétricas chegam como espelho de outra ou metade + espelho,
   mais os pixels de "detail" que as tornam exactas (o build garante que batem com o PNG). */
function toRGBA(s, sprites, mapColour) {
  const out = new Uint8ClampedArray(s.w * s.h * 4);
  const put = (src, map) => {
    const idx = decodeIndices(src), pal = [null, ...src.palette.map(h => parseHex(h === "#00000000" || !mapColour ? h : mapColour(h)))];
    for (let i = 0; i < idx.length; i++) if (idx[i]) map(i, pal[idx[i]]);
  };
  if (s.mirrorOf || s.half) {
    const base = s.mirrorOf ? toRGBA(sprites[s.mirrorOf], sprites, mapColour) : null;
    if (base) for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++)
      out.set(base.subarray((y * s.w + (s.w - 1 - x)) * 4, (y * s.w + (s.w - 1 - x)) * 4 + 4), (y * s.w + x) * 4);
    if (s.half) {
      const hw = s.half.w;
      put(s.half, (i, c) => {
        const y = Math.floor(i / hw), x = i % hw;
        out.set(c, (y * s.w + x) * 4);
        if (s.w - 1 - x >= hw) out.set(c, (y * s.w + (s.w - 1 - x)) * 4);
      });
    }
    put(s.detail, (i, c) => out.set(c, i * 4));
  } else put(s, (i, c) => out.set(c, i * 4));
  return out;
}

function paint(s, rgba) {
  const c = document.createElement("canvas");
  c.width = s.w; c.height = s.h;
  const ctx = c.getContext("2d");
  ctx.putImageData(new ImageData(rgba, s.w, s.h), 0, 0);
  return c;
}

/* Espelha um sprite já pintado: "h" horizontal, "v" vertical, "hv" os dois. */
function flip(src, how) {
  const c = document.createElement("canvas");
  c.width = src.width; c.height = src.height;
  const ctx = c.getContext("2d"), h = how.includes("h"), v = how.includes("v");
  ctx.setTransform(h ? -1 : 1, 0, 0, v ? -1 : 1, h ? c.width : 0, v ? c.height : 0);
  ctx.drawImage(src, 0, 0);
  return c;
}

/* Contorno de 1px por fora da arte: o "está seleccionado" de um menu de jogo. */
function outline(s, rgba, colour = OUTLINE.dark) {
  const c = document.createElement("canvas");
  c.width = s.w + 2; c.height = s.h + 2;
  const ctx = c.getContext("2d"), img = ctx.createImageData(c.width, c.height);
  const [r, g, b] = parseHex(colour);
  const on = (x, y) => x >= 0 && y >= 0 && x < s.w && y < s.h && rgba[(y * s.w + x) * 4 + 3] > 0;
  for (let y = -1; y <= s.h; y++) for (let x = -1; x <= s.w; x++) {
    if (on(x, y)) continue;
    if (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1)) img.data.set([r, g, b, 255], ((y + 1) * c.width + x + 1) * 4);
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/* Opções:
   anchors  — elementos que já existem na página (botões com os seus listeners) e que
              o motor só posiciona por cima da cena: { el, layer } ocupa a caixa do
              sprite, { el, rect: [x, y, w, h] } um rectângulo da grade. Com layer,
              o sprite ganha o contorno de hover quando o botão tem foco ou o rato.
   hotspots — false para não criar botões a partir do scene.json (o site usa anchors).
   focus    — [x, y, w, h] da grade que tem de caber num ecrã estreito: em vez de
              encolher a cena inteira até 1×, amplia até esta caixa caber e corta o resto.
   onScene  — chamada depois de cada pintura/medida com { u, ox, layer(name), image(name) }:
              u = 1 pixel da grade em px CSS. O site usa-a para continuar as paredes.
   intro    — [[prefixos], …]: na abertura, cada grupo de camadas sobe para o lugar
              em degraus de pixel, um grupo atrás do outro (um só momento coreografado).
   blink    — [{ rect: [x,y,w,h], levels: [i, j], ms }]: um ponto que alterna entre
              dois níveis da rampa do tema (o LED do monitor). Sem reduced-motion.
   cropTop  — quantos pixels de céu (topo da grade) se podem cortar para ganhar escala.
   theme    — "dark" | "light" | "grey"; sem tema, segue o sistema e acompanha a troca. */
export async function initSceneCanvas(root, { src = "/assets/scene/sprites.json", onOpen, theme, anchors = [], hotspots = true, focus = null, cropTop = 0, onScene, intro = null, blink = [] } = {}) {
  const data = await (await fetch(src)).json();
  const [BW, BH] = data.base;
  const reduced = prefersReducedMotion();

  const canvas = document.createElement("canvas");
  canvas.className = "scene-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const hotLayer = document.createElement("div");
  hotLayer.className = "scene-hotspots";
  root.append(canvas, hotLayer);
  const ctx = canvas.getContext("2d");

  const outlines = {};
  let images = {};
  /* Os sprites estão em cinza (a referência); o tema é um mapa cinza → cor com a mesma
     luminosidade. "grey" mostra a referência sem cor. */
  /* reduce: mapa opcional cinza → cinza aplicado antes do tema (ex.: teste com 8 níveis). */
  let reduce = null;
  const themeMap = name => {
    const t = data.themes?.[name], r = reduce;
    if (!t && !r) return null;
    return h => { const g = r?.[h.slice(0, 7)] ?? h.slice(0, 7); return (t ? t[g] ?? g : g) + h.slice(7); };
  };
  const scheme = matchMedia("(prefers-color-scheme: light)");
  let themeName = theme ?? (scheme.matches ? "light" : "dark");
  let mapColour = themeMap(themeName);
  /* Camadas podem pedir um espelho por tema (scene.json → layer.flip = { light: "hv" }):
     no light, os degradês da parede e do skyline invertem de sentido. */
  const flips = Object.fromEntries((data.layers ?? []).filter(l => l.flip).map(l => [l.name, l.flip]));
  /* Uma variante "light-claro" herda as regras de "light". */
  const family = () => themeName?.split("-")[0];
  const flipFor = n => flips[n]?.[themeName] ?? flips[n]?.[family()];
  /* Camadas com layer.invert = ["light"] pintam-se com a rampa do tema ao contrário:
     o tom mais escuro vira o mais claro. No light, os degradês (paredes, céu) e o
     fundo passam a claros sem redesenhar nada — o cinza continua a referência. */
  const inverts = Object.fromEntries((data.layers ?? []).filter(l => l.invert).map(l => [l.name, l.invert]));
  const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const invertedMap = () => {
    const t = data.themes?.[themeName];
    if (!t) return mapColour;
    const ramp = [...new Set(Object.values(t))].sort((a, b) => lum(a) - lum(b));
    return h => { const c = mapColour(h); const i = ramp.indexOf(c.slice(0, 7)); return i < 0 ? c : ramp[ramp.length - 1 - i] + c.slice(7); };
  };
  const invertedFor = n => inverts[n]?.includes(themeName) || inverts[n]?.includes(family());
  const repaint = () => {
    images = {};
    const inv = invertedMap();
    for (const [n, s] of Object.entries(data.sprites)) {
      const img = paint(s, toRGBA(s, data.sprites, invertedFor(n) ? inv : mapColour)), how = flipFor(n);
      images[n] = how ? flip(img, how) : img;
    }
  };
  repaint();

  const notify = () => onScene?.({
    u: state.k / (state.dpr || 1), ox: state.ox, oy: state.oy, base: data.base, theme: themeName,
    layer: n => data.layers.find(l => l.name === n), image: n => images[n],
  });
  const outlineCache = {};
  const outlineFor = n => {
    const colour = OUTLINE[family()] ?? OUTLINE.dark, key = n + colour;
    return outlineCache[key] ??= outline(data.sprites[n], toRGBA(data.sprites[n], data.sprites, null), colour);
  };

  const state = { k: 1, cw: BW, ch: BH, ox: 0, oy: 0, px: 0, py: 0, hover: null, frame: 0, playing: null };

  /* Hotspots */
  const hot = hotspots ? data.layers.filter(l => l.hotspot) : [];
  for (const l of hot) {
    const s = data.sprites[l.name];
    outlines[l.name] = true;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `scene-hotspot hotspot-${l.name}`;
    btn.setAttribute("aria-label", l.hotspot.label);
    if (l.hotspot.modal) btn.dataset.modalTarget = l.hotspot.modal;
    const enter = () => { state.hover = l.name; if (l.frames && !reduced) play(l); draw(); };
    const leave = () => { if (state.hover === l.name) state.hover = null; stop(); draw(); };
    btn.addEventListener("pointerenter", enter);
    btn.addEventListener("focus", enter);
    btn.addEventListener("pointerleave", () => { if (document.activeElement !== btn) leave(); });
    btn.addEventListener("blur", leave);
    btn.addEventListener("click", () => onOpen?.(l, btn));
    l.button = btn;
    hotLayer.append(btn);
  }

  /* Âncoras: botões da página colocados sobre a cena */
  const byName = Object.fromEntries(data.layers.map(l => [l.name, l]));
  for (const a of anchors) {
    if (!a.el) continue;
    const l = a.layer && byName[a.layer];
    if (l) {
      const s = data.sprites[l.name];
      outlines[l.name] = true;
      a.rect = [l.x, l.y, s.w, s.h];
      const on = () => { state.hover = l.name; draw(); };
      const off = () => { if (state.hover === l.name) { state.hover = null; draw(); } };
      a.el.addEventListener("pointerenter", on);
      a.el.addEventListener("focus", on);
      a.el.addEventListener("pointerleave", () => { if (document.activeElement !== a.el) off(); });
      a.el.addEventListener("blur", off);
    }
    a.el.classList.add("scene-anchor");
    hotLayer.append(a.el);
  }

  /* Animação por quadros — steps puros, como o resto do site */
  let timer = 0;
  function play(l) {
    stop();
    state.playing = l.name; state.frame = 0;
    timer = setInterval(() => { state.frame = (state.frame + 1) % l.frames.names.length; draw(); }, l.frames.ms);
  }
  function stop() { clearInterval(timer); state.playing = null; }

  /* Escala: o maior inteiro em pixels de dispositivo que ainda mostra a grade
     toda; o canvas cobre o resto do ecrã com cena a mais, não com esticamento. */
  function layout() {
    const dpr = window.devicePixelRatio || 1;
    const rw = root.clientWidth, rh = root.clientHeight;
    const dw = Math.round(rw * dpr), dh = Math.round(rh * dpr);
    /* A largura manda; na altura pode perder-se até cropTop pixels de céu (a cena
       assenta no fundo), para um portátil de 768px não cair para 1×. */
    const kw = Math.floor(dw / BW);
    let k = Math.max(1, Math.min(kw, Math.floor(dh / (BH - cropTop))));
    /* 1× numa janela larga mas baixa (1568×718) é a cena em miniatura: aí aceita-se
       cortar até 60px de céu para ficar a 2×. */
    if (k === 1 && kw >= 2 && dh >= 2 * (BH - 60)) k = 2;
    let cx = BW / 2;
    if (focus && kw <= 1) {
      const kf = Math.max(1, Math.min(Math.floor(dw / focus[2]), Math.floor(dh / focus[3])));
      if (kf > k) { k = kf; cx = focus[0] + focus[2] / 2; } // telemóvel: amplia até a caixa de foco caber
    }
    const cw = Math.ceil(dw / k), ch = Math.ceil(dh / k);
    Object.assign(state, { k, cw, ch, ox: Math.floor(cw / 2 - cx), oy: Math.min(0, ch - BH), dpr });
    /* Alinhada ao topo; só quando o ecrã é mais baixo que a cena é que corta o
       céu em vez da mesa — os objectos clicáveis nunca ficam abaixo da dobra. */
    canvas.width = cw; canvas.height = ch;
    canvas.style.width = `${(cw * k) / dpr}px`;
    canvas.style.height = `${(ch * k) / dpr}px`;
    const u = k / dpr; // 1 pixel da grade em px CSS
    for (const l of hot) {
      const s = data.sprites[l.name];
      Object.assign(l.button.style, {
        left: `${(state.ox + l.x) * u}px`, top: `${(state.oy + l.y) * u}px`,
        width: `${s.w * u}px`, height: `${s.h * u}px`,
      });
    }
    for (const a of anchors) {
      if (!a.el || !a.rect) continue;
      const [x, y, w, h] = a.rect;
      Object.assign(a.el.style, { left: `${(state.ox + x) * u}px`, top: `${(state.oy + y) * u}px`, width: `${w * u}px`, height: `${h * u}px` });
    }
    root.style.setProperty("--scene-unit", `${u}px`);
    notify();
    draw();
  }

  /* ---- Abertura: os grupos sobem 8px em 4 degraus, 110ms entre grupos ---- */
  const groupOf = n => intro ? intro.findIndex(g => g.some(p => n.startsWith(p))) : -1;
  const t0 = performance.now();
  const INTRO_STEP = 70, INTRO_STEPS = 4, INTRO_GAP = 110, INTRO_RISE = 8;
  const introEnd = intro && !reduced ? (intro.length - 1) * INTRO_GAP + INTRO_STEP * INTRO_STEPS : 0;
  const introOffset = n => {
    if (!introEnd) return 0;
    const g = groupOf(n); if (g < 0) return 0;
    const t = performance.now() - t0 - g * INTRO_GAP;
    if (t < 0) return null; // ainda não entrou
    const step = Math.min(INTRO_STEPS, Math.floor(t / INTRO_STEP));
    return Math.round(INTRO_RISE * (1 - step / INTRO_STEPS));
  };
  const ramp = () => {
    const t = data.themes?.[themeName];
    return t ? [...new Set(Object.values(t))].sort((a, b) => lum(a) - lum(b)) : [];
  };

  function draw() {
    ctx.imageSmoothingEnabled = false;
    /* O fundo também troca de luz; data.backgroundInvert = ["light"] inverte-o como as camadas */
    /* backgroundColor = { tema: cor }: o fundo é o mesmo do site (tokens.css --surface) */
    const bgMap = data.backgroundInvert?.includes(themeName) ? invertedMap() : mapColour;
    ctx.fillStyle = data.backgroundColor?.[themeName] ?? (bgMap ? bgMap(data.background) : data.background);
    /* O fundo só vai até ao fim da mesa: daí para baixo o canvas fica
       transparente e vê-se o fundo da página (as paredes que continuam) */
    ctx.clearRect(0, 0, state.cw, state.ch);
    ctx.fillRect(0, 0, state.cw, Math.min(state.ch, state.oy + BH));
    for (const l of data.layers) {
      if (l.themes && !l.themes.includes(themeName) && !l.themes.includes(family())) continue; // camada só de alguns temas
      const d = l.parallax ? l.parallax : 0;
      const rise = introOffset(l.name);
      if (rise === null) continue;
      const x = state.ox + l.x + Math.round(state.px * d), y = state.oy + l.y + Math.round(state.py * d) + rise;
      if (l.frames && state.playing === l.name) {
        ctx.drawImage(images[l.frames.names[state.frame]], state.ox + l.frames.x, state.oy + l.frames.y);
        continue;
      }
      if (state.hover === l.name && outlines[l.name]) ctx.drawImage(outlineFor(l.name), x - 1, y - 1);
      ctx.drawImage(images[l.name], x, y);
    }
    /* LEDs: alternam entre dois níveis da rampa do tema */
    if (blink.length && !reduced) {
      const r = ramp(), now = performance.now();
      for (const b of blink) {
        const on = Math.floor(now / b.ms) % 2 === 0;
        ctx.fillStyle = r[on ? b.levels[0] : b.levels[1]] ?? "#fff";
        ctx.fillRect(state.ox + b.rect[0], state.oy + b.rect[1], b.rect[2], b.rect[3]);
      }
    }
  }

  /* Um só ciclo de animação: corre a abertura até ao fim e depois só redesenha
     quando um LED muda de estado */
  if (!reduced && (introEnd || blink.length)) {
    let lastTick = -1;
    const tick = () => {
      const t = performance.now() - t0;
      const ledTick = blink.length ? Math.floor(performance.now() / Math.min(...blink.map(b => b.ms))) : 0;
      if (t <= introEnd + INTRO_STEP || ledTick !== lastTick) { lastTick = ledTick; draw(); }
      if (t > introEnd + INTRO_STEP && !root.dataset.sceneReady) root.dataset.sceneReady = "1";
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  } else root.dataset.sceneReady = "1";

  /* Paralaxe: só o fundo (como no site), e em passos de pixel inteiro da grade */
  if (!reduced) {
    root.addEventListener("pointermove", e => {
      const r = root.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      const px = -nx, py = -ny * 0.5;
      if (Math.round(px * 3) !== Math.round(state.px * 3) || Math.round(py * 3) !== Math.round(state.py * 3)) {
        state.px = px; state.py = py; draw();
      }
    });
  }

  if (!theme) scheme.addEventListener("change", () => { themeName = scheme.matches ? "light" : "dark"; mapColour = themeMap(themeName); root.dataset.sceneTheme = themeName; repaint(); draw(); notify(); });
  root.dataset.sceneTheme = themeName;

  new ResizeObserver(layout).observe(root);
  matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener("change", layout, { once: true });
  layout();

  return {
    get scale() { return state.k; },
    /* mapColour(hex) → hex: a mesma cena noutra luz (dia/noite, tema claro) */
    setPalette(fn) { themeName = null; mapColour = fn; repaint(); draw(); },
    setTheme(name) { themeName = name; root.dataset.sceneTheme = name; mapColour = themeMap(name); repaint(); draw(); notify(); },
    /* setLevels("reduce8") liga o teste de 8 níveis; setLevels(null) volta aos 31. */
    setLevels(name) { reduce = name ? data.themes?.[name] ?? null : null; mapColour = themeMap(themeName); repaint(); draw(); },
    /* Troca o desenho de um sprite sem recarregar: para comparar versões */
    swapSprite(name, sprite) {
      data.sprites[name] = sprite;
      const img = paint(sprite, toRGBA(sprite, data.sprites, mapColour)), how = flipFor(name);
      images[name] = how ? flip(img, how) : img;
      for (const key of Object.keys(outlineCache)) if (key.startsWith(name + "#")) delete outlineCache[key];
      draw();
    },
    redraw: draw,
  };
}
