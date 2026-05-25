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

/* Hotspot feedback */

document.querySelectorAll(".hotspot").forEach((hotspot) => {
  hotspot.addEventListener("click", () => {
    hotspot.classList.remove("is-clicked");
    void hotspot.offsetWidth;
    hotspot.classList.add("is-clicked");

    window.setTimeout(() => {
      hotspot.classList.remove("is-clicked");
    }, 180);
  });
});

/* Modals */

const modalTriggers = document.querySelectorAll("[data-modal-target]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");

function openModal(id) {
  const modal = document.getElementById(id);

  if (!modal) return;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");

  const firstButton = modal.querySelector("button, input, textarea, a");

  if (firstButton) {
    firstButton.focus();
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

    if (trigger.classList.contains("hotspot-phone")) {
      trigger.classList.remove("is-ringing");
      void trigger.offsetWidth;
      trigger.classList.add("is-ringing");
    }

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

let currentTrack = null;

const mp3Hotspot = document.querySelector(".hotspot-mp3");
const mp3Controls = document.querySelector(".mp3-controls");
const trackTitle = document.querySelector("[data-track-title]");

function getTrackName(path) {
  return path
    .split("/")
    .pop()
    .replace(".mp3", "")
    .replaceAll("-", " ");
}

function playRandomTrack() {
  if (!tracks.length) return;

  const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];

  currentTrack = randomTrack;
  audio.src = randomTrack;
  audio.play();

  if (trackTitle) {
    trackTitle.textContent = getTrackName(randomTrack);
  }

  if (mp3Controls) {
    mp3Controls.classList.add("is-visible");
  }
}

function stopAudio() {
  audio.pause();
  audio.currentTime = 0;
}

if (mp3Hotspot) {
  mp3Hotspot.addEventListener("click", () => {
    playRandomTrack();
  });
}

document.querySelectorAll("[data-audio-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.audioAction;

    if (action === "play") {
      if (audio.src) {
        audio.play();
      } else {
        playRandomTrack();
      }
    }

    if (action === "pause") {
      audio.pause();
    }

    if (action === "stop") {
      stopAudio();
    }

    if (action === "volume-down") {
      audio.volume = Math.max(0, audio.volume - 0.1);
    }

    if (action === "volume-up") {
      audio.volume = Math.min(1, audio.volume + 0.1);
    }
  });
});

audio.addEventListener("ended", () => {
  playRandomTrack();
});