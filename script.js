const hero = document.querySelector("#hero");

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const isDesktop = window.matchMedia("(min-width: 901px)").matches;

const layers = [
  { selector: ".skyline-far", depth: 4 },
  { selector: ".window-frame", depth: 2 },
  { selector: ".table", depth: 3 },
  { selector: ".win-bg", depth: 6 },
  { selector: ".desktop-icons", depth: 8 },
  { selector: ".pixel-window", depth: 9 },
  { selector: ".paint", depth: 10 },
  { selector: ".toolbar", depth: 11 },
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
let animationFrame = null;

function updateLayers() {
  currentX += (targetX - currentX) * 0.08;
  currentY += (targetY - currentY) * 0.08;

  layerElements.forEach(({ depth, elements }) => {
    const moveX = currentX * depth;
    const moveY = currentY * depth;

    elements.forEach((element) => {
      element.style.setProperty("--move-x", `${moveX}px`);
      element.style.setProperty("--move-y", `${moveY}px`);
    });
  });

  animationFrame = requestAnimationFrame(updateLayers);
}

function handleMouseMove(event) {
  const rect = hero.getBoundingClientRect();

  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;

  targetX = x;
  targetY = y;
}

function handleMouseLeave() {
  targetX = 0;
  targetY = 0;
}

if (hero && !prefersReducedMotion && isDesktop) {
  hero.addEventListener("mousemove", handleMouseMove);
  hero.addEventListener("mouseleave", handleMouseLeave);

  updateLayers();
}
