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
| Logic | Vanilla JS — parallax with lerp smoothing, modal system, audio player |

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
├── script.js               # parallax, modals, MP3 player
├── assets/
│   ├── hero/               # pixel-art props for the diorama
│   ├── logo/               # bylx wordmark variants
│   ├── cursor/             # pixel cursor states (arrow, pointer, click)
│   └── mp3/                # music tracks
└── .claude/
    └── skills/
        └── bylx-design/    # design system — invoke with /bylx-design
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

The full design language lives in `.claude/skills/bylx-design/`:

- **SKILL.md** — invoke with `/bylx-design` in Claude Code to get full brand context
- **colors_and_type.css** — drop-in CSS with all tokens (colors, type, spacing, shadows, motion)
- **README.md** — visual rules, brand pillars, copy guidelines, hard rules
- **preview/** — token specimen pages you can open in a browser
- **ui_kits/site/** — React component library for mocks and prototypes

**Hard rules (never break):**
- Only Pixelify Sans + Press Start 2P — no system fonts for display copy
- No `border-radius` anywhere
- Hard-offset pixel shadows only — never blurred (`4px 4px 0`, `7px 7px 0`)
- No gradients outside `gradient.png`
- No emoji in copy
- `image-rendering: pixelated` everywhere
- Never pure `#000` or `#fff` — use `--bg` and `--text`
