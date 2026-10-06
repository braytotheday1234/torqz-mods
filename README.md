# Torqz Mods V6

V6 is the content-density, visual-depth, and brand-polish pass for the Torqz Mods website.

The site remains a static GitHub Pages project and preserves the established dark automotive Torqz design. The goal of V6 is to make the site feel like the active development home of **Torqz Garage / Project 01**, even before release screenshots and download information exist.

## Torqz Garage

Project 01 now has the public development name:

**Torqz Garage**

Tagline:

**Persistent vehicle ownership for BeamNG.drive.**

The internal identifier remains **Project 01**.

Current project data is stored in `js/mods.js`.

## Current confirmed development state

- Foundation — Complete
- Vehicle Data — In Progress
- Persistent Vehicle ID — Planned
- Garage Storage — Planned
- Service History — Planned
- UI — Planned
- Testing — Planned

The site does not use percentage-complete bars.

## Development model

The project data supports:

- public and internal names
- tagline and descriptions
- categories and tags
- current phase
- milestones
- live systems
- planned features
- development log
- project media
- development media
- image focal positions
- local video clips and posters
- version and release state
- compatibility
- project-specific installation
- known issues
- changelog
- download state
- credits

Project 01 development-log entries automatically flow into the project page, Updates page, and homepage development activity.

## Media

Real Project 01 media can be added without redesigning the website.

Use:

- `projectMedia` for release-quality or project-facing screenshots/clips
- `developmentMedia` for console output, telemetry tests, VS Code screenshots, debug images, testing captures, and development clips
- `heroImage` / `heroVideo` for the primary project hero

Until real project media exists, V6 uses a data-driven Torqz development graphic rather than a fake vehicle screenshot.

## Brand assets

The user-provided Torqz logo is stored at:

`assets/brand/torqz-logo.webp`

It is used in the navbar, footer, development visuals, favicon treatment, and Open Graph metadata.

## External links

External destinations remain centralized in `js/config.js`.

Unconfigured Discord, YouTube, TikTok, bug-report, and suggestion destinations remain intentional **Coming Soon** states. No fake URLs are used.

## Deployment

Production deploys from the `main` branch root through GitHub Pages.
