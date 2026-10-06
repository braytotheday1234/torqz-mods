import { SITE_CONFIG, configured } from "./config.js";
import {
  MODS,
  CATEGORIES,
  getModBySlug,
  getProjectName,
  getProjectLabel,
  displayValue,
  resolvedDownloadState
} from "./mods.js";
import { UPDATES, updatesForProject } from "./updates.js";
import { mountHeader, mountFooter, modTile, mediaFrame, statusBadge, comingSoonBadge } from "./components.js";

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
  toast.timer = setTimeout(() => node.classList.remove("show"), 2600);
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

function wireConfiguredActions(scope = document) {
  $("[data-config-link]", scope).forEach((node) => {
    if (node.dataset.configBound) return;
    node.dataset.configBound = "true";
    const key = node.dataset.configLink;
    const url = configured(SITE_CONFIG[key]);
    const card = node.closest("[data-service-card]");
    const state = card?.querySelector("[data-service-state]");
    if (url) {
      card?.classList.add("is-available");
      if (state) state.textContent = "External";
      const trailing = node.querySelector("span");
      if (trailing) trailing.textContent = "Open ↗";
      node.addEventListener("click", () => window.open(url, "_blank", "noopener,noreferrer"));
    } else {
      if (state) state.textContent = "Coming Soon";
      node.addEventListener("click", () => toast("Coming soon — this service has not been configured yet."));
    }
  });
}
wireConfiguredActions();

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
    mod.status,
    mod.shortDescription,
    mod.fullDescription,
    ...(mod.tags || []),
    mod.version
  ].filter(Boolean).join(" ").toLowerCase();
}

function renderGlobalSearch() {
  if (!globalResults || !globalSearch) return;
  const query = globalSearch.value.trim().toLowerCase();
  const matches = MODS.filter((mod) => searchText(mod).includes(query));

  if (!query) {
    globalResults.innerHTML = '<div class="command-empty"><strong>Search the Torqz library.</strong><span>Names, category, status, tags, descriptions, and versions.</span></div>';
    searchIndex = -1;
    return;
  }
  if (!matches.length) {
    globalResults.innerHTML = '<div class="command-empty"><strong>No Torqz projects found.</strong><span>Try another project name, category, or status.</span></div>';
    searchIndex = -1;
    return;
  }

  globalResults.innerHTML = matches.map((mod, index) => {
    const name = getProjectName(mod);
    return '<a class="command-result ' + (index === 0 ? "selected" : "") + '" href="' + base + 'mods/' + mod.slug + '.html" data-search-result>' +
      '<img src="' + base + (mod.thumbnail || mod.fallbackThumbnail) + '" data-fallback="' + base + (mod.fallbackThumbnail || "") + '" data-fade-image alt="" width="112" height="70" loading="lazy">' +
      '<span><strong>' + name + '</strong><small>' + (mod.category || "Other") + ' · ' + displayValue(mod.status) + ' · ' + displayValue(mod.version) + '</small></span><b>↗</b></a>';
  }).join("");
  wireImages(globalResults);
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
}, { threshold: 0.1, rootMargin: "0px 0px -32px" }) : null;

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
  $("[data-lazy-video]", scope).forEach((video) => {
    if (video.dataset.videoBound) return;
    video.dataset.videoBound = "true";
    video.addEventListener("error", () => {
      const fallback = video.dataset.fallback;
      if (!fallback) {
        video.closest(".media-frame")?.classList.add("media-failed");
        return;
      }
      const img = document.createElement("img");
      img.src = fallback;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.dataset.fadeImage = "";
      img.dataset.fallback = fallback;
      const frame = video.closest(".media-frame");
      if (frame) {
        frame.replaceChildren(img);
        wireImages(frame);
      }
    }, { once: true });
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

  const image = mod.heroImage || mod.fallbackHero;
  if (image) setMeta('meta[property="og:image"]', "content", new URL("../" + image, location.href).href);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = new URL("mods/" + mod.slug + ".html", SITE_CONFIG.siteUrl).href;

  const oldSchema = document.head.querySelector("#project-breadcrumb-schema");
  oldSchema?.remove();
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

const homeHeroMedia = $("[data-home-hero-media]");
if (homeHeroMedia) {
  const featuredProject = MODS.find((item) => item.featured);
  if (featuredProject) {
    homeHeroMedia.innerHTML = mediaFrame({
      src: featuredProject.heroImage || "",
      video: featuredProject.heroVideo || "",
      poster: featuredProject.heroVideoPoster || "",
      fallback: featuredProject.fallbackHero || "",
      alt: "",
      loading: "eager",
      className: "home-hero-media-frame",
      position: featuredProject.heroImagePosition || "center"
    });
    wireImages(homeHeroMedia);
    wireVideos(homeHeroMedia);
  }
}

const homeStatus = $("[data-home-status]");
if (homeStatus) {
  const featuredProject = MODS.find((item) => item.featured);
  if (featuredProject) {
    homeStatus.innerHTML =
      '<div><small>Project</small><strong>' + featuredProject.internalName + '</strong></div>' +
      '<div><small>Status</small><strong>' + displayValue(featuredProject.status) + '</strong></div>' +
      '<div><small>Current Phase</small><strong>' + displayValue(featuredProject.currentPhase, "Not published") + '</strong></div>';
  }
}

const featured = $("[data-featured-project]");
if (featured) {
  const mod = MODS.find((item) => item.featured);
  if (mod) {
    const name = getProjectName(mod);
    const heroMedia = mediaFrame({
      src: mod.heroImage,
      alt: name + " development preview",
      video: mod.heroVideo,
      poster: mod.heroVideoPoster,
      fallback: mod.fallbackHero,
      loading: "eager",
      className: "featured-media-frame",
      position: mod.heroImagePosition
    });
    featured.innerHTML =
      '<a class="featured-project-media" href="mods/' + mod.slug + '.html">' + heroMedia +
      '<span class="featured-label">Featured Project</span><span class="featured-corner" aria-hidden="true"></span>' +
      '<div class="featured-overlay"><div><span>' + (mod.category || "Other") + '</span><h2>' + name + '</h2></div><div class="featured-status"><small>Status</small><strong>' + mod.status + '</strong></div></div>' +
      '<span class="featured-view">View Project <b>→</b></span></a>' +
      '<div class="featured-project-copy"><p>' + (mod.shortDescription || mod.fullDescription) + '</p>' +
      '<div class="featured-spec-row"><span><small>Version</small><b>' + displayValue(mod.version) + '</b></span><span><small>BeamNG</small><b>' + displayValue(mod.beamngCompatibility?.testedVersion) + '</b></span><span><small>Current phase</small><b>' + displayValue(mod.currentPhase, "Not published") + '</b></span></div>' +
      '<a class="inline-arrow" href="mods/' + mod.slug + '.html">View Project <b>→</b></a></div>';
    wireImages(featured);
    wireVideos(featured);
  }
}

const projectGrid = $("[data-project-grid]");
if (projectGrid) {
  projectGrid.innerHTML = MODS.map((mod) => modTile(mod, base)).join("") +
    '<div class="future-project"><div class="future-grid" aria-hidden="true"></div><span>Future Torqz Project</span><strong>Reserved for the next release.</strong><p>No project name or vehicle art will appear here until a real future project exists.</p></div>';
  wireImages(projectGrid);
}

function updateMarkup(item, index, rootPrefix = "") {
  const project = item.projectId ? MODS.find((mod) => mod.id === item.projectId) : null;
  const projectLink = project ? rootPrefix + "mods/" + project.slug + ".html" : "";
  return '<article class="update-row">' +
    '<div class="update-index">' + String(index + 1).padStart(2, "0") + '</div>' +
    '<time datetime="' + item.date + '">' + item.displayDate + '</time>' +
    '<div><span>' + item.category + '</span><h3>' + item.title + '</h3><p>' + item.description + '</p></div>' +
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
    return '<article class="journal-entry" data-reveal>' +
      '<div class="journal-num">' + String(index + 1).padStart(2, "0") + '</div>' +
      '<div class="journal-meta"><time datetime="' + item.date + '">' + item.displayDate + '</time><span>' + item.category + '</span></div>' +
      '<div class="journal-copy"><h2>' + item.title + '</h2><p>' + item.description + '</p>' +
      (item.articleUrl ? '<a href="' + item.articleUrl + '">Read full update →</a>' : project ? '<a href="mods/' + project.slug + '.html">Open related project →</a>' : '') +
      '</div></article>';
  }).join("");
  wireReveal(updatesMount);
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
    let items = MODS.filter((mod) => (active === "All" || mod.category === active) && searchText(mod).includes(query));

    if (sort?.value === "az") items = [...items].sort((a, b) => getProjectName(a).localeCompare(getProjectName(b)));
    if (sort?.value === "updated") items = [...items].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    if (sort?.value === "latest") items = [...items].sort((a, b) => (b.releaseDate || b.updatedAt || "").localeCompare(a.releaseDate || a.updatedAt || ""));

    requestAnimationFrame(() => {
      modGrid.innerHTML = items.length
        ? items.map((mod) => modTile(mod, base)).join("")
        : '<div class="library-empty"><strong>No matching projects.</strong><span>Try another category or search term.</span></div>';
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

function renderGalleryItem(item, index, mod) {
  const type = item.type || "image";
  const src = item.src ? "../" + item.src : "";
  const poster = item.poster ? "../" + item.poster : "";
  const fallback = mod.fallbackHero ? "../" + mod.fallbackHero : "";
  const caption = item.caption || "";
  if (type === "video") {
    return '<button type="button" data-gallery-index="' + index + '" data-gallery-type="video" data-gallery-src="' + src + '" data-gallery-poster="' + poster + '" data-gallery-label="' + caption + '">' +
      mediaFrame({ video: src, poster, fallback, caption, className: "gallery-media", position: item.position || "center" }) + '</button>';
  }
  return '<button type="button" data-gallery-index="' + index + '" data-gallery-type="image" data-gallery-src="' + src + '" data-gallery-label="' + caption + '">' +
    mediaFrame({ src, fallback, alt: item.alt || caption || getProjectName(mod) + " media", caption, className: "gallery-media", position: item.position || "center", srcset: item.srcset || "", sizes: item.sizes || "" }) + '</button>';
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
    const gallery = [
      ...(mod.heroImage || mod.fallbackHero ? [{
        type: "image",
        src: mod.heroImage || mod.fallbackHero,
        alt: name + " hero media",
        caption: name + " development preview",
        position: mod.heroImagePosition || "center"
      }] : []),
      ...(mod.gallery || []),
      ...(mod.videoClips || [])
    ].filter((item) => item?.src);

    const heroMedia = mediaFrame({
      src: mod.heroImage ? "../" + mod.heroImage : "",
      alt: name + " development preview",
      video: mod.heroVideo ? "../" + mod.heroVideo : "",
      poster: mod.heroVideoPoster ? "../" + mod.heroVideoPoster : "",
      fallback: mod.fallbackHero ? "../" + mod.fallbackHero : "",
      loading: "eager",
      className: "project-hero-frame",
      position: mod.heroImagePosition
    });

    const compat = mod.beamngCompatibility || {};
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
      : '<div class="pending-panel"><span>Installation</span><strong>Coming Soon</strong><p>Project-specific installation steps will appear here once the real installation method is verified.</p></div>';

    const releaseMeta = downloadReady
      ? '<div><small>Release Date</small><strong>' + displayValue(mod.releaseDate) + '</strong></div>'
      : '<div><small>Release</small><strong>' + downloadLabel(downloadState) + '</strong></div>';

    detail.innerHTML =
      '<section class="project-hero"><div class="project-hero-media">' + heroMedia + '<div class="project-hero-shade"></div>' +
        '<div class="project-hero-copy"><span>' + getProjectLabel(mod) + '</span>' +
          (mod.publicName ? '<small class="project-dev-id">' + mod.internalName + '</small>' : '') +
          '<h1>' + name + '</h1>' +
          (mod.tagline ? '<h2 class="project-tagline">' + mod.tagline + '</h2>' : '') +
          '<p>' + (mod.shortDescription || mod.fullDescription) + '</p>' +
          '<div class="project-hero-actions">' +
            (downloadReady
              ? '<a class="button primary" href="' + mod.downloadUrl + '">Download <span>→</span></a>'
              : '<span class="release-state">' + downloadLabel(downloadState) + '</span>') +
            '<a class="button ghost" href="#project-information">Installation / Information</a>' +
          '</div>' +
        '</div>' +
        '<div class="project-hero-status"><small>Current status</small>' + statusBadge(mod.status) + '</div>' +
      '</div></section>' +

      '<section class="project-info-rail" id="project-information">' +
        '<div><small>Version</small><strong>' + displayValue(mod.version) + '</strong></div>' +
        '<div><small>BeamNG Version</small><strong>' + displayValue(compat.testedVersion) + '</strong></div>' +
        '<div><small>File Size</small><strong>' + displayValue(mod.fileSize) + '</strong></div>' +
        releaseMeta +
        '<div><small>Current Phase</small><strong>' + displayValue(mod.currentPhase, "Not published") + '</strong></div>' +
      '</section>' +

      (gallery.length ? '<section class="project-section project-gallery-section"><div class="project-section-head"><span>Media / 01</span><h2>Project gallery</h2><p>Images and clips are data-driven so real Project 01 media can replace placeholders without changing the layout.</p></div><div class="project-gallery" data-gallery>' +
        '<div class="gallery-primary">' + renderGalleryItem(gallery[0], 0, mod) + '</div>' +
        (gallery.length > 1 ? '<div class="gallery-secondary">' + gallery.slice(1, 5).map((item, index) => renderGalleryItem(item, index + 1, mod)).join("") + '</div>' : '') +
      '</div></section>' : '') +

      '<section class="project-section editorial-about"><div class="project-section-head"><span>Overview / 02</span><h2>About this project</h2></div><div class="editorial-copy"><p>' + (mod.fullDescription || mod.shortDescription) + '</p>' +
        (mod.featureSummary ? '<p class="feature-summary">' + mod.featureSummary + '</p>' : '') +
        (mod.technicalDescription ? '<div class="technical-copy"><h3>Technical details</h3><p>' + mod.technicalDescription + '</p></div>' : '') +
        (mod.features?.length ? '<div class="feature-rows">' + mod.features.map((feature, index) => '<div class="feature-row"><span>' + String(index + 1).padStart(2, "0") + '</span><div><h3>' + feature.title + '</h3><p>' + feature.description + '</p></div></div>').join("") + '</div>' : '') +
      '</div></section>' +

      (mod.milestones?.length ? '<section class="project-section"><div class="project-section-head"><span>Development / 03</span><h2>Project development</h2><p>Milestones are shown only when they are explicitly configured in project data.</p></div><div class="milestone-rail">' +
        mod.milestones.map((item, index) => '<div class="milestone ' + String(item.status).toLowerCase().replace(/[^a-z0-9]+/g, "-") + '"><span aria-hidden="true"></span><b>' + String(index + 1).padStart(2, "0") + '</b><strong>' + item.name + '</strong><small>' + item.status + '</small></div>').join("") +
      '</div></section>' : '') +

      (projectUpdates.length ? '<section class="project-section"><div class="project-section-head"><span>Updates / 04</span><h2>Development updates</h2><p>Project-linked updates are shared with the Torqz Updates page automatically.</p></div><div class="project-update-list">' +
        projectUpdates.map((item, index) => updateMarkup(item, index, "../")).join("") +
      '</div></section>' : '') +

      '<section class="project-section install-section"><div class="project-section-head"><span>Setup / 05</span><h2>Installation</h2><p>Instructions are project-specific and only appear once the real method is known.</p></div>' + installHtml + '</section>' +

      '<section class="project-section compatibility-section"><div class="compatibility-copy"><span>Compatibility / 06</span><h2>Compatibility</h2>' + statusBadge(mod.status) + '</div><div class="compatibility-lines">' +
        '<div><span>Tested BeamNG Version</span><b>' + displayValue(compat.testedVersion) + '</b></div>' +
        '<div><span>Minimum Version</span><b>' + displayValue(compat.minimumVersion) + '</b></div>' +
        (compat.notes ? '<div><span>Notes</span><b>' + compat.notes + '</b></div>' : '') +
        '<div><span>Download State</span><b>' + downloadLabel(downloadState) + '</b></div>' +
      '</div></section>' +

      (knownIssuesText ? '<section class="project-section"><div class="project-section-head"><span>Issues / 07</span><h2>Known issues</h2><p>Only actual configured issues are listed.</p></div><div class="known-issues">' + knownIssuesText + '</div></section>' : '') +

      (mod.changelog?.length ? '<section class="project-section changelog-section"><div class="project-section-head"><span>History / 08</span><h2>' + (downloadReady ? "Changelog" : "Development history") + '</h2></div><div class="changelog-list">' +
        mod.changelog.map((entry, index) => '<article class="changelog-item ' + (index === 0 ? "open" : "") + '"><button type="button" data-changelog-toggle aria-expanded="' + (index === 0 ? "true" : "false") + '"><span><strong>' + entry.version + '</strong><small>' + displayValue(entry.date, "Current development") + '</small></span><b aria-hidden="true">' + (index === 0 ? "−" : "+") + '</b></button><div class="changelog-body"><div>' +
          Object.entries(entry.groups || {}).filter(([, items]) => items?.length).map(([label, items]) => '<section><h3>' + label + '</h3><ul>' + items.map((item) => '<li>' + item + '</li>').join("") + '</ul></section>').join("") +
        '</div></div></article>').join("") +
      '</div></section>' : '') +

      (mod.credits?.length ? '<section class="project-section credits-section"><div><span>Credits / 09</span><h2>Project credits</h2></div><div>' + mod.credits.map((credit) => '<strong>' + credit + '</strong>').join("") + '</div></section>' : '') +

      (MODS.some((item) => item.slug !== mod.slug) ? '<section class="project-section"><div class="project-section-head"><span>More / 10</span><h2>More from Torqz</h2></div><div class="mod-grid">' + MODS.filter((item) => item.slug !== mod.slug).map((item) => modTile(item, "../")).join("") + '</div></section>' : '');

    wireImages(detail);
    wireVideos(detail);
    wireReveal(detail);
    bindPlaceholderLinks(detail);
    wireConfiguredActions(detail);
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
    setTimeout(() => (button.textContent = old), 1600);
  } catch {
    toast("Copy failed — select the path manually.");
  }
});

$("[data-discord-link]").forEach((node) => {
  const url = configured(SITE_CONFIG.discordUrl);
  const card = node.closest("[data-service-card]");
  const state = card?.querySelector("[data-service-state]");
  if (url) {
    card?.classList.add("is-available");
    if (state) state.textContent = "External";
    const trailing = node.querySelector("span");
    if (trailing) trailing.textContent = "Open ↗";
  }
  node.addEventListener("click", (event) => {
    event.preventDefault();
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else toast("Discord support is coming soon. The official invite has not been configured yet.");
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
  setTimeout(() => { location.href = link.href; }, 150);
});
