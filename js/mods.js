export const CATEGORIES = Object.freeze(["All","Vehicles","Gameplay","Utility","Visual","Performance","Parts","Other"]);
export const PROJECT_STATUSES = Object.freeze(["Concept","In Development","Testing","Release Candidate","Released","Archived"]);
export const MILESTONE_STATUSES = Object.freeze(["complete","in-progress","planned","blocked"]);
export const DOWNLOAD_STATES = Object.freeze(["unavailable","testing","private-beta","released","archived"]);

export const MODS = Object.freeze([{
  id: "project-01",
  slug: "project-01",
  internalName: "Project 01",
  publicName: "Torqz Garage",
  tagline: "Persistent vehicle ownership for BeamNG.drive.",
  subtitle: "Persistent vehicle ownership system",
  category: "Gameplay",
  categories: ["Gameplay","Utility"],
  tags: ["persistent vehicle ownership","garage","telemetry","vehicle data"],
  status: "In Development",
  currentPhase: "Vehicle Data",
  featured: true,

  shortDescription: "Torqz Garage is being built to give BeamNG.drive vehicles a persistent identity across gameplay.",
  fullDescription: "Torqz Garage is a persistent vehicle ownership system being developed for BeamNG.drive. The project is being built around the idea that a vehicle should be more than a temporary spawn: it should be able to keep an identity and, over time, support persistent ownership data such as mileage, driving time, configuration, condition, fuel or energy information, service history, and other garage records.",
  featureSummary: "Development currently focuses on vehicle detection, telemetry, and the foundations required for future persistent garage data.",
  technicalDescription: "The current Vehicle Data phase is focused on recognizing the active vehicle and building reliable data access for later persistence systems. Planned ownership features are listed separately so unfinished systems are never presented as complete.",
  releaseNotes: null,
  installationNotes: null,
  compatibilityNotes: null,

  version: null,
  fileSize: null,
  releaseDate: null,
  updatedAt: "2026-10-06",
  updatedLabel: "Active development",

  downloadState: "unavailable",
  downloadUrl: null,

  heroImage: null,
  heroVideo: null,
  heroVideoPoster: null,
  heroImagePosition: "center",
  thumbnail: null,
  thumbnailPosition: "center",
  developmentVisual: true,

  projectMedia: [],
  developmentMedia: [],
  videoClips: [],

  features: [
    {
      title: "Persistent vehicle identity",
      description: "The long-term goal is for owned vehicles to keep an identity across gameplay instead of behaving like disposable temporary spawns.",
      status: "planned"
    },
    {
      title: "Vehicle data foundation",
      description: "Current work focuses on vehicle detection and telemetry foundations needed before persistent garage records can be trusted.",
      status: "in-progress"
    },
    {
      title: "Ownership records",
      description: "Garage records are planned to store vehicle-specific information as the persistence system develops.",
      status: "planned"
    }
  ],

  liveSystems: [
    { name: "Vehicle Detection", status: "in-progress", description: "Active development is focused on reliably recognizing the current vehicle." },
    { name: "Telemetry Foundation", status: "in-progress", description: "Core vehicle data access is being prepared for future persistent records." },
    { name: "RPM Telemetry", status: "planned", description: "Planned telemetry source for future vehicle history and diagnostics." },
    { name: "Speed Telemetry", status: "planned", description: "Planned vehicle data source for later mileage and usage systems." },
    { name: "Engine State", status: "planned", description: "Planned engine-state tracking for future ownership data." },
    { name: "Session Mileage", status: "planned", description: "Planned foundation for persistent mileage tracking." },
    { name: "Vehicle Identity", status: "planned", description: "Planned persistent identity layer for owned vehicles." },
    { name: "Persistent Garage Storage", status: "planned", description: "Planned storage layer for vehicle ownership records." }
  ],

  plannedFeatures: [
    "Persistent vehicle identity",
    "Mileage",
    "Driving time",
    "Garage records",
    "Fuel / energy tracking",
    "Configuration history",
    "Service history",
    "Vehicle condition",
    "Garage management"
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

  milestones: [
    { name: "Foundation", status: "complete" },
    { name: "Vehicle Data", status: "in-progress" },
    { name: "Persistent Vehicle ID", status: "planned" },
    { name: "Garage Storage", status: "planned" },
    { name: "Service History", status: "planned" },
    { name: "UI", status: "planned" },
    { name: "Testing", status: "planned" }
  ],

  developmentLog: [
    {
      id: "project-01-foundation-loads",
      date: "2026-10-06",
      displayDate: "Oct 6, 2026",
      category: "Foundation",
      title: "Project foundation loads in BeamNG.drive",
      description: "Project 01 successfully initializes in BeamNG.drive, completing the first foundation stage for Torqz Garage.",
      relatedMilestone: "Foundation",
      image: null,
      video: null
    },
    {
      id: "project-01-vehicle-data-begins",
      date: "2026-10-06",
      displayDate: "Oct 6, 2026",
      category: "Vehicle Data",
      title: "Vehicle Data phase begins",
      description: "Development has moved into vehicle detection and telemetry foundations. Individual vehicle systems remain in progress or planned until they are tested.",
      relatedMilestone: "Vehicle Data",
      image: null,
      video: null
    }
  ],

  changelog: [{
    version: "Development",
    date: null,
    groups: {
      Added: ["Project foundation", "Vehicle Data development phase", "Persistent ownership architecture"],
      Changed: ["Project 01 now has the public development name Torqz Garage"],
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
  return project.publicName ? "Torqz " + project.internalName : "Torqz / " + project.internalName;
}
export function getModBySlug(slug) { return MODS.find((mod) => mod.slug === slug) || null; }
export function getModById(id) { return MODS.find((mod) => mod.id === id) || null; }
export function displayValue(value, fallback = "TBD") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}
export function projectCategories(project) {
  return project?.categories?.length ? project.categories : [project?.category || "Other"];
}
export function projectCategoryLabel(project) {
  return projectCategories(project).join(" / ");
}
export function resolvedDownloadState(project) {
  if (!project) return "unavailable";
  const status = String(project.status || "").toLowerCase();
  if (status === "archived") return "archived";
  if (status === "released") return project.downloadUrl ? "released" : "unavailable";
  if (project.downloadState === "testing" || project.downloadState === "private-beta") return project.downloadState;
  return "unavailable";
}
