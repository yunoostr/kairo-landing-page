// Captures one frame of the hero's real ShaderBackground from the running dev server
// into scripts/og-bg.png. Run: node scripts/og-bg.mjs (needs `next dev` on :3000)
import { chromium } from "/Users/renardn/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs"

const browser = await chromium.launch({
  executablePath:
    "/Users/renardn/Library/Caches/ms-playwright/chromium-1181/chrome-mac/Chromium.app/Contents/MacOS/Chromium",
  args: ["--use-gl=angle", "--use-angle=metal", "--ignore-gpu-blocklist"],
})
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" })
await page.evaluate(() => {
  document.querySelector("nextjs-portal")?.remove()
  const c = document.querySelector("main canvas")
  Object.assign(c.style, { position: "fixed", inset: "0", width: "100vw", height: "100vh", zIndex: 9999, maskImage: "none", webkitMaskImage: "none" })
  c.parentElement.style.maskImage = "none"
})
await page.waitForTimeout(2500)
await page.screenshot({ path: "scripts/og-bg.png" })
await browser.close()
