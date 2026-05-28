# bylx.dev

Personal portfolio of Aline Xavier — a pixel-art diorama of a Y2K cyber-café where Rio de Janeiro and Lisbon share a desk.

Built from scratch in vanilla HTML, CSS and JavaScript. No frameworks, no build step.

**Live:** [bylx.dev](https://bylx.dev)

---

## Stack

| Layer | Tech |
|---|---|
| Markup | HTML5 — semantic, ARIA-accessible |
| Styles | CSS3 — custom properties, stepped animations, parallax via CSS variables |
| Logic | Vanilla JS — parallax with lerp smoothing, modal system, audio player, sakura cursor trail, interactive desk props |

---

## Running locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

---

## Structure

```
bylx/
├── index.html              # single HTML page
├── styles.css              # full design system + layout
├── script.js               # parallax, modals, MP3 player, sakura trail, desk interactions
├── DESIGN.md               # brand + design language reference
└── assets/
    ├── hero/               # pixel-art props for the diorama
    ├── logo/               # bylx wordmark variants
    ├── cursor/             # pixel cursor states (arrow, pointer, click)
    ├── particles/          # sakura petal sprites (cursor trail)
    └── mp3/                # music tracks
```

---

## Projects

| Project | Stack | |
|---|---|---|
| [Dark28](https://dark28.pt) | Next.js · TypeScript · React · Tailwind | [repo](https://github.com/alinelx/dark-28) |
| bylx.dev | HTML · CSS · Vanilla JS | this repo |
| Designer Portfolio | Next.js · Figma | in progress |

---

## Design system

The full brand + design language lives in [`DESIGN.md`](DESIGN.md) — voice,
color, type, spacing, motion, and iconography rules. The canonical design
tokens are defined in `styles.css` (`:root`).

**Hard rules (never break):**
- Only Pixelify Sans + Press Start 2P — no system fonts for display copy
- No `border-radius` anywhere (except the cyan focus ring)
- Hard-offset pixel shadows only — never blurred (`4px 4px 0`, `7px 7px 0`)
- No gradients outside `gradient.png`
- No emoji in copy
- `image-rendering: pixelated` everywhere
- Never pure `#000` or `#fff` — use `--bg` and `--text`
