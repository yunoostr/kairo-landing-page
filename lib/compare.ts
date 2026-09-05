// Single source of truth for the comparison pages. Same eight criteria for
// every product, Kairo included, so no row is shaped to flatter Kairo.
// Rules: objective facts only, "Not documented" when unverified, a source
// URL on every price. Re-verify quarterly and bump `checked`.

export type Criterion =
  | "macApp"
  | "anyApp"
  | "highlight"
  | "voices"
  | "pricing"
  | "offline"
  | "aiActions"
  | "platforms"

export type Cell = { value: string; note?: string; source?: string }

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
      macApp: { value: "Yes", note: "Apple Silicon and Intel builds" },
      anyApp: {
        value: "Yes",
        note: "Global shortcut, Option-A by default. A floating player opens over the app you are in.",
      },
      highlight: { value: "Word" },
      voices: {
        value: "macOS voices free; 9 OpenAI voices with your own API key (Pro)",
      },
      pricing: {
        value: "Free; Pro is a one-time license",
        note: "Price on the checkout page. OpenAI bills Pro usage to your own key, cents per use.",
        source:
          "https://buy.polar.sh/polar_cl_GXU4TBTXSkt8Plin39rfKOGoDrSfzpIZwI37m3L4JJX",
      },
      offline: {
        value: "Free tier yes",
        note: "OpenAI voices and AI actions need a connection",
      },
      aiActions: { value: "Humanize, Translate, Summarize (Pro)" },
      platforms: {
        value: "None",
        note: "macOS only. No iOS app, no browser extension, no PDF or document import.",
      },
    },
  },
  {
    slug: "spoken-content",
    name: "macOS Spoken Content",
    url: "https://support.apple.com/guide/mac-help/mh27448/mac",
    vendor: "Apple, USA",
    checked: CHECKED,
    facts: {
      macApp: { value: "Built into macOS" },
      anyApp: {
        value: "Yes",
        note: "Option-Esc by default, customizable in System Settings",
        source: "https://support.apple.com/guide/mac-help/mh27448/mac",
      },
      highlight: {
        value: "Word and sentence",
        note: "Drawn in place in the source app",
        source: "https://support.apple.com/guide/mac-help/mh27448/mac",
      },
      voices: { value: "Apple voices, more downloadable" },
      pricing: {
        value: "Free",
        source: "https://support.apple.com/guide/mac-help/mh27448/mac",
      },
      offline: { value: "Yes" },
      aiActions: { value: "None" },
      platforms: { value: "iOS and iPadOS have an equivalent Speak Selection" },
    },
  },
  {
    slug: "loudscript",
    name: "LoudScript",
    url: "https://loudscript.app",
    vendor: "Independent developer",
    checked: CHECKED,
    facts: {
      macApp: {
        value: "Yes",
        note: "macOS 15.6 or later",
        source: "https://loudscript.app",
      },
      anyApp: {
        value: "Yes",
        note: "Services menu or Option-Command-R, floating player",
        source: "https://loudscript.app/read-selected-text-aloud-mac/",
      },
      highlight: { value: "Sentence", source: "https://loudscript.app" },
      voices: {
        value:
          "Apple voices plus local Supertonic, Kokoro and PocketTTS models",
      },
      pricing: { value: "Free", source: "https://loudscript.app" },
      offline: { value: "Yes" },
      aiActions: {
        value: "Optional AI formatting through your own provider",
        note: "No summarize or translate",
      },
      platforms: { value: "None" },
    },
  },
  {
    slug: "speech-central",
    name: "Speech Central",
    url: "https://speechcentral.net",
    vendor: "Labsii, Serbia",
    checked: CHECKED,
    facts: {
      macApp: {
        value: "Yes",
        note: "macOS 14 or later",
        source:
          "https://apps.apple.com/us/app/speech-central-text-to-speech/id1223093645?mt=12",
      },
      anyApp: {
        value: "Via the macOS Services shortcut",
        note: "The text is read inside its own document library",
        source: "https://speechcentral.net/speech-central-macos-help/",
      },
      highlight: {
        value: "Synchronized highlighting",
        note: "Word or sentence granularity not documented",
      },
      voices: {
        value:
          "Apple voices, offline Piper voices, cloud voices with your own Azure, OpenAI, Google or xAI key",
      },
      pricing: {
        value: "$9.99 one-time (Mac App Store)",
        note: "Free for VoiceOver users",
        source:
          "https://apps.apple.com/us/app/speech-central-text-to-speech/id1223093645?mt=12",
      },
      offline: { value: "Yes" },
      aiActions: { value: "None" },
      platforms: { value: "iOS, Android, Windows, Apple Watch" },
    },
  },
  {
    slug: "speechify",
    name: "Speechify",
    url: "https://speechify.com",
    vendor: "Speechify, Inc., Miami, USA",
    checked: CHECKED,
    facts: {
      macApp: {
        value: "Yes",
        note: "Direct download from speechify.com",
        source: "https://speechify.com/mac/",
      },
      anyApp: {
        value: "Yes",
        note: "Option-A by default, mini player, shortcuts customizable",
        source:
          "https://help.speechify.com/en/articles/15097404-how-to-use-play-selected-text-on-mac",
      },
      highlight: { value: "Word", source: "https://speechify.com/mac/" },
      voices: { value: "10 voices free; 1,000+ Speechify voices with Premium" },
      pricing: {
        value: "Free tier; Premium $29/month or $139/year",
        note: "Free: 10 voices, 1.5x speed cap, 5 files. Premium guarantees 150,000 words/month of premium voices.",
        source: "https://speechify.com/pricing/",
      },
      offline: {
        value: "Yes, on-device voices",
        source:
          "https://help.speechify.com/en/articles/15097414-how-to-listen-to-text-offline-on-the-mac-app",
      },
      aiActions: {
        value: "AI summaries, AI chat, AI podcasts (Premium)",
        note: "No translate feature listed",
      },
      platforms: { value: "iOS, Android, Windows, Chrome, Edge, web" },
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
        value: "Legacy desktop app, new sales discontinued",
        note: "The current product is the web app, the mobile apps and the Chrome extension",
        source: "https://www.naturalreaders.com/software.html",
      },
      anyApp: {
        value: "No",
        note: "The Chrome extension reads web pages; the legacy desktop app used a Miniboard for other windows",
        source:
          "https://help.naturalreaders.com/en/articles/6093937-reading-webpages-chrome-extension",
      },
      highlight: {
        value: "Word and sentence",
        source:
          "https://help.naturalreaders.com/en/articles/9788570-settings-chrome-extension",
      },
      voices: { value: "NaturalReader voices, 90+ languages" },
      pricing: {
        value:
          "Free tier; Lite $13.90/month or $79/year; Plus $20.90/month or $119/year; Pro $25.90/month or $159/year",
        source:
          "https://help.naturalreaders.com/en/articles/8854700-plans-pricing-personal-version",
      },
      offline: {
        value: "Not documented",
        note: "The web app and extension run in the browser; no offline mode is documented",
      },
      aiActions: {
        value: "AI Podcast, AI Recap, AI Chat, AI Quizzes",
        source: "https://www.naturalreaders.com/",
      },
      platforms: { value: "iOS, Android, web, Chrome extension" },
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
        value: "No",
        note: "Web app at elevenreader.io, used in the browser on a Mac",
        source: "https://help.elevenlabs.io/hc/en-us/articles/38319697008657",
      },
      anyApp: {
        value: "No",
        note: "Content is written, pasted, uploaded or imported by the Chrome extension",
        source: "https://help.elevenlabs.io/hc/en-us/articles/41076873230097",
      },
      highlight: {
        value: "Text highlighting",
        note: "Word or sentence granularity not documented",
        source:
          "https://apps.apple.com/us/app/elevenreader-read-books-aloud/id6479373050",
      },
      voices: { value: "1,000+ ElevenLabs voices, 32 languages" },
      pricing: {
        value: "Free 10 hours/month; Ultra $11/month or $99/year",
        source: "https://elevenreader.io/pricing",
      },
      offline: {
        value: "Ultra only, as downloads",
        source: "https://help.elevenlabs.io/hc/en-us/articles/36191320658833",
      },
      aiActions: { value: "None" },
      platforms: { value: "iOS, Android, web, Chrome extension" },
    },
  },
  {
    slug: "voice-dream",
    name: "Voice Dream Reader",
    url: "https://www.voicedream.com",
    vendor: "Voice Dream LLC, USA",
    checked: CHECKED,
    facts: {
      macApp: {
        value: "Yes",
        note: "macOS 11 or later, Mac App Store",
        source:
          "https://apps.apple.com/us/app/voice-dream-reader-for-desktop/id972112040?mt=12",
      },
      anyApp: { value: "No", note: "Documents are imported into a library" },
      highlight: {
        value: "Word",
        source:
          "https://apps.apple.com/us/app/voice-dream-reader-for-desktop/id972112040?mt=12",
      },
      voices: {
        value:
          "75 macOS voices in 27 languages; premium voices as in-app purchase",
      },
      pricing: {
        value: "Free download; subscriptions from $49.99/year to $79.99/year",
        source:
          "https://apps.apple.com/us/app/voice-dream-reader-for-desktop/id972112040?mt=12",
      },
      offline: { value: "Yes, with Mac voices" },
      aiActions: { value: "AI summaries for documents" },
      platforms: { value: "iOS, iPadOS, visionOS" },
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
