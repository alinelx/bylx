const hero = document.querySelector("#hero");

const layers = [
  { selector: ".skyline-far", depth: 4 },
  { selector: ".window-frame", depth: 3 },
  { selector: ".monitor", depth: 12 },
  { selector: ".keyboard", depth: 16 },
  { selector: ".instax", depth: 18 },
  { selector: ".phone", depth: 20 },
  { selector: ".sushi", depth: 14 },
  { selector: ".cocktail", depth: 18 },
  { selector: ".mouse", depth: 20 },
];

if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  hero.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    layers.forEach(({ selector, depth }) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.style.setProperty("--move-x", `${x * depth}px`);
        el.style.setProperty("--move-y", `${y * depth}px`);
      });
    });
  });

  hero.addEventListener("mouseleave", () => {
    layers.forEach(({ selector }) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.style.setProperty("--move-x", "0px");
        el.style.setProperty("--move-y", "0px");
      });
    });
  });
}