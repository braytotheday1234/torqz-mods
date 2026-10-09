import { defineConfig } from "@playwright/test";
export default defineConfig({
 testDir: "./tests",
 testMatch: /v3\.spec\.js/,
 timeout: 30000,
 use: { baseURL: "http://127.0.0.1:8765", browserName: "chromium", viewport: {width: 1440,height:900}, permissions:["clipboard-read","clipboard-write"] },
 reporter: [["list"],["html",{outputFolder:"test-results/report",open:"never"}]],
 outputDir: "test-results/artifacts"
});
