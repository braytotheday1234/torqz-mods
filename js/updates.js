import { MODS, getProjectName } from "./mods.js";

const SITE_UPDATES = Object.freeze([
  {
    id: "site-v6-brand-polish",
    date: "2026-10-06",
    displayDate: "Oct 6, 2026",
    category: "Website",
    title: "Torqz Mods V6 brand polish",
    description: "The site is being refined into the development home for Torqz Garage with denser project information, stronger development presentation, and less placeholder-heavy layout.",
    projectId: null,
    currentPhase: null,
    image: null,
    video: null,
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
      currentPhase: entry.relatedMilestone || project.currentPhase || null,
      image: entry.image || null,
      video: entry.video || null,
      relatedMilestone: entry.relatedMilestone || null,
      articleUrl: entry.articleUrl || null,
      source: "project-development-log"
    }))
  );
}

export const UPDATES = Object.freeze(
  [...SITE_UPDATES, ...derivedProjectUpdates()].sort((a, b) =>
    (b.date || "").localeCompare(a.date || "") || b.id.localeCompare(a.id)
  )
);

export function updatesForProject(projectId) {
  return UPDATES.filter((update) => update.projectId === projectId);
}
