# bylx.dev — Design language

> A pixel-art portfolio for **Aline** (`alinelx`) — a front-end developer and
> designer built at the crossroads of Brazil and Portugal. Half
> desktop, half nostalgic y2k diorama.

## What the site is

A single-page portfolio that opens on a **diorama hero scene**: an isometric
desk with a CRT monitor showing a Windows-9x-style desktop, framed by a
hand-drawn iron-railing window. Outside it, skyline silhouettes of **Rio de
Janeiro** (Cristo Redentor, Pão de Açúcar, two hills) and **Lisbon** (Ponte 25
de Abril, Torre de Belém) sit together. The monitor plays a tiny Japan-poster
scene — the third pole of the aesthetic.

Everything is pixel-perfect, the cursor is replaced with a pixel pointer, and
small props are interactive:

- **Instax camera** → opens the gallery modal (8-frame sprite animates on hover)
- **Phone** → opens the contact modal (rings on hover)
- **MP3 player** → plays randomized lo-fi / city-pop / cyberpunk music
- **Desk mouse** → flees the real cursor when it gets close
- **Keyboard** → flares a colored underglow on every physical key press
- **Desktop tech icons** → click to open a small popover describing the stack
- **Sakura petals** → trail the cursor and burst on click

It is **playful, personal, and unmistakably hand-crafted** — not a SaaS landing
page, not a corporate developer site.

## Brand pillars

1. **Hand-crafted pixel-art world.** Every visible element is a pixel-art PNG.
   Image rendering is forced `pixelated`. Type is bitmappy.
2. **Y2K nostalgia.** CRT monitor, Win9x window chrome, MS-Paint
   frame, mechanical keyboard, an MP3 player you click to spin lo-fi.
3. **Two cities, one diorama.** Rio + Lisbon skylines share the wall behind the
   desk — the artist's biography baked into the scene.
4. **Built in public, owning the craft.** First-person, honest voice — a maker's
   portfolio, not faked seniority.

## Voice & copy

- **First person, sentence case.** *"I build web things that feel like places."*
  Not *"We build…"*, not Title Case headers.
- **Eyebrows and tiny UI labels are UPPERCASE** because they're set in Press
  Start 2P (uppercase-only glyphs).
- **Em dash is the favorite connector** — it matches the stitched-together vibe.
- Lean into craft + tactile words: *playful, useful, building, pixel, retro,
  lo-fi, neon*. Avoid SaaS tropes (*empower, unlock, seamless, world-class*).

## Color

Canonical tokens (in `styles.css :root`; short aliases like `--pink` map to the
`--bylx-*` originals):

| Token            | Hex       | Role                                                          |
|------------------|-----------|--------------------------------------------------------------|
| `--bylx-bg`      | `#09051b` | Deep night purple — page background, scrim, ink on light.    |
| `--bylx-bg-ink`  | `#1d1640` | Secondary surface (sections, code blocks).                   |
| `--bylx-purple`  | `#5d3fd3` | Iris violet — hero wash, large fills behind the diorama.     |
| `--bylx-pink`    | `#ff5dbb` | Hot neon pink — primary accent, CTAs, drop-shadow.           |
| `--bylx-cyan`    | `#59f3ff` | Electric cyan — borders, eyebrow text, links.                |
| `--bylx-text`    | `#f7f2ff` | Near-white, faint lavender — body text on dark.              |
| `--bylx-muted`   | `#d8d0ff` | Dim lavender — secondary text.                               |
| `--bylx-paper`   | `#fff8ff` | Paper-white — input fields, light surfaces.                  |

**Combination rules**

- Hero / above-the-fold lives in **purple wash**; the rest of the page lives in
  **deep night**.
- Pink is **never** a large fill — only accents, borders, drop-shadows, CTAs.
- Cyan is the **default border + link + eyebrow** color — the system highlighter.
- **Pure black (`#000`) and pure white (`#fff`) are forbidden.** Darkest legal
  color is `--bylx-bg`; lightest is `--bylx-text` / `--bylx-paper`.

## Type

- **Display + body: "Pixelify Sans"** (Google Fonts, weights 400–700, OFL).
- **Labels + UI + eyebrows: "Press Start 2P"** (Google Fonts, OFL) — uppercase
  bitmap font for tiny system-chrome labels, eyebrows, CTAs.
- **Never use Inter, Roboto, Arial, or system-ui for display copy.** `system-ui`
  is a last-resort fallback only.
- Anti-aliasing is off on small UI text so the bitmap pixels stay crisp.
- Headings are tight (`line-height` ~0.96), body is loose (~1.16). Letter
  spacing is **0** — bitmap fonts already carry their own kerning.

## Spacing, borders, shadows

- Base unit is **4px**. Use the `--space-1` (4px) … `--space-8` (64px) scale.
- Borders are **2–7px solid** (`--stroke-1/2/3`), never dashed, dotted, or
  radiused.
- **All corners are square (`border-radius: 0`).** The only exception is the
  cyan focus ring (a `box-shadow`, not a radius).
- Elevation is a **hard offset 8-bit shadow** — never blurred:
  - `--shadow-chunk-sm` `4px 4px 0` · `--shadow-chunk-md` `7px 7px 0`
  - `--shadow-chunk-lg` `9px 9px 0` · `--shadow-chunk-cyan` `6px 6px 0` cyan
- A soft luminous glow (`--glow-cyan`) is used **only** for focus rings and the
  keyboard keypress underglow.

## Motion

- **Stepped easing only** for the diorama: `steps(2/3/4, end)`. Never `linear`,
  never smooth bezier for hero elements.
- **Continuous breathing loops.** Every prop has a `hero-float` animation with
  unique `--float-x/-y/-rotate/-duration` so the scene gently exhales out of
  phase.
- **Cursor parallax.** Pointer position → `--move-x` / `--move-y` on layers,
  weighted by `depth`. The scene tilts toward the mouse.
- **Modal opens are instant** (`display: none → block`) — pixel software doesn't
  fade.
- Respect `prefers-reduced-motion`: parallax, sakura, marquee, and prop
  animations all stand down.

## Iconography

bylx.dev uses **no icon font and no SVG icons** — everything is pixel-art PNGs
in `assets/`.

- **Tech-logo icons** (`assets/hero/*_icon.png`): HTML, CSS, JavaScript,
  TypeScript, React, Node, Figma, WordPress. Use as-is; never redraw in SVG.
- **Prop icons** double as action affordances: `instax` → gallery,
  `phone` → contact, `mp3_player` → music.
- **Cursor** (`assets/cursor/`): `arrow` (default), `pointer` (hoverables),
  `click` (mouse-down). Driven by a fixed `.cursor` div, `cursor: none` global.
- **Particles** (`assets/particles/sakura{1..4}.png`): the cursor trail / burst.
- If you need a glyph the library lacks: first reach for a thematic substitute
  in `assets/hero/`, otherwise draw a labeled empty pixel box. **Never** import
  Lucide / Heroicons / Material — they read as immediately off-brand.


---

When in doubt, ask: *would this fit on Aline's desk?* If not, redesign it.
