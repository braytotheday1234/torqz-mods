import { SITE_CONFIG, configured } from "./config.js";
import { displayValue, getProjectName, projectCategoryLabel } from "./mods.js";

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

export function statusBadge(status, label = null) {
  return '<span class="status-badge ' + statusClass(status) + '">' + (label || displayValue(status, "TBD")) + '</span>';
}

export function systemStateBadge(status) {
  const value = String(status || "planned").toLowerCase();
  const label = {
    complete: "Complete",
    "in-progress": "In Progress",
    planned: "Planned",
    blocked: "Blocked"
  }[value] || status || "Planned";
  return '<span class="system-state ' + statusClass(value) + '">' + label + '</span>';
}

export function comingSoonBadge(label = "Coming Soon") {
  return '<span class="coming-soon-badge"><i aria-hidden="true"></i>' + label + '</span>';
}

export function developmentVisual(mod, options = {}) {
  const {
    compact = false,
    className = "",
    showMilestones = true
  } = options;
  const milestones = (mod.milestones || []).slice(0, compact ? 3 : 5);
  return '<div class="development-visual ' + (compact ? "compact " : "") + className + '">' +
    '<div class="dev-grid" aria-hidden="true"></div>' +
    '<div class="dev-lines" aria-hidden="true"></div>' +
    '<div class="dev-watermark" aria-hidden="true">GARAGE</div>' +
    '<div class="dev-topline">' +
      '<img src="' + logo() + '" alt="" aria-hidden="true" width="64" height="64">' +
      '<div><span>TORQZ ' + mod.internalName.toUpperCase() + '</span><strong>DEVELOPMENT BUILD</strong></div>' +
      statusBadge(mod.status) +
    '</div>' +
    '<div class="dev-main">' +
      '<span>TORQZ GARAGE</span>' +
      '<h2>' + getProjectName(mod) + '</h2>' +
      '<p>' + (mod.tagline || mod.shortDescription || "") + '</p>' +
    '</div>' +
    '<div class="dev-meta">' +
      '<div><small>Current Phase</small><strong>' + displayValue(mod.currentPhase, "Not published") + '</strong></div>' +
      '<div><small>Category</small><strong>' + projectCategoryLabel(mod) + '</strong></div>' +
      '<div><small>Project</small><strong>' + mod.internalName + '</strong></div>' +
    '</div>' +
    (showMilestones && milestones.length ? '<div class="dev-milestones">' + milestones.map((item) =>
      '<div><span class="dev-state-dot ' + statusClass(item.status) + '" aria-hidden="true"></span><b>' + item.name + '</b><small>' + item.status.replace("-", " ") + '</small></div>'
    ).join("") + '</div>' : '') +
    '<div class="dev-coordinate" aria-hidden="true">TQZ / DEV / 01</div>' +
  '</div>';
}

export function mediaFrame(options = {}) {
  const {
    src = "",
    alt = "",
    video = "",
    poster = "",
    fallback = "",
    className = "",
    loading = "lazy",
    caption = "",
    position = "center",
    srcset = "",
    sizes = ""
  } = options;

  const safePosition = position || "center";

  if (video) {
    const type = video.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4";
    return '<div class="media-frame ' + className + '">' +
      '<video muted loop playsinline preload="none" style="object-position:' + safePosition + '" ' +
      (poster ? 'poster="' + poster + '" ' : '') +
      'data-lazy-video data-fallback="' + fallback + '">' +
      '<source data-src="' + video + '" type="' + type + '">' +
      '</video>' +
      (caption ? '<span class="media-caption">' + caption + '</span>' : '') +
      '</div>';
  }

  const resolvedSrc = src || fallback;
  if (!resolvedSrc) {
    return '<div class="media-frame media-failed ' + className + '"><span class="media-unavailable">Media coming soon</span></div>';
  }
  return '<div class="media-frame ' + className + '">' +
    '<img src="' + resolvedSrc + '" alt="' + alt + '" loading="' + loading + '" decoding="async" ' +
    (srcset ? 'srcset="' + srcset + '" ' : '') +
    (sizes ? 'sizes="' + sizes + '" ' : '') +
    'style="object-position:' + safePosition + '" data-fade-image data-fallback="' + fallback + '">' +
    (caption ? '<span class="media-caption">' + caption + '</span>' : '') +
    '</div>';
}

export function projectMedia(mod, options = {}) {
  const {
    compact = false,
    className = "",
    loading = "lazy",
    context = "card"
  } = options;

  const hasRealVideo = Boolean(mod.heroVideo);
  const hasRealImage = Boolean(mod.heroImage);

  if (hasRealVideo || hasRealImage) {
    return mediaFrame({
      src: hasRealImage ? (context === "nested" ? "../" : "") + mod.heroImage : "",
      video: hasRealVideo ? (context === "nested" ? "../" : "") + mod.heroVideo : "",
      poster: mod.heroVideoPoster ? (context === "nested" ? "../" : "") + mod.heroVideoPoster : "",
      alt: getProjectName(mod) + " project media",
      loading,
      className,
      position: mod.heroImagePosition || "center"
    });
  }

  return developmentVisual(mod, { compact, className, showMilestones: !compact });
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
        '<a class="brand brand-logo" href="' + href("index.html") + '" aria-label="Torqz Mods home">' +
          '<img src="' + logo() + '" alt="Torqz Mods" width="46" height="46">' +
        '</a>' +
        '<nav class="desktop-nav" aria-label="Primary navigation">' + links + '</nav>' +
        '<div class="nav-actions">' +
          '<button class="nav-search" type="button" data-search-trigger aria-label="Search Torqz Mods">' +
            icon("search") + '<span>Search</span><kbd data-search-shortcut>Ctrl K</kbd>' +
          '</button>' +
          (discord
            ? '<a class="nav-discord" href="' + discord + '" target="_blank" rel="noopener noreferrer">Discord ' + icon("arrow") + '</a>'
            : '<button class="nav-discord coming" type="button" data-placeholder-link><span>Discord</span><small>Coming Soon</small></button>') +
          '<button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu" aria-label="Open navigation"><i></i><i></i></button>' +
        '</div>' +
      '</div>' +
      '<nav class="mobile-nav" id="mobile-menu" data-mobile-nav aria-label="Mobile navigation" aria-hidden="true">' +
        '<div class="mobile-nav-head"><img src="' + logo() + '" alt="Torqz Mods" width="48" height="48"><button type="button" data-menu-close aria-label="Close navigation">×</button></div>' +
        '<div class="mobile-nav-links">' + links + '</div>' +
        (discord
          ? '<a class="mobile-discord" href="' + discord + '" target="_blank" rel="noopener noreferrer">Discord ↗</a>'
          : '<div class="mobile-discord coming"><span>Discord</span>' + comingSoonBadge() + '</div>') +
      '</nav>' +
    '</header>' +
    '<div class="command-search" data-search-overlay aria-hidden="true">' +
      '<button class="command-backdrop" type="button" data-search-close aria-label="Close search"></button>' +
      '<section class="command-panel" role="dialog" aria-modal="true" aria-labelledby="search-dialog-title" tabindex="-1" data-search-dialog>' +
        '<div class="command-head"><span id="search-dialog-title">Search Torqz Mods</span><div><kbd>↑↓</kbd><span>Navigate</span><kbd>Enter</kbd><span>Open</span><kbd>Esc</kbd><span>Close</span></div></div>' +
        '<label class="command-input">' + icon("search") +
          '<span class="sr-only">Search projects</span>' +
          '<input type="search" autocomplete="off" placeholder="Search Torqz Garage, Project 01, telemetry…" data-global-search>' +
        '</label>' +
        '<div class="command-results" data-search-results aria-live="polite"></div>' +
      '</section>' +
    '</div>';
}

export function mountFooter() {
  const target = document.querySelector("[data-site-footer]");
  if (!target) return;
  target.innerHTML =
    '<footer class="site-footer">' +
      '<div class="wide-shell footer-top">' +
        '<div class="footer-lockup">' +
          '<img class="footer-brand-logo" src="' + logo() + '" alt="Torqz Mods" width="140" height="140">' +
          '<div><strong>TORQZ MODS</strong><p>The development home for Torqz Garage and future Torqz BeamNG.drive projects.</p></div>' +
        '</div>' +
        '<div class="footer-columns">' +
          '<div><h2>Projects</h2><a href="' + href("mods.html") + '">Mods</a><a href="' + href("updates.html") + '">Development Updates</a><a href="' + href("mods/project-01.html") + '">Torqz Garage</a></div>' +
          '<div><h2>Company</h2><a href="' + href("about.html") + '">About</a><a href="' + href("support.html") + '">Support</a><a href="' + href("install.html") + '">Installation</a></div>' +
          '<div><h2>Community</h2>' +
            socialItem("Discord", SITE_CONFIG.discordUrl) +
            socialItem("YouTube", SITE_CONFIG.youtubeUrl) +
            socialItem("TikTok", SITE_CONFIG.tiktokUrl) +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="wide-shell footer-bottom"><span>© <span data-year></span> Torqz Mods</span><span>Torqz Mods is an independent BeamNG.drive modding project and is not affiliated with BeamNG GmbH.</span></div>' +
    '</footer>' +
    '<div class="toast" data-toast role="status" aria-live="polite"></div>' +
    '<div class="lightbox" data-lightbox aria-hidden="true" role="dialog" aria-modal="true" aria-label="Project media viewer" tabindex="-1">' +
      '<button class="lightbox-prev" type="button" data-lightbox-prev aria-label="Previous media">←</button>' +
      '<button class="lightbox-close" type="button" data-lightbox-close aria-label="Close media viewer">×</button>' +
      '<button class="lightbox-next" type="button" data-lightbox-next aria-label="Next media">→</button>' +
      '<div class="lightbox-stage" data-lightbox-stage></div>' +
      '<span data-lightbox-label></span>' +
    '</div>';
}

export function modTile(mod, base = "") {
  const name = getProjectName(mod);
  const media = mod.heroImage || mod.heroVideo
    ? mediaFrame({
        src: mod.thumbnail ? base + mod.thumbnail : (mod.heroImage ? base + mod.heroImage : ""),
        video: mod.thumbnail ? "" : (mod.heroVideo ? base + mod.heroVideo : ""),
        poster: mod.heroVideoPoster ? base + mod.heroVideoPoster : "",
        alt: name + " preview",
        position: mod.thumbnailPosition || mod.heroImagePosition || "center"
      })
    : developmentVisual(mod, { compact: true, showMilestones: false });

  return '<article class="project-tile" data-mod-card>' +
    '<a class="project-media" href="' + base + 'mods/' + mod.slug + '.html" aria-label="View ' + name + '">' +
      media + statusBadge(mod.status) +
      '<span class="project-arrow">' + icon("arrow") + '</span>' +
    '</a>' +
    '<div class="project-copy">' +
      '<div class="project-meta"><span>' + projectCategoryLabel(mod) + '</span><span>' + displayValue(mod.currentPhase, "Development") + '</span></div>' +
      '<h3><a href="' + base + 'mods/' + mod.slug + '.html">' + name + '</a></h3>' +
      '<small class="project-internal-name">' + mod.internalName + '</small>' +
      '<p>' + (mod.shortDescription || mod.fullDescription || "Project information is being prepared.") + '</p>' +
      '<a class="project-link" href="' + base + 'mods/' + mod.slug + '.html">View project <span>→</span></a>' +
    '</div>' +
  '</article>';
}
