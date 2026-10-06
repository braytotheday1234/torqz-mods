export const SITE_CONFIG = Object.freeze({
  name: "Torqz Mods",
  shortName: "Torqz",
  description: "Independent BeamNG.drive mods, development updates, installation help, and clean releases.",
  discordUrl: "",
  githubUrl: "https://github.com/torqzmods/torqz-mods",
  tiktokUrl: "",
  youtubeUrl: "",
  supportUrl: "",
  bugReportUrl: "",
  suggestionUrl: "",
  contactEmail: "",
  accent: "#f36b2b"
});

export function externalOrPlaceholder(url) {
  return url && url.trim() ? url : null;
}
