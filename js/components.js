import { SITE_CONFIG, configured } from "./config.js";
import { displayValue, getProjectName } from "./mods.js";

const icon = (name) => ({
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.4-4.4m2.4-5.1A7.5 7.5 0 1 1 4 11.5a7.5 7.5 0 0 1 15 0Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>'
}[name] || "");

const root = () => document.body.dataset.root || "";
const href = (path) => root() + path;
const logo = () => href("assets/brand/torqz-logo.webp");

export function statusClass(status) {
  return "status-" + String(status || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function statusBadge(status) {
  return '<span class="status-badge casual-status ' + statusClass(status) + '">' + displayValue(status, "TBD") + '</span>';
}

export function projectVisual(mod, options = {}) {
  const prefix = options.nested ? "../" : "";
  if (mod.heroVideo) {
    return '<div class="project-visual-media"><video muted loop playsinline preload="none" ' +
      (mod.heroVideoPoster ? 'poster="' + prefix + mod.heroVideoPoster + '" ' : '') +
      'data-lazy-video><source data-src="' + prefix + mod.heroVideo + '" type="' +
      (mod.heroVideo.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4") +
      '"></video></div>';
  }
  if (mod.heroImage) {
    return '<div class="project-visual-media"><img src="' + prefix + mod.heroImage + '" alt="' + getProjectName(mod) + ' project preview" loading="' + (options.eager ? "eager" : "lazy") + '" decoding="async" data-fade-image></div>';
  }

  return '<div class="project-visual-brand">' +
    '<div class="project-visual-glow" aria-hidden="true"></div>' +
    '<img src="' + prefix + 'assets/brand/torqz-logo.webp" alt="" aria-hidden="true" width="180" height="180">' +
    '<div class="project-visual-copy"><span>' + mod.internalName + '</span><strong>' + getProjectName(mod) + '</strong><small>' + (mod.subtitle || mod.tagline || "") + '</small></div>' +
    statusBadge(mod.status) +
  '</div>';
}

function navLinks(active) {
  const items = [
    ["home", "index.html", "Home"],
    ["mods", "mods.html", "Mods"],
    ["updates", "updates.html", "Updates"],
    ["about", "about.html", "About"],
    ["support", "support.html", "Support"]
  ];
  return items.map(([key, path, label]) =>
    '<a class="' + (active === key ? "active" : "") + '" href="' + href(path) + '"' +
    (active === key ? ' aria-current="page"' : '') + '>' + label + '</a>'
  ).join("");
}

function socialItem(label, url) {
  const value = configured(url);
  return value
    ? '<a href="' + value + '" target="_blank" rel="noopener noreferrer">' + label + '<span>↗</span></a>'
    : '<span class="footer-social-muted">' + label + '<small>Coming Soon</small></span>';
}

export function mountHeader(active = "") {
  const target = document.querySelector("[data-site-header]");
  if (!target) return;
  const discord = configured(SITE_CONFIG.discordUrl);
  const links = navLinks(active);

  target.innerHTML =
    '<a class="skip-link" href="#main-content">Skip to content</a>' +
    '<header class="site-header" data-header>' +
      '<div class="wide-shell nav-shell">' +
        '<a class="brand brand-logo" href="' + href("index.html") + '" aria-label="Torqz Mods home"><img src="' + logo() + '" alt="Torqz Mods" width="44" height="44"></a>' +
        '<nav class="desktop-nav" aria-label="Primary navigation">' + links + '</nav>' +
        '<div class="nav-actions">' +
          '<button class="nav-search" type="button" data-search-trigger aria-label="Search Torqz Mods">' + icon("search") + '<span>Search</span><kbd data-search-shortcut>Ctrl K</kbd></button>' +
          (discord
            ? '<a class="nav-discord" href="' + discord + '" target="_blank" rel="noopener noreferrer">Discord ' + icon("arrow") + '</a>'
            : '<button class="nav-discord coming" type="button" data-placeholder-link><span>Discord</span><small>Coming Soon</small></button>') +
          '<button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu" aria-label="Open navigation"><i></i><i></i></button>' +
        '</div>' +
      '</div>' +
      '<nav class="mobile-nav" id="mobile-menu" data-mobile-nav aria-label="Mobile navigation" aria-hidden="true">' +
        '<div class="mobile-nav-head"><img src="' + logo() + '" alt="Torqz Mods" width="44" height="44"><button type="button" data-menu-close aria-label="Close navigation">×</button></div>' +
        '<div class="mobile-nav-links">' + links + '</div>' +
        (discord ? '<a class="mobile-discord" href="' + discord + '" target="_blank" rel="noopener noreferrer">Discord ↗</a>' : '<div class="mobile-discord coming"><span>Discord</span><small>Coming Soon</small></div>') +
      '</nav>' +
    '</header>' +
    '<div class="command-search" data-search-overlay aria-hidden="true">' +
      '<button class="command-backdrop" type="button" data-search-close aria-label="Close search"></button>' +
      '<section class="command-panel" role="dialog" aria-modal="true" aria-labelledby="search-dialog-title" tabindex="-1" data-search-dialog>' +
        '<div class="command-head"><span id="search-dialog-title">Search Torqz Mods</span><div><kbd>↑↓</kbd><span>Navigate</span><kbd>Enter</kbd><span>Open</span><kbd>Esc</kbd><span>Close</span></div></div>' +
        '<label class="command-input">' + icon("search") + '<span class="sr-only">Search projects</span><input type="search" autocomplete="off" placeholder="Search Torqz Garage…" data-global-search></label>' +
        '<div class="command-results" data-search-results aria-live="polite"></div>' +
      '</section>' +
    '</div>';
}

export function mountFooter() {
  const target = document.querySelector("[data-site-footer]");
  if (!target) return;
  target.innerHTML =
    '<footer class="site-footer simple-footer">' +
      '<div class="wide-shell footer-top">' +
        '<div class="footer-lockup">' +
          '<img class="footer-brand-logo" src="' + logo() + '" alt="Torqz Mods" width="96" height="96">' +
          '<div><strong>TORQZ MODS</strong><p>BeamNG.drive mods made by a small independent creator project.</p></div>' +
        '</div>' +
        '<div class="footer-columns">' +
          '<div><h2>Projects</h2><a href="' + href("mods.html") + '">Mods</a><a href="' + href("updates.html") + '">Updates</a><a href="' + href("mods/project-01.html") + '">Torqz Garage</a></div>' +
          '<div><h2>Torqz</h2><a href="' + href("about.html") + '">About</a><a href="' + href("support.html") + '">Support</a><a href="' + href("install.html") + '">Installation</a></div>' +
          '<div><h2>Community</h2>' + socialItem("Discord", SITE_CONFIG.discordUrl) + socialItem("YouTube", SITE_CONFIG.youtubeUrl) + socialItem("TikTok", SITE_CONFIG.tiktokUrl) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="wide-shell footer-bottom"><span>© <span data-year></span> Torqz Mods</span><span>Not affiliated with BeamNG GmbH.</span></div>' +
    '</footer>' +
    '<div class="toast" data-toast role="status" aria-live="polite"></div>' +
    '<div class="lightbox" data-lightbox aria-hidden="true" role="dialog" aria-modal="true" aria-label="Project media viewer" tabindex="-1">' +
      '<button class="lightbox-prev" type="button" data-lightbox-prev aria-label="Previous media">←</button>' +
      '<button class="lightbox-close" type="button" data-lightbox-close aria-label="Close media viewer">×</button>' +
      '<button class="lightbox-next" type="button" data-lightbox-next aria-label="Next media">→</button>' +
      '<div class="lightbox-stage" data-lightbox-stage></div><span data-lightbox-label></span>' +
    '</div>';
}

export function modTile(mod, base = "") {
  return '<article class="project-tile casual-project-card">' +
    '<a class="project-media casual-card-media" href="' + base + 'mods/' + mod.slug + '.html">' + projectVisual(mod) + '</a>' +
    '<div class="project-copy"><div class="project-card-top">' + statusBadge(mod.status) + '</div><h3><a href="' + base + 'mods/' + mod.slug + '.html">' + getProjectName(mod) + '</a></h3><p>' + mod.shortDescription + '</p><a class="project-link" href="' + base + 'mods/' + mod.slug + '.html">View Project <span>→</span></a></div>' +
  '</article>';
}
