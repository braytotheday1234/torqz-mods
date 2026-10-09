const names = { carbon: "Carbon & Crimson", copper: "Titanium & Copper", violet: "Obsidian & Violet" };
const colors = { carbon: "#0b0d11", copper: "#0d0e10", violet: "#0b0b12" };
const key = "torqz-theme-v3";

export function initThemePicker() {
  const trigger = document.querySelector("[data-theme-toggle]");
  const panel = document.querySelector("[data-theme-popover]");
  if (!trigger || !panel) return;
  const choices = [...panel.querySelectorAll("[data-theme-choice]")];
  const getTheme = () => names[document.documentElement.dataset.theme] ? document.documentElement.dataset.theme : "carbon";

  function reflect() {
    const theme = getTheme();
    trigger.setAttribute("aria-label", "Color theme: " + names[theme] + ". Change theme");
    choices.forEach(button => {
      const selected = button.dataset.themeChoice === theme;
      button.setAttribute("aria-pressed", String(selected));
      button.classList.toggle("selected", selected);
    });
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", colors[theme]);
  }
  function close(restore = false) {
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (restore) trigger.focus();
  }
  function open() {
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    const selected = choices.find(button => button.dataset.themeChoice === getTheme());
    (selected || choices[0])?.focus();
  }
  trigger.addEventListener("click", () => panel.hidden ? open() : close(true));
  choices.forEach(button => button.addEventListener("click", () => {
    const theme = button.dataset.themeChoice;
    if (!names[theme]) return;
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(key, theme); } catch (_) {}
    reflect();
    close(true);
  }));
  document.addEventListener("pointerdown", event => {
    if (!panel.hidden && !panel.contains(event.target) && !trigger.contains(event.target)) close();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) {
      event.preventDefault();
      close(true);
    }
  });
  reflect();
}
