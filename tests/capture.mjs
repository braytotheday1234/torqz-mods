import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const browser=await chromium.launch({headless:true});
for (const [label,port] of [["before",8766],["after",8765]]) {
 const dir="screenshots/"+label;
 await fs.mkdir(dir,{recursive:true});
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 for (const [name,path] of [["home","/"],["mods","/mods.html"],["project","/mods/project-01.html"],["support","/support.html"]]) {
  await page.goto("http://127.0.0.1:"+port+path,{waitUntil:"networkidle"});
  await page.screenshot({path:dir+"/"+name+"-desktop.png",fullPage:true});
 }
 await page.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 await mobile.goto("http://127.0.0.1:"+port+"/",{waitUntil:"networkidle"});
 await mobile.locator("[data-menu-toggle]").click();
 await mobile.screenshot({path:dir+"/mobile-menu.png"});
 await mobile.close();
}
await browser.close();
