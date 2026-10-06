import { SITE_CONFIG, configured } from "./config.js";
import { MODS, CATEGORIES, getModBySlug } from "./mods.js";
import { UPDATES } from "./updates.js";
import { mountHeader, mountFooter, modTile } from "./components.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const base = document.body.dataset.root || "";

mountHeader(document.body.dataset.page || "");
mountFooter();

$$("[data-year]").forEach((node) => (node.textContent = new Date().getFullYear()));

function toast(message) {
  const node = $("[data-toast]");
  if (!node) return;
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 2800);
}

$$("[data-placeholder-link]").forEach((node) => node.addEventListener("click", (event) => {
  event.preventDefault();
  toast("Coming soon — add the real link in js/config.js.");
}));

const header = $("[data-header]");
if (header) {
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

const menuButton = $("[data-menu-toggle]");
const mobileNav = $("[data-mobile-nav]");
menuButton?.addEventListener("click", () => {
  const open = mobileNav?.classList.toggle("open") || false;
  menuButton.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
});

const searchOverlay = $("[data-search-overlay]");
const globalSearch = $("[data-global-search]");
const globalResults = $("[data-search-results]");
let searchIndex = -1;

function closeSearch() {
  if (!searchOverlay) return;
  searchOverlay.classList.remove("open");
  searchOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("search-open");
  searchIndex = -1;
}

function openSearch() {
  if (!searchOverlay) return;
  searchOverlay.classList.add("open");
  searchOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("search-open");
  setTimeout(() => globalSearch?.focus(), 50);
  renderGlobalSearch();
}

function renderGlobalSearch() {
  if (!globalResults || !globalSearch) return;
  const query = globalSearch.value.trim().toLowerCase();
  const matches = MODS.filter((mod) => [mod.title, mod.subtitle, mod.category, mod.status, mod.description, mod.version].join(" ").toLowerCase().includes(query));
  if (!query) {
    globalResults.innerHTML = '<div class="command-empty"><strong>Start typing to search.</strong><span>Projects, categories, status, and versions are indexed.</span></div>';
    searchIndex = -1;
    return;
  }
  if (!matches.length) {
    globalResults.innerHTML = `<div class="command-empty"><strong>No results for “${globalSearch.value}”.</strong><span>Try a project name or category.</span></div>`;
    searchIndex = -1;
    return;
  }
  globalResults.innerHTML = matches.map((mod, index) => `
    <a class="command-result ${index === 0 ? "selected" : ""}" href="${base}mods/${mod.slug}.html" data-search-result>
      <img src="${base}${mod.thumbnail}" alt="" width="112" height="70">
      <span><strong>${mod.title}</strong><small>${mod.category} · ${mod.status} · ${mod.version}</small></span>
      <b>↗</b>
    </a>`).join("");
  searchIndex = 0;
}

function moveSearch(delta) {
  const results = $$("[data-search-result]");
  if (!results.length) return;
  searchIndex = Math.max(0, Math.min(results.length - 1, searchIndex + delta));
  results.forEach((node, index) => node.classList.toggle("selected", index === searchIndex));
  results[searchIndex]?.scrollIntoView({ block: "nearest" });
}

$("[data-search-trigger]")?.addEventListener("click", openSearch);
$$("[data-search-close]").forEach((node) => node.addEventListener("click", closeSearch));
globalSearch?.addEventListener("input", renderGlobalSearch);
document.addEventListener("keydown", (event) => {
  const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
    return;
  }
  if (event.key === "/" && !typing) {
    event.preventDefault();
    openSearch();
    return;
  }
  if (!searchOverlay?.classList.contains("open")) return;
  if (event.key === "Escape") closeSearch();
  if (event.key === "ArrowDown") { event.preventDefault(); moveSearch(1); }
  if (event.key === "ArrowUp") { event.preventDefault(); moveSearch(-1); }
  if (event.key === "Enter" && searchIndex >= 0) {
    const target = $$("[data-search-result]")[searchIndex];
    if (target) window.location.href = target.href;
  }
});

const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: "0px 0px -35px" }) : null;

$$("[data-reveal]").forEach((node) => observer ? observer.observe(node) : node.classList.add("visible"));

const featured = $("[data-featured-project]");
if (featured) {
  const mod = MODS.find((item) => item.featured);
  if (mod) {
    featured.innerHTML = `
      <a class="featured-project-media" href="mods/${mod.slug}.html">
        <img src="${mod.heroImage}" alt="${mod.title} development preview" width="1600" height="900">
        <span class="featured-label">Featured Project</span>
        <div class="featured-overlay">
          <div><span>${mod.category}</span><h2>${mod.title}</h2></div>
          <div class="featured-status"><small>Status</small><strong>${mod.status}</strong></div>
        </div>
      </a>
      <div class="featured-project-copy">
        <p>${mod.description}</p>
        <div class="featured-spec-row"><span><small>Version</small><b>${mod.version}</b></span><span><small>BeamNG</small><b>${mod.beamngVersion}</b></span><span><small>Updated</small><b>${mod.updatedLabel}</b></span></div>
        <a class="inline-arrow" href="mods/${mod.slug}.html">View Project <b>→</b></a>
      </div>`;
  }
}

const projectGrid = $("[data-project-grid]");
if (projectGrid) {
  projectGrid.innerHTML = MODS.map((mod) => modTile(mod, base)).join("") + `
    <div class="future-project">
      <span>Future project</span>
      <strong>Next release slot</strong>
      <p>Reserved for a real Torqz project. No placeholder mod name or fake details.</p>
    </div>`;
}

const latestUpdates = $("[data-latest-updates]");
if (latestUpdates) {
  latestUpdates.innerHTML = UPDATES.slice(0, 3).map((item, index) => `
    <article class="update-row">
      <div class="update-index">0${index + 1}</div>
      <time datetime="${item.date}">${item.displayDate}</time>
      <div><span>${item.category}</span><h3>${item.title}</h3><p>${item.description}</p></div>
      <a href="updates.html">Read update <b>→</b></a>
    </article>`).join("");
}

const updatesMount = $("[data-updates-list]");
if (updatesMount) {
  updatesMount.innerHTML = UPDATES.map((item, index) => `
    <article class="journal-entry" data-reveal>
      <div class="journal-num">${String(index + 1).padStart(2, "0")}</div>
      <div class="journal-meta"><time datetime="${item.date}">${item.displayDate}</time><span>${item.category}</span></div>
      <div class="journal-copy"><h2>${item.title}</h2><p>${item.description}</p>${item.projectSlug ? `<a href="mods/${item.projectSlug}.html">Open related project →</a>` : ""}</div>
    </article>`).join("");
  $$("[data-reveal]", updatesMount).forEach((node) => observer ? observer.observe(node) : node.classList.add("visible"));
}

const categoryMount = $("[data-category-list]");
if (categoryMount) {
  categoryMount.innerHTML = CATEGORIES.map((category, index) => `<button class="filter-chip ${index === 0 ? "active" : ""}" type="button" data-category-filter="${category}">${category}</button>`).join("");
}

const modGrid = $("[data-mod-grid]");
if (modGrid) {
  const localSearch = $("[data-mod-search]");
  const sort = $("[data-sort]");

  function renderLibrary() {
    const active = $("[data-category-filter].active")?.dataset.categoryFilter || "All";
    const query = localSearch?.value.trim().toLowerCase() || "";
    let items = MODS.filter((mod) => (active === "All" || mod.category === active) && [mod.title, mod.category, mod.description, mod.status].join(" ").toLowerCase().includes(query));
    if (sort?.value === "az") items = [...items].sort((a, b) => a.title.localeCompare(b.title));
    if (sort?.value === "updated") items = [...items].sort((a, b) => (b.updatedDate || "").localeCompare(a.updatedDate || ""));
    if (sort?.value === "latest") items = [...items].sort((a, b) => (b.releaseDate || "").localeCompare(a.releaseDate || ""));
    modGrid.innerHTML = items.length ? items.map((mod) => modTile(mod, base)).join("") : '<div class="library-empty"><strong>No matching projects.</strong><span>Try another category or search term.</span></div>';
    const count = $("[data-result-count]");
    if (count) count.textContent = `${items.length} ${items.length === 1 ? "project" : "projects"}`;
  }

  categoryMount?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category-filter]");
    if (!button) return;
    $$("[data-category-filter]", categoryMount).forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderLibrary();
  });
  localSearch?.addEventListener("input", renderLibrary);
  sort?.addEventListener("change", renderLibrary);
  renderLibrary();
}

const detail = $("[data-mod-detail]");
if (detail) {
  const mod = getModBySlug(document.body.dataset.modSlug || "");
  if (!mod) {
    detail.innerHTML = '<div class="library-empty"><strong>Project not found.</strong><a href="../mods.html">Return to mods</a></div>';
  } else {
    const download = configured(mod.downloadUrl);
    const related = MODS.filter((item) => item.slug !== mod.slug);
    detail.innerHTML = `
      <section class="project-hero">
        <div class="project-hero-media">
          <img src="../${mod.heroImage}" alt="${mod.title} development preview" width="1800" height="1013">
          <div class="project-hero-shade"></div>
          <div class="project-hero-copy">
            <span>${mod.category} / ${mod.status}</span>
            <h1>${mod.title}</h1>
            <p>${mod.description}</p>
            <div class="project-hero-actions">
              ${download ? `<a class="button primary" href="${download}">Download ${mod.version}</a>` : `<span class="coming-soon">Download / Coming Soon</span>`}
              <a class="button ghost" href="../install.html">View Installation</a>
            </div>
          </div>
          <div class="project-hero-status"><small>Current status</small><strong>${mod.status}</strong></div>
        </div>
      </section>
      <section class="project-info-rail">
        <div><small>Version</small><strong>${mod.version}</strong></div>
        <div><small>BeamNG Version</small><strong>${mod.beamngVersion}</strong></div>
        <div><small>File Size</small><strong>${mod.fileSize}</strong></div>
        <div><small>Updated</small><strong>${mod.updatedLabel}</strong></div>
        <div><small>Category</small><strong>${mod.category}</strong></div>
      </section>
      <section class="project-section project-gallery-section">
        <div class="project-section-head"><span>Media / 01</span><h2>Project gallery</h2><p>Development placeholders are intentionally labeled. Drop real project media into the configured asset paths later.</p></div>
        <div class="project-gallery">
          <button class="gallery-primary" type="button" data-gallery-image="../${mod.heroImage}" data-gallery-label="${mod.title} development preview"><img src="../${mod.heroImage}" alt="${mod.title} development preview" loading="lazy"></button>
          <div class="gallery-secondary">${mod.gallery.map((image) => `<button type="button" data-gallery-image="../${image.src}" data-gallery-label="${image.alt}"><img src="../${image.src}" alt="${image.alt}" loading="lazy"><span>Development media</span></button>`).join("")}</div>
        </div>
      </section>
      <section class="project-section editorial-about">
        <div class="project-section-head"><span>Overview / 02</span><h2>About this project</h2></div>
        <div class="editorial-copy"><p>${mod.longDescription}</p><div class="feature-rows">${mod.features.map((feature, index) => `<div class="feature-row"><span>0${index + 1}</span><div><h3>${feature.title}</h3><p>${feature.description}</p></div></div>`).join("")}</div></div>
      </section>
      <section class="project-section install-section">
        <div class="project-section-head"><span>Setup / 03</span><h2>Installation</h2><p>Four clear steps. Release-specific exceptions will always be called out on this page.</p></div>
        <div class="install-cards">${mod.installation.map((step, index) => `<article><div class="install-number">0${index + 1}</div><div class="install-icon" aria-hidden="true">${step.icon === "download" ? "↓" : step.icon === "file" ? "▱" : step.icon === "folder" ? "▰" : "▶"}</div><h3>${step.title}</h3><p>${step.description}</p></article>`).join("")}</div>
        <div class="path-row"><span>Typical location</span><code>%LOCALAPPDATA%\BeamNG.drive\&lt;version&gt;\mods</code><button type="button" data-copy-path>Copy</button></div>
      </section>
      <section class="project-section compatibility-section">
        <div class="compatibility-copy"><span>Compatibility / 04</span><h2>Current status</h2><strong>${mod.compatibility.status}</strong></div>
        <div class="compatibility-lines"><div><span>Supported BeamNG Version</span><b>${mod.compatibility.beamngVersion}</b></div><div><span>Known Issues</span><b>${mod.compatibility.knownIssues}</b></div><div><span>Release File</span><b>${download ? "Available" : "Coming Soon"}</b></div></div>
      </section>
      <section class="project-section changelog-section">
        <div class="project-section-head"><span>History / 05</span><h2>Changelog</h2></div>
        <div class="changelog-list">${mod.changelog.map((entry, index) => `<article class="changelog-item ${index === 0 ? "open" : ""}"><button type="button" data-changelog-toggle aria-expanded="${index === 0 ? "true" : "false"}"><span><strong>${entry.version}</strong><small>${entry.date || "Current development"}</small></span><b>${index === 0 ? "−" : "+"}</b></button><div class="changelog-body"><div>${Object.entries(entry.groups).filter(([,items]) => items.length).map(([label, items]) => `<section><h3>${label}</h3><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul></section>`).join("")}</div></div></article>`).join("")}</div>
      </section>
      <section class="project-section credits-section"><div><span>Credits / 06</span><h2>Project credits</h2></div><div>${mod.credits.map((credit) => `<strong>${credit}</strong>`).join("")}</div></section>
      ${related.length ? `<section class="project-section"><div class="project-section-head"><span>More / 07</span><h2>More from Torqz</h2></div><div class="mod-grid">${related.map((item) => modTile(item, "../")).join("")}</div></section>` : ""}
    `;
  }
}

const lightbox = $("[data-lightbox]");
const lightboxImage = $("[data-lightbox-image]");
const lightboxLabel = $("[data-lightbox-label]");
document.addEventListener("click", (event) => {
  const galleryButton = event.target.closest("[data-gallery-image]");
  if (galleryButton && lightbox && lightboxImage) {
    lightboxImage.src = galleryButton.dataset.galleryImage;
    lightboxImage.alt = galleryButton.dataset.galleryLabel || "";
    if (lightboxLabel) lightboxLabel.textContent = galleryButton.dataset.galleryLabel || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("search-open");
  }
  const changelog = event.target.closest("[data-changelog-toggle]");
  if (changelog) {
    const item = changelog.closest(".changelog-item");
    const open = item.classList.toggle("open");
    changelog.setAttribute("aria-expanded", String(open));
    const symbol = changelog.querySelector("b");
    if (symbol) symbol.textContent = open ? "−" : "+";
  }
});
$("[data-lightbox-close]")?.addEventListener("click", () => {
  lightbox?.classList.remove("open");
  lightbox?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("search-open");
});
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("search-open");
  }
});

$("[data-copy-path]")?.addEventListener("click", async (event) => {
  const path = "%LOCALAPPDATA%\\BeamNG.drive\\<version>\\mods";
  try {
    await navigator.clipboard.writeText(path);
    event.currentTarget.textContent = "Copied";
    setTimeout(() => (event.currentTarget.textContent = "Copy"), 1600);
  } catch {
    toast("Copy failed — select the path manually.");
  }
});

$$("[data-discord-link]").forEach((node) => {
  const url = configured(SITE_CONFIG.discordUrl);
  node.addEventListener("click", (event) => {
    event.preventDefault();
    if (url) window.open(url, "_blank", "noopener");
    else toast("Discord / Coming Soon — add the invite in js/config.js.");
  });
});

$$("[data-accordion-button]").forEach((button) => button.addEventListener("click", () => {
  const item = button.closest(".faq-item");
  const open = item.classList.toggle("open");
  button.setAttribute("aria-expanded", String(open));
  const symbol = button.querySelector("[data-accordion-symbol]");
  if (symbol) symbol.textContent = open ? "−" : "+";
}));
