export const CATEGORIES = Object.freeze(["All","Gameplay","Utility"]);

export const MODS = Object.freeze([{
  id: "project-01",
  slug: "project-01",
  internalName: "Project 01",
  publicName: "Torqz Garage",
  tagline: "A better way to own and track your BeamNG vehicles.",
  subtitle: "Persistent vehicle ownership for BeamNG.drive.",
  category: "Gameplay",
  categories: ["Gameplay","Utility"],
  tags: ["garage","ownership","vehicle data","mileage","telemetry","BeamNG"],
  status: "In Development",
  currentPhase: "Vehicle Data",
  featured: true,

  shortDescription: "Torqz Garage is a BeamNG.drive mod focused on persistent vehicle ownership, mileage, vehicle data, and future garage features.",
  fullDescription: "Torqz Garage is being built to give vehicles a persistent identity across gameplay. The goal is to make owned vehicles feel like something you keep and build a history with instead of something that disappears when a session ends.",
  featureSummary: "Right now, development is focused on vehicle detection and the data needed for future saving, mileage, and garage features.",

  version: null,
  fileSize: null,
  releaseDate: null,
  updatedAt: "2026-10-06",
  downloadState: "unavailable",
  downloadUrl: null,

  heroImage: null,
  heroVideo: null,
  heroVideoPoster: null,
  projectMedia: [],
  developmentMedia: [],

  features: [
    { title: "Persistent Vehicle Identity", description: "Give owned vehicles an identity that can carry across gameplay.", status: "planned" },
    { title: "Mileage Tracking", description: "Track how far a vehicle has been driven over time.", status: "planned" },
    { title: "Driving Time", description: "Keep a record of time spent with individual vehicles.", status: "planned" },
    { title: "Vehicle Data", description: "Build the vehicle detection and telemetry foundation the rest of the garage depends on.", status: "in-progress" },
    { title: "Future Garage Storage", description: "Save ownership information and garage records for vehicles.", status: "planned" },
    { title: "Service History", description: "Leave room for service and maintenance history as the project grows.", status: "planned" }
  ],

  milestones: [
    { name: "Foundation", status: "complete" },
    { name: "Vehicle Data", status: "in-progress" },
    { name: "Persistent Garage", status: "planned" },
    { name: "UI", status: "planned" },
    { name: "Testing", status: "planned" }
  ],

  developmentLog: [
    {
      id: "project-01-foundation-loads",
      date: "2026-10-06",
      displayDate: "Oct 6, 2026",
      title: "Project foundation loads in BeamNG.drive",
      description: "Project 01 now initializes in BeamNG.drive, giving Torqz Garage a working base to build on.",
      image: null,
      video: null
    },
    {
      id: "project-01-vehicle-data-begins",
      date: "2026-10-06",
      displayDate: "Oct 6, 2026",
      title: "Vehicle Data work begins",
      description: "Development has moved into vehicle detection and telemetry work for Torqz Garage.",
      image: null,
      video: null
    }
  ],

  installation: [],
  beamngCompatibility: {
    testedVersion: null,
    minimumVersion: null,
    notes: null
  },
  knownIssuesState: "unpublished",
  knownIssues: [],
  changelog: [{
    version: "Development",
    date: null,
    groups: {
      Added: ["Project foundation", "Vehicle Data development work"],
      Changed: ["Project 01 is now publicly presented as Torqz Garage"],
      Fixed: []
    }
  }],
  credits: ["Torqz Mods"]
}]);

export function getProjectName(project) {
  return project?.publicName || project?.internalName || "Untitled Torqz Project";
}
export function getModBySlug(slug) { return MODS.find((mod) => mod.slug === slug) || null; }
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
  if (status === "released" && project.downloadUrl) return "released";
  if (status === "archived") return "archived";
  return "unavailable";
}
