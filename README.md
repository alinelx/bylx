# bylx.dev

Personal portfolio of Aline Xavier — a pixel-art diorama of a Y2K cyber-café where Rio de Janeiro and Lisbon share a desk.

Built from scratch in vanilla HTML, CSS and JavaScript. No frameworks; the only build step generates the case-study pages (`npm run build`).

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
npm run build          # stamp assets + generate /work pages (before every deploy)
npx serve . -l 4173    # or: python3 -m http.server 8080
npm test               # Playwright: smoke, motion, work routes
```

---

## Structure

```
bylx/
├── index.html              # the page — and the source of the case-study copy
├── work/<slug>/index.html  # generated: one page per case study (npm run build)
├── styles.css              # full design system + layout
├── script.js               # parallax, modals, MP3 player, sakura trail, desk interactions
├── scripts/                # stamp-assets.mjs (cache) + build-work-pages.mjs (routes)
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

| Project | Stack | | |
|---|---|---|---|
| [Dark28](https://dark28.pt) | Next.js · TypeScript · React · Tailwind | [repo](https://github.com/alinelx/dark-28) | [case study](https://bylx.dev/work/dark28/) |
| bylx.dev | HTML · CSS · Vanilla JS | this repo | [case study](https://bylx.dev/work/bylx-dev/) |
| [irs-pt](https://github.com/alinelx/irs-pt) | Agent Skill · Python | [repo](https://github.com/alinelx/irs-pt) | [case study](https://bylx.dev/work/irs-pt/) |
| [konochan.pt](https://konochan.pt) | E-commerce · Stripe · MB Way | — | [case study](https://bylx.dev/work/konochan/) |
| [luparoad.com](https://luparoad.com) | WordPress · Branding | — | [case study](https://bylx.dev/work/luparoad/) |

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
