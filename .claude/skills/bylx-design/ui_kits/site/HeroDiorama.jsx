/* HeroDiorama.jsx — layered pixel-art hero scene with cursor parallax,
   fleeing mouse, keyboard RGB glow, monitor power, pixel-window close,
   tech-icon popovers, and start menu. */

const PARALLAX_LAYERS = [
  { selector: '.bylx-bg-skyline-left', depth: 1 },
  { selector: '.bylx-bg-skyline-right', depth: 1 },
  { selector: '.bylx-morro', depth: 2 },
  { selector: '.bylx-cristo', depth: 3 },
  { selector: '.bylx-pao-de-acucar', depth: 3 },
  { selector: '.bylx-ponte', depth: 3 },
  { selector: '.bylx-torre-belem', depth: 3 },
  { selector: '.bylx-bg-wall-left', depth: 1 },
  { selector: '.bylx-bg-wall-right', depth: 1 },
  { selector: '.bylx-window-frame', depth: 2 },
  { selector: '.bylx-table', depth: 3 },
  { selector: '.bylx-win-bg', depth: 5 },
  { selector: '.bylx-desktop-icons', depth: 6 },
  { selector: '.bylx-pixel-window', depth: 6 },
  { selector: '.bylx-paint', depth: 7 },
  { selector: '.bylx-toolbar-strip', depth: 7 },
  { selector: '.bylx-monitor', depth: 8 },
  { selector: '.bylx-keyboard', depth: 10 },
  { selector: '.bylx-instax', depth: 11 },
  { selector: '.bylx-phone', depth: 12 },
  { selector: '.bylx-sushi', depth: 9 },
  { selector: '.bylx-cocktail', depth: 10 },
];

// User-perceived speed: ~half of original (was depth*4, ease 0.08).
// Multiplier can be tuned at runtime via window.__bylx_parallax_mult (Tweaks panel).
const PARALLAX_MULTIPLIER = 1.8;
const PARALLAX_LERP = 0.05;

const TECH_INFO = {
  html: { name: 'HTML', sub: 'Markup, semantics first.' },
  css:  { name: 'CSS', sub: 'Pixel-perfect layout & motion.' },
  js:   { name: 'JavaScript', sub: 'Interactivity & DOM.' },
  ts:   { name: 'TypeScript', sub: 'Types when stakes are real.' },
  react:{ name: 'React', sub: 'Component-driven UI.' },
  node: { name: 'Node.js', sub: 'Server-side & tooling.' },
  figma:{ name: 'Figma', sub: 'UX & design specs.' },
  wp:   { name: 'WordPress', sub: 'CMS for content sites.' },
};

function HeroDiorama({
  onInstaxClick,
  onPhoneClick,
  onMp3Click,
  onStartClick,
  screenOff,
  onMonitorPowerClick,
  children,
}) {
  const heroRef = React.useRef(null);
  const mouseRef = React.useRef(null);
  const keysRef = React.useRef(null);
  const [pixelWinOpen, setPixelWinOpen] = React.useState(true);
  const [techPop, setTechPop] = React.useState(null); // {key, x, y}

  // ----- Parallax (slower + lighter) -----
  React.useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const layerNodes = PARALLAX_LAYERS.map(({ selector, depth }) => ({
      depth,
      elements: [...hero.querySelectorAll(selector)],
    }));

    let cx = 0, cy = 0, tx = 0, ty = 0, raf;
    let lastWrite = 0;

    function step(now) {
      // Throttle DOM writes to ~30fps; rAF gives 60.
      if (now - lastWrite >= 28) {
        cx += (tx - cx) * PARALLAX_LERP;
        cy += (ty - cy) * PARALLAX_LERP;
        const tweakMult = (typeof window.__bylx_parallax_mult === 'number')
          ? window.__bylx_parallax_mult
          : 1;
        const mult = PARALLAX_MULTIPLIER * tweakMult;
        for (const { depth, elements } of layerNodes) {
          const mx = `${(cx * depth * mult).toFixed(2)}px`;
          const my = `${(cy * depth * mult).toFixed(2)}px`;
          for (const el of elements) {
            el.style.setProperty('--move-x', mx);
            el.style.setProperty('--move-y', my);
          }
        }
        lastWrite = now;
      }
      raf = requestAnimationFrame(step);
    }

    // Throttle pointer events too
    let pointerScheduled = false;
    function onMove(e) {
      if (pointerScheduled) return;
      pointerScheduled = true;
      requestAnimationFrame(() => {
        pointerScheduled = false;
        const r = hero.getBoundingClientRect();
        const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        if (outside) { tx = 0; ty = 0; return; }
        tx = (e.clientX - r.left) / r.width - 0.5;
        ty = (e.clientY - r.top) / r.height - 0.5;
      });
    }
    function reset() { tx = 0; ty = 0; }

    window.addEventListener('pointermove', onMove, { passive: true });
    hero.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);

    // Pause rAF when the hero scrolls off-screen
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!raf) raf = requestAnimationFrame(step);
      } else {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
      }
    });
    io.observe(hero);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
    };
  }, []);

  // ----- Fleeing mouse sprite -----
  React.useEffect(() => {
    const hero = heroRef.current;
    const mouse = mouseRef.current;
    if (!hero || !mouse) return;

    let rafM;
    let pointerScheduled = false;
    function onMove(e) {
      if (pointerScheduled) return;
      pointerScheduled = true;
      requestAnimationFrame(() => {
        pointerScheduled = false;
        const m = mouse.getBoundingClientRect();
        const mx = m.left + m.width / 2;
        const my = m.top + m.height / 2;
        const dx = mx - e.clientX;
        const dy = my - e.clientY;
        const dist = Math.hypot(dx, dy);
        const radius = 220;          // start fleeing when cursor is within this distance
        const maxOffset = 45;        // pixels max displacement (halved per Aline)
        if (dist < radius && dist > 0.5) {
          const t = (radius - dist) / radius;       // 0..1 close-ness
          const ux = dx / dist;
          const uy = dy / dist;
          // Horizontal: full range. Vertical: compressed (table perspective).
          mouse.style.setProperty('--flee-x', `${(ux * maxOffset * t).toFixed(1)}px`);
          mouse.style.setProperty('--flee-y', `${(uy * maxOffset * t * 0.5).toFixed(1)}px`);
          // Lean into the direction of motion (perspective lean)
          const lean = Math.max(-12, Math.min(12, ux * t * 14));
          mouse.style.setProperty('--flee-rot', `${lean.toFixed(1)}deg`);
        } else {
          mouse.style.setProperty('--flee-x', `0px`);
          mouse.style.setProperty('--flee-y', `0px`);
          mouse.style.setProperty('--flee-rot', `0deg`);
        }
      });
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (rafM) cancelAnimationFrame(rafM);
    };
  }, []);

  // ----- Keyboard RGB glow on physical key press -----
  React.useEffect(() => {
    const keys = keysRef.current;
    if (!keys) return;
    let timeout;
    function onKey(e) {
      // Tint cycles by keycode → repeatable colors
      const palette = ['#ff5dbb', '#59f3ff', '#5d3fd3', '#f7f2ff', '#ffd45d', '#5dff9b'];
      const tint = palette[(e.keyCode || e.which || 0) % palette.length];
      keys.style.setProperty('--rgb-tint', tint);
      keys.classList.add('is-pressed');
      clearTimeout(timeout);
      timeout = setTimeout(() => keys.classList.remove('is-pressed'), 220);
    }
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(timeout); };
  }, []);

  function onIconClick(key, e) {
    const iconBox = e.currentTarget.getBoundingClientRect();
    // Position the popover up-and-right of the icon (viewport coords).
    const x = iconBox.right;
    const y = iconBox.top - 6;
    setTechPop((prev) => (prev && prev.key === key ? null : { key, x, y }));
  }

  return (
    <section className="bylx-hero-scene" ref={heroRef} aria-labelledby="bylx-hero-title">
      <div className="bylx-hero-artboard" aria-hidden="true">
        <div className={`bylx-scene ${screenOff ? 'bylx-screen-off' : ''}`}>

          <img className="bylx-layer bylx-bg-skyline-left bylx-flippedY" src="../../assets/hero/gradient.png" alt=""/>
          <img className="bylx-layer bylx-bg-skyline-right bylx-flippedY" src="../../assets/hero/gradient.png" alt=""/>

          <img className="bylx-layer bylx-morro bylx-morro-left bylx-flippedX" src="../../assets/hero/morro.png" alt=""/>
          <img className="bylx-layer bylx-morro bylx-morro-right" src="../../assets/hero/morro.png" alt=""/>

          <img className="bylx-layer bylx-cristo" src="../../assets/hero/cristo_redentor.png" alt=""/>
          <img className="bylx-layer bylx-pao-de-acucar" src="../../assets/hero/pao_de_acucar.png" alt=""/>
          <img className="bylx-layer bylx-ponte" src="../../assets/hero/ponte_25abril.png" alt=""/>
          <img className="bylx-layer bylx-torre-belem" src="../../assets/hero/torre_belem.png" alt=""/>

          <img className="bylx-layer bylx-bg-wall-left" src="../../assets/hero/gradient.png" alt=""/>
          <img className="bylx-layer bylx-bg-wall-right" src="../../assets/hero/gradient.png" alt=""/>

          <img className="bylx-layer bylx-window-frame" src="../../assets/hero/window_frame.png" alt=""/>
          <img className="bylx-layer bylx-table" src="../../assets/hero/table.png" alt=""/>

          <img className="bylx-layer bylx-cocktail" src="../../assets/hero/cocktail.png" alt=""/>
          <img className="bylx-layer bylx-sushi" src="../../assets/hero/sushi.png" alt=""/>

          <button
            className="bylx-hotspot bylx-hotspot-instax bylx-instax"
            type="button"
            aria-label="Open gallery"
            onClick={onInstaxClick}
          >
            <span className="bylx-hotspot-visual bylx-instax-sprite" aria-hidden="true"></span>
          </button>

          <button
            className="bylx-hotspot bylx-hotspot-phone bylx-phone"
            type="button"
            aria-label="Open contact form"
            onClick={onPhoneClick}
          >
            <span className="bylx-hotspot-visual"><img src="../../assets/hero/phone.png" alt=""/></span>
          </button>

          <button
            className="bylx-hotspot bylx-hotspot-mp3 bylx-mp3player"
            type="button"
            aria-label="Open music player"
            onClick={onMp3Click}
          >
            <span className="bylx-hotspot-visual"><img src="../../assets/hero/mp3_player.png" alt=""/></span>
          </button>

          <div
            className="bylx-layer bylx-mouse"
            ref={mouseRef}
            style={{ '--flee-x': '0px', '--flee-y': '0px' }}
          >
            <img src="../../assets/hero/mouse.png" alt="" style={{ width: '100%', display: 'block', imageRendering: 'pixelated' }}/>
          </div>

          <img className="bylx-screen-item bylx-win-bg" src="../../assets/hero/win_background.png" alt=""/>

          <div className="bylx-screen-item bylx-desktop-icons">
            {[
              ['html', 'html_icon.png'],
              ['css', 'css_icon.png'],
              ['js', 'javascript_icon.png'],
              ['figma', 'figma_icon.png'],
              ['wp', 'wordpress_icon.png'],
              ['react', 'react_icon.png'],
              ['node', 'node_icon.png'],
              ['ts', 'typescript_icon.png'],
            ].map(([key, file]) => (
              <button
                key={key}
                type="button"
                className="bylx-icon-btn"
                aria-label={TECH_INFO[key].name}
                onClick={(e) => onIconClick(key, e)}
              >
                <img className="bylx-icon" src={`../../assets/hero/${file}`} alt=""/>
              </button>
            ))}
          </div>

          {pixelWinOpen && (
            <div className="bylx-screen-item bylx-pixel-window">
              <div className="bylx-win tl"></div>
              <div className="bylx-win tm">
                <p className="bylx-win-title">nihon.bmp</p>
              </div>
              {/* The win_top_right.png sprite already includes an X icon.
                  Make the whole top-right tile a button → close. */}
              <button
                type="button"
                className="bylx-win tr bylx-pixel-window-close"
                aria-label="Close window"
                onClick={() => setPixelWinOpen(false)}
              ></button>
              <div className="bylx-win sl"></div>
              <div className="bylx-win-content">
                <img src="../../assets/hero/japan_poster.png" className="bylx-poster" alt=""/>
              </div>
              <div className="bylx-win sr"></div>
              <div className="bylx-win bl"></div>
              <div className="bylx-win bm"></div>
              <div className="bylx-win br"></div>
            </div>
          )}

          <img className="bylx-screen-item bylx-paint" src="../../assets/hero/paint_frame.png" alt=""/>

          <div className="bylx-screen-item bylx-toolbar-strip">
            <button
              type="button"
              className="bylx-start-btn"
              aria-label="Open Start menu"
              onClick={onStartClick}
            >
              <img className="bylx-toolbar bylx-toolbar-start" src="../../assets/hero/toolbar.png" alt=""/>
            </button>
            <img className="bylx-toolbar bylx-toolbar-fill" src="../../assets/hero/toolbar.png" alt=""/>
          </div>

          <div className="bylx-layer bylx-monitor">
            <img className="bylx-monitor-img" src="../../assets/hero/monitor_frame.png" alt=""/>
            {/* bylx.dev wordmark stuck on the top-right of the CRT bezel */}
            <img className="bylx-bylx-logo-sticker" src="../../assets/logo/bylx_logo_semdev.png" alt="bylx.dev"/>
            <button
              type="button"
              className="bylx-monitor-power"
              aria-label={screenOff ? 'Turn monitor on' : 'Turn monitor off'}
              onClick={onMonitorPowerClick}
            ></button>
          </div>

          <img className="bylx-layer bylx-keyboard bylx-keyboard-board" src="../../assets/hero/keyboard_board.png" alt=""/>
          <div className="bylx-layer bylx-keyboard bylx-keyboard-keys" ref={keysRef}>
            <img src="../../assets/hero/keyboard_keys.png" alt="" style={{ width: '100%', display: 'block', imageRendering: 'pixelated' }}/>
          </div>

          {/* Tech icon popover — rendered with fixed positioning, so it sits
              in viewport coords and doesn't fight the artboard transform. */}
        </div>
      </div>

      {techPop && (
        <div
          className="bylx-tech-pop"
          style={{ left: techPop.x, top: techPop.y }}
          role="dialog"
          aria-label={TECH_INFO[techPop.key].name}
        >
          <button
            type="button"
            className="bylx-tech-pop-close"
            aria-label="Close"
            onClick={() => setTechPop(null)}
          >×</button>
          <p className="bylx-tech-pop-name">{TECH_INFO[techPop.key].name}</p>
          <p className="bylx-tech-pop-sub">{TECH_INFO[techPop.key].sub}</p>
        </div>
      )}

      <div className="bylx-hero-copy">{children}</div>
    </section>
  );
}

window.BylxHeroDiorama = HeroDiorama;
