const hero = document.querySelector("#hero");

const layers = [
  { selector: ".skyline-far", depth: 4 },
  { selector: ".skyline-mid", depth: 8 },
  { selector: ".window-frame", depth: 3 },
  { selector: ".monitor", depth: 12 },
  { selector: ".keyboard", depth: 16 },
  { selector: ".instax", depth: 18 },
  { selector: ".phone", depth: 20 },
  { selector: ".sushi", depth: 14 },
  { selector: ".cocktail", depth: 18 },
  { selector: ".mouse", depth: 20 },
];

hero.addEventListener("mousemove", (event) => {
  const rect = hero.getBoundingClientRect();

  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;

  layers.forEach(({ selector, depth }) => {
    const el = document.querySelector(selector);
    if (!el) return;

    el.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
  });
});

hero.addEventListener("mouseleave", () => {
  layers.forEach(({ selector }) => {
    const el = document.querySelector(selector);
    if (!el) return;

    el.style.transform = "translate(0, 0)";
  });
});