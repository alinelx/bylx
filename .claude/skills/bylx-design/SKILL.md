---
name: bylx-design
description: Use this skill to generate well-branded interfaces and assets for bylx.dev (Aline's pixel-art portfolio), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

# bylx-design

Read `README.md` in this skill folder for the full design language — content rules, visual foundations, iconography, and how to combine the tokens.

Then explore the other files:

- `colors_and_type.css` — drop-in CSS with all color, type, spacing, shadow, motion tokens. Loads Google Fonts (Pixelify Sans + Press Start 2P) and sets sensible element defaults.
- `assets/logo/` — six pixel wordmark variants
- `assets/hero/` — the full pixel-art prop library (CRT, keyboard, instax, phone, MP3 player, Rio/Lisbon skyline silhouettes, MS-Paint frame, Win9x window pieces, tech-logo desktop icons, sakura/cherry-blossom-laden Japan poster)
- `assets/cursor/` — pixel cursor states (arrow, pointer, click)
- `assets/particles/` — four sakura petal sprites
- `preview/` — small specimen cards for each token group
- `ui_kits/site/` — React (Babel-in-the-browser) recreation of the live site: hero diorama with cursor parallax, info card, modal, contact form, MP3 controls, pixel cursor

## When invoked

If creating visual artifacts (slides, mocks, throwaway prototypes, marketing material, etc.):
1. Copy `colors_and_type.css` and the assets you need (logo + hero props) into your output folder.
2. Reuse the JSX components from `ui_kits/site/` directly if you want quick high-fidelity recreations.
3. Output a static HTML file the user can open.

If working on production code, copy assets and study the rules in `README.md` to become an expert in designing with this brand. Match the existing component anatomy (chunky pixel borders, hard offset shadows, square corners, stepped easing, no gradients, no emoji).

If the user invokes this skill without any other guidance:
- Ask them what they want to build or design.
- Ask 6–10 questions (audience, surface, scope, copy, motion intensity, novelty vs faithfulness).
- Act as an expert designer who outputs HTML artifacts **or** production code, depending on the need.

## Hard rules — never violate

- Never use Inter, Roboto, Arial, or system-ui for display copy. The two pixel fonts are non-negotiable.
- Never apply `border-radius` to bylx components (cursor focus ring is the only exception).
- Never apply blurred drop-shadows. Use hard-offset pixel shadows (`4px 4px 0`, `7px 7px 0`, `9px 9px 0`).
- Never use gradients outside the bundled `gradient.png` skyline asset.
- Never use emoji in copy.
- Never invent new SVG/Lucide/Heroicons icons — use the existing pixel-art PNGs or fall back to a labeled empty pixel box.
- Never use pure black (`#000`) or pure white (`#fff`). Use `--bylx-bg` and `--bylx-text`/`--bylx-paper`.
- Always set `image-rendering: pixelated` (or rely on the default in `colors_and_type.css`).
- Always write copy in first person, sentence case, with a learner-in-progress voice. No SaaS marketing tropes.

## Source

This design system was reverse-engineered from [github.com/alinelx/bylx](https://github.com/alinelx/bylx). Explore that repo (and the related [dark-28](https://github.com/alinelx/dark-28), [bora-viajar](https://github.com/alinelx/bora-viajar)) for additional context if you have access.
