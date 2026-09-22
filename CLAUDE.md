# CLAUDE.md — bylx.dev

Pixel-art portfolio for Aline Lopes Xavier (bylx.dev). Vanilla HTML/CSS/JS by design — this is the project's positioning ("pixel art, vanilla code"). **Never suggest migrating to React/Next**; React/TS proof lives in the dark28 repo instead.

## Architecture

- `index.html` — single page: hero scene, projects grid, case-study modals, about, contact
- `styles.css` — entry point only; imports `css/` partials in strict order: tokens → base → cursor → hero-animations → hero-positions → hero-text → sections → animations → responsive
- `script.js` — entry point only; imports `js/` ES modules, each with a single `init*()` export
- `contact.php` — form handler (Hostinger), honeypot + non-JS fallback
- `assets/mp3/` — the 17 lo-fi/citypop tracks the player streams; `js/audio.js` lists them in `TRACKS` and every file there is used. **Don't delete them** — they are the mp3 player
- `bylx.dev - Standalone.html` — the design-system UI kit exported as one self-contained React/Babel bundle. **Spec, never shipped code**: the site stays vanilla. It is the reference for scene coordinates and motion; open it side by side when porting visuals
- Design tokens live in `css/tokens.css` (`:root`); brand rules in `DESIGN.md`
- `assets/cv/*.pdf` — the two CVs the About section links, **generated**, never hand-edited: the source is `scripts/cv/*.html` + `cv.css`, and `npm run cv` prints them through Chromium. They are public files on a public domain, so they carry `geral@bylx.dev` and nothing private — no phone number, no personal inbox. The first pair, exported from elsewhere, shipped with both, and `tests/smoke.spec.js` now guards it. Reading a PDF back is possible but painful (the fonts embed subsetted with their own encoding, so plain-text extractors return mojibake — use pdf.js in a browser); editing the HTML is the intended path

## Hard rules

- Motion uses `steps()` easing — pixel-crisp, never smooth tweens. The one exception is a marquee, where `steps()` judders and `linear` is correct
- O brilho do teclado não cicla em repouso: só muda quando alguém escreve (`--rgb-tint` em `js/interactions.js`). Era a única coisa a piscar na mesa
- **Ambient motion is allowed; attention-seeking motion is not.** (Revised 2026-07-16 — this rule used to read "no idle pulse animations" and was being read too broadly.) The line is *who the motion belongs to*: a CRT ticking, a Win98 corner blinking, an RGB board cycling, props drifting on the desk are **diegetic** — they belong to the objects and make the diorama a place. A CTA that blinks, a headline that sparks, a copy panel that breathes are **the funnel asking to be clicked** — still banned. When in doubt: would a real object do this while nobody watched?
- **A deriva ambiente está desligada** (2026-09-22). O motor continua inteiro — keyframes `hero-float`, durações co-primas, `--float-*` por objecto — atrás da classe `is-drifting` no `.scene`; `.hotspot:hover` pausa-a enquanto estiver ligada. Porquê: comparando com o kit lado a lado, o kit parece ter deriva e não tem (lá `--base-transform: none` faz `none translate3d(…)`, erro de parse, e as keyframes correm sem mover nada). Medido: no kit cada objecto mexe 0.00px em relação à prancheta, aqui o cocktail fazia 13.6px. Aline escolheu o kit. `tests/motion.spec.js` guarda as duas metades: a cena parada, e o interruptor a funcionar
- **`--base-transform` must never be `none`.** Layers compose `var(--base-transform) translate3d(…)`, and `none translate3d(…)` is a parse error that silently drops the whole declaration — which once left most of the scene with no transform, killing both float and parallax. Use `translateZ(0)` for "no base transform". `tests/motion.spec.js` guards this
- No blanket `will-change` on scene layers: it pinned 28 compositor layers permanently for animations the browser promotes by itself. Only motion starting from a standing start (parallax, mouse-flee) sets it
- Hero scene layers are positioned by a 64×64 grid system translated to CSS percentages — follow existing coordinate patterns exactly, no creative deviation
- **Props are sized against the real objects.** The keyboard is the ruler (36cm TKL → 12.76 px/cm at any width, since everything is a % of the artboard) and desk depth is drawn at 0.70. Measured 2026-09-22: monitor 0.95×, CRT screen 1.00× (a 15-inch tube), instax 0.94×, cocktail 0.88×, sushi 0.93×, phone 0.91×, mouse 0.83×, mp3 1.04×. The desk reads ~100cm — a small desk, and the props fill it exactly. Measure the *drawn* pixels, not the box, and the long axis, not the width, for anything drawn at an angle
- **Kit vs site, settled 2026-09** (compared rule by rule, `bylx.dev - Standalone.html`): adopted the kit's `toolbar-pulse`, `window-content-pulse` and `mp3-meta-flicker` — all diegetic, all cheap. Still refused: `scene-glow` (a filter on the scene root repaints 28 layers forever to shift saturation 4%), `cta-blink` (walks the CTA back through 2.53:1), `copy-panel-breathe`, `headline-shift`, `text-spark` (the funnel asking to be clicked), and `toolbar-scan`, whose only visible effect was dragging a mirrored START along the taskbar. The site keeps its own below-fold entrances (`card-enter`, `heading-enter`, `icon-enter`, `text-fade-in`) and `mp3-groove`, which the kit lacks
- **Scene coordinates come from the kit** (`bylx.dev - Standalone.html`), ported 2026-09. Sky, hills and landmark haze stay the site's own — see DESIGN.md. Two places deliberately beat the kit: the mp3 player sits at 26%/76.5%/10% (the kit's 31%/13% buries its right third under the keyboard's box, which ate a third of the hotspot) and the sushi at 12% (the kit's 15% crowds it). Before moving any prop, check what its *box* — not its art — now covers: transparent corners steal clicks
- Parallax is **pointer-driven** (`js/parallax.js` writes `--move-x/--move-y`), not scroll-driven — e **só no fundo**: céu, morros, marcos, paredes e moldura da janela. A mesa e tudo o que está sobre ela ficam parados (2026-09-22), para a profundidade se ler na paisagem e nada fugir debaixo do cursor
- `.layer` static transform consumes `--move-x/--move-y` even with `animation: none` — so JS motion features must check `prefersReducedMotion()` from `js/utils.js` (parallax and mouse-flee already do; keep it that way for new features)
- The `prefers-reduced-motion` CSS block lives at the end of `css/responsive.css` — animations often live on child elements (`img`, `::before`, `.icon`), target those, not the wrappers
- Every scene object should do what it looks like it does: camera → gallery, phone → contact form, mp3 player → music player panel
- Accessibility non-negotiable: aria-labels, `:focus-visible` states, keyboard-accessible modals, forms that work without JS
- **Never `aria-hidden` a wrapper that contains controls.** `.hero-artboard` carried it over 14 real buttons, which stayed tabbable while announcing nothing — hide the decorative *leaves* (`alt=""`, or `aria-hidden` on the one text node) instead
- Modals owe a keyboard three things, all in `js/modals.js`: trap Tab, restore focus to the opener, lock scroll on `<html>`. Escape is consumed with `preventDefault()` there — `js/audio.js` and `js/desktop.js` bail on `event.defaultPrevented`, or one press closes three layers
- Colour goes on the surface it is actually read against: the brand cyan and pink are 2.17:1 and 2.65:1 on the paper modals, so text there uses `--bylx-cyan-deep` / `--danger`

## Palette (dark)

bg `#09051b` · cyan `#62E6FF` / `#59f3ff` · pink `#FF7EB6` · purple `#5B3FC2` — always via tokens (`var(--cyan)` etc.), never hardcoded.

## Content voice

Case studies follow the structure: The question → What I built → Technical decisions → What I learned. Tone: technical but human, concise, no corporate buzzwords. Site language: English.

## Current backlog

1. **Mobile/responsive pass** — redone (2026-09): the desk-focused crop is gone. In portrait (`orientation: portrait and max-width: 1200px`) the hero is *copy panel above, whole diorama below*: the artboard is `calc(100vw * 1.7)` so the visible band is 20.6%–79.4% of it, which holds every prop from the sushi to the phone, and **nothing is repositioned** — same desk on every device. The old crop framed only the monitor and keyboard, so the three hotspots were moved into that band and ended up drawn on top of the keyboard. Landscape is untouched (there the artboard is no wider than the viewport, so nothing is cropped). Touch targets grown under `(pointer: coarse)`. Pending: QA on real devices
2. Gallery modal — done (2026-07): pixel-art image grid with captions, opened by the instax
3. **Project cards** — done (2026-07): text-first, as the design system draws them. This entry used to read "konochan.pt, lupa.road, Workspace Automations use striped placeholder previews — need pixel art". The previews are gone entirely, so no pixel art is owed: the kit's card is a label, a name, a description and stack chips, and the name is what you scan for. `dark28-linepixel.png` and `bylx_logo_line_cyan.png` are now unused by the cards
4. Review case-study copy for konochan.pt / luparoad.com / Workspace Automations (drafted from project memory — verify facts). The lupa project lives at **luparoad.com** (200, verified 2026-09-22); the old `lupa.road` domain is NXDOMAIN and all four references were repointed
5. **`bylx/` foi apagada** (2026-09-22, com autorização) — era um segundo *clone* de `alinelx/bylx` dentro da própria pasta do projeto, 134MB (67MB de `.git` + 64MB de mp3 duplicados), ignorado por `.gitignore` e nunca servido. Antes de apagar: sem commits fora do remoto (`git log --branches --not --remotes` vazio), sem stashes, sem ficheiros untracked ou ignorados, e o único commit solto era um stash "WIP on main" que apagava os 17 mp3 — precisamente o que não se quer. Foi essa cópia que produziu o commit "Sync", que reverteu ~1.700 linhas: **uma máquina, uma cópia**, e commit/push só daqui
6. Volume buttons on the mp3 sprite — done (2026-09): the sprite draws no keys, so they are drawn in CSS as `::after` on `.mp3-volup`/`.mp3-voldown`, on the dark bezel directly under the printed "MP3 / FM" (sprite rows 91–96 of 128, centred on the lettering at x ≈ 57.8%). The hit box runs lower than the drawn key, and `(pointer: coarse)` grows it further. If real pixel art for them lands in `mp3_player.png`, delete those `::after` rules

7. Hero copy vs positioning — settled (2026-09-22): "no shortcuts" is deleted from the meta description and from this file's positioning line. The hero's own line ("vanilla code, optional shortcuts through AI and tech debug") stands, and it is now the only claim the site makes about shortcuts. Don't reintroduce "no shortcuts"

## Cache

`styles.css` / `script.js` are entry points only, so a `?v=` on them never reaches the `@import`ed `css/*.css` or the imported `js/*.js` — those are separate requests. `.htaccess` sends `no-cache` for every css/js so the origin revalidates.

**That is not enough, and the note here used to stop at that line.** Hostinger's CDN sits in front of the origin and serves its own copies: measured 2026-09-22, hours after a deploy, the browser got `css/responsive.css` with `age: 27075` and a `last-modified` seven hours older than the deploy, while curl on the same URL got the current bytes — the site looked like the previous version to every visitor. Any query string came back uncached, so the edge keys on the URL and ignores `no-cache`.

So every first-party css/js URL carries `?v=<hash>`, and `scripts/stamp-assets.mjs` writes it: a hash of the files' own contents (same bytes → same URL → still cached), stamped onto the entry points in `index.html`, the `@import`s inside `styles.css`, and the module specifiers in `script.js` and `js/*.js` — the whole chain, because a stale `styles.css` would otherwise hand out stale specifiers. `index.html` itself is not edge-cached, which is what makes the chain work.

The same script also stamps the two CV PDFs, one hash each — they are not in the import chain, but they are edge-cached by URL, and overwriting a PDF in place would leave the edge serving the old one.

**Run `npm run stamp` (or `node scripts/stamp-assets.mjs`) before every deploy**; `--check` exits 1 if it is stale, and it is a no-op when nothing changed.

## Git

Commit and push from this machine only. History may show whole-file EOL diffs (CRLF→LF normalization) — content-safe.
