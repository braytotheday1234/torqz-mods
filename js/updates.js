import { MODS, getProjectName } from "./mods.js";

const SITE_UPDATES = Object.freeze([
  {
    id: "site-v5-quality-pass",
    date: "2026-10-06",
    displayDate: "10.06.26",
    category: "Website",
    title: "Torqz Mods V5 quality pass",
    description: "The established Torqz design received a final major refinement focused on accessibility, responsive behavior, Coming Soon states, project-data architecture, media readiness, error handling, SEO, and release readiness.",
    projectId: null,
    image: null,
    articleUrl: null
  },
  {
    id: "project-01-structure",
    date: "2026-10-06",
    displayDate: "10.06.26",
    category: "Project 01",
    title: "Project release structure expanded",
    description: "Project 01 now supports public naming, richer media, compatibility data, known issues, project-specific installation, changelog groups, milestones, development logs, credits, and future download states without inventing unfinished information.",
    projectId: "project-01",
    image: null,
    articleUrl: null
  }
]);

function derivedProjectUpdates() {
  return MODS.flatMap((project) =>
    (project.developmentLog || []).map((entry, index) => ({
      id: entry.id || project.id + "-devlog-" + index,
      date: entry.date || "",
      displayDate: entry.displayDate || entry.date || "",
      category: entry.category || getProjectName(project),
      title: entry.title,
      description: entry.description,
      projectId: project.id,
      image: entry.image || null,
      video: entry.video || null,
      relatedMilestone: entry.relatedMilestone || null,
      articleUrl: entry.articleUrl || null,
      source: "project-development-log"
    }))
  );
}

export const UPDATES = Object.freeze(
  [...SITE_UPDATES, ...derivedProjectUpdates()].sort((a, b) => (b.date || "").localeCompare(a.date || ""))
);

export function updatesForProject(projectId) {
  return UPDATES.filter((update) => update.projectId === projectId);
}
