/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _        
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  < 
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */ 
/* ᑲყᥣx cursor */


export function initCursor() {
  const cursor = document.querySelector(".cursor");

  if (!cursor) return;

  /* rAF-throttled like parallax and mouse-flee: this used to write two style
     properties on every single pointer event */
  let pending = null;
  let scheduled = false;

  window.addEventListener("mousemove", (event) => {
    pending = event;
    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      cursor.style.left = `${pending.clientX}px`;
      cursor.style.top  = `${pending.clientY}px`;
    });
  }, { passive: true });

  document.addEventListener("mouseover", (event) => {
    if (event.target.closest("a, button")) cursor.classList.add("hover");
  });

  document.addEventListener("mouseout", (event) => {
    if (event.target.closest("a, button")) cursor.classList.remove("hover");
  });

  window.addEventListener("mousedown", () => cursor.classList.add("click"));
  window.addEventListener("mouseup",   () => cursor.classList.remove("click"));
}

export function initSakuraTrail() {
  const sakuraLayer = document.querySelector(".sakura-cursor");

  if (!sakuraLayer) return;

    /* A seta é 40px em vez dos 32 do kit, e as pétalas acompanham-na na mesma
     proporção. 1.9 é o valor que a Aline escolheu a olho, não uma regra. */
  const PETAL_SCALE    = 1.9;
  const TRAIL_INTERVAL = 70;
  const BURST_COUNT    = 12;
  const MAX_PETALS     = 90;

  let lastTrail = 0;
  let liveCount = 0;

  function spawnPetal(x, y, kind) {
    if (liveCount >= MAX_PETALS) return;

    const variant = Math.floor(Math.random() * 4) + 1;

    let angle, power, gravity, duration, size;

    if (kind === "burst") {
      angle    = Math.random() * Math.PI * 2;
      power    = 70 + Math.random() * 70;
      gravity  = 50;
      duration = 1200 + Math.random() * 700;
      size     = (14 + Math.random() * 16) * PETAL_SCALE;
    } else {
      angle    = Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      power    = 10 + Math.random() * 20;
      gravity  = 90;
      duration = 1500 + Math.random() * 800;
      size     = (14 + Math.random() * 10) * PETAL_SCALE;
    }

    const dx   = Math.cos(angle) * power;
    const dy   = Math.sin(angle) * power + gravity;
    const spin = -240 + Math.random() * 480;

    const petal = document.createElement("img");
    petal.className = "sakura-bit";
    petal.src = `assets/particles/sakura${variant}.png`;
    petal.alt = "";
    petal.style.left  = `${x}px`;
    petal.style.top   = `${y}px`;
    petal.style.width = `${size}px`;
    petal.style.setProperty("--dx",   `${dx.toFixed(1)}px`);
    petal.style.setProperty("--dy",   `${dy.toFixed(1)}px`);
    petal.style.setProperty("--spin", `${spin.toFixed(1)}deg`);
    petal.style.animationDuration = `${Math.round(duration)}ms`;

    sakuraLayer.appendChild(petal);
    liveCount += 1;

    let removed = false;
    const remove = () => {
      if (removed) return;
      removed = true;
      petal.remove();
      liveCount -= 1;
    };

    petal.addEventListener("animationend", remove, { once: true });
    setTimeout(remove, duration + 250);
  }

  window.addEventListener("mousemove", (event) => {
    const now = performance.now();
    if (now - lastTrail < TRAIL_INTERVAL) return;
    lastTrail = now;

    spawnPetal(event.clientX, event.clientY, "trail");
  }, { passive: true });

  window.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;

    const count = BURST_COUNT;
    for (let i = 0; i < count; i += 1) {
      spawnPetal(event.clientX, event.clientY, "burst");
    }
  }, { passive: true });
}
