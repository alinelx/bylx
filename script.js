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
  window.addEventListener("mousemove", handlePointerMove);
  hero.addEventListener("pointerleave", handlePointerLeave);
  hero.addEventListener("mouseleave", handlePointerLeave);
  window.addEventListener("blur", handlePointerLeave);
  updateLayers();
}
