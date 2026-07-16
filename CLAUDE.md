# CLAUDE.md — bylx.dev

Pixel-art portfolio for Aline Lopes Xavier (bylx.dev). Vanilla HTML/CSS/JS by design — this is the project's positioning ("vanilla code, no shortcuts"). **Never suggest migrating to React/Next**; React/TS proof lives in the dark28 repo instead.

## Architecture

- `index.html` — single page: hero scene, projects grid, case-study modals, about, contact
- `styles.css` — entry point only; imports `css/` partials in strict order: tokens → base → cursor → hero-animations → hero-positions → hero-text → sections → animations → responsive
- `script.js` — entry point only; imports `js/` ES modules, each with a single `init*()` export
- `contact.php` — form handler (Hostinger), honeypot + non-JS fallback
- Design tokens live in `css/tokens.css` (`:root`); brand rules in `DESIGN.md`

## Hard rules

- Motion uses `steps()` easing — pixel-crisp, never smooth tweens
- No idle "pulse" animations; motion is hover- or interaction-triggered
- Hero scene layers are positioned by a 64×64 grid system translated to CSS percentages — follow existing coordinate patterns exactly, no creative deviation
- Parallax is **pointer-driven** (`js/parallax.js` writes `--move-x/--move-y`), not scroll-driven
- `.layer` static transform consumes `--move-x/--move-y` even with `animation: none` — so JS motion features must check `prefersReducedMotion()` from `js/utils.js` (parallax and mouse-flee already do; keep it that way for new features)
- The `prefers-reduced-motion` CSS block lives at the end of `css/responsive.css` — animations often live on child elements (`img`, `::before`, `.icon`), target those, not the wrappers
- Every scene object should do what it looks like it does: camera → gallery, phone → contact form, mp3 player → music player panel
- Accessibility non-negotiable: aria-labels, `:focus-visible` states, keyboard-accessible modals, forms that work without JS

## Palette (dark)

bg `#09051b` · cyan `#62E6FF` / `#59f3ff` · pink `#FF7EB6` · purple `#5B3FC2` — always via tokens (`var(--cyan)` etc.), never hardcoded.

## Content voice

Case studies follow the structure: The question → What I built → Technical decisions → What I learned. Tone: technical but human, concise, no corporate buzzwords. Site language: English.

## Current backlog

1. **Mobile/responsive pass** — done (2026-07): desk-focused crop; on `max-width: 900px` / portrait ≤ 1200px the hero keeps the center crop and recomposes the three hotspots onto the visible desk (`css/responsive.css`), touch targets grown under `(pointer: coarse)`. Pending: QA on real devices
2. Gallery modal — done (2026-07): pixel-art image grid with captions, opened by the instax
3. Project cards for konochan.pt, lupa.road, Workspace Automations use striped placeholder previews — need pixel art
4. Review case-study copy for konochan.pt / lupa.road / Workspace Automations (drafted from project memory — verify facts)
5. **Do not delete `bylx/`** — this entry used to read "duplicate untracked folder `bylx/bylx/` can be deleted". No `bylx/bylx/` exists. What exists is `bylx/`: a second *clone* of `alinelx/bylx` with its own `.git`, commits up to "Merge pull request #12", and staged-but-uncommitted edits across ~10 files. Deleting it destroys work that is in no other repo. Decide deliberately what to salvage first
6. Volume buttons on the mp3 sprite are undrawn — nothing exists in `mp3_player.png` past 82% of its width, so the vol−/vol+ hits sit on blank pink and only appear on hover. Needs pixel art (2 buttons), or the hits move onto a drawn feature

## Cache

`styles.css` / `script.js` are entry points only, so a `?v=` on them never reaches the `@import`ed `css/*.css` or the imported `js/*.js` — those are separate requests. `.htaccess` therefore has the partials revalidate (cheap 304s) instead. **No `?v=` bump is needed on deploy**; don't reintroduce the ritual.

## Git

Commit and push from this machine only. History may show whole-file EOL diffs (CRLF→LF normalization) — content-safe.
