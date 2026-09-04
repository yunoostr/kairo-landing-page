// Renders scripts/og.html to app/opengraph-image.png. Run: node scripts/og.mjs
// ponytail: imports Playwright from the npx cache instead of adding it to devDependencies.
import { chromium } from "/Users/renardn/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs"

const browser = await chromium.launch({
  executablePath:
    "/Users/renardn/Library/Caches/ms-playwright/chromium-1181/chrome-mac/Chromium.app/Contents/MacOS/Chromium",
})
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await page.goto(`file://${process.cwd()}/scripts/og.html`)
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: "app/opengraph-image.png" })
await browser.close()
