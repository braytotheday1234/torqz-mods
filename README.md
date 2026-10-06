# Torqz Mods

Production-oriented static website for the Torqz Mods BeamNG.drive modding brand.

## Architecture

- `index.html` — homepage
- `mods.html` — searchable/filterable mod library
- `mods/project-01.html` — data-driven mod detail page
- `about.html` — brand/about page
- `support.html` — support hub and FAQ
- `install.html` — installation guide
- `updates.html` — development/release log
- `js/config.js` — centralized site/social/support configuration
- `js/mods.js` — reusable mod data source
- `js/components.js` — shared header/footer/mod-card rendering
- `js/main.js` — interactions and page behavior
- `css/main.css` — responsive design system

## Configuration

Edit `js/config.js` to add real Discord, TikTok, YouTube, support, bug-report, suggestion, or contact links.

Mod metadata lives in `js/mods.js`. UI cards and detail pages render from that data instead of duplicating mod content throughout the site.

## Publishing

The repository is compatible with GitHub Pages from the `main` branch root. All navigation uses relative URLs so it can later move to a custom domain without rewriting the site structure.

## Release integrity

The project intentionally avoids fake download numbers, fake users, fake reviews, fake release dates, and fake compatibility data.
