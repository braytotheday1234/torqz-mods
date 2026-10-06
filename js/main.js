import { SITE_CONFIG, configured } from "./config.js";
import { MODS, getModBySlug, getProjectName, displayValue, projectCategories, resolvedDownloadState } from "./mods.js";
import { UPDATES, updatesForProject } from "./updates.js";
import { mountHeader, mountFooter, modTile, projectVisual, statusBadge } from "./components.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const base = document.body.dataset.root || "";
const focusableSelector = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),video[controls],[tabindex]:not([tabindex="-1"])';

mountHeader(document.body.dataset.page || "");
mountFooter();
document.documentElement.classList.add("js");
requestAnimationFrame(() => document.body.classList.add("page-ready"));
$$("[data-year]").forEach((node) => node.textContent = new Date().getFullYear());

function toast(message) {
  const node = $("[data-toast]");
  if (!node) return;
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 2200);
}

$$("[data-placeholder-link]").forEach((node) => node.addEventListener("click", (event) => {
  event.preventDefault();
  toast("Coming soon.");
}));

$("[data-discord-link]").forEach((node) => node.addEventListener("click", (event) => {
  event.preventDefault();
  const url = configured(SITE_CONFIG.discordUrl);
  if (url) window.open(url, "_blank", "noopener,noreferrer");
  else toast("Discord is coming soon.");
}));

$("[data-service-key]").forEach((card) => {
  const key = card.dataset.serviceKey;
  const url = configured(SITE_CONFIG[key]);
  const badge = $("[data-service-badge]", card);
  const action = $("[data-service-action]", card);
  if (!url) return;
  card.classList.add("available");
  if (badge) badge.textContent = "Available";
  if (action) {
    action.hidden = false;
    action.addEventListener("click", () => window.open(url, "_blank", "noopener,noreferrer"));
  }
});

const header = $("[data-header]");
if (header) {
  const update = () => header.classList.toggle("scrolled", window.scrollY > 16);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

const menuButton = $("[data-menu-toggle]");
const mobileNav = $("[data-mobile-nav]");
let previousMenuFocus = null;

function trapFocus(event, container) {
  if (event.key !== "Tab" || !container) return;
  const nodes = $$(focusableSelector, container).filter((node) => node.offsetParent !== null);
  if (!nodes.length) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault(); first.focus();
  }
}

function openMenu() {
  previousMenuFocus = document.activeElement;
  mobileNav?.classList.add("open");
  mobileNav?.setAttribute("aria-hidden","false");
  menuButton?.setAttribute("aria-expanded","true");
  document.body.classList.add("menu-open");
  setTimeout(() => $("[data-menu-close]", mobileNav)?.focus(), 20);
}
function closeMenu() {
  mobileNav?.classList.remove("open");
  mobileNav?.setAttribute("aria-hidden","true");
  menuButton?.setAttribute("aria-expanded","false");
  document.body.classList.remove("menu-open");
  previousMenuFocus?.focus?.();
}
menuButton?.addEventListener("click", () => mobileNav?.classList.contains("open") ? closeMenu() : openMenu());
$("[data-menu-close]")?.addEventListener("click", closeMenu);
$$(".mobile-nav a").forEach((link) => link.addEventListener("click", closeMenu));

const searchOverlay = $("[data-search-overlay]");
const searchDialog = $("[data-search-dialog]");
const searchInput = $("[data-global-search]");
const searchResults = $("[data-search-results]");
let searchIndex = -1;
let previousSearchFocus = null;

function searchText(mod) {
  return [mod.publicName,mod.internalName,mod.tagline,mod.shortDescription,mod.category,...(mod.categories||[]),...(mod.tags||[])].filter(Boolean).join(" ").toLowerCase();
}
function renderSearch() {
  if (!searchInput || !searchResults) return;
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    searchResults.innerHTML = '<div class="command-empty"><strong>Search Torqz Mods</strong><span>Try “Torqz Garage”, “mileage”, or “vehicle data”.</span></div>';
    searchIndex = -1;
    return;
  }
  const matches = MODS.filter((mod) => searchText(mod).includes(query));
  if (!matches.length) {
    searchResults.innerHTML = '<div class="command-empty"><strong>No project found.</strong><span>Try a different search.</span></div>';
    searchIndex = -1;
    return;
  }
  searchResults.innerHTML = matches.map((mod,index) =>
    '<a class="command-result ' + (index===0?"selected":"") + '" href="' + base + 'mods/' + mod.slug + '.html" data-search-result>' +
      '<img src="' + base + 'assets/brand/torqz-logo.webp" alt="" width="56" height="56">' +
      '<span><strong>' + getProjectName(mod) + '</strong><small>' + mod.shortDescription + '</small></span><b>→</b></a>'
  ).join("");
  searchIndex = 0;
}
function openSearch() {
  closeMenu();
  previousSearchFocus = document.activeElement;
  searchOverlay?.classList.add("open");
  searchOverlay?.setAttribute("aria-hidden","false");
  document.body.classList.add("search-open");
  renderSearch();
  setTimeout(() => searchInput?.focus(), 20);
}
function closeSearch() {
  searchOverlay?.classList.remove("open");
  searchOverlay?.setAttribute("aria-hidden","true");
  document.body.classList.remove("search-open");
  searchIndex = -1;
  previousSearchFocus?.focus?.();
}
function moveSearch(delta) {
  const results = $$("[data-search-result]");
  if (!results.length) return;
  searchIndex = Math.max(0, Math.min(results.length - 1, searchIndex + delta));
  results.forEach((node,index) => node.classList.toggle("selected",index===searchIndex));
}
$("[data-search-trigger]")?.addEventListener("click", openSearch);
$$("[data-search-close]").forEach((node) => node.addEventListener("click", closeSearch));
searchInput?.addEventListener("input", renderSearch);

document.addEventListener("keydown", (event) => {
  const typing = ["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName);
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase()==="k") {
    event.preventDefault(); openSearch(); return;
  }
  if (event.key==="/" && !typing && !searchOverlay?.classList.contains("open")) {
    event.preventDefault(); openSearch(); return;
  }
  if (event.key==="Escape") {
    if (searchOverlay?.classList.contains("open")) { closeSearch(); return; }
    if (mobileNav?.classList.contains("open")) { closeMenu(); return; }
  }
  if (searchOverlay?.classList.contains("open")) {
    trapFocus(event, searchDialog);
    if (event.key==="ArrowDown") { event.preventDefault(); moveSearch(1); }
    if (event.key==="ArrowUp") { event.preventDefault(); moveSearch(-1); }
    if (event.key==="Enter" && searchIndex>=0) {
      const target = $$("[data-search-result]")[searchIndex];
      if (target) location.href = target.href;
    }
  } else if (mobileNav?.classList.contains("open")) {
    trapFocus(event, mobileNav);
  }
});

const revealObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  });
},{threshold:.08,rootMargin:"0px 0px -20px"}) : null;
$$("[data-reveal]").forEach((node) => revealObserver ? revealObserver.observe(node) : node.classList.add("visible"));

const videoObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const video = entry.target;
    const source = $("source[data-src]",video);
    if (source && !source.src) { source.src = source.dataset.src; video.load(); }
    videoObserver.unobserve(video);
  });
},{rootMargin:"200px"}) : null;
$$("[data-lazy-video]").forEach((video) => videoObserver ? videoObserver.observe(video) : video.load());

function updateCard(update, prefix="") {
  const project = MODS.find((mod) => mod.id===update.projectId);
  return '<article class="casual-update-card">' +
    '<div class="casual-update-date">' + update.displayDate + '</div>' +
    '<div class="casual-update-copy"><h3>' + update.title + '</h3><p>' + update.description + '</p>' +
      (project ? '<a href="' + prefix + 'mods/' + project.slug + '.html">View Project →</a>' : '') +
    '</div>' +
    (update.image ? '<div class="casual-update-media"><img src="' + prefix + update.image + '" alt="' + update.title + '" loading="lazy"></div>' : '') +
  '</article>';
}

const featured = $("[data-featured-project]");
if (featured) {
  const mod = MODS.find((item) => item.featured);
  if (mod) {
    featured.innerHTML =
      '<a class="featured-project-media casual-feature-media" href="mods/' + mod.slug + '.html">' + projectVisual(mod) + '</a>' +
      '<div class="featured-project-copy casual-feature-copy"><div>' + statusBadge(mod.status) + '<h2>' + getProjectName(mod) + '</h2><p class="featured-tagline">' + mod.subtitle + '</p><p>' + mod.shortDescription + '</p><a class="inline-arrow" href="mods/' + mod.slug + '.html">View Project <b>→</b></a></div></div>';
  }
}

const homeFeatures = $("[data-home-features]");
if (homeFeatures) {
  const mod = MODS.find((item)=>item.featured);
  if (mod) homeFeatures.innerHTML = mod.features.slice(0,6).map((feature) =>
    '<article class="casual-feature-item"><h3>' + feature.title + '</h3><p>' + feature.description + '</p></article>'
  ).join("");
}

const latestUpdates = $("[data-latest-updates]");
if (latestUpdates) latestUpdates.innerHTML = UPDATES.slice(0,3).map((item)=>updateCard(item)).join("");

const updatesMount = $("[data-updates-list]");
if (updatesMount) updatesMount.innerHTML = UPDATES.map((item)=>updateCard(item)).join("");

const categoryMount = $("[data-category-list]");
const allCategories = ["All", ...new Set(MODS.flatMap((mod)=>projectCategories(mod)))];
if (categoryMount) {
  categoryMount.innerHTML = allCategories.map((category,index) =>
    '<button class="filter-chip ' + (index===0?"active":"") + '" type="button" data-category-filter="' + category + '">' + category + '</button>'
  ).join("");
}

const modGrid = $("[data-mod-grid]");
if (modGrid) {
  const localSearch = $("[data-mod-search]");
  const sort = $("[data-sort]");
  function renderMods() {
    const active = $("[data-category-filter].active")?.dataset.categoryFilter || "All";
    const query = localSearch?.value.trim().toLowerCase() || "";
    let items = MODS.filter((mod)=>(active==="All" || projectCategories(mod).includes(active)) && searchText(mod).includes(query));
    if (sort?.value==="az") items = [...items].sort((a,b)=>getProjectName(a).localeCompare(getProjectName(b)));
    if (sort?.value==="updated") items = [...items].sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""));
    modGrid.innerHTML = items.length ? items.map((mod)=>modTile(mod,base)).join("") : '<div class="library-empty"><strong>No matching projects.</strong><span>Try another filter or search.</span></div>';
    const count = $("[data-result-count]");
    if (count) count.textContent = items.length + (items.length===1 ? " project" : " projects");
  }
  categoryMount?.addEventListener("click",(event)=>{
    const button = event.target.closest("[data-category-filter]");
    if (!button) return;
    $$("[data-category-filter]",categoryMount).forEach((item)=>item.classList.remove("active"));
    button.classList.add("active");
    renderMods();
  });
  localSearch?.addEventListener("input",renderMods);
  sort?.addEventListener("change",renderMods);
  renderMods();
}

function projectStatusList(mod) {
  return '<div class="simple-status-list">' + (mod.milestones||[]).map((item)=>
    '<div><span>' + item.name + '</span><strong class="' + String(item.status).replace(/[^a-z0-9]+/gi,"-") + '">' +
      ({complete:"Complete","in-progress":"In Progress",planned:"Planned",blocked:"Blocked"}[item.status] || item.status) +
    '</strong></div>'
  ).join("") + '</div>';
}

function projectFeatureGrid(mod) {
  return '<div class="project-feature-grid">' + (mod.features||[]).map((feature)=>
    '<article><h3>' + feature.title + '</h3><p>' + feature.description + '</p></article>'
  ).join("") + '</div>';
}

function mediaItems(items, nested=true) {
  const prefix = nested ? "../" : "";
  return items.map((item,index)=>{
    const type=item.type||"image";
    const src=prefix+(item.src||"");
    const poster=prefix+(item.poster||"");
    const label=item.caption||"Project media";
    return '<button type="button" class="media-collection-item" data-gallery-type="' + type + '" data-gallery-src="' + src + '" data-gallery-poster="' + poster + '" data-gallery-label="' + label + '">' +
      (type==="video" ? '<video muted playsinline preload="metadata" ' + (poster?'poster="'+poster+'"':'') + '><source src="' + src + '"></video>' : '<img src="' + src + '" alt="' + label + '" loading="lazy">') +
    '</button>';
  }).join("");
}

const detail = $("[data-mod-detail]");
if (detail) {
  const mod = getModBySlug(document.body.dataset.modSlug || "");
  if (!mod) {
    detail.innerHTML = '<section class="project-error"><span>Project Not Found</span><h1>This project is unavailable.</h1><a class="button primary" href="../mods.html">Back to Mods</a></section>';
  } else {
    document.title = getProjectName(mod) + " | Torqz Mods";
    const compat = mod.beamngCompatibility || {};
    const downloadState = resolvedDownloadState(mod);
    const projectUpdates = updatesForProject(mod.id);
    const projectMedia = mod.projectMedia || [];
    const devMedia = mod.developmentMedia || [];

    detail.innerHTML =
      '<section class="casual-project-hero"><div class="wide-shell casual-project-hero-grid">' +
        '<div class="casual-project-hero-copy"><span class="eyebrow">' + mod.internalName + '</span><h1>' + getProjectName(mod) + '</h1><p class="project-tagline">' + mod.tagline + '</p><p>' + mod.shortDescription + '</p>' + statusBadge(mod.status) + '</div>' +
        '<div class="casual-project-hero-media">' + projectVisual(mod,{nested:true}) + '</div>' +
      '</div></section>' +

      '<section class="project-section casual-section"><div class="wide-shell simple-two-col"><div><span class="section-label">About</span><h2>What is Torqz Garage?</h2></div><div><p>' + mod.fullDescription + '</p><p>' + mod.featureSummary + '</p></div></div></section>' +

      '<section class="project-section casual-section section-dark"><div class="wide-shell"><div class="simple-section-head"><span class="section-label">Features</span><h2>What it is being built to do.</h2></div>' + projectFeatureGrid(mod) + '</div></section>' +

      '<section class="project-section casual-section"><div class="wide-shell simple-two-col"><div><span class="section-label">Development Status</span><h2>Where the project is now.</h2></div><div>' + projectStatusList(mod) + '</div></div></section>' +

      '<section class="project-section casual-section section-dark"><div class="wide-shell"><div class="simple-section-head"><span class="section-label">Media</span><h2>Torqz Garage media.</h2></div>' +
        ((projectMedia.length || devMedia.length)
          ? '<div class="media-collection">' + mediaItems([...projectMedia,...devMedia]) + '</div>'
          : '<div class="casual-media-placeholder">' + projectVisual(mod,{nested:true}) + '<p>Real BeamNG screenshots and development captures will show up here as they are made.</p></div>') +
      '</div></section>' +

      (projectUpdates.length ? '<section class="project-section casual-section section-dark"><div class="wide-shell"><div class="simple-section-head"><span class="section-label">Updates</span><h2>Latest development.</h2></div><div class="casual-updates-list">' + projectUpdates.map((item)=>updateCard(item,"../")).join("") + '</div></div></section>' : '') +

      '<section class="project-section casual-section"><div class="wide-shell simple-info-grid">' +
        '<article><span class="section-label">Installation</span><h3>' + (mod.installation?.length ? "Instructions available" : "Coming Soon") + '</h3><p>' + (mod.installation?.length ? "Follow the project-specific steps for this release." : "Installation steps will be posted when the release method is ready.") + '</p></article>' +
        '<article><span class="section-label">Compatibility</span><h3>' + displayValue(compat.testedVersion) + '</h3><p>Supported BeamNG.drive versions will be listed after testing.</p></article>' +
        '<article><span class="section-label">Known Issues</span><h3>' + (mod.knownIssues?.length ? mod.knownIssues.length + " listed" : "None published") + '</h3><p>' + (mod.knownIssues?.length ? "Check the latest project notes for details." : "Known issues will be added here when there is something useful to report.") + '</p></article>' +
      '</div></section>';

    $$("[data-lazy-video]",detail).forEach((video)=>videoObserver ? videoObserver.observe(video) : video.load());
  }
}

let galleryItems=[];
let lightboxIndex=0;
const lightbox=$("[data-lightbox]");
const stage=$("[data-lightbox-stage]");
const label=$("[data-lightbox-label]");

function renderLightbox(index) {
  if (!galleryItems.length || !lightbox || !stage) return;
  lightboxIndex=(index+galleryItems.length)%galleryItems.length;
  const item=galleryItems[lightboxIndex];
  const type=item.dataset.galleryType||"image";
  const src=item.dataset.gallerySrc||"";
  const poster=item.dataset.galleryPoster||"";
  stage.innerHTML=type==="video"
    ? '<video controls muted playsinline ' + (poster?'poster="'+poster+'"':'') + '><source src="' + src + '"></video>'
    : '<img src="' + src + '" alt="' + (item.dataset.galleryLabel||"") + '">';
  label.textContent=item.dataset.galleryLabel||"";
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden","false");
  document.body.classList.add("search-open");
}
function closeLightbox() {
  lightbox?.classList.remove("open");
  lightbox?.setAttribute("aria-hidden","true");
  document.body.classList.remove("search-open");
  if (stage) stage.innerHTML="";
}
document.addEventListener("click",(event)=>{
  const item=event.target.closest("[data-gallery-src]");
  if (item) {
    galleryItems=$$("[data-gallery-src]");
    renderLightbox(galleryItems.indexOf(item));
  }
});
$("[data-lightbox-close]")?.addEventListener("click",closeLightbox);
$("[data-lightbox-prev]")?.addEventListener("click",()=>renderLightbox(lightboxIndex-1));
$("[data-lightbox-next]")?.addEventListener("click",()=>renderLightbox(lightboxIndex+1));

$$("[data-accordion-button]").forEach((button)=>button.addEventListener("click",()=>{
  const item=button.closest(".faq-item");
  const open=item.classList.toggle("open");
  button.setAttribute("aria-expanded",String(open));
  const symbol=button.querySelector("[data-accordion-symbol]");
  if (symbol) symbol.textContent=open?"−":"+";
}));

document.addEventListener("click",(event)=>{
  const link=event.target.closest('a[href]');
  if (!link || link.target==="_blank" || link.hasAttribute("download")) return;
  const url=new URL(link.href,location.href);
  if (url.origin!==location.origin || (url.hash && url.pathname===location.pathname)) return;
  event.preventDefault();
  document.body.classList.add("page-leaving");
  setTimeout(()=>location.href=link.href,120);
});
