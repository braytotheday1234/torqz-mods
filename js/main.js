import { SITE_CONFIG, externalOrPlaceholder } from "./config.js";
import { MODS, CATEGORIES, getModBySlug } from "./mods.js";
import { mountHeader, mountFooter, modCard } from "./components.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const root = document.body.dataset.root || "";

mountHeader(document.body.dataset.page || "");
mountFooter();

$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

function toast(message) {
  const el = $("[data-toast]");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => el.classList.remove("show"), 2800);
}

$$("[data-placeholder-link]").forEach((el) => {
  el.addEventListener("click", (event) => {
    event.preventDefault();
    toast("This link is ready — add the real URL in js/config.js.");
  });
});

const menuToggle = $("[data-menu-toggle]");
const mobileNav = $("[data-mobile-nav]");
if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");
    menuToggle.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  });
}

const overlay = $("[data-search-overlay]");
const searchInput = $("[data-global-search]");
const searchResults = $("[data-search-results]");
function closeSearch() {
  if (!overlay) return;
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("search-open");
}
function openSearch() {
  if (!overlay) return;
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("search-open");
  window.setTimeout(() => searchInput?.focus(), 60);
}
$("[data-search-trigger]")?.addEventListener("click", openSearch);
$$("[data-search-close]").forEach((el) => el.addEventListener("click", closeSearch));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSearch();
  if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
    event.preventDefault();
    openSearch();
  }
});
if (searchInput && searchResults) {
  const renderSearch = () => {
    const query = searchInput.value.trim().toLowerCase();
    const matches = MODS.filter((mod) => [mod.name, mod.category, mod.description].join(" ").toLowerCase().includes(query));
    searchResults.innerHTML = query
      ? matches.length
        ? matches.map((mod) => `<a href="${root}mods/${mod.slug}.html"><span><strong>${mod.name}</strong><small>${mod.category} · ${mod.status}</small></span><b>→</b></a>`).join("")
        : `<div class="search-empty">No Torqz mods match “${searchInput.value}”.</div>`
      : `<div class="search-empty">Start typing to search the Torqz library.</div>`;
  };
  searchInput.addEventListener("input", renderSearch);
  renderSearch();
}

const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: 0.12 })
  : null;
$$("[data-reveal]").forEach((el) => revealObserver ? revealObserver.observe(el) : el.classList.add("is-visible"));

const featuredMount = $("[data-featured-mods]");
if (featuredMount) {
  featuredMount.innerHTML = MODS.filter((mod) => mod.featured).map((mod) => modCard(mod, root)).join("");
}

const modGrid = $("[data-mod-grid]");
if (modGrid) {
  modGrid.innerHTML = MODS.map((mod) => modCard(mod, root)).join("");
  const categoryButtons = $$("[data-category-filter]");
  const sortSelect = $("[data-sort]");
  const localSearch = $("[data-mod-search]");

  const applyFilters = () => {
    const active = $("[data-category-filter].active")?.dataset.categoryFilter || "All";
    const query = localSearch?.value.trim().toLowerCase() || "";
    let items = [...MODS].filter((mod) => (active === "All" || mod.category === active) && [mod.name, mod.category, mod.description].join(" ").toLowerCase().includes(query));
    if (sortSelect?.value === "name") items.sort((a, b) => a.name.localeCompare(b.name));
    if (sortSelect?.value === "featured") items.sort((a, b) => Number(b.featured) - Number(a.featured));
    modGrid.innerHTML = items.length ? items.map((mod) => modCard(mod, root)).join("") : `<div class="empty-state"><strong>No mods found.</strong><span>Try another search or category.</span></div>`;
    const count = $("[data-result-count]");
    if (count) count.textContent = `${items.length} ${items.length === 1 ? "project" : "projects"}`;
  };

  categoryButtons.forEach((button) => button.addEventListener("click", () => {
    categoryButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    applyFilters();
  }));
  sortSelect?.addEventListener("change", applyFilters);
  localSearch?.addEventListener("input", applyFilters);
  applyFilters();
}

const categoryMount = $("[data-category-list]");
if (categoryMount) {
  categoryMount.innerHTML = CATEGORIES.map((category, index) => `<button class="filter-chip ${index === 0 ? "active" : ""}" type="button" data-category-filter="${category}">${category}</button>`).join("");
}

const detailMount = $("[data-mod-detail]");
if (detailMount) {
  const slug = document.body.dataset.modSlug || "";
  const mod = getModBySlug(slug);
  if (!mod) {
    detailMount.innerHTML = `<div class="empty-state"><strong>Mod not found.</strong><a href="../mods.html">Return to mods</a></div>`;
  } else {
    const download = externalOrPlaceholder(mod.downloadUrl);
    detailMount.innerHTML = `
      <section class="detail-hero">
        <div class="detail-media">
          <img src="../${mod.image}" alt="${mod.name} preview" width="1200" height="675" />
          <span class="detail-status">${mod.status}</span>
        </div>
        <aside class="detail-summary">
          <span class="eyebrow">${mod.category} · ${mod.releaseType}</span>
          <h1>${mod.name}</h1>
          <p>${mod.description}</p>
          <div class="download-specs">
            <div><small>Version</small><strong>${mod.version}</strong></div>
            <div><small>BeamNG</small><strong>${mod.beamngVersion}</strong></div>
            <div><small>File size</small><strong>${mod.fileSize}</strong></div>
            <div><small>Updated</small><strong>${mod.updated}</strong></div>
          </div>
          ${download ? `<a class="button button-primary button-wide" href="${download}">Download ${mod.version}</a>` : `<button class="button button-primary button-wide is-disabled" type="button" disabled>Download unavailable</button>`}
          <p class="download-note">${download ? "Official Torqz download." : "A real download link will appear here when the mod is released."}</p>
        </aside>
      </section>
      <section class="detail-content">
        <article class="prose-card">
          <span class="section-kicker">Overview</span>
          <h2>About ${mod.name}</h2>
          <p>${mod.fullDescription}</p>
          <h3>Features</h3>
          <ul>${mod.features.map((item) => `<li>${item}</li>`).join("")}</ul>
        </article>
        <aside class="detail-sidebar">
          <div class="side-card"><span class="section-kicker">Compatibility</span><h3>Before you install</h3><p>Compatibility is intentionally marked TBD until a real build has been tested against a specific BeamNG.drive version.</p></div>
          <div class="side-card"><span class="section-kicker">Need help?</span><h3>Installation support</h3><p>Use the Torqz install guide for the normal ZIP workflow and troubleshooting steps.</p><a class="text-action" href="../install.html">Open install guide →</a></div>
        </aside>
      </section>
      <section class="detail-section">
        <div class="section-heading"><div><span class="section-kicker">Setup</span><h2>Installation</h2></div></div>
        <div class="steps-grid">${mod.installation.map((step, index) => `<div class="step-card"><span>0${index + 1}</span><p>${step}</p></div>`).join("")}</div>
      </section>
      <section class="detail-section">
        <div class="section-heading"><div><span class="section-kicker">Release history</span><h2>Changelog</h2></div></div>
        <div class="changelog">${mod.changelog.map((entry) => `<article><div><strong>${entry.version}</strong><small>${entry.date || "Current development"}</small></div><ul>${entry.items.map((item) => `<li>${item}</li>`).join("")}</ul></article>`).join("")}</div>
      </section>
      <section class="detail-section">
        <div class="section-heading"><div><span class="section-kicker">Credits</span><h2>Project credits</h2></div></div>
        <div class="credits-row">${mod.credits.map((name) => `<span>${name}</span>`).join("")}</div>
      </section>
    `;
  }
}

$$("[data-discord-link]").forEach((button) => {
  const url = externalOrPlaceholder(SITE_CONFIG.discordUrl);
  if (url) {
    button.href = url;
    button.target = "_blank";
    button.rel = "noreferrer";
  } else {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      toast("Discord is ready to connect — add the invite in js/config.js.");
    });
  }
});

$$("[data-accordion-button]").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const open = item.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
  });
});
