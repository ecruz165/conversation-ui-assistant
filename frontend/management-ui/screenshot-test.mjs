import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: "homepage-screenshot.png", fullPage: true });

  console.log("Screenshot saved to homepage-screenshot.png");
  await browser.close();
})();
