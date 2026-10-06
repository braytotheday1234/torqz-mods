export const CATEGORIES = Object.freeze(["All","Vehicles","Gameplay","Utility","Visual","Performance","Parts","Other"]);
export const PROJECT_STATUSES = Object.freeze(["Concept","In Development","Testing","Release Candidate","Released","Archived"]);
export const MILESTONE_STATUSES = Object.freeze(["complete","in-progress","planned","blocked"]);
export const DOWNLOAD_STATES = Object.freeze(["unavailable","testing","private-beta","released","archived"]);

export const PROJECT_MEDIA_PLACEHOLDER = Object.freeze({
  hero: "assets/projects/project-01/hero.svg",
  thumbnail: "assets/projects/project-01/thumb.svg"
});

export const MODS = Object.freeze([{
  id: "project-01",
  slug: "project-01",
  internalName: "Project 01",
  publicName: null,
  tagline: null,
  subtitle: "First Torqz development project",
  category: "Other",
  tags: [],
  status: "In Development",
  currentPhase: null,
  featured: true,

  shortDescription: "The first official Torqz Mods BeamNG.drive project, currently in active development.",
  fullDescription: "Project 01 is the first Torqz Mods release in development. Its final public name, verified specifications, real in-game screenshots, supported BeamNG.drive version, file size, and release package will be published only when they are real.",
  featureSummary: null,
  technicalDescription: null,
  releaseNotes: null,
  installationNotes: null,
  compatibilityNotes: null,

  version: null,
  fileSize: null,
  releaseDate: null,
  updatedAt: "2026-10-06",
  updatedLabel: "In development",

  downloadState: "unavailable",
  downloadUrl: null,

  heroImage: "assets/projects/project-01/hero.svg",
  heroVideo: null,
  heroVideoPoster: null,
  heroImagePosition: "center",
  thumbnail: "assets/projects/project-01/thumb.svg",
  thumbnailPosition: "center",
  fallbackHero: PROJECT_MEDIA_PLACEHOLDER.hero,
  fallbackThumbnail: PROJECT_MEDIA_PLACEHOLDER.thumbnail,

  gallery: [
    { type: "image", src: "assets/projects/project-01/gallery-01.svg", alt: "Project 01 development media placeholder", caption: "Development media placeholder", position: "center" },
    { type: "image", src: "assets/projects/project-01/gallery-02.svg", alt: "Project 01 development media placeholder", caption: "Development media placeholder", position: "center" },
    { type: "image", src: "assets/projects/project-01/gallery-03.svg", alt: "Project 01 development media placeholder", caption: "Development media placeholder", position: "center" }
  ],
  videoClips: [],

  features: [
    { title: "Original Torqz project", description: "Built as a first-party Torqz Mods release rather than a re-upload or repack." },
    { title: "Clear release information", description: "Compatibility, file size, version, and installation notes will be published only after verification." },
    { title: "Support-ready", description: "Installation help, known issues, and release notes are organized around the project page." }
  ],

  beamngCompatibility: {
    testedVersion: null,
    minimumVersion: null,
    notes: null
  },

  knownIssuesState: "unpublished",
  knownIssues: [],

  installation: [],
  installationPath: null,
  installationWarning: null,
  installationNote: null,

  milestones: [],
  developmentLog: [],

  changelog: [{
    version: "Development",
    date: null,
    groups: {
      Added: ["Professional release page structure", "Project media placeholders ready for real screenshots"],
      Changed: ["Project data model expanded for future releases"],
      Fixed: []
    }
  }],

  credits: ["Torqz Mods"]
}]);

export function getProjectName(project) {
  return project?.publicName || project?.internalName || "Untitled Torqz Project";
}

export function getProjectLabel(project) {
  if (!project) return "Torqz Project";
  return project.publicName ? project.internalName : "Torqz / " + project.internalName;
}

export function getModBySlug(slug) {
  return MODS.find((mod) => mod.slug === slug) || null;
}

export function getModById(id) {
  return MODS.find((mod) => mod.id === id) || null;
}

export function displayValue(value, fallback = "TBD") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

export function resolvedDownloadState(project) {
  if (!project) return "unavailable";
  const status = String(project.status || "").toLowerCase();
  if (status === "archived") return "archived";
  if (status === "released") return project.downloadUrl ? "released" : "unavailable";
  if (project.downloadState === "testing" || project.downloadState === "private-beta") return project.downloadState;
  return "unavailable";
}
