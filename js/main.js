import { SITE_CONFIG, configured } from "./config.js";
import {
  MODS,
  getModBySlug,
  getProjectName,
  getProjectLabel,
  displayValue,
  projectCategories,
  projectCategoryLabel,
  resolvedDownloadState
} from "./mods.js";
import { UPDATES, updatesForProject } from "./updates.js";
import {
  mountHeader,
  mountFooter,
  modTile,
  mediaFrame,
  developmentVisual,
  statusBadge,
  systemStateBadge
} from "./components.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const base = document.body.dataset.root || "";
const focusableSelector = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),video[controls],[tabindex]:not([tabindex="-1"])';

mountHeader(document.body.dataset.page || "");
mountFooter();

if (SITE_CONFIG.allowIndexing === false || SITE_CONFIG.environment !== "production") {
  let robots = document.head.querySelector('meta[name="robots"]');
  if (!robots) {
    robots = document.createElement("meta");
    robots.name = "robots";
    document.head.appendChild(robots);
  }
  robots.content = "noindex,nofollow";
}

document.documentElement.classList.add("js");
requestAnimationFrame(() => document.body.classList.add("page-ready"));
$$("[data-year]").forEach((node) => (node.textContent = new Date().getFullYear()));

function toast(message) {
  const node = $("[data-toast]");
  if (!node) return;
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 2500);
}

function trapFocus(event, container) {
  if (event.key !== "Tab" || !container) return;
  const items = $$(focusableSelector, container).filter((node) => !node.hidden && node.offsetParent !== null);
  if (!items.length) {
    event.preventDefault();
    container.focus();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function bindPlaceholderLinks(scope = document) {
  $$("[data-placeholder-link]", scope).forEach((node) => {
    if (node.dataset.boundPlaceholder) return;
    node.dataset.boundPlaceholder = "true";
    node.addEventListener("click", (event) => {
      event.preventDefault();
      toast("Coming soon — the real destination has not been configured yet.");
    });
  });
}
bindPlaceholderLinks();

function hydrateServiceCards(scope = document) {
  $$("[data-service-key]", scope).forEach((card) => {
    if (card.dataset.serviceBound) return;
    card.dataset.serviceBound = "true";
    const key = card.dataset.serviceKey;
    const url = configured(SITE_CONFIG[key]);
    const badge = $("[data-service-badge]", card);
    const action = $("[data-service-action]", card);
    if (!url) {
      if (badge) badge.textContent = "Coming Soon";
      card.classList.add("is-coming-soon");
      return;
    }
    card.classList.add("is-available");
    card.classList.remove("is-coming-soon");
    if (badge) badge.textContent = "External";
    if (action) {
      action.hidden = false;
      action.addEventListener("click", () => window.open(url, "_blank", "noopener,noreferrer"));
    }
  });
}
hydrateServiceCards();

const header = $("[data-header]");
if (header) {
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

const shortcut = $("[data-search-shortcut]");
if (shortcut) shortcut.textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ K" : "Ctrl K";

const menuButton = $("[data-menu-toggle]");
const mobileNav = $("[data-mobile-nav]");
let menuPreviousFocus = null;

function closeMenu() {
  if (!mobileNav) return;
  mobileNav.classList.remove("open");
  mobileNav.setAttribute("aria-hidden", "true");
  menuButton?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
  menuPreviousFocus?.focus?.();
}

function openMenu() {
  if (!mobileNav) return;
  menuPreviousFocus = document.activeElement;
  mobileNav.classList.add("open");
  mobileNav.setAttribute("aria-hidden", "false");
  menuButton?.classList.add("open");
  menuButton?.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
  setTimeout(() => $("[data-menu-close]", mobileNav)?.focus(), 30);
}

menuButton?.addEventListener("click", () => mobileNav?.classList.contains("open") ? closeMenu() : openMenu());
$("[data-menu-close]")?.addEventListener("click", closeMenu);
$$(".mobile-nav a").forEach((link) => link.addEventListener("click", closeMenu));

const searchOverlay = $("[data-search-overlay]");
const searchDialog = $("[data-search-dialog]");
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
  closeMenu();
  searchPreviousFocus = document.activeElement;
  searchOverlay.classList.add("open");
  searchOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("search-open");
  renderGlobalSearch();
  setTimeout(() => globalSearch?.focus(), 40);
}

function searchText(mod) {
  return [
    mod.publicName,
    mod.internalName,
    mod.subtitle,
    mod.category,
    ...(mod.categories || []),
    mod.status,
    mod.currentPhase,
    mod.shortDescription,
    mod.fullDescription,
    ...(mod.tags || []),
    ...(mod.plannedFeatures || []),
    mod.version
  ].filter(Boolean).join(" ").toLowerCase();
}

function renderGlobalSearch() {
  if (!globalResults || !globalSearch) return;
  const query = globalSearch.value.trim().toLowerCase();
  const matches = MODS.filter((mod) => searchText(mod).includes(query));

  if (!query) {
    globalResults.innerHTML = '<div class="command-empty"><strong>Search Torqz projects.</strong><span>Try Torqz Garage, Project 01, Vehicle Data, telemetry, Gameplay, or Utility.</span></div>';
    searchIndex = -1;
    return;
  }
  if (!matches.length) {
    globalResults.innerHTML = '<div class="command-empty"><strong>No Torqz projects found.</strong><span>Try another project name, phase, category, or feature.</span></div>';
    searchIndex = -1;
    return;
  }

  globalResults.innerHTML = matches.map((mod, index) =>
    '<a class="command-result ' + (index === 0 ? "selected" : "") + '" href="' + base + 'mods/' + mod.slug + '.html" data-search-result>' +
      '<div class="command-result-mark"><img src="' + base + 'assets/brand/torqz-logo.webp" alt="" width="62" height="62"></div>' +
      '<span><strong>' + getProjectName(mod) + '</strong><small>' + mod.internalName + ' · ' + projectCategoryLabel(mod) + ' · ' + displayValue(mod.currentPhase, "Development") + '</small></span><b>↗</b>' +
    '</a>'
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
  if (event.key === "/" && !typing && !searchOverlay?.classList.contains("open")) {
    event.preventDefault();
    openSearch();
    return;
  }
  if (event.key === "Escape") {
    if (searchOverlay?.classList.contains("open")) {
      closeSearch();
      return;
    }
    if (mobileNav?.classList.contains("open")) {
      closeMenu();
      return;
    }
  }
  if (searchOverlay?.classList.contains("open")) {
    trapFocus(event, searchDialog);
    if (event.key === "ArrowDown") { event.preventDefault(); moveSearch(1); }
    if (event.key === "ArrowUp") { event.preventDefault(); moveSearch(-1); }
    if (event.key === "Enter" && searchIndex >= 0) {
      const target = $$("[data-search-result]")[searchIndex];
      if (target) window.location.href = target.href;
    }
  } else if (mobileNav?.classList.contains("open")) {
    trapFocus(event, mobileNav);
  }
});

const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: "0px 0px -24px" }) : null;

function wireReveal(scope = document) {
  $$("[data-reveal]", scope).forEach((node) => observer ? observer.observe(node) : node.classList.add("visible"));
}
wireReveal();

function wireImages(scope = document) {
  $$("[data-fade-image]", scope).forEach((img) => {
    if (img.dataset.imageBound) return;
    img.dataset.imageBound = "true";
    const finish = () => img.classList.add("loaded");
    const fail = () => {
      const fallback = img.dataset.fallback;
      if (fallback && img.src !== new URL(fallback, location.href).href && !img.dataset.fallbackTried) {
        img.dataset.fallbackTried = "true";
        img.src = fallback;
        return;
      }
      img.classList.add("media-error");
      img.closest(".media-frame")?.classList.add("media-failed");
    };
    if (img.complete && img.naturalWidth) finish();
    else {
      img.addEventListener("load", finish);
      img.addEventListener("error", fail);
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
}, { rootMargin: "260px" }) : null;

function wireVideos(scope = document) {
  $$("[data-lazy-video]", scope).forEach((video) => {
    if (video.dataset.videoBound) return;
    video.dataset.videoBound = "true";
    videoObserver ? videoObserver.observe(video) : video.load();
  });
}
wireVideos();

function downloadLabel(state) {
  return {
    unavailable: "Not Yet Released",
    testing: "In Testing",
    "private-beta": "Private Testing",
    released: "Download",
    archived: "Archived"
  }[state] || "Not Yet Released";
}

function updateProjectHead(mod) {
  const name = getProjectName(mod);
  const description = mod.shortDescription || mod.fullDescription || SITE_CONFIG.description;
  document.title = name + " | Torqz Mods";

  const setMeta = (selector, attr, value) => {
    let node = document.head.querySelector(selector);
    if (!node) {
      node = document.createElement("meta");
      if (selector.includes('property="')) node.setAttribute("property", selector.match(/property="([^"]+)"/)?.[1] || "");
      else node.setAttribute("name", selector.match(/name="([^"]+)"/)?.[1] || "");
      document.head.appendChild(node);
    }
    node.setAttribute(attr, value);
  };

  setMeta('meta[name="description"]', "content", description);
  setMeta('meta[property="og:title"]', "content", name + " | Torqz Mods");
  setMeta('meta[property="og:description"]', "content", description);
  setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
  setMeta('meta[property="og:image"]', "content", new URL("assets/brand/torqz-logo.webp", SITE_CONFIG.siteUrl).href);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = new URL("mods/" + mod.slug + ".html", SITE_CONFIG.siteUrl).href;

  document.head.querySelector("#project-breadcrumb-schema")?.remove();
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "project-breadcrumb-schema";
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_CONFIG.siteUrl },
      { "@type": "ListItem", position: 2, name: "Mods", item: new URL("mods.html", SITE_CONFIG.siteUrl).href },
      { "@type": "ListItem", position: 3, name }
    ]
  });
  document.head.appendChild(script);
}

function renderProjectMedia(mod, options = {}) {
  if (mod.heroImage || mod.heroVideo) {
    const prefix = options.nested ? "../" : "";
    return mediaFrame({
      src: mod.heroImage ? prefix + mod.heroImage : "",
      video: mod.heroVideo ? prefix + mod.heroVideo : "",
      poster: mod.heroVideoPoster ? prefix + mod.heroVideoPoster : "",
      alt: getProjectName(mod) + " project media",
      loading: options.loading || "lazy",
      className: options.className || "",
      position: mod.heroImagePosition || "center"
    });
  }
  return developmentVisual(mod, {
    compact: Boolean(options.compact),
    showMilestones: options.showMilestones !== false,
    className: options.className || ""
  });
}

const homeHeroMedia = $("[data-home-hero-media]");
if (homeHeroMedia) {
  const mod = MODS.find((item) => item.featured);
  if (mod) homeHeroMedia.innerHTML = renderProjectMedia(mod, { loading: "eager", showMilestones: false });
}

const homeStatus = $("[data-home-status]");
if (homeStatus) {
  const mod = MODS.find((item) => item.featured);
  if (mod) {
    homeStatus.innerHTML =
      '<div><small>Project</small><strong>' + mod.internalName + '</strong></div>' +
      '<div><small>Status</small><strong>' + displayValue(mod.status) + '</strong></div>' +
      '<div><small>Current Phase</small><strong>' + displayValue(mod.currentPhase) + '</strong></div>';
  }
}

const featured = $("[data-featured-project]");
if (featured) {
  const mod = MODS.find((item) => item.featured);
  if (mod) {
    const milestonePreview = (mod.milestones || []).slice(0, 4).map((item) =>
      '<div class="featured-milestone"><span>' + item.name + '</span>' + systemStateBadge(item.status) + '</div>'
    ).join("");
    featured.innerHTML =
      '<a class="featured-project-media" href="mods/' + mod.slug + '.html" aria-label="View ' + getProjectName(mod) + '">' +
        renderProjectMedia(mod, { loading: "eager", showMilestones: true }) +
        '<span class="featured-label">' + mod.internalName + '</span>' +
        '<span class="featured-view">View Project <b>→</b></span>' +
      '</a>' +
      '<div class="featured-project-copy">' +
        '<span class="section-label">Current Project</span>' +
        '<h2>' + getProjectName(mod) + '</h2>' +
        '<p class="featured-tagline">' + mod.tagline + '</p>' +
        '<div class="featured-project-state">' +
          '<div><small>Status</small>' + statusBadge(mod.status) + '</div>' +
          '<div><small>Current Phase</small><strong>' + mod.currentPhase + '</strong></div>' +
          '<div><small>Category</small><strong>' + projectCategoryLabel(mod) + '</strong></div>' +
        '</div>' +
        '<p>' + mod.shortDescription + '</p>' +
        (milestonePreview ? '<div class="featured-milestones">' + milestonePreview + '</div>' : '') +
        '<a class="inline-arrow" href="mods/' + mod.slug + '.html">View Project <b>→</b></a>' +
      '</div>';
  }
}

const homeMilestones = $("[data-home-milestones]");
if (homeMilestones) {
  const mod = MODS.find((item) => item.featured);
  if (mod) {
    homeMilestones.innerHTML = '<section class="home-status-panel"><span class="section-label">Project 01 Status</span><h3>Development milestones</h3>' +
      (mod.milestones || []).map((item, index) =>
        '<div class="home-milestone-row"><span>' + String(index + 1).padStart(2, "0") + '</span><strong>' + item.name + '</strong>' + systemStateBadge(item.status) + '</div>'
      ).join("") + '</section>';
  }
}

const homeActivity = $("[data-home-activity]");
if (homeActivity) {
  const mod = MODS.find((item) => item.featured);
  if (mod) {
    const entries = (mod.developmentLog || []).slice().reverse().slice(0, 3);
    homeActivity.innerHTML = '<section class="home-activity-panel"><span class="section-label">Recent Development</span><h3>What changed</h3>' +
      entries.map((entry) =>
        '<article class="home-activity-entry"><time datetime="' + entry.date + '">' + entry.displayDate + '</time><div><span>' + entry.category + '</span><h4>' + entry.title + '</h4><p>' + entry.description + '</p></div></article>'
      ).join("") +
      '<a class="inline-arrow" href="updates.html">View all updates <b>→</b></a></section>';
  }
}

const projectGrid = $("[data-project-grid]");
if (projectGrid) {
  projectGrid.innerHTML = MODS.map((mod) => modTile(mod, base)).join("");
}

function updateMarkup(item, index, rootPrefix = "", className = "") {
  const project = item.projectId ? MODS.find((mod) => mod.id === item.projectId) : null;
  const projectLink = project ? rootPrefix + "mods/" + project.slug + ".html" : "";
  return '<article class="update-row ' + className + '">' +
    '<div class="update-index">' + String(index + 1).padStart(2, "0") + '</div>' +
    '<time datetime="' + item.date + '">' + item.displayDate + '</time>' +
    '<div class="update-copy"><div class="update-kicker"><span>' + item.category + '</span>' + (item.currentPhase ? '<b>' + item.currentPhase + '</b>' : '') + '</div><h3>' + item.title + '</h3><p>' + item.description + '</p></div>' +
    (item.articleUrl
      ? '<a href="' + item.articleUrl + '">Read update <b>→</b></a>'
      : projectLink
        ? '<a href="' + projectLink + '">View project <b>→</b></a>'
        : '<a href="' + rootPrefix + 'updates.html">Updates <b>→</b></a>') +
  '</article>';
}

const latestUpdates = $("[data-latest-updates]");
if (latestUpdates) latestUpdates.innerHTML = UPDATES.slice(0, 3).map((item, index) => updateMarkup(item, index)).join("");

const updatesMount = $("[data-updates-list]");
if (updatesMount) {
  updatesMount.innerHTML = UPDATES.map((item, index) => {
    const project = item.projectId ? MODS.find((mod) => mod.id === item.projectId) : null;
    const hasMedia = Boolean(item.image || item.video);
    return '<article class="journal-entry ' + (hasMedia ? "has-media" : "editorial-only") + '" data-reveal>' +
      '<div class="journal-num">' + String(index + 1).padStart(2, "0") + '</div>' +
      '<div class="journal-meta"><time datetime="' + item.date + '">' + item.displayDate + '</time><span>' + item.category + '</span>' + (item.currentPhase ? '<b>' + item.currentPhase + '</b>' : '') + '</div>' +
      '<div class="journal-copy"><h2>' + item.title + '</h2><p>' + item.description + '</p>' +
        (project ? '<a href="mods/' + project.slug + '.html">Open ' + getProjectName(project) + ' →</a>' : '') +
      '</div>' +
      (hasMedia ? '<div class="journal-media">' + (item.video
        ? mediaFrame({ video: item.video, poster: item.image || "", alt: item.title })
        : mediaFrame({ src: item.image, alt: item.title })) + '</div>' : '<div class="journal-wordmark" aria-hidden="true">DEVELOPMENT</div>') +
    '</article>';
  }).join("");
  wireReveal(updatesMount);
  wireImages(updatesMount);
  wireVideos(updatesMount);
}

const categoryMount = $("[data-category-list]");
const availableCategories = ["All", ...new Set(MODS.flatMap((mod) => projectCategories(mod)))];
if (categoryMount) {
  categoryMount.innerHTML = availableCategories.map((category, index) =>
    '<button class="filter-chip ' + (index === 0 ? "active" : "") + '" type="button" data-category-filter="' + category + '">' + category + '</button>'
  ).join("");
}

const modGrid = $("[data-mod-grid]");
if (modGrid) {
  const localSearch = $("[data-mod-search]");
  const sort = $("[data-sort]");

  function singleProjectMarkup(mod) {
    const milestones = (mod.milestones || []).slice(0, 5).map((item) =>
      '<div class="library-milestone"><span>' + item.name + '</span>' + systemStateBadge(item.status) + '</div>'
    ).join("");
    return '<article class="single-project-feature">' +
      '<a class="single-project-media" href="mods/' + mod.slug + '.html">' + renderProjectMedia(mod, { showMilestones: true }) + '</a>' +
      '<div class="single-project-copy"><span class="section-label">' + mod.internalName + '</span><h2>' + getProjectName(mod) + '</h2><p class="single-project-tagline">' + mod.tagline + '</p>' +
        '<div class="single-project-meta"><span>' + statusBadge(mod.status) + '</span><span><small>Phase</small><b>' + mod.currentPhase + '</b></span><span><small>Category</small><b>' + projectCategoryLabel(mod) + '</b></span></div>' +
        '<p>' + mod.shortDescription + '</p>' +
        '<div class="library-milestones">' + milestones + '</div>' +
        '<a class="button primary" href="mods/' + mod.slug + '.html">View Project <span>→</span></a>' +
      '</div>' +
    '</article>' +
    '<section class="future-projects-note"><div><span class="section-label">Future Torqz Projects</span><h3>New projects appear only when development begins.</h3></div><p>No fake mod cards, placeholder names, or made-up screenshots. The library grows when a real Torqz project is active.</p></section>';
  }

  function renderLibrary() {
    modGrid.classList.add("is-loading");
    const active = $("[data-category-filter].active")?.dataset.categoryFilter || "All";
    const query = localSearch?.value.trim().toLowerCase() || "";
    let items = MODS.filter((mod) => (active === "All" || projectCategories(mod).includes(active)) && searchText(mod).includes(query));

    if (sort?.value === "az") items = [...items].sort((a, b) => getProjectName(a).localeCompare(getProjectName(b)));
    if (sort?.value === "updated") items = [...items].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    if (sort?.value === "latest") items = [...items].sort((a, b) => (b.releaseDate || b.updatedAt || "").localeCompare(a.releaseDate || a.updatedAt || ""));

    requestAnimationFrame(() => {
      if (!items.length) {
        modGrid.innerHTML = '<div class="library-empty"><strong>No matching projects.</strong><span>Try another category or search term.</span></div>';
      } else if (items.length === 1 && MODS.length === 1) {
        modGrid.innerHTML = singleProjectMarkup(items[0]);
      } else {
        modGrid.innerHTML = items.map((mod) => modTile(mod, base)).join("");
      }
      modGrid.classList.remove("is-loading");
      const count = $("[data-result-count]");
      if (count) count.textContent = items.length + " " + (items.length === 1 ? "project" : "projects");
      wireImages(modGrid);
      wireVideos(modGrid);
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

function renderMediaCollection(items, mod) {
  return items.map((item, index) => {
    const type = item.type || "image";
    const src = item.src ? "../" + item.src : "";
    const poster = item.poster ? "../" + item.poster : "";
    const caption = item.caption || "";
    const data = ' data-gallery-index="' + index + '" data-gallery-type="' + type + '" data-gallery-src="' + src + '" data-gallery-poster="' + poster + '" data-gallery-label="' + caption + '"';
    return '<button type="button" class="media-collection-item"' + data + '>' +
      (type === "video"
        ? mediaFrame({ video: src, poster, caption, className: "gallery-media", position: item.position || "center" })
        : mediaFrame({ src, alt: item.alt || caption || getProjectName(mod) + " media", caption, className: "gallery-media", position: item.position || "center", srcset: item.srcset || "", sizes: item.sizes || "" })) +
    '</button>';
  }).join("");
}

const detail = $("[data-mod-detail]");
if (detail) {
  const mod = getModBySlug(document.body.dataset.modSlug || "");
  if (!mod) {
    detail.innerHTML = '<section class="project-error"><span>Project Not Found</span><h1>This Torqz project is unavailable.</h1><p>The requested project does not exist or is no longer available.</p><a class="button primary" href="../mods.html">Browse Projects →</a></section>';
  } else {
    updateProjectHead(mod);
    const name = getProjectName(mod);
    const downloadState = resolvedDownloadState(mod);
    const downloadReady = downloadState === "released" && configured(mod.downloadUrl);
    const projectUpdates = updatesForProject(mod.id);
    const compat = mod.beamngCompatibility || {};
    const projectMediaItems = mod.projectMedia || [];
    const developmentMediaItems = mod.developmentMedia || [];

    const knownIssuesText = mod.knownIssues?.length
      ? mod.knownIssues.map((issue) => '<article class="issue-row"><div><strong>' + issue.title + '</strong><span>' + displayValue(issue.severity, "Unspecified") + ' · ' + displayValue(issue.status, "Open") + '</span></div><p>' + issue.description + '</p>' + (issue.workaround ? '<small>Workaround: ' + issue.workaround + '</small>' : '') + '</article>').join("")
      : mod.knownIssuesState === "unpublished"
        ? '<div class="known-issues-empty">No known issues have been published yet.</div>'
        : "";

    const installHtml = mod.installation?.length
      ? '<div class="install-cards">' + mod.installation.map((step, index) =>
          '<article><div class="install-number">' + String(step.step || index + 1).padStart(2, "0") + '</div><h3>' + step.title + '</h3><p>' + step.description + '</p>' +
          (step.warning ? '<div class="install-warning">' + step.warning + '</div>' : '') +
          (step.note ? '<small>' + step.note + '</small>' : '') +
          (step.link ? '<a class="project-link" href="' + step.link + '">More information <span>→</span></a>' : '') + '</article>'
        ).join("") + '</div>' +
        (mod.installationPath ? '<div class="path-row"><span>Path</span><code>' + mod.installationPath + '</code><button type="button" data-copy-path data-copy-value="' + mod.installationPath.replace(/"/g, "&quot;") + '">Copy</button></div>' : "")
      : '<div class="pending-panel"><span>Installation</span><strong>Not Published Yet</strong><p>Project-specific installation steps will appear here once Torqz Garage has a verified release method.</p></div>';

    detail.innerHTML =
      '<section class="project-hero garage-project-hero"><div class="project-hero-media">' +
        renderProjectMedia(mod, { nested: true, loading: "eager", showMilestones: true }) +
        '<div class="project-hero-shade"></div>' +
        '<div class="project-hero-copy"><span>' + getProjectLabel(mod) + '</span><small class="project-dev-id">' + mod.internalName + '</small><h1>' + name + '</h1>' +
          '<h2 class="project-tagline">' + mod.tagline + '</h2><p>' + mod.shortDescription + '</p>' +
          '<div class="project-hero-actions">' +
            (downloadReady ? '<a class="button primary" href="' + mod.downloadUrl + '">Download <span>→</span></a>' : '<span class="release-state">' + downloadLabel(downloadState) + '</span>') +
            '<a class="button ghost" href="#project-overview">View Development</a>' +
          '</div>' +
        '</div>' +
        '<div class="project-hero-status"><small>Current phase</small><strong>' + mod.currentPhase + '</strong>' + statusBadge(mod.status) + '</div>' +
      '</div></section>' +

      '<section class="project-info-rail" id="project-overview">' +
        '<div><small>Internal ID</small><strong>' + mod.internalName + '</strong></div>' +
        '<div><small>Status</small><strong>' + mod.status + '</strong></div>' +
        '<div><small>Current Phase</small><strong>' + mod.currentPhase + '</strong></div>' +
        '<div><small>Category</small><strong>' + projectCategoryLabel(mod) + '</strong></div>' +
        '<div><small>Release</small><strong>' + downloadLabel(downloadState) + '</strong></div>' +
      '</section>' +

      '<section class="project-section editorial-about depth-section"><div class="project-section-head"><span>Overview</span><h2>Persistent ownership, built for BeamNG.</h2></div><div class="editorial-copy"><p>' + mod.fullDescription + '</p><p class="feature-summary">' + mod.featureSummary + '</p>' +
        (mod.technicalDescription ? '<div class="technical-copy"><h3>Current development focus</h3><p>' + mod.technicalDescription + '</p></div>' : '') +
      '</div></section>' +

      (mod.milestones?.length ? '<section class="project-section depth-section background-word" data-background-word="PROJECT 01"><div class="project-section-head"><span>Current Status</span><h2>Development milestones</h2><p>No percentages or guessed progress — every state comes directly from Project 01 data.</p></div><div class="milestone-rail">' +
        mod.milestones.map((item, index) => '<div class="milestone ' + String(item.status).replace(/[^a-z0-9]+/gi, "-") + '"><span aria-hidden="true"></span><b>' + String(index + 1).padStart(2, "0") + '</b><strong>' + item.name + '</strong>' + systemStateBadge(item.status) + '</div>').join("") +
      '</div></section>' : '') +

      (mod.liveSystems?.length ? '<section class="project-section systems-section"><div class="project-section-head"><span>Vehicle Data</span><h2>Live vehicle systems</h2><p>Current and planned data systems are separated clearly so active development is not confused with finished functionality.</p></div><div class="systems-grid">' +
        mod.liveSystems.map((system) => '<article class="system-card"><div><h3>' + system.name + '</h3>' + systemStateBadge(system.status) + '</div><p>' + system.description + '</p></article>').join("") +
      '</div></section>' : '') +

      (mod.plannedFeatures?.length ? '<section class="project-section depth-section"><div class="project-section-head"><span>Roadmap</span><h2>Planned features</h2><p>These are development targets, not claims about current functionality.</p></div><div class="planned-feature-list">' +
        mod.plannedFeatures.map((feature, index) => '<div><span>' + String(index + 1).padStart(2, "0") + '</span><strong>' + feature + '</strong><b>Planned</b></div>').join("") +
      '</div></section>' : '') +

      (projectUpdates.length ? '<section class="project-section"><div class="project-section-head"><span>Development Log</span><h2>Recent development</h2><p>Real Project 01 entries are shared automatically with the Torqz Updates page.</p></div><div class="project-update-list">' +
        projectUpdates.map((item, index) => updateMarkup(item, index, "../", "project-update-row")).join("") +
      '</div></section>' : '') +

      (projectMediaItems.length ? '<section class="project-section project-gallery-section"><div class="project-section-head"><span>Project Media</span><h2>Torqz Garage media</h2><p>Final project screenshots and release media live here when they exist.</p></div><div class="media-collection">' + renderMediaCollection(projectMediaItems, mod) + '</div></section>' : '') +

      (developmentMediaItems.length ? '<section class="project-section project-gallery-section depth-section"><div class="project-section-head"><span>Development Media</span><h2>Behind the build</h2><p>Console output, telemetry tests, code screenshots, gameplay tests, and short clips can document real development without pretending to be release media.</p></div><div class="media-collection">' + renderMediaCollection(developmentMediaItems, mod) + '</div></section>' : '') +

      '<section class="project-section install-section"><div class="project-section-head"><span>Installation</span><h2>Release setup</h2><p>Installation information appears only after the real release method is verified.</p></div>' + installHtml + '</section>' +

      '<section class="project-section compatibility-section depth-section"><div class="compatibility-copy"><span>Compatibility</span><h2>BeamNG support</h2>' + statusBadge(mod.status) + '</div><div class="compatibility-lines">' +
        '<div><span>Tested BeamNG Version</span><b>' + displayValue(compat.testedVersion) + '</b></div>' +
        '<div><span>Minimum Version</span><b>' + displayValue(compat.minimumVersion) + '</b></div>' +
        '<div><span>Version</span><b>' + displayValue(mod.version) + '</b></div>' +
        '<div><span>File Size</span><b>' + displayValue(mod.fileSize) + '</b></div>' +
        '<div><span>Download State</span><b>' + downloadLabel(downloadState) + '</b></div>' +
      '</div></section>' +

      (knownIssuesText ? '<section class="project-section"><div class="project-section-head"><span>Known Issues</span><h2>Published issues</h2><p>Only issues explicitly added to project data are shown.</p></div><div class="known-issues">' + knownIssuesText + '</div></section>' : '') +

      (mod.changelog?.length ? '<section class="project-section changelog-section depth-section"><div class="project-section-head"><span>Development History</span><h2>' + (downloadReady ? "Changelog" : "Development changelog") + '</h2></div><div class="changelog-list">' +
        mod.changelog.map((entry, index) => '<article class="changelog-item ' + (index === 0 ? "open" : "") + '"><button type="button" data-changelog-toggle aria-expanded="' + (index === 0 ? "true" : "false") + '"><span><strong>' + entry.version + '</strong><small>' + displayValue(entry.date, "Current development") + '</small></span><b aria-hidden="true">' + (index === 0 ? "−" : "+") + '</b></button><div class="changelog-body"><div>' +
          Object.entries(entry.groups || {}).filter(([, items]) => items?.length).map(([label, items]) => '<section><h3>' + label + '</h3><ul>' + items.map((item) => '<li>' + item + '</li>').join("") + '</ul></section>').join("") +
        '</div></div></article>').join("") +
      '</div></section>' : '') +

      (mod.credits?.length ? '<section class="project-section credits-section"><div><span>Credits</span><h2>Project credits</h2></div><div>' + mod.credits.map((credit) => '<strong>' + credit + '</strong>').join("") + '</div></section>' : '');

    wireImages(detail);
    wireVideos(detail);
    wireReveal(detail);
    bindPlaceholderLinks(detail);
  }
}

let galleryItems = [];
let lightboxIndex = 0;
let lightboxPreviousFocus = null;
let swipeStartX = null;
const lightbox = $("[data-lightbox]");
const lightboxStage = $("[data-lightbox-stage]");
const lightboxLabel = $("[data-lightbox-label]");

function renderLightboxItem(item) {
  if (!lightboxStage || !item) return;
  const type = item.dataset.galleryType || "image";
  const src = item.dataset.gallerySrc || "";
  const poster = item.dataset.galleryPoster || "";
  const label = item.dataset.galleryLabel || "";
  lightboxStage.innerHTML = type === "video"
    ? '<video controls muted playsinline preload="metadata" ' + (poster ? 'poster="' + poster + '"' : '') + '><source src="' + src + '"></video>'
    : '<img src="' + src + '" alt="' + label + '">';
  if (lightboxLabel) lightboxLabel.textContent = label;
}

function showLightbox(index) {
  if (!galleryItems.length || !lightbox) return;
  lightboxIndex = (index + galleryItems.length) % galleryItems.length;
  renderLightboxItem(galleryItems[lightboxIndex]);
  lightboxPreviousFocus = document.activeElement;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("search-open");
  setTimeout(() => $("[data-lightbox-close]")?.focus(), 20);
}

function closeLightbox() {
  lightbox?.classList.remove("open");
  lightbox?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("search-open");
  if (lightboxStage) lightboxStage.innerHTML = "";
  lightboxPreviousFocus?.focus?.();
}

document.addEventListener("click", (event) => {
  const galleryButton = event.target.closest("[data-gallery-src]");
  if (galleryButton) {
    galleryItems = $$("[data-gallery-src]");
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
lightbox?.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });
lightbox?.addEventListener("touchstart", (event) => { swipeStartX = event.changedTouches[0]?.clientX ?? null; }, { passive: true });
lightbox?.addEventListener("touchend", (event) => {
  if (swipeStartX === null) return;
  const end = event.changedTouches[0]?.clientX ?? swipeStartX;
  const distance = end - swipeStartX;
  if (Math.abs(distance) > 50) showLightbox(lightboxIndex + (distance < 0 ? 1 : -1));
  swipeStartX = null;
}, { passive: true });

document.addEventListener("keydown", (event) => {
  if (!lightbox?.classList.contains("open")) return;
  trapFocus(event, lightbox);
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") showLightbox(lightboxIndex - 1);
  if (event.key === "ArrowRight") showLightbox(lightboxIndex + 1);
});

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy-path]");
  if (!button) return;
  const value = button.dataset.copyValue || "";
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    const old = button.textContent;
    button.textContent = "Copied";
    setTimeout(() => (button.textContent = old), 1500);
  } catch {
    toast("Copy failed — select the path manually.");
  }
});

$$("[data-discord-link]").forEach((node) => {
  const url = configured(SITE_CONFIG.discordUrl);
  node.addEventListener("click", (event) => {
    event.preventDefault();
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else toast("Discord is not published yet.");
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
  if (url.origin !== location.origin || (url.hash && url.pathname === location.pathname)) return;
  event.preventDefault();
  document.body.classList.add("page-leaving");
  setTimeout(() => { location.href = link.href; }, 140);
});
