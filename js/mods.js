export const CATEGORIES = Object.freeze(["All", "Vehicles", "Parts", "Performance", "Visual", "Utility"]);

export const MODS = Object.freeze([
  {
    id: "project-01",
    slug: "project-01",
    title: "Project 01",
    subtitle: "First Torqz development project",
    description: "The first official Torqz Mods BeamNG.drive project, currently in active development.",
    longDescription: "Project 01 is the first Torqz Mods release in development. Its final name, specifications, real in-game screenshots, supported BeamNG.drive version, file size, and release package will be published only when they are real and verified.",
    category: "Vehicles",
    version: "TBD",
    beamngVersion: "TBD",
    status: "In Development",
    releaseDate: "",
    updatedDate: "",
    updatedLabel: "In development",
    fileSize: "TBD",
    heroImage: "assets/projects/project-01/hero.svg",
    thumbnail: "assets/projects/project-01/thumb.svg",
    gallery: [
      { src: "assets/projects/project-01/gallery-01.svg", alt: "Project 01 development media placeholder", placeholder: true },
      { src: "assets/projects/project-01/gallery-02.svg", alt: "Project 01 development media placeholder", placeholder: true },
      { src: "assets/projects/project-01/gallery-03.svg", alt: "Project 01 development media placeholder", placeholder: true }
    ],
    downloadUrl: "",
    featured: true,
    features: [
      { title: "Original Torqz project", description: "Built as a first-party Torqz Mods release rather than a re-upload or repack." },
      { title: "Clear release information", description: "Compatibility, file size, version, and installation notes will be published only after verification." },
      { title: "Support-ready", description: "The release page is structured to keep installation help, known issues, and changelog details easy to find." }
    ],
    installation: [
      { title: "Download", description: "Use the official Torqz release link once Project 01 is published.", icon: "download" },
      { title: "Move File", description: "Keep the downloaded archive intact unless the release notes say otherwise.", icon: "file" },
      { title: "Place in Mods", description: "Move the ZIP into the mods folder inside your active BeamNG.drive user folder.", icon: "folder" },
      { title: "Launch BeamNG", description: "Start the game and verify the project appears before troubleshooting anything else.", icon: "play" }
    ],
    compatibility: {
      status: "Testing",
      beamngVersion: "TBD",
      knownIssues: "None published yet"
    },
    changelog: [
      {
        version: "Development",
        date: "",
        groups: {
          Added: ["Professional release page structure", "Project media placeholders ready for real screenshots"],
          Changed: ["Project data model expanded for future releases"],
          Fixed: []
        }
      }
    ],
    credits: ["Torqz Mods"]
  }
]);

export function getModBySlug(slug) {
  return MODS.find((mod) => mod.slug === slug) || null;
}
