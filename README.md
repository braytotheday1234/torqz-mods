# Torqz Mods V5

Final major quality/refinement pass for the Torqz Mods BeamNG.drive website before real Project 01 media and release information begin replacing placeholders.

## Design direction

V5 preserves the established Torqz identity:

- Black / charcoal automotive visual system
- White and light typography
- Torqz orange accent
- Large editorial headlines
- Cinematic project media
- Existing navigation, mods library, updates, About, Support, FAQ, and footer structure

V5 is a refinement, not a redesign.

## Project data

Project content lives in `js/mods.js`. The data model now supports:

- `internalName`
- `publicName`
- `tagline`
- `shortDescription`
- `fullDescription`
- `featureSummary`
- `technicalDescription`
- `releaseNotes`
- `installationNotes`
- `compatibilityNotes`
- project status and current phase
- milestones
- development log
- category and configured tags
- version, file size, release date
- BeamNG compatibility data
- known issues
- project-specific installation
- download state and URL
- hero image / hero video / poster
- thumbnail and focal positions
- mixed gallery media
- video clips
- changelog
- credits

Null or empty values remain intentionally unpublished instead of being guessed.

## Project naming

Project 01 keeps its development identifier through `internalName`.

When a final public name exists, set:

`publicName: "Real Mod Name"`

The website will display the public name prominently while retaining Project 01 as its development identifier.

## Project media

Current development media lives under:

`assets/projects/project-01/`

The media layer supports images and local MP4/WebM video. Real media can replace the current SVG development placeholders by updating the project data; the page layouts do not need to be rewritten.

Use optimized WebP or AVIF for screenshots where practical. Gallery items can optionally provide `srcset`, `sizes`, captions, alt text, poster images, and focal positions.

## Updates

`js/updates.js` contains site-level updates and automatically derives project development-log entries from project data. A development entry can therefore appear on the project page, Updates page, and homepage without being manually duplicated.

## Configuration

External destinations remain centralized in `js/config.js`:

- Discord
- GitHub
- YouTube
- TikTok
- support
- bug reporting
- suggestions
- contact email

Empty external destinations render intentional **Coming Soon** states. No fake URLs are used.

## Release states

Project download states support:

- unavailable
- testing
- private-beta
- released
- archived

A public Download control appears only when the project is actually marked Released and a real download URL exists.

## Accessibility and interaction

V5 includes keyboard/focus handling for search, mobile navigation, FAQ, and project media lightbox; reduced-motion support; visible focus states; screen-reader labels; intentional error states; and touch-friendly controls.

## SEO / indexing

The production site includes unique page metadata, canonical URLs, Open Graph/Twitter metadata, a WebSite structured-data block on the homepage, project breadcrumb structured data, `sitemap.xml`, and `robots.txt`.

## Deployment

The production website remains a static GitHub Pages build from the `main` branch root.

There is no package-based build, linter, or type-check pipeline in this repository. GitHub Pages deployment is the production build check.
