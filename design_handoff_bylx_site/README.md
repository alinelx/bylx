# Handoff: bylx.dev Design System → `alinelx/bylx`

This package contains the **bylx Design System** built in the design tool, ready to drop into the [`alinelx/bylx`](https://github.com/alinelx/bylx) GitHub repo (or any other project that needs the bylx visual language).

The whole thing is also packaged as a **Claude Code Agent Skill** — drop `bylx-design/` into your `.claude/skills/` folder and the `bylx-design` skill becomes available for design tasks.

---

## About the files in this bundle

The files in `bylx-design/` are **design references** built in HTML/CSS/React (Babel-in-the-browser). They are **not production code** — they're a high-fidelity, pixel-perfect prototype of the bylx.dev visual language, plus the foundational tokens (colors, type, spacing, motion).

When implementing in the target codebase (the `alinelx/bylx` portfolio site, which is **vanilla HTML / CSS / JS — no framework**), recreate the designs **using the existing project's patterns**, not by copy-pasting React JSX. Most of the JSX components map 1:1 to small chunks of vanilla DOM you can paste back into the live site.

**Fidelity:** ⭐ High-fidelity (hi-fi). Colors, typography, spacing, shadows, animations, and interaction states are all final and pixel-accurate. Recreate the UI **exactly** as shown.

---

## What's inside `bylx-design/`

```
bylx-design/
├── SKILL.md                 ← Agent Skill front-matter (Claude Code)
├── README.md                ← Full design system docs (read first!)
├── colors_and_type.css      ← All CSS variables (colors, type, spacing, motion)
├── assets/                  ← 51 pixel-art PNGs: logos, hero props, cursor, particles
│   ├── logo/                ← 6 wordmark variants
│   ├── hero/                ← Diorama props, CRT, keyboard, sky, skyline, etc.
│   ├── cursor/              ← Pixel cursor states (arrow / pointer / click)
│   └── particles/           ← Sakura petal sprites
├── preview/                 ← 23 small HTML specimen cards for each token group
└── ui_kits/site/            ← React/JSX recreation of bylx.dev (the UI kit)
    ├── index.html           ← Full assembled page
    ├── App.jsx              ← Orchestrator
    ├── HeroDiorama.jsx      ← Layered pixel scene (parallax, fleeing mouse, etc.)
    ├── InfoCard.jsx         ← Eyebrow + H1 + body + CTA panel
    ├── Modal.jsx            ← Cyan-headed pixel modal
    ├── ContactForm.jsx      ← Paper inputs
    ├── Mp3Player.jsx        ← Expanded image-mapped MP3 player + real audio
    ├── PixelCursor.jsx      ← Custom 32×32 cursor states
    ├── SakuraCursor.jsx     ← Sakura petal cursor trail + click burst
    ├── Button.jsx           ← Press Start 2P CTA in 4 variants
    ├── hero-diorama.css     ← Hero positioning + animations
    ├── mp3-player.css       ← Expanded MP3 + image-map hotspots
    └── sakura-cursor.css    ← Cursor trail keyframes
```

---

## How to drop this into `alinelx/bylx`

### Option A — install as a Claude Code skill (recommended)

```bash
cd /path/to/your/checkout/of/alinelx-bylx
mkdir -p .claude/skills
cp -R /path/to/this/handoff/bylx-design ./.claude/skills/
git add .claude/skills/bylx-design
git commit -m "design: add bylx-design system as a Claude Code skill"
git push
```

Then in Claude Code: invoke the `bylx-design` skill and ask it to ship work using the system.

### Option B — copy the design system files into the repo root

The live site already has `assets/`, `styles.css`, and `script.js` at the root. The design system is mostly **additive** — drop these files alongside the existing ones:

```bash
cp -R bylx-design/assets/* /path/to/alinelx-bylx/assets/   # additive — no overwrites
cp bylx-design/colors_and_type.css /path/to/alinelx-bylx/
cp bylx-design/README.md /path/to/alinelx-bylx/DESIGN-SYSTEM.md
cp -R bylx-design/preview /path/to/alinelx-bylx/design-preview
```

For the UI kit (the React/Babel rebuild), copy `bylx-design/ui_kits/site/` to wherever you want a hi-fi reference page:

```bash
cp -R bylx-design/ui_kits /path/to/alinelx-bylx/design-ui-kit
```

It's a static HTML page — no build step. Open `design-ui-kit/site/index.html` and it works.

### Option C — keep them as separate sibling repos

Leave `bylx-design/` as a standalone package on disk (or push it to its own repo, e.g. `alinelx/bylx-design`) and `npm link` / submodule it into the live site. Useful if you plan to evolve the system independently.

---

## Recreating the new interactions in the live `alinelx/bylx` site

The live `alinelx/bylx` codebase is vanilla HTML + a single `styles.css` + a single `script.js`. The UI kit in this handoff added several new interactions on top of what's currently shipped. Here's the mapping for porting each one back as vanilla code:

| Feature in the UI kit | Lives in | How to port to vanilla |
|----------------------|----------|------------------------|
| **Pixel-window close (X)** | `HeroDiorama.jsx` + `hero-diorama.css` `.bylx-pixel-window-close` | Wrap the existing `<div class="win top-right">` as a `<button>`; add a click handler in `script.js` that toggles a `hidden` class on `.pixel-window`. |
| **Tech-icon popovers** | `HeroDiorama.jsx` `onIconClick`, `TECH_INFO` map | Wrap each `<img class="icon">` in a `<button>`; on click, create a fixed-position `<div class="tech-pop">` near the icon's bounding rect. Use the `TECH_INFO` map verbatim. |
| **Monitor power button** | `HeroDiorama.jsx` `<button class="bylx-monitor-power">` | Add an absolute-positioned `<button>` inside the monitor div at `right: 14%; bottom: 13%; width: 11%; height: 8%`. Toggle a `screen-off` class on the scene which dims `.screen-item` via `filter: brightness(0.04)`. |
| **Start menu + fullscreen monitor** | `HeroDiorama.jsx` `onStartClick` + `App.jsx` fullscreen state | Wrap the start area of `<img class="toolbar-start">` in a `<button>`. On click, show a fixed-position menu. "Fullscreen monitor" opens an overlay div with the win-background. Esc/F11 closes. |
| **Sakura cursor trail + click burst** | `SakuraCursor.jsx` + `sakura-cursor.css` | Drop the CSS file in. Port the React component as a small vanilla script that listens to `mousemove` (throttled to ~70ms) and `mousedown`, spawning DOM `<img>` nodes with random `--dx/--dy/--spin` CSS vars. Clean up after animation ends with `animationend` listener. |
| **Fleeing mouse + table perspective** | `HeroDiorama.jsx` "Fleeing mouse" effect | Add a `pointermove` listener that computes flee-x/flee-y/flee-rot vars based on cursor distance from the mouse sprite's center. Update CSS custom properties. `maxOffset: 45px`. Vertical compressed to 50%. Lean up to ±12°. |
| **Keyboard RGB underglow + per-key flash** | `HeroDiorama.jsx` "Keyboard RGB" effect | Add a `keydown` listener that picks a color from `['#ff5dbb', '#59f3ff', '#5d3fd3', '#f7f2ff', '#ffd45d', '#5dff9b']` by `keyCode % 6`, sets `--rgb-tint` on the keys div, adds `.is-pressed` class for 220ms. |
| **Expanded MP3 player with image-map controls** | `Mp3Player.jsx` + `mp3-player.css` | Drop the CSS as-is. The "image map" is just absolute-positioned invisible `<button>`s overlaid on the player sprite. Port the audio logic — `<audio>` element + tracks list, raw GitHub URLs. |

The existing live site already has the modals (`#gallery-modal`, `#contact-modal`) and the MP3 controls structure — both should be replaced with the new layouts from `ui_kits/site/`.

---

## Suggested commit plan

When pushing back to `alinelx/bylx`:

```bash
git checkout -b design-system
mkdir -p .claude/skills
cp -R /path/to/this/handoff/bylx-design ./.claude/skills/
git add .claude/skills/bylx-design
git commit -m "feat(design): add bylx-design system as Claude Code skill

- 6 logo variants, 51 pixel-art assets
- colors_and_type.css with all tokens
- 23 specimen cards (preview/)
- React UI kit recreating the live site with new interactions
- SKILL.md so Claude Code can use this as a design skill"

git push origin design-system
```

Then open a PR titled **"Add bylx-design system + new diorama interactions"** and use the table above as the PR body so reviewers know what to port to vanilla.

---

## Design tokens — at-a-glance reference

Full docs are in `bylx-design/README.md`. Quick summary:

**Colors**
- `--bylx-bg`: `#09051b` — night-purple background
- `--bylx-purple`: `#5d3fd3` — hero wash
- `--bylx-pink`: `#ff5dbb` — accent / drop-shadow
- `--bylx-cyan`: `#59f3ff` — border / link / eyebrow
- `--bylx-text`: `#f7f2ff` — body on dark
- `--bylx-paper`: `#fff8ff` — inputs / modals

**Type**
- **Pixelify Sans** (Google Fonts) — display + body, weights 400–700
- **Press Start 2P** (Google Fonts) — labels, eyebrows, CTAs, kbd
- Anti-aliasing OFF on small UI text

**Spacing** — 4px base, tokens `--space-1` (4) through `--space-8` (64)

**Elevation** — hard offset 8-bit shadows, never blurred
- `4px 4px 0 var(--bylx-pink)` — chip
- `7px 7px 0 var(--bylx-pink)` — card
- `9px 9px 0 var(--bylx-pink)` — modal

**Motion** — stepped easing only (`steps(2, end)`, `steps(3, end)`, `steps(4, end)`), never linear/bezier

**Corners** — `border-radius: 0` everywhere. Square only.

**Imagery** — every visible element is a pixel-art PNG. `image-rendering: pixelated` enforced globally.

---

## Assets in this bundle

51 PNGs total. **All exported pixel-perfect** — never resample or apply blur/border-radius.

- `assets/logo/` — 6 wordmark variants (full color, no-`.dev`, 4 outlines)
- `assets/hero/` — 38 prop sprites: CRT monitor, keyboard parts, instax/phone/mp3 props, Rio/Lisbon skyline silhouettes, MS-Paint frame, Win9x window pieces, tech-logo desktop icons, Japan poster, cocktail/sushi, win98 background
- `assets/cursor/` — 3 cursor states
- `assets/particles/` — 4 sakura petal variants

---

## Fonts

**No font files are bundled** — both Pixelify Sans and Press Start 2P load from Google Fonts via the `@import` at the top of `colors_and_type.css`. If you need offline TTFs, download from Google Fonts (both are SIL OFL, free to bundle) and swap the `@import` for `@font-face` rules.

---

## Audio (MP3 player)

The expanded MP3 player streams audio from `raw.githubusercontent.com/alinelx/bylx/main/assets/mp3/...` — these are the same 17 tracks the live site already ships. **No audio files are bundled here.** If the repo goes private or the files move, playback breaks.

---

## Questions / iteration

When you reopen this in Claude Code:
1. Invoke the `bylx-design` skill so the agent loads the full system context.
2. Tell it what you want to build (e.g. "add a /projects page", "redesign the contact modal", "make a blog template using the bylx vocabulary").
3. It will copy assets, follow the color + type + motion rules, and produce on-brand output.

Read `bylx-design/SKILL.md` for the agent prompt template.
