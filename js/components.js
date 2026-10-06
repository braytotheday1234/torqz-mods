import { SITE_CONFIG, configured } from "./config.js";

const icon = (name) => {
  const icons = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.4-4.4m2.4-5.1A7.5 7.5 0 1 1 4 11.5a7.5 7.5 0 0 1 15 0Z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>'
  };
  return icons[name] || "";
};

function root() {
  return document.body.dataset.root || "";
}

function href(path) {
  return `${root()}${path}`;
}

function socialItem(label, url) {
  const value = configured(url);
  return value
    ? `<a href="${value}" target="_blank" rel="noreferrer">${label}<span>↗</span></a>`
    : `<button type="button" class="footer-disabled" data-placeholder-link>${label}<span>Coming soon</span></button>`;
}

export function mountHeader(active = "") {
  const target = document.querySelector("[data-site-header]");
  if (!target) return;
  const discord = configured(SITE_CONFIG.discordUrl);

  target.innerHTML = `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="site-header" data-header>
      <div class="wide-shell nav-shell">
        <a class="brand" href="${href("index.html")}" aria-label="Torqz Mods home">
          <span class="brand-glyph" aria-hidden="true"><b>TQ</b></span>
          <span class="brand-word"><strong>TORQZ</strong><small>MODS</small></span>
        </a>
        <nav class="desktop-nav" aria-label="Primary navigation">
          <a class="${active === "home" ? "active" : ""}" href="${href("index.html")}">Home</a>
          <a class="${active === "mods" ? "active" : ""}" href="${href("mods.html")}">Mods</a>
          <a class="${active === "updates" ? "active" : ""}" href="${href("updates.html")}">Updates</a>
          <a class="${active === "about" ? "active" : ""}" href="${href("about.html")}">About</a>
          <a class="${active === "support" ? "active" : ""}" href="${href("support.html")}">Support</a>
        </nav>
        <div class="nav-actions">
          <button class="nav-search" type="button" data-search-trigger aria-label="Search mods">${icon("search")}<span>Search</span><kbd>⌘K</kbd></button>
          ${discord ? `<a class="nav-discord" href="${discord}" target="_blank" rel="noreferrer">Discord ${icon("arrow")}</a>` : `<button class="nav-discord" type="button" data-placeholder-link>Discord <small>Soon</small></button>`}
          <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-label="Open navigation"><i></i><i></i></button>
        </div>
      </div>
      <nav class="mobile-nav" data-mobile-nav aria-label="Mobile navigation">
        <a href="${href("index.html")}">Home</a>
        <a href="${href("mods.html")}">Mods</a>
        <a href="${href("updates.html")}">Updates</a>
        <a href="${href("about.html")}">About</a>
        <a href="${href("support.html")}">Support</a>
      </nav>
    </header>
    <div class="command-search" data-search-overlay aria-hidden="true">
      <button class="command-backdrop" type="button" data-search-close aria-label="Close search"></button>
      <section class="command-panel" role="dialog" aria-modal="true" aria-label="Search Torqz Mods">
        <div class="command-head"><span>Search Torqz Mods</span><div><kbd>↑↓</kbd><span>Navigate</span><kbd>Enter</kbd><span>Open</span><kbd>Esc</kbd><span>Close</span></div></div>
        <label class="command-input">${icon("search")}<input type="search" autocomplete="off" placeholder="Search projects, categories, status…" data-global-search /></label>
        <div class="command-results" data-search-results></div>
      </section>
    </div>
  `;
}

export function mountFooter() {
  const target = document.querySelector("[data-site-footer]");
  if (!target) return;
  target.innerHTML = `
    <footer class="site-footer">
      <div class="wide-shell footer-top">
        <div class="footer-lockup">
          <div class="footer-logo">TORQZ<span>MODS</span></div>
          <p>Independent BeamNG.drive projects built around quality, clarity, clean presentation, and honest release information.</p>
        </div>
        <div class="footer-columns">
          <div><h2>Projects</h2><a href="${href("mods.html")}">Mods</a><a href="${href("updates.html")}">Updates</a></div>
          <div><h2>Company</h2><a href="${href("about.html")}">About</a><a href="${href("support.html")}">Support</a><a href="${href("install.html")}">Installation</a></div>
          <div><h2>Community</h2>${socialItem("Discord", SITE_CONFIG.discordUrl)}${socialItem("YouTube", SITE_CONFIG.youtubeUrl)}${socialItem("TikTok", SITE_CONFIG.tiktokUrl)}</div>
        </div>
      </div>
      <div class="wide-shell footer-bottom"><span>© <span data-year></span> Torqz Mods</span><span>Torqz Mods is an independent BeamNG.drive modding project and is not affiliated with BeamNG GmbH.</span></div>
    </footer>
    <div class="toast" data-toast role="status" aria-live="polite"></div>
    <div class="lightbox" data-lightbox aria-hidden="true"><button type="button" data-lightbox-close aria-label="Close image">×</button><img alt="" data-lightbox-image><span data-lightbox-label></span></div>
  `;
}

export function modTile(mod, base = "") {
  return `
    <article class="project-tile" data-mod-card>
      <a class="project-media" href="${base}mods/${mod.slug}.html" aria-label="View ${mod.title}">
        <img src="${base}${mod.thumbnail}" alt="${mod.title} preview" width="900" height="600" loading="lazy">
        <span class="project-status">${mod.status}</span>
        <span class="project-arrow">${icon("arrow")}</span>
      </a>
      <div class="project-copy">
        <div class="project-meta"><span>${mod.category}</span><span>${mod.version}</span></div>
        <h3><a href="${base}mods/${mod.slug}.html">${mod.title}</a></h3>
        <p>${mod.description}</p>
        <a class="project-link" href="${base}mods/${mod.slug}.html">View project <span>→</span></a>
      </div>
    </article>
  `;
}
