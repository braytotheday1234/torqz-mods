import { SITE_CONFIG, configured } from "./config.js";
import { displayValue, getProjectName, projectCategoryLabel } from "./mods.js";

const root = () => document.body.dataset.root || "";
const href = (path) => root() + path;
const logo = () => href("assets/brand/torqz-logo.webp");

const icons = {
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.2-4.2m2.2-5.3A7.5 7.5 0 1 1 4 11.5a7.5 7.5 0 0 1 15 0Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>',
  odometer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17a8 8 0 1 1 16 0M12 12l4-4M7 17h10"/></svg>',
  car: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 14 2-5h12l2 5M5 14h14v5H5zM7 19v2m10-2v2M8 14h.01M16 14h.01"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/></svg>',
  garage: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 10 8-5 8 5v10H4zM7 13h10v7H7z"/></svg>',
  wrench: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 6a5 5 0 0 0-6 6L3 17l4 4 5-5a5 5 0 0 0 6-6l-3 3-4-4z"/></svg>',
  bug: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7V5m6 2V5M7 10H4m16 0h-3M7 14H4m16 0h-3M9 18v2m6-2v2M8 8h8v10H8z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  help: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 0 1 4.7 1.2c0 1.8-2.4 2.2-2.4 3.8m0 3h.01"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10m-4-4 4 4 4-4M5 19h14"/></svg>'
};
export const icon = (name) => icons[name] || "";

export function statusClass(status) {
  return "status-" + String(status || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
export function statusBadge(status, tiny = false) {
  return '<span class="status-badge ' + statusClass(status) + (tiny ? " tiny" : "") + '">' + displayValue(status, "TBD") + '</span>';
}
export function button(label, url, type = "primary", extra = "") {
  return '<a class="button ' + type + '" href="' + url + '" ' + extra + '>' + label + '<span>→</span></a>';
}
export function sectionTitle(label, title, text = "") {
  return '<div class="section-title"><span>' + label + '</span><h2>' + title + '</h2>' + (text ? '<p>' + text + '</p>' : '') + '</div>';
}

function socialLink(label, url) {
  const target = configured(url);
  return target
    ? '<a href="' + target + '" target="_blank" rel="noopener noreferrer">' + label + '</a>'
    : '<span>' + label + '<small>Coming soon</small></span>';
}

export function mountHeader(active = "") {
  const target = document.querySelector("[data-site-header]");
  if (!target) return;
  const links = [
    ["home","index.html","Home"],
    ["mods","mods.html","Mods"],
    ["updates","updates.html","Updates"],
    ["about","about.html","About"],
    ["support","support.html","Support"]
  ];
  const nav = links.map(([key,path,label]) =>
    '<a class="' + (active===key ? "active" : "") + '" href="' + href(path) + '"' + (active===key ? ' aria-current="page"' : '') + '>' + label + '</a>'
  ).join("");
  const discord = configured(SITE_CONFIG.discordUrl);

  target.innerHTML =
    '<a class="skip-link" href="#main-content">Skip to content</a>' +
    '<header class="site-header" data-header><div class="site-header-background" aria-hidden="true"></div><div class="site-shell nav-shell">' +
      '<a class="brand" href="' + href("index.html") + '" aria-label="Torqz Mods home">' +
        '<img class="brand-logo" src="' + logo() + '" alt="Torqz Mods" width="44" height="44" loading="eager" decoding="sync" fetchpriority="high">' +
        '<span><strong>TORQZ</strong><small>MODS</small></span>' +
      '</a>' +
      '<nav class="desktop-nav" aria-label="Primary navigation">' + nav + '</nav>' +
      '<div class="nav-actions">' +
        '<button class="search-trigger" type="button" data-search-trigger>' + icon("search") + '<span>Search</span><kbd data-search-shortcut>Ctrl K</kbd></button>' +
        (discord
          ? '<a class="discord-link" href="' + discord + '" target="_blank" rel="noopener noreferrer">Discord</a>'
          : '<button class="discord-link soon" type="button" data-placeholder-link>Discord <small>Soon</small></button>') +
        '<button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu"><i></i><i></i></button>' +
      '</div>' +
    '</div><nav class="mobile-nav" id="mobile-menu" data-mobile-nav aria-hidden="true">' +
      '<div class="mobile-nav-head"><div class="brand mini"><img src="' + logo() + '" alt="Torqz Mods" width="44" height="44" loading="eager" decoding="sync"><span><strong>TORQZ</strong><small>MODS</small></span></div><button type="button" data-menu-close aria-label="Close menu">×</button></div>' +
      '<div class="mobile-nav-links">' + nav + '</div>' +
      (discord ? '<a class="mobile-discord" href="' + discord + '" target="_blank" rel="noopener noreferrer">Discord ↗</a>' : '<div class="mobile-discord muted">Discord <small>Coming soon</small></div>') +
    '</nav></header>' +
    '<div class="search-modal" data-search-overlay aria-hidden="true">' +
      '<button class="search-backdrop" type="button" data-search-close aria-label="Close search"></button>' +
      '<section class="search-panel" role="dialog" aria-modal="true" aria-labelledby="search-title" tabindex="-1" data-search-dialog>' +
        '<div class="search-head"><div><span>Quick Search</span><strong id="search-title">Find a Torqz project</strong></div><button type="button" data-search-close aria-label="Close search">×</button></div>' +
        '<label class="search-field">' + icon("search") + '<input type="search" autocomplete="off" placeholder="Search Torqz Garage…" data-global-search></label>' +
        '<div class="search-results" data-search-results aria-live="polite"></div>' +
        '<div class="search-hint"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div>' +
      '</section>' +
    '</div>';
}

export function mountFooter() {
  const target = document.querySelector("[data-site-footer]");
  if (!target) return;
  target.innerHTML =
    '<footer class="site-footer"><div class="site-shell footer-main">' +
      '<div class="footer-brand"><img src="' + logo() + '" alt="Torqz Mods" width="76" height="76"><div><strong>TORQZ MODS</strong><p>Original BeamNG.drive projects.</p></div></div>' +
      '<div class="footer-nav"><a href="' + href("mods.html") + '">Mods</a><a href="' + href("updates.html") + '">Updates</a><a href="' + href("about.html") + '">About</a><a href="' + href("support.html") + '">Support</a></div>' +
      '<div class="footer-socials">' + socialLink("Discord",SITE_CONFIG.discordUrl) + socialLink("YouTube",SITE_CONFIG.youtubeUrl) + socialLink("TikTok",SITE_CONFIG.tiktokUrl) + '</div>' +
    '</div><div class="site-shell footer-bottom"><span>© <span data-year></span> Torqz Mods</span><span>Torqz Mods is not affiliated with BeamNG GmbH.</span></div></footer>' +
    '<div class="toast" data-toast role="status" aria-live="polite"></div>' +
    '<div class="lightbox" data-lightbox aria-hidden="true" role="dialog" aria-modal="true" aria-label="Project media viewer" tabindex="-1">' +
      '<button class="lightbox-close" type="button" data-lightbox-close aria-label="Close media">×</button>' +
      '<button class="lightbox-prev" type="button" data-lightbox-prev aria-label="Previous media">←</button>' +
      '<div class="lightbox-stage" data-lightbox-stage></div>' +
      '<button class="lightbox-next" type="button" data-lightbox-next aria-label="Next media">→</button>' +
      '<span data-lightbox-label></span>' +
    '</div>';
}

export function automotiveArtwork(mod, nested = false, compact = false) {
  const prefix = nested ? "../" : "";
  return '<div class="automotive-art ' + (compact ? "compact" : "") + '">' +
    '<div class="garage-light light-a"></div><div class="garage-light light-b"></div>' +
    '<div class="speed-arc arc-a"></div><div class="speed-arc arc-b"></div>' +
    '<div class="road-lines"></div>' +
    '<svg class="car-outline" viewBox="0 0 900 380" aria-hidden="true"><path d="M68 245c50-8 78-28 118-78 38-48 76-71 138-82 82-14 208-17 299 0 57 11 98 34 139 72 23 21 43 45 76 55l25 8-2 36-39 8c-15 45-52 72-99 72-48 0-84-25-101-68H311c-16 43-53 68-101 68-48 0-85-27-100-72l-43-8 1-31z"/><path d="M278 111c31-49 71-73 134-81 66-8 151-3 216 15 44 12 78 35 116 75"/><path d="M332 96h266l75 28H276z"/></svg>' +
    '<div class="art-copy"><span>' + mod.internalName + '</span><strong>' + getProjectName(mod) + '</strong><p>' + (mod.subtitle || mod.tagline || "") + '</p></div>' +
    '<div class="art-badge">' + statusBadge(mod.status,true) + '</div>' +
    '<div class="art-annotation"><i></i><span>PROJECT 01 / GARAGE CONCEPT</span></div>' +
    '<div class="art-data"><span>BeamNG.drive</span><span>Creator build</span><span>Visual placeholder</span></div>' +
  '</div>';
}

export function projectMedia(mod, nested = false, compact = false) {
  const prefix = nested ? "../" : "";
  if (mod.heroVideo) {
    return '<div class="project-media-frame"><video muted loop playsinline preload="none" ' +
      (mod.heroVideoPoster ? 'poster="' + prefix + mod.heroVideoPoster + '"' : '') +
      ' data-lazy-video><source data-src="' + prefix + mod.heroVideo + '" type="' + (mod.heroVideo.endsWith(".webm")?"video/webm":"video/mp4") + '"></video></div>';
  }
  if (mod.heroImage) {
    return '<div class="project-media-frame"><img src="' + prefix + mod.heroImage + '" alt="' + getProjectName(mod) + ' project media" loading="lazy" decoding="async"></div>';
  }
  return automotiveArtwork(mod,nested,compact);
}

export function projectCard(mod, base = "") {
  return '<article class="project-card">' +
    '<a class="project-card-media" href="' + base + 'mods/' + mod.slug + '.html">' + projectMedia(mod,false,true) + '</a>' +
    '<div class="project-card-body"><div class="project-card-meta"><span>' + projectCategoryLabel(mod) + '</span>' + statusBadge(mod.status,true) + '</div>' +
    '<h3><a href="' + base + 'mods/' + mod.slug + '.html">' + getProjectName(mod) + '</a></h3><p>' + mod.subtitle + '</p><a class="text-link" href="' + base + 'mods/' + mod.slug + '.html">View Project <span>→</span></a></div>' +
  '</article>';
}

export function featureCard(feature, index = 0) {
  const names=["odometer","car","clock","garage","wrench","car"];
  return '<article class="feature-card"><div class="feature-icon">' + icon(names[index % names.length]) + '</div><div><h3>' + feature.title + '</h3><p>' + feature.description + '</p></div><span class="feature-state ' + statusClass(feature.status) + '">' +
    ({complete:"Working","in-progress":"In development",planned:"Planned"}[feature.status] || feature.status) +
  '</span></article>';
}

export function updateCard(update, project = null, prefix = "") {
  const pill = update.category || (project ? project.internalName : "Torqz");
  return '<article class="update-card">' +
    '<div class="update-card-date"><span>' + update.displayDate + '</span></div>' +
    '<div class="update-card-copy"><span class="update-pill">' + pill + '</span><span class="update-eyebrow">' + (project ? getProjectName(project) : "Torqz Mods") + '</span><h3>' + update.title + '</h3><p>' + update.description + '</p>' +
      (project ? '<a class="text-link" href="' + prefix + 'mods/' + project.slug + '.html">Read Update <span>→</span></a>' : '') +
    '</div>' +
    (update.image ? '<div class="update-card-media"><img src="' + prefix + update.image + '" alt="' + update.title + '" loading="lazy"></div>' : '<div class="update-card-accent" aria-hidden="true"></div>') +
  '</article>';
}

export function supportCard(iconName,title,text,status,actionHtml="") {
  const stateClass = actionHtml ? " is-actionable" : " is-unavailable";
  return '<article class="support-card' + stateClass + '"><div class="support-icon">' + icon(iconName) + '</div><h3>' + title + '</h3><p>' + text + '</p>' +
    (status ? '<span class="support-state ' + (status.toLowerCase().includes("soon") ? "muted" : "") + '">' + status + '</span>' : '') +
    actionHtml +
  '</article>';
}
