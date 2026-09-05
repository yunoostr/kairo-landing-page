// Single source of truth for the comparison pages. Same eight criteria for
// every product, Kairo included, so no row is shaped to flatter Kairo.
// Rules: objective facts only, one short value per cell, "Not documented"
// when unverified, a source URL on every price. Re-verify quarterly and
// bump `checked`. Facts gathered 2026-09-05 from the vendors' own pages.

export type Criterion =
  | "macApp"
  | "anyApp"
  | "highlight"
  | "voices"
  | "pricing"
  | "offline"
  | "aiActions"
  | "platforms"

export type Cell = { value: string; source?: string }

export type Product = {
  slug: string
  name: string
  url: string
  vendor: string
  checked: string
  facts: Record<Criterion, Cell>
}

export const CRITERIA: { key: Criterion; label: string }[] = [
  { key: "macApp", label: "Native Mac app" },
  { key: "anyApp", label: "Reads selected text in any app" },
  { key: "highlight", label: "Highlighting while reading" },
  { key: "voices", label: "Voices" },
  { key: "pricing", label: "Pricing" },
  { key: "offline", label: "Works offline" },
  { key: "aiActions", label: "AI text actions" },
  { key: "platforms", label: "Beyond macOS" },
]

const CHECKED = "2026-09-05"

export const PRODUCTS: Product[] = [
  {
    slug: "kairo",
    name: "Kairo",
    url: "https://kairoagent.io",
    vendor: "Nathan Renard, France",
    checked: CHECKED,
    facts: {
      macApp: { value: "Yes" },
      anyApp: { value: "Yes" },
      highlight: { value: "Word" },
      voices: { value: "macOS free, 9 OpenAI with Pro" },
      pricing: {
        value: "Free, Pro once",
        source:
          "https://buy.polar.sh/polar_cl_GXU4TBTXSkt8Plin39rfKOGoDrSfzpIZwI37m3L4JJX",
      },
      offline: { value: "Free tier" },
      aiActions: { value: "Humanize, Translate, Summarize" },
      platforms: { value: "None" },
    },
  },
  {
    slug: "speechify",
    name: "Speechify",
    url: "https://speechify.com",
    vendor: "Speechify, Inc., Miami, USA",
    checked: CHECKED,
    facts: {
      macApp: { value: "Yes", source: "https://speechify.com/mac/" },
      anyApp: {
        value: "Yes",
        source:
          "https://help.speechify.com/en/articles/15097404-how-to-use-play-selected-text-on-mac",
      },
      highlight: { value: "Word", source: "https://speechify.com/mac/" },
      voices: { value: "10 free, 1,000+ with Premium" },
      pricing: {
        value: "Free, Premium $139 / year",
        source: "https://speechify.com/pricing/",
      },
      offline: {
        value: "Yes",
        source:
          "https://help.speechify.com/en/articles/15097414-how-to-listen-to-text-offline-on-the-mac-app",
      },
      aiActions: { value: "Summaries, chat, podcasts" },
      platforms: { value: "iOS, Android, Windows, web" },
    },
  },
  {
    slug: "naturalreader",
    name: "NaturalReader",
    url: "https://www.naturalreaders.com",
    vendor: "NaturalSoft Ltd., Richmond, BC, Canada",
    checked: CHECKED,
    facts: {
      macApp: {
        value: "Legacy app, no longer sold",
        source: "https://www.naturalreaders.com/software.html",
      },
      anyApp: {
        value: "No",
        source:
          "https://help.naturalreaders.com/en/articles/6093937-reading-webpages-chrome-extension",
      },
      highlight: {
        value: "Word and sentence",
        source:
          "https://help.naturalreaders.com/en/articles/9788570-settings-chrome-extension",
      },
      voices: { value: "90+ languages" },
      pricing: {
        value: "Free, plans $79 to $159 / year",
        source:
          "https://help.naturalreaders.com/en/articles/8854700-plans-pricing-personal-version",
      },
      offline: { value: "Not documented" },
      aiActions: {
        value: "Podcast, recap, chat, quizzes",
        source: "https://www.naturalreaders.com/",
      },
      platforms: { value: "iOS, Android, web, Chrome" },
    },
  },
  {
    slug: "elevenreader",
    name: "ElevenReader",
    url: "https://elevenreader.io",
    vendor: "Eleven Labs Inc., New York, USA",
    checked: CHECKED,
    facts: {
      macApp: {
        value: "No, web app",
        source: "https://help.elevenlabs.io/hc/en-us/articles/38319697008657",
      },
      anyApp: {
        value: "No",
        source: "https://help.elevenlabs.io/hc/en-us/articles/41076873230097",
      },
      highlight: {
        value: "Text highlighting",
        source:
          "https://apps.apple.com/us/app/elevenreader-read-books-aloud/id6479373050",
      },
      voices: { value: "1,000+ ElevenLabs voices" },
      pricing: {
        value: "Free 10 h / month, Ultra $99 / year",
        source: "https://elevenreader.io/pricing",
      },
      offline: {
        value: "Ultra only",
        source: "https://help.elevenlabs.io/hc/en-us/articles/36191320658833",
      },
      aiActions: { value: "None" },
      platforms: { value: "iOS, Android, web, Chrome" },
    },
  },
]

export const LATEST_CHECK = PRODUCTS.map((p) => p.checked)
  .sort()
  .at(-1)!

export function pick(...slugs: string[]): Product[] {
  return slugs.map((s) => {
    const p = PRODUCTS.find((x) => x.slug === s)
    if (!p) throw new Error(`Unknown product: ${s}`)
    return p
  })
}
