import { SITE_CONFIG, externalOrPlaceholder } from "./config.js";

function rootPath() {
  return document.body.dataset.root || "";
}

function link(path) {
  return `${rootPath()}${path}`;
}

function socialLink(url, label) {
  const resolved = externalOrPlaceholder(url);
  if (!resolved) {
    return `<button class="footer-link is-disabled" type="button" data-placeholder-link aria-label="${label} link not configured">${label}<span>Coming soon</span></button>`;
  }
  return `<a class="footer-link" href="${resolved}" target="_blank" rel="noreferrer">${label}<span>↗</span></a>`;
}

export function mountHeader(active = "") {
  const target = document.querySelector("[data-site-header]");
  if (!target) return;

  const discord = externalOrPlaceholder(SITE_CONFIG.discordUrl);
  target.innerHTML = `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="utility-bar">
      <div class="shell utility-inner">
        <span>Independent BeamNG.drive development</span>
        <div>
          <a href="${link("updates.html")}">Updates</a>
          <a href="${link("support.html")}">Support</a>
          <a href="${SITE_CONFIG.githubUrl}" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>
    </div>
    <header class="site-header">
      <div class="shell nav-shell">
        <a class="brand" href="${link("index.html")}" aria-label="Torqz Mods home">
          <span class="brand-mark" aria-hidden="true"><i></i><b>TQ</b></span>
          <span class="brand-type"><strong>TORQZ</strong><small>MODS</small></span>
        </a>

        <nav class="desktop-nav" aria-label="Primary">
          <a class="${active === "home" ? "active" : ""}" href="${link("index.html")}">Home</a>
          <a class="${active === "mods" ? "active" : ""}" href="${link("mods.html")}">Mods</a>
          <a class="${active === "about" ? "active" : ""}" href="${link("about.html")}">About</a>
          <a class="${active === "support" ? "active" : ""}" href="${link("support.html")}">Support</a>
        </nav>

        <div class="nav-actions">
          <button class="icon-button search-trigger" type="button" aria-label="Open mod search" data-search-trigger>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.3-4.3m2.3-5.2A7.5 7.5 0 1 1 4 11.5a7.5 7.5 0 0 1 15 0Z"/></svg>
          </button>
          ${discord ? `<a class="button button-compact" href="${discord}" target="_blank" rel="noreferrer">Join Discord</a>` : `<button class="button button-compact" type="button" data-placeholder-link>Join Discord</button>`}
          <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false" data-menu-toggle><span></span><span></span></button>
        </div>
      </div>
      <div class="mobile-nav" data-mobile-nav>
        <a href="${link("index.html")}">Home</a>
        <a href="${link("mods.html")}">Mods</a>
        <a href="${link("about.html")}">About</a>
        <a href="${link("support.html")}">Support</a>
        <a href="${link("updates.html")}">Updates</a>
      </div>
    </header>
    <div class="search-overlay" data-search-overlay aria-hidden="true">
      <button class="search-backdrop" type="button" data-search-close aria-label="Close search"></button>
      <div class="search-dialog" role="dialog" aria-modal="true" aria-label="Search Torqz Mods">
        <div class="search-dialog-top">
          <span>Search mods</span>
          <button type="button" data-search-close aria-label="Close search">Esc</button>
        </div>
        <label class="global-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.3-4.3m2.3-5.2A7.5 7.5 0 1 1 4 11.5a7.5 7.5 0 0 1 15 0Z"/></svg>
          <input type="search" placeholder="Search Torqz Mods…" autocomplete="off" data-global-search />
        </label>
        <div class="search-results" data-search-results></div>
      </div>
    </div>
  `;
}

export function mountFooter() {
  const target = document.querySelector("[data-site-footer]");
  if (!target) return;
  target.innerHTML = `
    <footer class="site-footer">
      <div class="shell footer-grid">
        <div class="footer-brand">
          <a class="brand" href="${link("index.html")}">
            <span class="brand-mark" aria-hidden="true"><i></i><b>TQ</b></span>
            <span class="brand-type"><strong>TORQZ</strong><small>MODS</small></span>
          </a>
          <p>Focused BeamNG.drive projects with honest release information, clean downloads, and support that is easy to find.</p>
        </div>
        <div class="footer-column"><h2>Explore</h2><a href="${link("mods.html")}">Browse Mods</a><a href="${link("updates.html")}">Updates</a><a href="${link("about.html")}">About Torqz</a></div>
        <div class="footer-column"><h2>Help</h2><a href="${link("support.html")}">Support</a><a href="${link("install.html")}">Installation</a><a href="${link("support.html#faq")}">FAQ</a></div>
        <div class="footer-column"><h2>Community</h2>${socialLink(SITE_CONFIG.discordUrl, "Discord")}${socialLink(SITE_CONFIG.tiktokUrl, "TikTok")}${socialLink(SITE_CONFIG.youtubeUrl, "YouTube")}</div>
      </div>
      <div class="shell footer-bottom"><span>© <span data-year></span> Torqz Mods</span><span>Torqz Mods is not affiliated with BeamNG GmbH.</span></div>
    </footer>
    <div class="toast" role="status" aria-live="polite" data-toast></div>
  `;
}

export function modCard(mod, base = "") {
  return `
    <article class="mod-card" data-mod-card data-category="${mod.category}" data-name="${mod.name.toLowerCase()}" data-updated="${mod.updatedISO || ""}">
      <a class="mod-card-media" href="${base}mods/${mod.slug}.html" aria-label="View ${mod.name}">
        <img src="${base}${mod.image}" alt="${mod.name} preview" loading="lazy" width="800" height="450" />
        <span class="status-pill">${mod.status}</span>
        <span class="media-arrow" aria-hidden="true">↗</span>
      </a>
      <div class="mod-card-body">
        <div class="mod-card-heading"><div><span class="mod-category">${mod.category}</span><h3><a href="${base}mods/${mod.slug}.html">${mod.name}</a></h3></div><span class="version-label">${mod.version}</span></div>
        <p>${mod.description}</p>
        <div class="mod-card-meta"><span>BeamNG ${mod.beamngVersion}</span><span>${mod.releaseType}</span><span>${mod.updated}</span></div>
        <div class="mod-card-actions">
          <a class="text-action" href="${base}mods/${mod.slug}.html">View details <span>→</span></a>
          <button class="download-link ${mod.downloadUrl ? "" : "is-disabled"}" type="button" ${mod.downloadUrl ? `data-download="${mod.downloadUrl}"` : "disabled"}>${mod.downloadUrl ? "Download" : "Not released"}</button>
        </div>
      </div>
    </article>
  `;
}
