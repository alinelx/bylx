# bylx.dev — Design System

> A pixel-art portfolio brand for **Aline** (`alinelx`), a software-engineering student & front-end developer in progress. Half cyber-café desktop, half nostalgic vacation diorama.

This design system captures the visual + content language of **bylx.dev** — Aline's personal portfolio site — so future agents (or Aline herself) can produce slides, mockups, prototypes, and additional pages that look like they belong to the same world.

---

## Sources

This system was reverse-engineered from the live portfolio repo. Explore the originals here:

- **GitHub:** [github.com/alinelx/bylx](https://github.com/alinelx/bylx) — landing page (HTML/CSS/JS, no framework)
- **Related public work:**
  - [alinelx/dark-28](https://github.com/alinelx/dark-28) — Lisbon Tram 28 dark-tourism web concept
  - [alinelx/bora-viajar](https://github.com/alinelx/bora-viajar) — AI travel-planner concept

If you have access to those repos you can dig deeper for additional motifs.

---

## What the product is

**bylx.dev** is a single-page portfolio that opens on a **diorama hero scene**: an isometric desk with a CRT monitor (a "Positivo" brand 90s/2000s Brazilian monitor) showing a Windows-9x-style desktop, surrounded by skyline silhouettes of **Rio de Janeiro** (Cristo Redentor, Pão de Açúcar, two morros) and **Lisbon** (Ponte 25 de Abril, Torre de Belém) framed by a hand-drawn iron-railing window. The desktop screen plays a tiny Japan-poster scene. A neon "info card" overlays the top-left with the headline, eyebrow, and CTA.

Everything is pixel-perfect, the cursor is replaced with a pixel pointer, and small props (an instax camera, a phone, an MP3 player) are interactive hotspots that open modals or play randomized lo-fi / city-pop / cyberpunk music.

It is **playful, personal, and unmistakably hand-crafted** — not a SaaS landing page, not a corporate developer site.

---

## Quick index

| File / folder                | What it holds                                                 |
|------------------------------|---------------------------------------------------------------|
| `README.md`                  | This document — context, content rules, visual rules, iconography |
| `SKILL.md`                   | Agent-Skill front-matter so this folder can be used as a Claude Code skill |
| `colors_and_type.css`        | Base + semantic CSS variables (colors, type, spacing, shadows, motion) |
| `assets/logo/`               | Wordmark in 6 variants (full color, single-color, no-`.dev`) |
| `assets/hero/`               | Full pixel-art prop library from the live hero diorama         |
| `assets/cursor/`             | Pixel cursor states (arrow, pointer, click)                    |
| `assets/particles/`          | Sakura petal sprites (4 variants)                              |
| `preview/`                   | Small HTML cards that populate the Design System tab           |
| `ui_kits/site/`              | UI kit recreating bylx.dev — components + interactive index    |
| `ui_kits/site/index.html`    | Live hi-fi rebuild of the homepage                             |

---

## Brand pillars

1. **Hand-crafted pixel-art world.** Every visible element is a pixel-art PNG, even props that could have been vector. Image rendering is forced `pixelated`. Type is bitmappy.
2. **Y2K cyber-café nostalgia.** CRT monitors, Win9x window chrome, MS-Paint frames, clackety mechanical keyboard, an MP3 player you click to spin lo-fi.
3. **Two cities, one diorama.** Rio + Lisbon skylines sit together — the artist's biography baked into the wall behind the desk. Japan poster on the monitor is the third pole (city-pop / synthwave music vocabulary).
4. **Built in public, in progress.** Copy openly says "in progress" — this is a learner's portfolio, owning that energy rather than faking seniority.

---

## CONTENT FUNDAMENTALS

### Voice & POV
- **First-person, casual but specific.** *"I'm Aline, a software engineering student building creative front-end projects with HTML, CSS, JavaScript and React."* Not *"We build…"*, not *"Aline is…"* — first-person `I`.
- Addresses the visitor implicitly, doesn't lecture. No `you`-as-customer constructions ("Get your dream portfolio today!"). The site speaks **about Aline** to **whoever walks in**.
- **Honest about stage.** The eyebrow literally says *"Front-end developer in progress"* — owning the student/learner identity is part of the brand, not hidden.
- **Playful, never ironic-distant.** The world is sincere — cocktails on the desk, sushi, an instax, a Brazilian monitor brand. Charm comes from specificity, not jokes.

### Casing & punctuation
- **Sentence case everywhere.** Headlines (*"Designing playful, useful web experiences"*), eyebrows (when not All Caps), buttons. No Title Case headers.
- **Eyebrows and tiny UI labels are UPPERCASE** because they're set in Press Start 2P, which only ships uppercase glyphs (lowercase reads as small caps).
- **Periods are optional** at the end of short headline phrases — eyebrows never get one, body sentences do.
- **Em dash is the favorite connector** — it matches the diorama's stitched-together vibe.
- **Curly quotes** are fine; the site is in English by default; Portuguese is welcome when authentic (project names like *bora viajar*).

### Vocabulary
- Lean into craft words: **playful, useful, creative, in progress, building**.
- Lean into tactile/era words: **pixel, retro, lo-fi, neon, cottagecore, vaporwave**.
- Avoid SaaS-marketing tropes: ❌ *"empower"*, *"unlock"*, *"seamless"*, *"reimagine"*, *"world-class"*, *"effortless"*.
- Avoid emoji as decoration in body copy. The site uses *images* for personality, not emoji.

### Headline patterns
- **Verb + adjective stack + noun.** *"Designing playful, useful web experiences."* (gerund + two soft adjectives + plural noun)
- **Eyebrow = role-in-progress.** *"FRONT-END DEVELOPER IN PROGRESS"*. *"DESIGNER LEARNING IN PUBLIC"*. Always present-tense.
- **CTA = imperative + plural noun.** *"VIEW PROJECTS"*, *"OPEN GALLERY"*, *"SAY HI"*. Two words, all caps (because Press Start 2P).

### Example copy bank
> Eyebrow: `FRONT-END DEVELOPER IN PROGRESS`
> H1: `Designing playful, useful web experiences`
> Body: `I'm Aline, a software engineering student building creative front-end projects with HTML, CSS, JavaScript and React.`
> CTA: `VIEW PROJECTS`

> Eyebrow: `NOW PLAYING`
> H3: `Lo-fi for late-night merges`

> Modal title (header bar, dark on cyan): `Gallery`

---

## VISUAL FOUNDATIONS

### Colors

| Token            | Hex        | Role                                                                 |
|------------------|------------|----------------------------------------------------------------------|
| `--bylx-bg`      | `#09051b`  | Deep night purple. Page background, modal scrim, ink on light cards. |
| `--bylx-bg-ink`  | `#1d1640`  | Secondary surface (sections, code blocks).                           |
| `--bylx-purple`  | `#5d3fd3`  | Iris violet — hero scene wash, large fills behind dioramas.          |
| `--bylx-pink`    | `#ff5dbb`  | Hot neon pink — primary accent, CTAs, drop-shadow.                   |
| `--bylx-cyan`    | `#59f3ff`  | Electric cyan — secondary accent, borders, eyebrow text, links.      |
| `--bylx-text`    | `#f7f2ff`  | Near-white with faint lavender tint — body text on dark.             |
| `--bylx-muted`   | `#d8d0ff`  | Dim lavender — secondary text.                                       |
| `--bylx-paper`   | `#fff8ff`  | Paper-white — input fields, light surfaces.                          |

**Rules of combination**
- The hero / above-the-fold lives in **purple wash** (`#5d3fd3`), the rest of the page lives in **deep night** (`#09051b`).
- Pink is **never** used as a large fill. It's the accent on borders, drop-shadows, CTA fills, and small flourishes.
- Cyan is the **default border + link + eyebrow** color. It's the system's "highlighter".
- Black is forbidden. The darkest legal color is `--bylx-bg`.
- Pure white is forbidden. Use `--bylx-text` or `--bylx-paper`.

### Type

- **Display + body: "Pixelify Sans"** (Google Fonts) — variable weight 400–700, has lowercase, used for everything that needs to read fluently.
- **Labels + UI + eyebrows: "Press Start 2P"** (Google Fonts) — uppercase-only bitmap font, used for tiny system-chrome labels, eyebrows, CTAs, kbd-style glyphs.
- **Never use Inter, Roboto, Arial, system-ui, or any sans-serif default.** If the pixel fonts fail, fall back to `system-ui` only as last resort.
- **Anti-aliasing is off** (`-webkit-font-smoothing: none`) on small UI text so the bitmap pixels stay crisp.

Scale (`colors_and_type.css`):

```
--fs-eyebrow:  0.7rem    Press Start 2P
--fs-caption:  0.85rem
--fs-body:     1.05rem
--fs-body-lg:  1.2rem
--fs-h3:       1.6rem
--fs-h2:       2.4rem
--fs-h1:       3.4rem
--fs-display:  5rem
```

Line heights are **tight** for headings (`0.96`) and **body-loose** for paragraphs (`1.16`). Letter-spacing is **0** everywhere — bitmap fonts already have their own kerning.

### Spacing

Base unit is **4px**. Tokens `--space-1` (4px) through `--space-8` (64px). Section padding is `var(--space-6)` to `var(--space-7)`.

### Backgrounds

- **No gradients** outside the hand-painted `gradient.png` skyline sheet.
- Hero uses a **layered diorama**: PNGs at distinct z-indexes (skyline → morros → buildings → wall → window-frame → table → props → CRT). Parallax slides the layers in opposite directions on pointer-move.
- Section backgrounds are flat `--bylx-bg`.
- For texture/atmosphere, use **sakura particle PNGs** falling slowly, or a **scanline filter** on screen-items.
- **No noise textures, no glassmorphism, no soft blurs**. The look is deliberately crisp + chunky.

### Hand-drawn / pixel rendering

Every raster asset is exported pixel-perfect and the page forces `image-rendering: pixelated`. **Never apply** `filter: blur()` or `border-radius: 8px` to a hero asset — it kills the bitmap fidelity.

### Animation

- **Stepped easing only.** `steps(2, end)`, `steps(3, end)`, `steps(4, end)`. Never `linear`, never `ease-in-out` for hero elements.
- **Continuous breathing loops.** Every prop has a `hero-float` animation with unique `--float-x`, `--float-y`, `--float-rotate`, and `--float-duration` (4–18s) so the whole diorama gently exhales out of phase.
- **Flickers, not fades.** Window pieces use `window-piece-flicker` (a 5.2s 2-step brightness pulse). The CTA uses `cta-blink` (color swap every 2.2s).
- **Cursor parallax.** Pointer position → `--move-x`/`--move-y` on layered elements, weighted by their `depth` (1–18). The scene tilts toward the mouse.
- **Modal opens are instant** (`display: none` → `block`) — no fade-in. Pixel software doesn't fade.

### Hover, press, focus

- **Hover (links, props):** `filter: brightness(1.16)`. Sometimes a 100ms `transform: translate(-1px, -1px)`.
- **Press:** `filter: brightness(0.96)` and/or `transform: scale(0.95)` on the cursor.
- **Hotspots** wrap an invisible expanded `::after` (8% padding-out) so the hit target is generous; a pink wash fills that ring on hover.
- **Focus:** `box-shadow: 0 0 0 3px rgba(89, 243, 255, 0.9)` — a chunky cyan ring. Never the OS default.

### Borders, shadows, "elevation"

- Borders are **2–7px solid**, never dashed/dotted, never radiused.
- Elevation is a **hard offset 8-bit shadow** — no blur. Pink, offset bottom-right.
  - `4px 4px 0 var(--bylx-pink)` — small chip
  - `7px 7px 0 var(--bylx-pink)` — info card
  - `9px 9px 0 var(--bylx-pink)` — modal at peak breathe
- **No `box-shadow: 0 4px 12px rgba(0,0,0,.1)`-style soft shadows anywhere.**

### Transparency & blur

- The hero info card sits on `rgba(9, 5, 27, 0.78)` over the diorama — a hard semi-transparent fill, **no backdrop-filter blur**.
- Modal scrim: `rgba(9, 5, 27, 0.76)`. Same — no blur.

### Corner radii

- **All corners are square (`border-radius: 0`).** The only exception is the focus ring (it's a `box-shadow`, not radius).

### Cards

A "card" in this system is a **chunky pixel box**:
- Fill: `var(--bylx-bg)` (dark) or `var(--bylx-paper)` (light)
- Border: `var(--stroke-2)` to `var(--stroke-3)` (4–7px) solid `var(--bylx-cyan)`
- Shadow: hard offset pink (`var(--shadow-chunk-md)`)
- Radius: `0`
- Padding: `var(--space-4)` to `var(--space-5)`

### Layout rules

- Hero is a fixed `aspect-ratio: 16 / 9` artboard, centered, **breathing** (`artboard-breathe`: -3px Y over 12s).
- Below the hero, sections are normal block flow with `clamp(1rem, 5vw, 5rem)` horizontal padding.
- Z-index goes from `1` (skyline) to `30` (info card) to `80000` (MP3 controls) to `90000` (modals). Use these bands.
- The custom cursor is `z-index: 99999`, `pointer-events: none`, swapped to OS cursor under 520px width.

### Imagery vibe

- **Warm desk, cool sky.** Foreground props (cocktail, sushi, cocktail-pink) lean warm; backgrounds and walls lean violet/cyan.
- Sakura, neon signs, CRT scanlines, MS-Paint-style overlays — anything that nods to **1995–2005 personal-computer aesthetics + Tokyo/Lisbon/Rio cottagecore**.
- **No stock photos. No 3D renders. No AI-generated art.** Every illustration is sprite-art-style.

---

## ICONOGRAPHY

bylx.dev does not use an icon font and does not use SVG icons. The whole system is **pixel-art PNGs**.

### Tech-logo icons (`assets/hero/`)

Small 16–32px desktop-style PNGs of common dev-tech logos, used as desktop shortcuts on the CRT:

`html_icon.png` · `css_icon.png` · `javascript_icon.png` · `typescript_icon.png` · `react_icon.png` · `node_icon.png` · `figma_icon.png` · `wordpress_icon.png`

Use these as-is for any "tech I work with" stamp/badge in mocks. Do **not** redraw them in SVG.

### Prop icons (`assets/hero/`)

The diorama's interactive props double as iconography for the actions they trigger:

- `instax.png` / `instax_spritesheet.png` → **gallery** (8-frame sprite, animates 700ms `steps(8, end)` on hover)
- `phone.png` → **contact** (shakes on hover via `phone-ring` keyframes)
- `mp3_player.png` → **music** (click to play random track)
- `mouse.png`, `keyboard_board.png`, `keyboard_keys.png` → desk furniture, decorative only
- `cocktail.png`, `sushi.png` → personal-touch decor, decorative only

### Cursor (`assets/cursor/`)

A custom hardware-pointer replacement:
- `arrow.png` — default
- `pointer.png` — over hoverables (`a, button, .clickable`)
- `click.png` — mouse-down state (also gets `transform: scale(0.95)`)

Activated by setting `cursor: none` globally and following the pointer with a 32×32 fixed-position `.cursor` div whose `background-image` swaps based on event listeners.

### Particles (`assets/particles/`)

Four sakura petal sprites used as falling particles for atmosphere. Drop these into a canvas/CSS-animated layer in front of the hero for seasonal moments.

### Emoji & unicode

**No emoji** in copy or UI. **No unicode pseudo-icons** (✓, ★, →, etc.). If you need a glyph, draw it as a pixel PNG and add it to `assets/hero/` (or use one of the existing ones).

### CDN fallback

If, while authoring a new screen, you find yourself wanting an icon that the bylx asset library does not have:
1. **First**, check `assets/hero/` for a thematic substitute (the toolbar PNG, the paint frame, etc.).
2. **Otherwise**, render the area as a labeled empty pixel box (4px cyan border, sentence-case label inside) — placeholder is better than off-brand iconography.
3. **Do not** import Lucide, Heroicons, Material, etc. They will look immediately wrong in this world.

---

## Font substitution note

**No font files were available in the source repo** — the live site loads both fonts from Google Fonts CDN:

- [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans) (weights 400–700)
- [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) (regular only)

`colors_and_type.css` re-imports them via `@import url(...)`. If you need them offline, download the TTFs from Google Fonts and drop them in a `fonts/` folder, then swap the `@import` for `@font-face` blocks. **Both fonts are licensed under the SIL Open Font License (OFL)** so they're safe to bundle.

---

## How to use this design system

1. **Link `colors_and_type.css`** in your `<head>` — it imports the fonts and sets up all CSS variables.
2. **Pick assets from `assets/`** — don't redraw them. Use `<img>` with `image-rendering: pixelated` (already set globally by the CSS).
3. **Follow the rules above** for tone, color, motion, borders.
4. **Check `preview/*.html`** for live specimens of every token.
5. **Check `ui_kits/site/`** for assembled components (info card, modal, mp3 controls, hero diorama, hotspot).

When in doubt, ask: *would this fit on Aline's desk?* If the answer is no, redesign it.
