import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/roadmap", "/changelog"].map(
    (path) => ({ url: `https://kairoagent.io${path}` })
  )
}
