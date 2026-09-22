# CLAUDE.md — bylx.dev

Pixel-art portfolio for Aline Lopes Xavier (bylx.dev). Vanilla HTML/CSS/JS by design — this is the project's positioning ("vanilla code, no shortcuts"). **Never suggest migrating to React/Next**; React/TS proof lives in the dark28 repo instead.

## Architecture

- `index.html` — single page: hero scene, projects grid, case-study modals, about, contact
- `styles.css` — entry point only; imports `css/` partials in strict order: tokens → base → cursor → hero-animations → hero-positions → hero-text → sections → animations → responsive
- `script.js` — entry point only; imports `js/` ES modules, each with a single `init*()` export
- `contact.php` — form handler (Hostinger), honeypot + non-JS fallback
- `assets/mp3/` — the 17 lo-fi/citypop tracks the player streams; `js/audio.js` lists them in `TRACKS` and every file there is used. **Don't delete them** — they are the mp3 player
- `bylx.dev - Standalone.html` — the design-system UI kit exported as one self-contained React/Babel bundle. **Spec, never shipped code**: the site stays vanilla. It is the reference for scene coordinates and motion; open it side by side when porting visuals
- Design tokens live in `css/tokens.css` (`:root`); brand rules in `DESIGN.md`

## Hard rules

- Motion uses `steps()` easing — pixel-crisp, never smooth tweens. The one exception is a marquee, where `steps()` judders and `linear` is correct
- **Ambient motion is allowed; attention-seeking motion is not.** (Revised 2026-07-16 — this rule used to read "no idle pulse animations" and was being read too broadly.) The line is *who the motion belongs to*: a CRT ticking, a Win98 corner blinking, an RGB board cycling, props drifting on the desk are **diegetic** — they belong to the objects and make the diorama a place. A CTA that blinks, a headline that sparks, a copy panel that breathes are **the funnel asking to be clicked** — still banned. When in doubt: would a real object do this while nobody watched?
- Scene props drift via `--float-x/-y/-rotate/-duration` on co-prime durations so the loop never resolves. `.hotspot:hover` pauses the drift — a moving click target dodges the hand reaching for it
- **`--base-transform` must never be `none`.** Layers compose `var(--base-transform) translate3d(…)`, and `none translate3d(…)` is a parse error that silently drops the whole declaration — which once left most of the scene with no transform, killing both float and parallax. Use `translateZ(0)` for "no base transform". `tests/motion.spec.js` guards this
- No blanket `will-change` on scene layers: it pinned 28 compositor layers permanently for animations the browser promotes by itself. Only motion starting from a standing start (parallax, mouse-flee) sets it
- Hero scene layers are positioned by a 64×64 grid system translated to CSS percentages — follow existing coordinate patterns exactly, no creative deviation
- **Scene coordinates come from the kit** (`bylx.dev - Standalone.html`), ported 2026-09. Sky, hills and landmark haze stay the site's own — see DESIGN.md. Two places deliberately beat the kit: the mp3 player sits at 26%/76.5%/10% (the kit's 31%/13% buries its right third under the keyboard's box, which ate a third of the hotspot) and the sushi at 12% (the kit's 15% crowds it). Before moving any prop, check what its *box* — not its art — now covers: transparent corners steal clicks
- Parallax is **pointer-driven** (`js/parallax.js` writes `--move-x/--move-y`), not scroll-driven
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

1. **Mobile/responsive pass** — done (2026-07): desk-focused crop; on `max-width: 900px` / portrait ≤ 1200px the hero keeps the center crop and recomposes the three hotspots onto the visible desk (`css/responsive.css`), touch targets grown under `(pointer: coarse)`. Pending: QA on real devices
2. Gallery modal — done (2026-07): pixel-art image grid with captions, opened by the instax
3. **Project cards** — done (2026-07): text-first, as the design system draws them. This entry used to read "konochan.pt, lupa.road, Workspace Automations use striped placeholder previews — need pixel art". The previews are gone entirely, so no pixel art is owed: the kit's card is a label, a name, a description and stack chips, and the name is what you scan for. `dark28-linepixel.png` and `bylx_logo_line_cyan.png` are now unused by the cards
4. Review case-study copy for konochan.pt / lupa.road / Workspace Automations (drafted from project memory — verify facts). **`lupa.road` does not resolve** (NXDOMAIN on 8.8.8.8, 2026-09-22, while dark28.pt and konochan.pt answer 200) and the site links to it twice — the card's case study and its "Visit lupa.road" button
5. **Do not delete `bylx/`** — a second *clone* of `alinelx/bylx` with its own `.git`. Its uncommitted edits were pushed from that machine on 2026-09-22 as commit "Sync", whose merge reverted ~1,700 lines of the July work; `e5c7910` put the site back and dropped the Sync content entirely (the commits stay in history). So that work is no longer only in `bylx/` — but check before deleting, and push from this machine only
6. Volume buttons on the mp3 sprite — done (2026-09): the sprite draws no keys, so they are drawn in CSS as `::after` on `.mp3-volup`/`.mp3-voldown`, on the dark bezel directly under the printed "MP3 / FM" (sprite rows 91–96 of 128, centred on the lettering at x ≈ 57.8%). The hit box runs lower than the drawn key, and `(pointer: coarse)` grows it further. If real pixel art for them lands in `mp3_player.png`, delete those `::after` rules

7. Hero copy contradicts the positioning: the panel reads "vanilla code, optional shortcuts through AI and tech debug" while CLAUDE.md, the meta description and DESIGN.md's own voice example all say "no shortcuts". Aline's call — flagged 2026-09-22, not changed

## Cache

`styles.css` / `script.js` are entry points only, so a `?v=` on them never reaches the `@import`ed `css/*.css` or the imported `js/*.js` — those are separate requests. `.htaccess` therefore has the partials revalidate (cheap 304s) instead. **No `?v=` bump is needed on deploy**; don't reintroduce the ritual.

## Git

Commit and push from this machine only. History may show whole-file EOL diffs (CRLF→LF normalization) — content-safe.
