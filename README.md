# Torqz Mods V4

Deep polish and interaction pass of the Torqz Mods BeamNG.drive website.

## What changed

V3 keeps the existing data-driven/static GitHub Pages architecture, but substantially rebuilds the visual system and page composition.

- Cinematic 80–95vh homepage hero
- Large featured-project reveal
- Media-dominant project tiles
- Editorial philosophy and updates sections
- Data-driven development journal
- Command-style search with Ctrl/Cmd+K, slash, arrow-key navigation, Enter, and Escape
- Search result thumbnails, status, category, and version
- Search/filter/sort mod library
- Cinematic data-driven project detail page
- Lightbox gallery
- Four-step installation presentation
- Dedicated compatibility state
- Expandable changelog
- Fully reworked About and Support pages
- Responsive mobile layouts
- Centralized site links in js/config.js
- Centralized mod data in js/mods.js
- Centralized update data in js/updates.js

## Configuration

Edit js/config.js for Discord, GitHub, YouTube, TikTok, support, bug report, suggestion, and contact links.

Empty URLs intentionally render as Coming Soon rather than fake or dead destinations.

## Project data

Edit js/mods.js. UI listings and Project 01 render from the data model.

Project media currently uses clearly labeled development SVG placeholders under assets/projects/project-01/. Replace those files with real optimized WebP/AVIF/JPG/PNG screenshots later and update the data file if filenames change.

## Publishing

GitHub Pages can continue deploying from the main branch root.
