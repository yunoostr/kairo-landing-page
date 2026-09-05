import type { MetadataRoute } from "next"

import { LATEST_CHECK } from "@/lib/compare"

const COMPARE = [
  "/vs/speechify",
  "/vs/naturalreader",
  "/vs/elevenreader",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://kairoagent.io"
  return [
    ...["/", "/roadmap", "/changelog"].map((path) => ({
      url: `${base}${path}`,
    })),
    ...COMPARE.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(LATEST_CHECK),
    })),
  ]
}
