# bylx.dev — Site UI kit

Hi-fi interactive recreation of the bylx.dev portfolio, in React (Babel-in-the-browser).

## Files

| File                | Role                                                                    |
|---------------------|-------------------------------------------------------------------------|
| `index.html`        | Assembled page — hero diorama + projects + modals + MP3 + start menu    |
| `App.jsx`           | Top-level state: modals, MP3, start menu, screen-off, fullscreen        |
| `HeroDiorama.jsx`   | Layered pixel scene, parallax, fleeing mouse, RGB keyboard, monitor power, pixel-window close, tech-icon popovers |
| `hero-diorama.css`  | All hero positioning + animation rules                                  |
| `mp3-player.css`    | Expanded MP3 player styling + image-map hotspots                        |
| `InfoCard.jsx`      | Chunky cyan-bordered eyebrow/h1/body/CTA panel                          |
| `Modal.jsx`         | Cyan-headed pixel modal (Esc + backdrop close)                          |
| `ContactForm.jsx`   | Paper inputs with cyan focus ring                                       |
| `Mp3Player.jsx`     | Image-mapped player: real audio from raw GitHub URLs                    |
| `PixelCursor.jsx`   | Custom 32×32 cursor (arrow / pointer / click)                           |
| `Button.jsx`        | Press Start 2P CTA in 4 variants                                        |

Components export to `window.Bylx*` so each `<script type="text/babel">` can reach the others.

## Interactions

### On the desk
- **Instax** → opens the **Gallery** modal (image gallery of bylx pixel-art)
- **Phone** → opens **Contact** modal; rings on hover
- **MP3 player** → expands into a bottom-right image-mapped player that streams real audio
- **Mouse sprite** → flees the real cursor when it gets within ~220 px
- **Keyboard** → has a permanent low-RGB underglow; flares brighter and changes color on every physical key press

### On the monitor
- **Power button** (bottom-right of the monitor) → toggles the CRT off/on (screen items fade to near-black)
- **Pixel window X** → closes the `nihon.bmp` window
- **Desktop icons** (HTML / CSS / JS / TS / React / Node / Figma / WP) → click any to open a small popover explaining the stack item
- **Start button** (left of the toolbar) → opens the **Start menu** with 4 options:
  - **Fullscreen monitor** → enters cinema mode; press **F11** or **Esc** to return
  - **Play music** → opens the MP3 player
  - **Turn monitor off / on** → same as the power button
  - **Send a message** → opens the contact modal

### MP3 player (image-mapped)
The full-size player image is the controller — each invisible hotspot reveals its label on hover:
- **Left circular dial** → play / pause
- **Top selector strip** → single click = next track, double click = previous
- **Bottom-left button** → vol −
- **Bottom-right button** → vol +
- **LCD** shows a scrolling track name + track index + volume + transport icon
- Tracks are streamed from `raw.githubusercontent.com/alinelx/bylx/main/assets/mp3/…`

### Hover state policy
Per user preference: hovering an interactive prop does **not** wash a transparent fill behind it and does **not** brighten/hue-shift the sprite. Only the per-prop animation runs (e.g., phone ring, instax sprite sheet).

## Performance

- Parallax DOM writes throttled to ~30 fps via rAF clock
- Parallax loop pauses via `IntersectionObserver` when the hero scrolls off-screen
- Pointer events for mouse-fleeing and parallax are coalesced into one rAF callback each
- Multiplier halved vs. the original (`depth × 1.8`, ease 0.05)

## Reusing components elsewhere

```html
<link rel="stylesheet" href="../../colors_and_type.css"/>
<link rel="stylesheet" href="hero-diorama.css"/> <!-- only with HeroDiorama -->
<link rel="stylesheet" href="mp3-player.css"/>   <!-- only with Mp3Player -->
<script type="text/babel" src="Button.jsx"></script>
<script type="text/babel" src="InfoCard.jsx"></script>
```

## Known gaps

- Audio depends on GitHub serving raw mp3 from the `alinelx/bylx` repo. If those URLs change or the repo goes private, playback stops.
- Fullscreen monitor is currently a CSS overlay, not a true `requestFullscreen()` call. F11 in real browsers still toggles browser fullscreen — the in-page overlay listens for Esc/F11 to dismiss.
- The mp3 image-map regions are approximate (positioned by percentage over a 320×128 sprite). Adjust the `.bylx-mp3-*` rect rules in `mp3-player.css` if you want pixel-exact hit areas.
