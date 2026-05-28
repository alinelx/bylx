const hero = document.querySelector("#hero");

const layers = [
  { selector: ".bg-skyline-left", depth: 1 },
  { selector: ".bg-skyline-right", depth: 1 },
  { selector: ".morro", depth: 2 },
  { selector: ".skyline", depth: 4 },
  { selector: ".bg-wall-left", depth: 1 },
  { selector: ".bg-wall-right", depth: 1 },
  { selector: ".window-frame", depth: 2 },
  { selector: ".table", depth: 3 },
  { selector: ".win-bg", depth: 6 },
  { selector: ".desktop-icons", depth: 8 },
  { selector: ".pixel-window", depth: 9 },
  { selector: ".paint", depth: 10 },
  { selector: ".toolbar-strip", depth: 11 },
  { selector: ".monitor", depth: 12 },
  { selector: ".keyboard", depth: 15 },
  { selector: ".instax", depth: 16 },
  { selector: ".mp3player", depth: 17 },
  { selector: ".phone", depth: 18 },
  { selector: ".sushi", depth: 14 },
  { selector: ".cocktail", depth: 15 },
  { selector: ".mouse", depth: 18 },
  { selector: ".bylx-logo", depth: 8 },
];

const layerElements = layers.map(({ selector, depth }) => ({
  depth,
  elements: [...document.querySelectorAll(selector)],
}));

let currentX = 0;
let currentY = 0;
let targetX = 0;
let targetY = 0;

function updateLayers() {
  currentX += (targetX - currentX) * 0.08;
  currentY += (targetY - currentY) * 0.08;

  layerElements.forEach(({ depth, elements }) => {
    const moveX = currentX * depth * 4;
    const moveY = currentY * depth * 4;

    elements.forEach((element) => {
      element.style.setProperty("--move-x", `${moveX}px`);
      element.style.setProperty("--move-y", `${moveY}px`);
    });
  });

  requestAnimationFrame(updateLayers);
}

function handlePointerMove(event) {
  if (!hero) return;

  const rect = hero.getBoundingClientRect();

  const isOutsideHero =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (isOutsideHero) {
    handlePointerLeave();
    return;
  }

  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;

  targetX = x;
  targetY = y;
}

function handlePointerLeave() {
  targetX = 0;
  targetY = 0;
}

if (hero) {
  window.addEventListener("pointermove", handlePointerMove);
  hero.addEventListener("pointerleave", handlePointerLeave);
  window.addEventListener("blur", handlePointerLeave);
  updateLayers();
}

/* Custom cursor */

const cursor = document.querySelector(".cursor");

if (cursor) {
  window.addEventListener("mousemove", (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });

  document.addEventListener("mouseover", (event) => {
    const target = event.target.closest("a, button, .clickable");

    if (target) {
      cursor.classList.add("hover");
    }
  });

  document.addEventListener("mouseout", (event) => {
    const target = event.target.closest("a, button, .clickable");

    if (target) {
      cursor.classList.remove("hover");
    }
  });

  window.addEventListener("mousedown", () => {
    cursor.classList.add("click");
  });

  window.addEventListener("mouseup", () => {
    cursor.classList.remove("click");
  });
}

/* Modals */

const modalTriggers = document.querySelectorAll("[data-modal-target]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");

function openModal(id) {
  const modal = document.getElementById(id);

  if (!modal) return;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");

  const firstFocusable = modal.querySelector("button, input, textarea, a");

  if (firstFocusable) {
    firstFocusable.focus();
  }
}

function closeModal(modal) {
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

modalTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const modalId = trigger.dataset.modalTarget;
    openModal(modalId);
  });
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeModal(button.closest(".modal"));
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  document.querySelectorAll(".modal.is-open").forEach((modal) => {
    closeModal(modal);
  });
});

/* Audio player */

const tracks = [
  "assets/mp3/9jackjack8-japanese-trap-beat-272645.mp3",
  "assets/mp3/23843807-analog-dreams-synthwave-9497.mp3",
  "assets/mp3/32256300-expectation-420244.mp3",
  "assets/mp3/bfcmusic-lofi-lo-fi-511230.mp3",
  "assets/mp3/bounce-bay-records-traditional-japanese-1-437929.mp3",
  "assets/mp3/bounce-bay-records-traditional-japanese-3-437933.mp3",
  "assets/mp3/bounce-bay-records-traditional-japanese-4-437934.mp3",
  "assets/mp3/hitslab-japan-japanese-music-502006.mp3",
  "assets/mp3/itswatr-watr-fluid-10149.mp3",
  "assets/mp3/mondamusic-lofi-lofi-girl-lofi-chill-512853.mp3",
  "assets/mp3/monume-cyberpunk-519219.mp3",
  "assets/mp3/monume-cyberpunk-music-519215.mp3",
  "assets/mp3/sonican-lo-fi-music-loop-sentimental-jazzy-love-473154.mp3",
  "assets/mp3/tavccitypop-labyrinth-of-dreams-442228.mp3",
  "assets/mp3/tavccitypop-neon-dreams-489483.mp3",
  "assets/mp3/tavccitypop-stardust-rhapsody-442232.mp3",
  "assets/mp3/vibehorn-lofi-beat-lo-fi-music-512500.mp3",
];

const audio = new Audio();
audio.volume = 0.35;

let currentIndex = -1;

const mp3Hotspot = document.querySelector(".hotspot-mp3");
const mp3Controls = document.querySelector(".mp3-controls");
const trackTitle = document.querySelector("[data-track-title]");
const marqueeWindow = document.querySelector(".mp3-marquee-window");

function getTrackName(path) {
  return path
    .split("/")
    .pop()
    .replace(".mp3", "")
    .replaceAll("-", " ");
}

// Scroll the title only when it overflows its window.
function updateMarquee() {
  if (!marqueeWindow || !trackTitle) return;

  marqueeWindow.classList.remove("is-scrolling");
  marqueeWindow.style.removeProperty("--mq-shift");

  const overflow = trackTitle.scrollWidth - marqueeWindow.clientWidth;

  if (overflow > 4) {
    marqueeWindow.style.setProperty("--mq-shift", `${overflow + 8}px`);
    marqueeWindow.classList.add("is-scrolling");
  }
}

function setTrackTitle(path) {
  if (!trackTitle) return;

  trackTitle.textContent = path ? getTrackName(path) : "None";
  requestAnimationFrame(updateMarquee);
}

function playTrack(index) {
  if (!tracks.length) return;

  currentIndex = ((index % tracks.length) + tracks.length) % tracks.length;
  const track = tracks[currentIndex];

  audio.src = track;
  audio.play();

  setTrackTitle(track);

  if (mp3Controls) {
    mp3Controls.classList.add("is-visible");
  }
}

function playRandomTrack() {
  if (!tracks.length) return;

  let next = Math.floor(Math.random() * tracks.length);

  // Avoid repeating the same track back-to-back when we can.
  if (tracks.length > 1 && next === currentIndex) {
    next = (next + 1) % tracks.length;
  }

  playTrack(next);
}

function stopAudio() {
  audio.pause();
  audio.currentTime = 0;
}

if (mp3Hotspot) {
  mp3Hotspot.addEventListener("click", () => {
    if (!audio.paused) {
      audio.pause();
    } else if (audio.src) {
      audio.play();
    } else {
      playRandomTrack();
    }
  });
}

// Keep the hotspot's playing state in sync with the audio element.
audio.addEventListener("play", () => {
  if (mp3Hotspot) mp3Hotspot.classList.add("is-playing");
});

audio.addEventListener("pause", () => {
  if (mp3Hotspot) mp3Hotspot.classList.remove("is-playing");
});

audio.addEventListener("ended", () => {
  playRandomTrack();
});

document.querySelectorAll("[data-audio-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.audioAction;

    if (action === "play") {
      if (audio.src) {
        audio.play();
      } else {
        playRandomTrack();
      }
    } else if (action === "pause") {
      audio.pause();
    } else if (action === "stop") {
      stopAudio();
    } else if (action === "next") {
      playTrack(currentIndex + 1);
    } else if (action === "prev") {
      playTrack(currentIndex - 1);
    } else if (action === "volume-down") {
      audio.volume = Math.max(0, audio.volume - 0.1);
    } else if (action === "volume-up") {
      audio.volume = Math.min(1, audio.volume + 0.1);
    }
  });
});

window.addEventListener("resize", updateMarquee);

/* Sakura cursor trail */

const sakuraLayer = document.querySelector(".sakura-cursor");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (sakuraLayer) {
  const TRAIL_INTERVAL = 70; // ms between trail petals
  const BURST_COUNT = 12; // petals per click
  const MAX_PETALS = 90; // hard cap to keep the DOM tame

  let lastTrail = 0;
  let liveCount = 0;

  function spawnPetal(x, y, kind) {
    if (liveCount >= MAX_PETALS) return;

    const variant = Math.floor(Math.random() * 4) + 1;

    let angle;
    let power;
    let gravity;
    let duration;
    let size;

    if (kind === "burst") {
      angle = Math.random() * Math.PI * 2;
      power = 70 + Math.random() * 70;
      gravity = 50;
      duration = 1200 + Math.random() * 700;
      size = 14 + Math.random() * 16;
    } else {
      angle = Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      power = 10 + Math.random() * 20;
      gravity = 90;
      duration = 1500 + Math.random() * 800;
      size = 14 + Math.random() * 10;
    }

    const dx = Math.cos(angle) * power;
    const dy = Math.sin(angle) * power + gravity;
    const spin = -240 + Math.random() * 480;

    const petal = document.createElement("img");
    petal.className = "sakura-bit";
    petal.src = `assets/particles/sakura${variant}.png`;
    petal.alt = "";
    petal.style.left = `${x}px`;
    petal.style.top = `${y}px`;
    petal.style.width = `${size}px`;
    petal.style.setProperty("--dx", `${dx.toFixed(1)}px`);
    petal.style.setProperty("--dy", `${dy.toFixed(1)}px`);
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

  window.addEventListener(
    "mousemove",
    (event) => {
      if (prefersReducedMotion) return;

      const now = performance.now();
      if (now - lastTrail < TRAIL_INTERVAL) return;
      lastTrail = now;

      spawnPetal(event.clientX, event.clientY, "trail");
    },
    { passive: true }
  );

  window.addEventListener(
    "mousedown",
    (event) => {
      if (event.button !== 0) return;

      const count = prefersReducedMotion ? 4 : BURST_COUNT;
      for (let i = 0; i < count; i += 1) {
        spawnPetal(event.clientX, event.clientY, "burst");
      }
    },
    { passive: true }
  );
}

/* Desk mouse sprite flees the cursor */

const mouseSprite = document.querySelector(".mouse");

if (mouseSprite && hero) {
  let fleeScheduled = false;

  window.addEventListener(
    "mousemove",
    (event) => {
      if (fleeScheduled) return;
      fleeScheduled = true;

      requestAnimationFrame(() => {
        fleeScheduled = false;

        const rect = mouseSprite.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - event.clientX;
        const dy = cy - event.clientY;
        const dist = Math.hypot(dx, dy);

        const radius = 220; // start fleeing within this distance
        const maxOffset = 45; // max displacement in px

        if (dist < radius && dist > 0.5) {
          const t = (radius - dist) / radius;
          const ux = dx / dist;
          const uy = dy / dist;

          mouseSprite.style.setProperty("--flee-x", `${(ux * maxOffset * t).toFixed(1)}px`);
          // Vertical compressed for the table-perspective.
          mouseSprite.style.setProperty("--flee-y", `${(uy * maxOffset * t * 0.5).toFixed(1)}px`);
          const lean = Math.max(-12, Math.min(12, ux * t * 14));
          mouseSprite.style.setProperty("--flee-rot", `${lean.toFixed(1)}deg`);
        } else {
          mouseSprite.style.setProperty("--flee-x", "0px");
          mouseSprite.style.setProperty("--flee-y", "0px");
          mouseSprite.style.setProperty("--flee-rot", "0deg");
        }
      });
    },
    { passive: true }
  );
}

/* Keyboard RGB underglow flares on a physical key press */

const keyboardKeys = document.querySelector(".keyboard-keys");

if (keyboardKeys) {
  const palette = ["#ff5dbb", "#59f3ff", "#5d3fd3", "#f7f2ff", "#ffd45d", "#5dff9b"];
  let glowTimeout;

  window.addEventListener("keydown", (event) => {
    const code = event.keyCode || event.which || 0;
    keyboardKeys.style.setProperty("--rgb-tint", palette[code % palette.length]);
    keyboardKeys.classList.add("is-pressed");

    clearTimeout(glowTimeout);
    glowTimeout = setTimeout(() => keyboardKeys.classList.remove("is-pressed"), 220);
  });
}

/* Desktop tech-icon stack popovers */

const TECH_INFO = {
  html: { name: "HTML", sub: "Markup, semantics first." },
  css: { name: "CSS", sub: "Pixel-perfect layout & motion." },
  js: { name: "JavaScript", sub: "Interactivity & DOM." },
  ts: { name: "TypeScript", sub: "Types when the stakes are real." },
  react: { name: "React", sub: "Component-driven UI." },
  node: { name: "Node.js", sub: "Server-side & tooling." },
  figma: { name: "Figma", sub: "UX & design specs." },
  wp: { name: "WordPress", sub: "CMS for content sites." },
};

const iconButtons = document.querySelectorAll(".icon-btn[data-tech]");
let techPop = null;
let techPopKey = null;

function closeTechPop() {
  if (techPop) {
    techPop.remove();
    techPop = null;
    techPopKey = null;
  }
}

function openTechPop(button) {
  const key = button.dataset.tech;
  const info = TECH_INFO[key];
  if (!info) return;

  closeTechPop();

  const pop = document.createElement("div");
  pop.className = "tech-pop";
  pop.setAttribute("role", "dialog");
  pop.setAttribute("aria-label", info.name);

  const close = document.createElement("button");
  close.type = "button";
  close.className = "tech-pop-close";
  close.setAttribute("aria-label", "Close");
  close.textContent = "×";

  const name = document.createElement("p");
  name.className = "tech-pop-name";
  name.textContent = info.name;

  const sub = document.createElement("p");
  sub.className = "tech-pop-sub";
  sub.textContent = info.sub;

  pop.append(close, name, sub);
  document.body.appendChild(pop);

  // Position up-and-right of the icon, then nudge back on-screen.
  const rect = button.getBoundingClientRect();
  const popRect = pop.getBoundingClientRect();
  let left = rect.right + 6;
  if (left + popRect.width > window.innerWidth - 8) {
    left = Math.max(8, rect.left - popRect.width - 6);
  }
  pop.style.left = `${left}px`;
  pop.style.top = `${Math.max(popRect.height + 8, rect.top - 6)}px`;

  close.addEventListener("click", (event) => {
    event.stopPropagation();
    closeTechPop();
  });

  techPop = pop;
  techPopKey = key;
}

iconButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();

    if (techPopKey === button.dataset.tech) {
      closeTechPop();
      return;
    }

    openTechPop(button);
  });
});

document.addEventListener("click", (event) => {
  if (!techPop) return;
  if (event.target.closest(".tech-pop") || event.target.closest(".icon-btn")) return;
  closeTechPop();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeTechPop();
});