# Torqz Mods

Official static website for **Torqz Mods**, an independent BeamNG.drive modding brand.

The site is intentionally lightweight and deploys directly through GitHub Pages. It uses shared project data, reusable header/footer/components, and a single organized design system.

## Current project

**Project 01 — Torqz Garage**

Torqz Garage is in development and focuses on persistent vehicle ownership, mileage, vehicle data, and future garage features.

No release date, version, compatibility claim, download, file size, or other unverified release information is published until it is real.

## Architecture

- `js/config.js` — site URLs and environment configuration
- `js/mods.js` — shared project data
- `js/updates.js` — development updates derived from project data
- `js/components.js` — shared header, footer, cards, media, and UI components
- `js/main.js` — page initialization and interactions
- `css/main.css` — authoritative design system and responsive styling

The project data feeds the homepage, Mods page, project page, search, and Updates page.

## Brand system

The current visual identity uses a dark automotive base with Torqz electric blue/cyan accents.

The navbar logo uses the existing stable CSS-background rendering architecture. Do not convert it back to a reveal/lazy/composited image implementation without a verified reason.

## Media

Project media supports real images and local video when they exist. Until real screenshots are available, Torqz Garage uses intentional development artwork rather than fake BeamNG screenshots.

## External links

Discord, YouTube, TikTok, bug reporting, and suggestions are configured in `js/config.js`.

If a URL is empty, the website displays an intentional **Coming Soon** state rather than a fake or dead link.

## Deployment

Production deploys from the `main` branch through GitHub Pages.
