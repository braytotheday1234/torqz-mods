export const SITE_CONFIG = Object.freeze({
  name: "Torqz Mods",
  shortName: "Torqz",
  description: "Independent BeamNG.drive mods, development updates, installation help, and clean releases.",
  siteUrl: "https://torqzmods.github.io/torqz-mods/",
  environment: "production",
  allowIndexing: true,
  discordUrl: "",
  githubUrl: "https://github.com/torqzmods/torqz-mods",
  youtubeUrl: "",
  tiktokUrl: "",
  supportUrl: "",
  bugReportUrl: "",
  suggestionUrl: "",
  contactEmail: "",
  accent: "#f26a2d"
});

export function configured(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
