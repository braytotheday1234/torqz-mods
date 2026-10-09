import { test, expect } from "@playwright/test";

test("default theme, all three palettes, persistence, and logo", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme","carbon");
  await expect(page.locator(".header-logo-mark").first()).toHaveCSS("visibility","visible");
  await expect(page.locator(".header-logo-mark").first()).toHaveCSS("opacity","1");
  await expect(page.locator(".header-logo-mark").first()).toHaveCSS("background-image",/torqz-logo.webp/);
  await expect(page.locator(".home-hero .button.primary")).toHaveCSS("background-color","rgb(217, 75, 89)");
  for (const [theme,color] of [["copper","rgb(203, 131, 93)"],["violet","rgb(152, 132, 232)"],["carbon","rgb(217, 75, 89)"]]) {
    await page.locator("[data-theme-toggle]").click();
    await page.locator('[data-theme-choice="'+theme+'"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-theme",theme);
    await expect(page.locator(".home-hero .button.primary")).toHaveCSS("background-color",color);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme",theme);
  }
  await page.locator("[data-theme-toggle]").click();
  await page.locator('[data-theme-choice="copper"]').click();
  await page.goto("/support.html");
  await expect(page.locator("html")).toHaveAttribute("data-theme","copper");
  await expect(page.locator(".header-logo-mark").first()).toHaveCSS("background-image",/torqz-logo.webp/);
});

test("FAQ search, categories, reset, and accordion", async ({page}) => {
  await page.goto("/support.html");
  await expect(page.locator(".faq-item")).toHaveCount(11);
  await page.locator("[data-faq-search]").fill("version");
  await expect(page.locator(".faq-item").first()).toBeVisible();
  await page.locator("[data-faq-category='Compatibility']").click();
  await expect(page.locator(".faq-item")).toHaveCount(1);
  await page.locator(".faq-item [data-accordion-button]").click();
  await expect(page.locator(".faq-item")).toHaveClass(/open/);
  await page.locator("[data-faq-clear]").click();
  await expect(page.locator(".faq-item")).toHaveCount(11);
});

test("troubleshooting guide and known-issues empty state",async ({page})=>{
  await page.goto("/help.html");
  await expect(page.locator(".guide-item")).toHaveCount(8);
  await page.locator("#cache-problems summary").click();
  await expect(page.locator("#cache-problems")).toHaveJSProperty("open",true);
  await page.locator("#cache-problems input[type=checkbox]").first().check();
  await expect(page.locator("#cache-problems input[type=checkbox]").first()).toBeChecked();
  await page.goto("/known-issues.html");
  await expect(page.locator(".known-issue-empty")).toContainText("No known issues have been published yet");
  await expect(page.locator(".known-issue")).toHaveCount(0);
});

test("bug and idea builders generate and copy without submission",async ({page})=>{
  await page.goto("/report.html#bug");
  await page.locator('[data-builder-form="bug"] [name="title"]').fill("Example loading problem");
  await page.locator('[data-builder-form="bug"] [name="description"]').fill("The test mod did not load");
  await page.locator('[data-builder-form="bug"] [name="steps"]').fill("1. Open the game");
  await page.locator('[data-builder-form="bug"] button[type="submit"]').click();
  await expect(page.locator('[data-builder-output="bug"]')).toContainText("Example loading problem");
  await expect(page.locator('[data-builder-copy="bug"]')).toBeEnabled();
  await page.locator('[data-builder-copy="bug"]').click();
  await expect(page.locator('[data-builder-feedback="bug"]')).toContainText("Copied to clipboard");
  await expect.poll(()=>page.evaluate(()=>navigator.clipboard.readText())).toContain("Example loading problem");
  await page.locator('[data-builder-tab="idea"]').click();
  await page.locator('[data-builder-form="idea"] [name="title"]').fill("Garage sorting");
  await page.locator('[data-builder-form="idea"] [name="description"]').fill("Group cars by type");
  await page.locator('[data-builder-form="idea"] [name="benefit"]').fill("Makes browsing easier");
  await page.locator('[data-builder-form="idea"] button[type="submit"]').click();
  await expect(page.locator('[data-builder-output="idea"]')).toContainText("Garage sorting");
  await page.locator('[data-builder-copy="idea"]').click();
  await expect(page.locator('[data-builder-feedback="idea"]')).toContainText("Copied to clipboard");
});

test("global search, update filters, and project navigation",async ({page})=>{
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await expect(page.locator("[data-search-overlay]")).toHaveClass(/open/);
  await page.locator("[data-global-search]").fill("cache");
  await expect(page.locator(".search-group-heading")).toContainText(["Troubleshooting"]);
  await page.locator('[data-search-result][href*="cache-problems"]').click();
  await expect(page).toHaveURL(/help.html#cache-problems/);
  await expect(page.locator("#cache-problems")).toHaveJSProperty("open",true);
  await page.goto("/updates.html");
  await expect(page.locator(".update-card")).toHaveCount(2);
  await page.locator("[data-update-query]").fill("foundation");
  await expect(page.locator(".update-card")).toHaveCount(1);
  await page.locator("[data-update-clear]").click();
  await expect(page.locator(".update-card")).toHaveCount(2);
  await page.locator("[data-update-category]").selectOption("Vehicle Data");
  await expect(page.locator(".update-card")).toHaveCount(1);
  await page.goto("/mods/project-01.html");
  await expect(page.locator(".project-status-strip")).toContainText("Vehicle Data");
  await expect(page.locator(".project-status-strip")).toContainText("Not released");
});

test("mobile menu and theme selector remain usable",async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("/");
  await expect(page.locator(".header-logo-mark").first()).toHaveCSS("visibility","visible");
  await page.locator("[data-theme-toggle]").click();
  await expect(page.locator("[data-theme-popover]")).toBeVisible();
  await page.locator('[data-theme-choice="violet"]').click();
  await expect(page.locator("html")).toHaveAttribute("data-theme","violet");
  await page.locator("[data-menu-toggle]").click();
  await expect(page.locator("[data-mobile-nav]")).toHaveClass(/open/);
  await page.locator('.mobile-nav-links a[href="support.html"]').click();
  await expect(page).toHaveURL(/support.html/);
  await expect(page.locator("html")).toHaveAttribute("data-theme","violet");
});
