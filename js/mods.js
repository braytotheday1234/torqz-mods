export const MODS = Object.freeze([
  {
    id: "project-01",
    slug: "project-01",
    name: "Project 01",
    category: "Vehicles",
    description: "The first official Torqz Mods BeamNG.drive project, currently in active development.",
    fullDescription: "Project 01 is the first Torqz Mods release in development. The final vehicle name, specifications, screenshots, supported BeamNG.drive version, file size, and release package will be published only when they are real and verified.",
    version: "TBD",
    beamngVersion: "TBD",
    image: "assets/images/project-01.svg",
    screenshots: [],
    downloadUrl: "",
    fileSize: "TBD",
    updated: "In development",
    updatedISO: "",
    featured: true,
    status: "In development",
    releaseType: "Pre-release",
    installation: [
      "Download the official Torqz ZIP when the release becomes available.",
      "Keep the archive zipped unless the release notes specifically say otherwise.",
      "Open your current BeamNG.drive user folder and place the ZIP inside the mods folder.",
      "Launch BeamNG.drive and verify the mod appears before enabling other troubleshooting steps."
    ],
    features: [
      "Original Torqz Mods project",
      "Release notes and compatibility information will be published with the real build",
      "Clear installation instructions and known-issue reporting"
    ],
    changelog: [
      { version: "Development", date: "", items: ["Project page and release structure prepared.", "Final mod specifications are still being defined."] }
    ],
    credits: ["Torqz Mods"]
  }
]);

export const CATEGORIES = Object.freeze(["All", "Vehicles", "Parts", "Performance", "Visual", "Utility"]);

export function getModBySlug(slug) {
  return MODS.find((mod) => mod.slug === slug) || null;
}
