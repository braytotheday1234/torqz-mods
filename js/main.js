import { SITE_CONFIG, configured } from "./config.js";
import {
  MODS,
  getModBySlug,
  getProjectName,
  displayValue,
  projectCategories,
  projectCategoryLabel
} from "./mods.js";
import { UPDATES, updatesForProject } from "./updates.js";
import { initThemePicker } from "./theme.js";
import {
  escapeHtml,
  initSupportFeatures,
  initHelpGuides,
  initKnownIssues,
  initReportBuilders,
  initUpdatesFilters,
  buildSiteSearchCatalog
} from "./features.js";
import {
  mountHeader,
  mountFooter,
  projectCard,
  projectMedia,
  featureCard,
  updateCard,
  supportCard,
  statusBadge,
  button,
  sectionTitle,
  icon
} from "./components.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const base = document.body.dataset.root || "";
const focusableSelector =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),video[controls],[tabindex]:not([tabindex="-1"])';
const projectById = new Map(MODS.map((project) => [project.id, project]));

mountHeader(document.body.dataset.page || "");
mountFooter();

function toast(message) {
  const node = $("[data-toast]");
  if (!node) return;
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 2200);
}

function trapFocus(event, container) {
  if (event.key !== "Tab" || !container) return;
  const nodes = $$(focusableSelector, container).filter((node) => node.offsetParent !== null);
  if (!nodes.length) return;
  const first = nodes[0];
  const last = nodes.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function initDocumentState() {
  $$("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  document.documentElement.classList.add("js");
  document.body.classList.add("page-entering");
  setTimeout(() => document.body.classList.remove("page-entering"), 360);

  const shortcut = $("[data-search-shortcut]");
  if (shortcut) {
    shortcut.textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ K" : "Ctrl K";
  }

  $$("[data-placeholder-link]").forEach((node) => {
    node.addEventListener("click", (event) => {
      event.preventDefault();
      toast("Coming soon.");
    });
  });

  $$("[data-discord-link]").forEach((node) => {
    node.addEventListener("click", (event) => {
      event.preventDefault();
      const url = configured(SITE_CONFIG.discordUrl);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else toast("Discord is coming soon.");
    });
  });
}

function initHeaderState() {
  const header = $("[data-header]");
  if (!header) return;
  const update = () => header.classList.toggle("scrolled", window.scrollY > 12);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initMobileMenu() {
  const menu = $("[data-mobile-nav]");
  const toggle = $("[data-menu-toggle]");
  const close = $("[data-menu-close]");
  if (!menu || !toggle) return;

  let previousFocus = null;

  const closeMenu = ({ restoreFocus = true } = {}) => {
    menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    if (restoreFocus) previousFocus?.focus?.();
  };

  const openMenu = () => {
    previousFocus = document.activeElement;
    menu.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
    setTimeout(() => close?.focus(), 20);
  };

  toggle.addEventListener("click", () => {
    if (menu.classList.contains("open")) closeMenu();
    else openMenu();
  });

  close?.addEventListener("click", () => closeMenu());
  $$(".mobile-nav a").forEach((link) => link.addEventListener("click", () => closeMenu({ restoreFocus: false })));

  menu.closeMenu = closeMenu;
  menu.trap = (event) => trapFocus(event, menu);
}

function projectSearchText(project) {
  return [
    project.publicName,
    project.internalName,
    project.tagline,
    project.subtitle,
    project.shortDescription,
    project.category,
    project.status,
    project.currentPhase,
    ...(project.categories || []),
    ...(project.tags || []),
    ...(project.features || []).map((feature) => feature.title)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function initSearch() {
  const overlay = $("[data-search-overlay]");
  const dialog = $("[data-search-dialog]");
  const input = $("[data-global-search]");
  const results = $("[data-search-results]");
  const trigger = $("[data-search-trigger]");
  if (!overlay || !dialog || !input || !results || !trigger) return;

  let selectedIndex = -1;
  let previousFocus = null;

  const catalog = buildSiteSearchCatalog();
  const groupOrder = ["Projects","FAQ","Troubleshooting","Known Issues","Updates","Help Pages"];
  const render = () => {
    const query = input.value.trim().toLowerCase();
    selectedIndex = -1;
    if (!query) {
      results.innerHTML = '<div class="search-empty"><strong>Search Torqz Mods</strong><span>Try “Garage”, “logs”, “download”, “mileage”, or “report”.</span></div>';
      return;
    }
    const matches = catalog.filter(entry =>
      [entry.title,entry.subtitle,entry.terms,entry.kind].join(" ").toLowerCase().includes(query)
    ).slice(0,35);
    if (!matches.length) {
      results.innerHTML = '<div class="search-empty"><strong>No matching results.</strong><span>Try another keyword or a shorter phrase.</span></div>';
      return;
    }
    results.innerHTML = groupOrder.map(kind => {
      const entries = matches.filter(e=>e.kind===kind);
      if(!entries.length)return "";
      return '<div class="search-result-group"><div class="search-group-heading">'+escapeHtml(kind)+'</div>'+
        entries.map(e=>
          '<a class="search-result" data-search-result href="'+base+escapeHtml(e.href)+'">'+
          '<span class="search-kind-mark" aria-hidden="true">↗</span><span class="search-result-copy"><strong>'+escapeHtml(e.title)+'</strong><span>'+escapeHtml(e.subtitle)+'</span></span><b aria-hidden="true">→</b></a>'
        ).join("")+'</div>';
    }).join("");
    const first = $("[data-search-result]", results);
    if(first){first.classList.add("selected");selectedIndex=0;}
  };

  const closeSearch = ({ restoreFocus = true } = {}) => {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("search-open");
    selectedIndex = -1;
    if (restoreFocus) previousFocus?.focus?.();
  };

  const openSearch = () => {
    const menu = $("[data-mobile-nav]");
    menu?.closeMenu?.({ restoreFocus: false });
    previousFocus = document.activeElement;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("search-open");
    render();
    setTimeout(() => input.focus(), 20);
  };

  const moveSelection = (delta) => {
    const items = $$("[data-search-result]");
    if (!items.length) return;
    selectedIndex = Math.max(0, Math.min(items.length - 1, selectedIndex + delta));
    items.forEach((item, index) => item.classList.toggle("selected", index === selectedIndex));
    items[selectedIndex]?.scrollIntoView({ block: "nearest" });
  };

  trigger.addEventListener("click", openSearch);
  $$("[data-search-close]").forEach((node) => node.addEventListener("click", () => closeSearch()));
  input.addEventListener("input", render);

  overlay.openSearch = openSearch;
  overlay.closeSearch = closeSearch;
  overlay.moveSelection = moveSelection;
  overlay.trap = (event) => trapFocus(event, dialog);
  overlay.getSelectedResult = () => $$("[data-search-result]")[selectedIndex] || null;
}

function initKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
    const search = $("[data-search-overlay]");
    const menu = $("[data-mobile-nav]");
    const lightbox = $("[data-lightbox]");

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      search?.openSearch?.();
      return;
    }

    if (event.key === "/" && !typing && !search?.classList.contains("open")) {
      event.preventDefault();
      search?.openSearch?.();
      return;
    }

    if (event.key === "Escape") {
      if (lightbox?.classList.contains("open")) {
        lightbox.closeLightbox?.();
        return;
      }
      if (search?.classList.contains("open")) {
        search.closeSearch?.();
        return;
      }
      if (menu?.classList.contains("open")) {
        menu.closeMenu?.();
        return;
      }
    }

    if (lightbox?.classList.contains("open")) {
      lightbox.trap?.(event);
      if (event.key === "ArrowLeft") lightbox.showPrevious?.();
      if (event.key === "ArrowRight") lightbox.showNext?.();
      return;
    }

    if (search?.classList.contains("open")) {
      search.trap?.(event);
      if (event.key === "ArrowDown") {
        event.preventDefault();
        search.moveSelection?.(1);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        search.moveSelection?.(-1);
      }
      if (event.key === "Enter") {
        const target = search.getSelectedResult?.();
        if (target) {
          event.preventDefault();
          location.href = target.href;
        }
      }
      return;
    }

    if (menu?.classList.contains("open")) {
      menu.trap?.(event);
    }
  });
}

function initRevealMotion() {
  if (!("IntersectionObserver" in window)) {
    $$("[data-reveal]").forEach((node) => node.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove("reveal-pending");
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -18px" }
  );

  $$("[data-reveal]").forEach((node) => {
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 1.05) {
      node.classList.add("visible");
      return;
    }
    node.classList.add("reveal-pending");
    observer.observe(node);
  });
}

function initLazyVideos(scope = document) {
  const videos = $$("[data-lazy-video]", scope);
  if (!videos.length) return;

  if (!("IntersectionObserver" in window)) {
    videos.forEach((video) => {
      const source = $("source[data-src]", video);
      if (source && !source.src) source.src = source.dataset.src;
      video.load();
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const video = entry.target;
        const source = $("source[data-src]", video);
        if (source && !source.src) {
          source.src = source.dataset.src;
          video.load();
        }
        observer.unobserve(video);
      });
    },
    { rootMargin: "220px" }
  );

  videos.forEach((video) => observer.observe(video));
}

function projectForUpdate(update) {
  return projectById.get(update.projectId) || null;
}

function initHomepage() {
  const featuredMount = $("[data-featured-project]");
  const featuresMount = $("[data-home-features]");
  const latestMount = $("[data-latest-updates]");
  const featured = MODS.find((project) => project.featured);

  if (featuredMount && featured) {
    const highlights = (featured.features || [])
      .slice(0, 3)
      .map((feature) => "<span>" + feature.title + "</span>")
      .join("");

    featuredMount.innerHTML =
      '<div class="featured-media">' +
      projectMedia(featured) +
      "</div>" +
      '<div class="featured-copy">' +
      '<span class="eyebrow">Project 01 / Featured Build</span><h2>' +
      getProjectName(featured) +
      '</h2><p class="featured-tagline">' +
      featured.tagline +
      "</p><p>" +
      featured.shortDescription +
      '</p><div class="highlight-list">' +
      highlights +
      '</div><div class="featured-footer">' +
      statusBadge(featured.status, true) +
      '<a class="text-link strong" href="mods/' +
      featured.slug +
      '.html">View Project <span>→</span></a></div></div>';
  }

  if (featuresMount && featured) {
    featuresMount.innerHTML = featured.features.slice(0, 4).map((feature, index) => featureCard(feature, index)).join("");
  }

  if (latestMount) {
    latestMount.innerHTML = UPDATES.slice(0, 3)
      .map((update) => updateCard(update, projectForUpdate(update)))
      .join("");
  }
}

function initModsLibrary() {
  const mount = $("[data-mod-grid]");
  const categoryMount = $("[data-category-list]");
  if (!mount || !categoryMount) return;

  const search = $("[data-mod-search]");
  const sort = $("[data-sort]");
  const categories = ["All", ...new Set(MODS.flatMap(projectCategories))];

  categoryMount.innerHTML = categories
    .map(
      (category, index) =>
        '<button class="filter-chip ' +
        (index === 0 ? "active" : "") +
        '" type="button" data-category-filter="' +
        category +
        '">' +
        category +
        "</button>"
    )
    .join("");

  const render = () => {
    const active = $("[data-category-filter].active")?.dataset.categoryFilter || "All";
    const query = search?.value.trim().toLowerCase() || "";

    let items = MODS.filter(
      (project) =>
        (active === "All" || projectCategories(project).includes(active)) &&
        projectSearchText(project).includes(query)
    );

    if (sort?.value === "az") {
      items = [...items].sort((a, b) => getProjectName(a).localeCompare(getProjectName(b)));
    } else if (sort?.value === "updated") {
      items = [...items].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    }

    mount.innerHTML = items.length
      ? items.map((project) => projectCard(project, base)).join("")
      : '<div class="empty-state"><strong>No matching projects.</strong><span>Try another search or filter.</span></div>';

    const count = $("[data-result-count]");
    if (count) count.textContent = items.length + (items.length === 1 ? " project" : " projects");

    const note = $("[data-project-note]");
    if (note) note.hidden = MODS.length !== 1;

    initLazyVideos(mount);
  };

  categoryMount.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category-filter]");
    if (!button) return;
    $$("[data-category-filter]", categoryMount).forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    render();
  });

  search?.addEventListener("input", render);
  sort?.addEventListener("change", render);
  render();
}

function renderDevelopmentTimeline(project) {
  return (
    '<div class="development-timeline">' +
    (project.milestones || [])
      .map((milestone, index) => {
        const label =
          {
            complete: "Complete",
            "in-progress": "In progress",
            planned: index === 2 ? "Next" : "Planned",
            blocked: "Blocked"
          }[milestone.status] || milestone.status;

        return (
          '<div class="timeline-item ' +
          milestone.status +
          '"><span class="timeline-number" aria-hidden="true">' +
          String(index + 1).padStart(2, "0") +
          '</span><div><strong>' +
          milestone.name +
          "</strong><span>" +
          label +
          "</span></div></div>"
        );
      })
      .join("") +
    "</div>"
  );
}

function renderFeatureGrid(project) {
  return (
    '<div class="feature-grid project-features">' +
    (project.features || []).map((feature, index) => featureCard(feature, index)).join("") +
    "</div>"
  );
}

function renderMediaGallery(project) {
  const items = [...(project.projectMedia || []), ...(project.developmentMedia || [])];

  if (!items.length) {
    return (
      '<div class="single-media-placeholder">' +
      projectMedia(project, true) +
      "<p>Real BeamNG screenshots and development captures will appear here as they are made.</p></div>"
    );
  }

  return (
    '<div class="media-grid">' +
    items
      .map((item) => {
        const prefix = "../";
        const type = item.type || "image";
        const src = prefix + (item.src || "");
        const poster = prefix + (item.poster || "");
        const caption = item.caption || "Torqz Garage media";
        return (
          '<button class="media-item" type="button" data-gallery-src="' +
          src +
          '" data-gallery-type="' +
          type +
          '" data-gallery-poster="' +
          poster +
          '" data-gallery-label="' +
          caption +
          '">' +
          (type === "video"
            ? '<video muted playsinline preload="metadata" ' +
              (poster ? 'poster="' + poster + '"' : "") +
              '><source src="' +
              src +
              '"></video>'
            : '<img src="' + src + '" alt="' + caption + '" loading="lazy">') +
          "<span>" +
          caption +
          "</span></button>"
        );
      })
      .join("") +
    "</div>"
  );
}

function initProjectDetail() {
  const detail = $("[data-mod-detail]");
  if (!detail) return;

  const project = getModBySlug(document.body.dataset.modSlug || "");
  if (!project) {
    detail.innerHTML =
      '<section class="not-found"><div class="site-shell"><h1>Project not found.</h1>' +
      button("Back to Mods", "../mods.html", "primary") +
      "</div></section>";
    return;
  }

  document.title = getProjectName(project) + " — Torqz Mods";
  const updates = updatesForProject(project.id);
  const compatibility = project.beamngCompatibility || {};

  detail.innerHTML =
    '<section class="project-hero"><div class="site-shell project-hero-grid">' +
    '<div class="project-hero-media">' +
    projectMedia(project, true) +
    '</div><div class="project-hero-copy"><span class="eyebrow">' +
    project.internalName +
    "</span><h1>" +
    getProjectName(project) +
    '</h1><p class="project-hero-tagline">' +
    project.tagline +
    "</p>" +
    statusBadge(project.status) +
    '<div class="hero-actions"><a class="button primary" href="../updates.html' + (updates.length ? '#update-' + updates[0].id : '') + '">Latest Update <span>→</span></a><button class="button secondary disabled" type="button" disabled>Installation — Not Released</button></div></div>' +
    '</div><div class="site-shell project-meta-row"><div><span>Category</span><strong>' +
    projectCategoryLabel(project) +
    "</strong></div><div><span>Status</span><strong>" +
    project.status +
    "</strong></div><div><span>Current Focus</span><strong>" +
    displayValue(project.currentPhase) +
    "</strong></div></div></section>" +
    '<section class="content-section"><div class="site-shell two-col-copy">' +
    sectionTitle("Overview", "What is Torqz Garage?") +
    "<div><p>" +
    project.fullDescription +
    "</p><p>" +
    project.featureSummary +
    "</p></div></div></section>" +
    '<section class="content-section alt"><div class="site-shell">' +
    sectionTitle("Features", "Built around your cars.", "Useful vehicle ownership features, with planned ideas clearly marked.") +
    renderFeatureGrid(project) +
    "</div></section>" +
    '<section class="content-section"><div class="site-shell two-col-copy">' +
    sectionTitle("Current Development", "Where things are right now.") +
    "<div>" +
    renderDevelopmentTimeline(project) +
    "</div></div></section>" +
    '<section class="content-section alt"><div class="site-shell">' +
    sectionTitle("Media", "Torqz Garage media.") +
    renderMediaGallery(project) +
    "</div></section>" +
    (updates.length
      ? '<section class="content-section"><div class="site-shell">' +
        sectionTitle("Latest Updates", "What I’m working on.") +
        '<div class="updates-list">' +
        updates.map((update) => updateCard(update, project, "../")).join("") +
        "</div></div></section>"
      : "") +
    '<section class="content-section alt"><div class="site-shell info-grid">' +
    '<article><div class="info-icon">' +
    icon("download") +
    '</div><span>Installation</span><h3>Not released yet</h3><p>Install steps will be posted when Torqz Garage has a real public release.</p></article>' +
    '<article><div class="info-icon">' +
    icon("car") +
    '</div><span>Compatibility</span><h3>' +
    displayValue(compatibility.testedVersion) +
    '</h3><p>Supported BeamNG.drive versions will be listed after testing.</p></article>' +
    '<article><div class="info-icon">' +
    icon("bug") +
    '</div><span>Known Issues</span><h3>' +
    (project.knownIssues?.length ? project.knownIssues.length + " listed" : "None published") +
    '</h3><p>Only verified published issues are listed.</p><a class="text-link" href="../known-issues.html">View Issues <span>→</span></a></article></div></section>' +
    '<section class="content-section"><div class="site-shell project-status-strip"><div><span class="eyebrow">Verified project status</span><h2>Currently building: ' +
    displayValue(project.currentPhase) +
    '</h2><p>Availability: Not released. No public download or verified compatibility has been announced.</p>' +
    (updates.length ? '<p>Latest verified entry: ' + updates[0].displayDate + ' — ' + updates[0].title + '</p>' : '') +
    '</div><div class="project-status-actions"><a class="button primary" href="../updates.html">Development Updates <span>→</span></a><a class="button secondary" href="../support.html">Need Help? <span>→</span></a><a class="text-link" href="../known-issues.html">Known Issues <span>→</span></a></div></div></section>' +
    '<section class="content-section"><div class="site-shell credits"><span>Credits</span><strong>' +
    (project.credits || []).join(" · ") +
    "</strong></div></section>";

  initLazyVideos(detail);
}

function initUpdatesPage() {
  const mount = $("[data-updates-list]");
  if (!mount) return;
  mount.innerHTML = UPDATES.map((update) => updateCard(update, projectForUpdate(update))).join("");
}

function initSupportPage() {
  const mount = $("[data-support-cards]");
  if (!mount) return;
  const discord = configured(SITE_CONFIG.discordUrl);
  mount.innerHTML =
    supportCard("help","Discord Support","Community support will be linked when the server is officially available.",
      discord ? "Available" : "Coming soon", discord
      ? '<a class="support-action" href="'+discord+'" target="_blank" rel="noopener noreferrer">Open Discord →</a>' : "") +
    supportCard("download","Installation Help","Current release status and general BeamNG installation guidance.","Available",
      '<a class="support-action" href="install.html">Open Guide →</a>') +
    supportCard("bug","Prepare Bug Report","Write reproduction steps, generate a report, and copy it. No submission.","Local tool",
      '<a class="support-action" href="report.html#bug">Build Report →</a>') +
    supportCard("plus","Feature Suggestions","Prepare a detailed, copy-ready idea for a Torqz project.","Local tool",
      '<a class="support-action" href="report.html#idea">Build Suggestion →</a>') +
    supportCard("help","Searchable FAQ","Find answers about downloads, development, installation, and more.","Available",
      '<a class="support-action" href="#faq">Browse FAQ ↓</a>');
}

function initFaq() {
  document.addEventListener("click", event => {
    const button=event.target.closest("[data-accordion-button]");
    if (!button) return;
    const item=button.closest(".faq-item");
    if (!item) return;
    const expanded=item.classList.toggle("open");
    button.setAttribute("aria-expanded",String(expanded));
    const symbol=$("[data-accordion-symbol]",button);
    if (symbol) symbol.textContent=expanded ? "−" : "+";
  });
}

function initLightbox() {
  const lightbox = $("[data-lightbox]");
  const stage = $("[data-lightbox-stage]");
  const label = $("[data-lightbox-label]");
  if (!lightbox || !stage) return;

  let items = [];
  let index = 0;
  let previousFocus = null;

  const render = (nextIndex) => {
    if (!items.length) return;
    index = (nextIndex + items.length) % items.length;
    const item = items[index];
    const src = item.dataset.gallerySrc || "";
    const type = item.dataset.galleryType || "image";
    const poster = item.dataset.galleryPoster || "";
    const text = item.dataset.galleryLabel || "";

    stage.innerHTML =
      type === "video"
        ? '<video controls muted playsinline ' +
          (poster ? 'poster="' + poster + '"' : "") +
          '><source src="' +
          src +
          '"></video>'
        : '<img src="' + src + '" alt="' + text + '">';

    if (label) label.textContent = text;
  };

  const close = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("search-open");
    stage.innerHTML = "";
    previousFocus?.focus?.();
  };

  const open = (gallery, startIndex, trigger) => {
    items = gallery;
    previousFocus = trigger || document.activeElement;
    render(startIndex);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("search-open");
    setTimeout(() => $("[data-lightbox-close]")?.focus(), 20);
  };

  document.addEventListener("click", (event) => {
    const item = event.target.closest("[data-gallery-src]");
    if (!item) return;
    const gallery = $$("[data-gallery-src]");
    open(gallery, gallery.indexOf(item), item);
  });

  $("[data-lightbox-close]")?.addEventListener("click", close);
  $("[data-lightbox-prev]")?.addEventListener("click", () => render(index - 1));
  $("[data-lightbox-next]")?.addEventListener("click", () => render(index + 1));

  lightbox.closeLightbox = close;
  lightbox.showPrevious = () => render(index - 1);
  lightbox.showNext = () => render(index + 1);
  lightbox.trap = (event) => trapFocus(event, lightbox);
}

function initPageTransitions() {
  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const link = event.target.closest('a[href]');
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

    const href = link.getAttribute("href") || "";
    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      return;
    }

    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return;

    event.preventDefault();
    $("[data-search-overlay]")?.closeSearch?.({ restoreFocus: false });
    $("[data-mobile-nav]")?.closeMenu?.({ restoreFocus: false });
    document.body.classList.add("page-leaving");

    const navigate = () => {
      location.href = link.href;
    };

    const timer = setTimeout(navigate, 190);
    document.body.addEventListener(
      "transitionend",
      (transitionEvent) => {
        if (transitionEvent.propertyName !== "opacity") return;
        clearTimeout(timer);
        navigate();
      },
      { once: true }
    );
  });

  window.addEventListener("pageshow", () => {
    document.body.classList.remove("page-leaving");
    document.body.classList.add("page-entering");
    setTimeout(() => document.body.classList.remove("page-entering"), 360);
  });
}

initDocumentState();
initThemePicker();
initHeaderState();
initMobileMenu();
initSearch();
initKeyboardShortcuts();
initRevealMotion();
initLazyVideos();
initHomepage();
initModsLibrary();
initUpdatesPage();
initUpdatesFilters();
initSupportPage();
initSupportFeatures();
initHelpGuides();
initKnownIssues();
initReportBuilders();
initProjectDetail();
initFaq();
initLightbox();
initPageTransitions();
