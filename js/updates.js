import { MODS } from "./mods.js";

export const UPDATES = Object.freeze(
  MODS.flatMap((project) =>
    (project.developmentLog || []).map((entry, index) => ({
      id: entry.id || project.id + "-update-" + index,
      date: entry.date || "",
      displayDate: entry.displayDate || entry.date || "",
      title: entry.title,
      description: entry.description,
      projectId: project.id,
      image: entry.image || null,
      video: entry.video || null
    }))
  ).sort((a,b)=>(b.date||"").localeCompare(a.date||"") || b.id.localeCompare(a.id))
);

export function updatesForProject(projectId) {
  return UPDATES.filter((update) => update.projectId === projectId);
}
