import { SITE_CONFIG, configured } from "./config.js";
import { MODS, CATEGORIES, getModBySlug } from "./mods.js";
import { UPDATES } from "./updates.js";
import { mountHeader, mountFooter, modTile, mediaFrame, statusBadge } from "./components.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const base = document.body.dataset.root || "";

mountHeader(document.body.dataset.page || "");
mountFooter();
document.documentElement.classList.add("js");
requestAnimationFrame(() => document.body.classList.add("page-ready"));

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
function closeMenu() {
  mobileNav?.classList.remove("open");
  menuButton?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}
menuButton?.addEventListener("click", () => {
  const open = mobileNav?.classList.toggle("open") || false;
  menuButton.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
});
$("[data-menu-close]")?.addEventListener("click", closeMenu);
$$(".mobile-nav a").forEach((link) => link.addEventListener("click", closeMenu));

const searchOverlay = $("[data-search-overlay]");
const globalSearch = $("[data-global-search]");
const globalResults = $("[data-search-results]");
let searchIndex = -1;
let searchPreviousFocus = null;

function closeSearch() {
  if (!searchOverlay) return;
  searchOverlay.classList.remove("open");
  searchOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("search-open");
  searchIndex = -1;
  searchPreviousFocus?.focus?.();
}

function openSearch() {
  if (!searchOverlay) return;
  searchPreviousFocus = document.activeElement;
  searchOverlay.classList.add("open");
  searchOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("search-open");
  setTimeout(() => globalSearch?.focus(), 60);
  renderGlobalSearch();
}

function renderGlobalSearch() {
  if (!globalResults || !globalSearch) return;
  const query = globalSearch.value.trim().toLowerCase();
  const matches = MODS.filter((mod) =>
    [mod.title, mod.subtitle, mod.category, mod.status, mod.shortDescription, mod.description, mod.version]
      .join(" ").toLowerCase().includes(query)
  );

  if (!query) {
    globalResults.innerHTML = '<div class="command-empty"><strong>Search the Torqz library.</strong><span>Project name, category, status, and version.</span></div>';
    searchIndex = -1;
    return;
  }
  if (!matches.length) {
    globalResults.innerHTML = '<div class="command-empty"><strong>No Torqz projects found.</strong><span>Try another project name or category.</span></div>';
    searchIndex = -1;
    return;
  }

  globalResults.innerHTML = matches.map((mod, index) =>
    '<a class="command-result ' + (index === 0 ? "selected" : "") + '" href="' + base + 'mods/' + mod.slug + '.html" data-search-result>' +
    '<img src="' + base + mod.thumbnail + '" alt="" width="112" height="70" loading="lazy">' +
    '<span><strong>' + mod.title + '</strong><small>' + mod.category + ' · ' + mod.status + ' · ' + mod.version + '</small></span><b>↗</b></a>'
  ).join("");
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
  if (event.key === "Escape") {
    if (searchOverlay?.classList.contains("open")) closeSearch();
    if (mobileNav?.classList.contains("open")) closeMenu();
  }
  if (!searchOverlay?.classList.contains("open")) return;
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

function wireImages(scope = document) {
  $$("[data-fade-image]", scope).forEach((img) => {
    const finish = () => img.classList.add("loaded");
    if (img.complete) finish();
    else {
      img.addEventListener("load", finish, { once: true });
      img.addEventListener("error", () => {
        img.classList.add("media-error");
        img.closest(".media-frame")?.classList.add("media-failed");
      }, { once: true });
    }
  });
}
wireImages();

const videoObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const video = entry.target;
    const source = $("source[data-src]", video);
    if (source && !source.src) {
      source.src = source.dataset.src;
      video.load();
    }
    videoObserver.unobserve(video);
  });
}, { rootMargin: "240px" }) : null;
$$("[data-lazy-video]").forEach((video) => videoObserver ? videoObserver.observe(video) : video.load());

const featured = $("[data-featured-project]");
if (featured) {
  const mod = MODS.find((item) => item.featured);
  if (mod) {
    const heroMedia = mediaFrame({
      src: mod.heroImage,
      alt: mod.title + " development preview",
      video: mod.video,
      poster: mod.videoPoster,
      loading: "eager",
      className: "featured-media-frame"
    });
    featured.innerHTML =
      '<a class="featured-project-media" href="mods/' + mod.slug + '.html">' + heroMedia +
      '<span class="featured-label">Featured Project</span><span class="featured-corner"></span>' +
      '<div class="featured-overlay"><div><span>' + mod.category + '</span><h2>' + mod.title + '</h2></div><div class="featured-status"><small>Status</small><strong>' + mod.status + '</strong></div></div>' +
      '<span class="featured-view">View Project <b>→</b></span></a>' +
      '<div class="featured-project-copy"><p>' + (mod.shortDescription || mod.description) + '</p>' +
      '<div class="featured-spec-row"><span><small>Version</small><b>' + mod.version + '</b></span><span><small>BeamNG</small><b>' + mod.beamngVersion + '</b></span><span><small>Current phase</small><b>' + mod.currentPhase + '</b></span></div>' +
      '<a class="inline-arrow" href="mods/' + mod.slug + '.html">View Project <b>→</b></a></div>';
    wireImages(featured);
  }
}

const projectGrid = $("[data-project-grid]");
if (projectGrid) {
  projectGrid.innerHTML = MODS.map((mod) => modTile(mod, base)).join("") +
    '<div class="future-project"><div class="future-grid"></div><span>Future Torqz Project</span><strong>Reserved for the next release.</strong><p>No fake project name. No fake vehicle art. This slot becomes real only when the next Torqz project exists.</p></div>';
  wireImages(projectGrid);
}

const latestUpdates = $("[data-latest-updates]");
if (latestUpdates) {
  latestUpdates.innerHTML = UPDATES.slice(0, 3).map((item, index) =>
    '<article class="update-row"><div class="update-index">0' + (index + 1) + '</div><time datetime="' + item.date + '">' + item.displayDate +
    '</time><div><span>' + item.category + '</span><h3>' + item.title + '</h3><p>' + item.description +
    '</p></div><a href="updates.html">Read update <b>→</b></a></article>'
  ).join("");
}

const updatesMount = $("[data-updates-list]");
if (updatesMount) {
  updatesMount.innerHTML = UPDATES.map((item, index) =>
    '<article class="journal-entry" data-reveal><div class="journal-num">' + String(index + 1).padStart(2, "0") +
    '</div><div class="journal-meta"><time datetime="' + item.date + '">' + item.displayDate + '</time><span>' + item.category +
    '</span></div><div class="journal-copy"><h2>' + item.title + '</h2><p>' + item.description + '</p>' +
    (item.projectSlug ? '<a href="mods/' + item.projectSlug + '.html">Open related project →</a>' : '') + '</div></article>'
  ).join("");
  $$("[data-reveal]", updatesMount).forEach((node) => observer ? observer.observe(node) : node.classList.add("visible"));
}

const categoryMount = $("[data-category-list]");
if (categoryMount) {
  categoryMount.innerHTML = CATEGORIES.map((category, index) =>
    '<button class="filter-chip ' + (index === 0 ? "active" : "") + '" type="button" data-category-filter="' + category + '">' + category + '</button>'
  ).join("");
}

const modGrid = $("[data-mod-grid]");
if (modGrid) {
  const localSearch = $("[data-mod-search]");
  const sort = $("[data-sort]");
  function renderLibrary() {
    modGrid.classList.add("is-loading");
    const active = $("[data-category-filter].active")?.dataset.categoryFilter || "All";
    const query = localSearch?.value.trim().toLowerCase() || "";
    let items = MODS.filter((mod) => (active === "All" || mod.category === active) &&
      [mod.title, mod.category, mod.shortDescription, mod.status].join(" ").toLowerCase().includes(query));
    if (sort?.value === "az") items = [...items].sort((a, b) => a.title.localeCompare(b.title));
    if (sort?.value === "updated") items = [...items].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    if (sort?.value === "latest") items = [...items].sort((a, b) => (b.releaseDate || b.updatedAt || "").localeCompare(a.releaseDate || a.updatedAt || ""));
    requestAnimationFrame(() => {
      modGrid.innerHTML = items.length ? items.map((mod) => modTile(mod, base)).join("") :
        '<div class="library-empty"><strong>No matching projects.</strong><span>Try another category or search term.</span></div>';
      modGrid.classList.remove("is-loading");
      const count = $("[data-result-count]");
      if (count) count.textContent = items.length + " " + (items.length === 1 ? "project" : "projects");
      wireImages(modGrid);
    });
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
    detail.innerHTML = '<section class="project-error"><span>Project error</span><h1>Project not found.</h1><p>The requested Torqz project does not exist or its data is unavailable.</p><a class="button primary" href="../mods.html">Browse Mods →</a></section>';
  } else {
    const download = configured(mod.downloadUrl);
    const related = MODS.filter((item) => item.slug !== mod.slug);
    const heroMedia = mediaFrame({
      src: "../" + mod.heroImage,
      alt: mod.title + " development preview",
      video: mod.video ? "../" + mod.video : "",
      poster: mod.videoPoster ? "../" + mod.videoPoster : "",
      loading: "eager",
      className: "project-hero-frame"
    });
    detail.innerHTML =
      '<section class="project-hero"><div class="project-hero-media">' + heroMedia + '<div class="project-hero-shade"></div>' +
      '<div class="project-hero-copy"><span>TORQZ / ' + mod.title + '</span><h1>' + mod.title + '</h1><p>' + (mod.shortDescription || mod.description) + '</p>' +
      '<div class="project-hero-actions">' +
      (download ? '<a class="button primary" href="' + download + '">Download ' + mod.version + '</a>' : '<span class="release-state">Release not available yet</span>') +
      '<a class="button ghost" href="../install.html">Installation / Information</a></div></div>' +
      '<div class="project-hero-status"><small>Current status</small>' + statusBadge(mod.status) + '</div></div></section>' +
      '<section class="project-info-rail"><div><small>Version</small><strong>' + mod.version + '</strong></div><div><small>BeamNG Version</small><strong>' + mod.beamngVersion + '</strong></div><div><small>File Size</small><strong>' + mod.fileSize + '</strong></div><div><small>Updated</small><strong>' + mod.updatedLabel + '</strong></div><div><small>Current Phase</small><strong>' + mod.currentPhase + '</strong></div></section>' +
      '<section class="project-section project-gallery-section"><div class="project-section-head"><span>Media / 01</span><h2>Project gallery</h2><p>Real screenshots, clips, before/after media, and feature demonstrations can be added through project data without changing this layout.</p></div><div class="project-gallery" data-gallery>' +
      '<button class="gallery-primary" type="button" data-gallery-index="0" data-gallery-image="../' + mod.heroImage + '" data-gallery-label="' + mod.title + ' development preview"><img src="../' + mod.heroImage + '" alt="' + mod.title + ' development preview" loading="lazy" data-fade-image></button>' +
      '<div class="gallery-secondary">' + mod.gallery.map((image, index) => '<button type="button" data-gallery-index="' + (index + 1) + '" data-gallery-image="../' + image.src + '" data-gallery-label="' + image.caption + '"><img src="../' + image.src + '" alt="' + image.alt + '" loading="lazy" data-fade-image><span>' + image.caption + '</span></button>').join("") + '</div></div></section>' +
      '<section class="project-section editorial-about"><div class="project-section-head"><span>Overview / 02</span><h2>About this project</h2></div><div class="editorial-copy"><p>' + mod.description + '</p><div class="feature-rows">' +
      mod.features.map((feature, index) => '<div class="feature-row"><span>0' + (index + 1) + '</span><div><h3>' + feature.title + '</h3><p>' + feature.description + '</p></div></div>').join("") +
      '</div></div></section>' +
      (mod.developmentMilestones?.length ? '<section class="project-section"><div class="project-section-head"><span>Progress / 03</span><h2>Development milestones</h2><p>No fake percentage. These stages update directly from Project 01 data.</p></div><div class="milestone-rail">' +
      mod.developmentMilestones.map((item) => '<div class="milestone ' + String(item.status).toLowerCase().replaceAll(" ", "-") + '"><span></span><strong>' + item.name + '</strong><small>' + item.status + '</small></div>').join("") + '</div></section>' : '') +
      '<section class="project-section install-section"><div class="project-section-head"><span>Setup / 04</span><h2>Installation</h2><p>Instructions are stored per project, so future Torqz releases are not forced into one install method.</p></div><div class="install-cards">' +
      mod.installation.map((step, index) => '<article><div class="install-number">0' + (index + 1) + '</div><h3>' + step.title + '</h3><p>' + step.description + '</p></article>').join("") +
      '</div><div class="path-row"><span>Typical location</span><code>%LOCALAPPDATA%\\BeamNG.drive\\&lt;version&gt;\\mods</code><button type="button" data-copy-path>Copy</button></div></section>' +
      '<section class="project-section compatibility-section"><div class="compatibility-copy"><span>Compatibility / 05</span><h2>Current status</h2>' + statusBadge(mod.compatibility.status) + '</div><div class="compatibility-lines"><div><span>Supported BeamNG Version</span><b>' + mod.compatibility.beamngVersion + '</b></div><div><span>Known Issues</span><b>' + mod.compatibility.knownIssues + '</b></div><div><span>Release File</span><b>' + (download ? "Available" : "Coming Soon") + '</b></div></div></section>' +
      (mod.developmentLog?.length ? '<section class="project-section"><div class="project-section-head"><span>Log / 06</span><h2>Development log</h2><p>Only real entries stored in project data are shown here.</p></div><div class="dev-log">' +
      mod.developmentLog.map((entry) => '<article><time datetime="' + entry.date + '">' + entry.displayDate + '</time><div><span>' + entry.status + '</span><h3>' + entry.title + '</h3><p>' + entry.description + '</p></div></article>').join("") + '</div></section>' : '') +
      '<section class="project-section changelog-section"><div class="project-section-head"><span>History / 07</span><h2>Changelog</h2></div><div class="changelog-list">' +
      mod.changelog.map((entry, index) => '<article class="changelog-item ' + (index === 0 ? "open" : "") + '"><button type="button" data-changelog-toggle aria-expanded="' + (index === 0 ? "true" : "false") + '"><span><strong>' + entry.version + '</strong><small>' + (entry.date || "Current development") + '</small></span><b>' + (index === 0 ? "−" : "+") + '</b></button><div class="changelog-body"><div>' +
      Object.entries(entry.groups).filter(([, items]) => items.length).map(([label, items]) => '<section><h3>' + label + '</h3><ul>' + items.map((item) => '<li>' + item + '</li>').join("") + '</ul></section>').join("") +
      '</div></div></article>').join("") + '</div></section>' +
      '<section class="project-section credits-section"><div><span>Credits / 08</span><h2>Project credits</h2></div><div>' + mod.credits.map((credit) => '<strong>' + credit + '</strong>').join("") + '</div></section>' +
      (related.length ? '<section class="project-section"><div class="project-section-head"><span>More / 09</span><h2>More from Torqz</h2></div><div class="mod-grid">' + related.map((item) => modTile(item, "../")).join("") + '</div></section>' : '');
    wireImages(detail);
  }
}

let galleryItems = [];
let lightboxIndex = 0;
const lightbox = $("[data-lightbox]");
const lightboxImage = $("[data-lightbox-image]");
const lightboxLabel = $("[data-lightbox-label]");

function showLightbox(index) {
  if (!galleryItems.length || !lightbox || !lightboxImage) return;
  lightboxIndex = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[lightboxIndex];
  lightboxImage.src = item.dataset.galleryImage;
  lightboxImage.alt = item.dataset.galleryLabel || "";
  if (lightboxLabel) lightboxLabel.textContent = item.dataset.galleryLabel || "";
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("search-open");
}
function closeLightbox() {
  lightbox?.classList.remove("open");
  lightbox?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("search-open");
}

document.addEventListener("click", (event) => {
  const galleryButton = event.target.closest("[data-gallery-image]");
  if (galleryButton) {
    galleryItems = $$("[data-gallery-image]");
    showLightbox(galleryItems.indexOf(galleryButton));
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

$("[data-lightbox-close]")?.addEventListener("click", closeLightbox);
$("[data-lightbox-prev]")?.addEventListener("click", () => showLightbox(lightboxIndex - 1));
$("[data-lightbox-next]")?.addEventListener("click", () => showLightbox(lightboxIndex + 1));

document.addEventListener("keydown", (event) => {
  if (!lightbox?.classList.contains("open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") showLightbox(lightboxIndex - 1);
  if (event.key === "ArrowRight") showLightbox(lightboxIndex + 1);
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
    else toast("Discord is coming soon. Add the invite in js/config.js when ready.");
  });
});

$$("[data-accordion-button]").forEach((button) => button.addEventListener("click", () => {
  const item = button.closest(".faq-item");
  const open = item.classList.toggle("open");
  button.setAttribute("aria-expanded", String(open));
  const symbol = button.querySelector("[data-accordion-symbol]");
  if (symbol) symbol.textContent = open ? "−" : "+";
}));

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href]');
  if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || url.hash) return;
  event.preventDefault();
  document.body.classList.add("page-leaving");
  setTimeout(() => { location.href = link.href; }, 150);
});
