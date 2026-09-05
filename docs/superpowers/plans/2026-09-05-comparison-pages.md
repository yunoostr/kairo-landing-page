# Comparison Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship one "Speechify alternatives for Mac" hub and three "Kairo vs X" pages whose every claim is a sourced, dated fact.

**Architecture:** A single data module (`lib/compare.ts`) holds eight identical criteria per product, Kairo included. One server component renders any subset of products as a table with a "Facts checked on" line and source links. Four MDX pages under a `(compare)` route group carry the prose and import the table. Footer and sitemap get the four routes.

**Tech Stack:** Next.js 16 app router, `@next/mdx`, Tailwind v4, Tabler icons, `node --test` (Node 26 runs `.ts` directly).

**Spec:** `docs/superpowers/specs/2026-09-05-comparison-pages-design.md`

## Global Constraints

- Competitor names in plain text only. No logos, screenshots, brand colours or icons anywhere.
- Table criteria are objective only: no row for voice quality, ease of use, speed or reliability.
- An unverified fact is written `Not documented`, never `No`.
- Every `pricing` cell has a `source` URL.
- No `value` contains "best", "better", "worse", "slow", "bad" or "robotic".
- "Choose X if" precedes "Choose Kairo if" on every vs page.
- Kairo's price is never written on these pages; say "one-time license" and link the Polar checkout.
- Every page ends with the disclaimer paragraph (trademarks, no affiliation, checked date, `contact@kairoagent.io`).
- Never use the middle dot "·" as a separator; use a plain hyphen.
- Public URLs: `/speechify-alternatives`, `/vs/speechify`, `/vs/naturalreader`, `/vs/elevenreader`.
- Only commit files from this plan; `components/demo.tsx` has unrelated uncommitted work and stays out of every commit.

---

### Task 1: Data module and its test

**Files:**
- Create: `lib/compare.ts`
- Create: `lib/compare.test.ts`

**Interfaces:**
- Produces: `type Criterion`, `type Cell`, `type Product`, `CRITERIA: { key: Criterion; label: string }[]`, `PRODUCTS: Product[]` (Kairo first), `pick(...slugs: string[]): Product[]`, `LATEST_CHECK: string` (ISO date).

- [ ] **Step 1: Write the failing test**

```ts
// Run: node --test lib/compare.test.ts
import assert from "node:assert/strict"
import { test } from "node:test"

import { CRITERIA, LATEST_CHECK, PRODUCTS, pick } from "./compare.ts"

const BANNED = /\b(best|better|worse|slow|bad|robotic)\b/i

test("every product has every criterion, a valid check date and a sourced price", () => {
  assert.ok(PRODUCTS.length >= 7)
  for (const p of PRODUCTS) {
    assert.ok(!Number.isNaN(Date.parse(p.checked)), `${p.name}: checked`)
    for (const c of CRITERIA) {
      const cell = p.facts[c.key]
      assert.ok(cell?.value, `${p.name}: ${c.key} missing`)
      assert.ok(!BANNED.test(cell.value), `${p.name}: ${c.key} uses a banned word`)
      assert.ok(!BANNED.test(cell.note ?? ""), `${p.name}: ${c.key} note uses a banned word`)
    }
    assert.ok(p.facts.pricing.source?.startsWith("https://"), `${p.name}: pricing source`)
  }
})

test("kairo is first and pick keeps the requested order", () => {
  assert.equal(PRODUCTS[0].slug, "kairo")
  assert.deepEqual(
    pick("speechify", "kairo").map((p) => p.slug),
    ["speechify", "kairo"]
  )
  assert.throws(() => pick("nope"))
})

test("latest check is the newest product date", () => {
  const max = PRODUCTS.map((p) => p.checked).sort().at(-1)
  assert.equal(LATEST_CHECK, max)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/compare.test.ts`
Expected: FAIL, cannot find module `./compare.ts`.

- [ ] **Step 3: Write the data module**

```ts
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
        source: "https://buy.polar.sh/polar_cl_GXU4TBTXSkt8Plin39rfKOGoDrSfzpIZwI37m3L4JJX",
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
      macApp: { value: "Yes", note: "macOS 15.6 or later", source: "https://loudscript.app" },
      anyApp: {
        value: "Yes",
        note: "Services menu or Option-Command-R, floating player",
        source: "https://loudscript.app/read-selected-text-aloud-mac/",
      },
      highlight: { value: "Sentence", source: "https://loudscript.app" },
      voices: { value: "Apple voices plus local Supertonic, Kokoro and PocketTTS models" },
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
        source: "https://apps.apple.com/us/app/speech-central-text-to-speech/id1223093645?mt=12",
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
        value: "Apple voices, offline Piper voices, cloud voices with your own Azure, OpenAI, Google or xAI key",
      },
      pricing: {
        value: "$9.99 one-time (Mac App Store)",
        note: "Free for VoiceOver users",
        source: "https://apps.apple.com/us/app/speech-central-text-to-speech/id1223093645?mt=12",
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
        source: "https://help.speechify.com/en/articles/15097404-how-to-use-play-selected-text-on-mac",
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
        source: "https://help.speechify.com/en/articles/15097414-how-to-listen-to-text-offline-on-the-mac-app",
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
        source: "https://help.naturalreaders.com/en/articles/6093937-reading-webpages-chrome-extension",
      },
      highlight: {
        value: "Word and sentence",
        source: "https://help.naturalreaders.com/en/articles/9788570-settings-chrome-extension",
      },
      voices: { value: "NaturalReader voices, 90+ languages" },
      pricing: {
        value: "Free tier; Lite $13.90/month or $79/year; Plus $20.90/month or $119/year; Pro $25.90/month or $159/year",
        source: "https://help.naturalreaders.com/en/articles/8854700-plans-pricing-personal-version",
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
        source: "https://apps.apple.com/us/app/elevenreader-read-books-aloud/id6479373050",
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
        source: "https://apps.apple.com/us/app/voice-dream-reader-for-desktop/id972112040?mt=12",
      },
      anyApp: { value: "No", note: "Documents are imported into a library" },
      highlight: {
        value: "Word",
        source: "https://apps.apple.com/us/app/voice-dream-reader-for-desktop/id972112040?mt=12",
      },
      voices: { value: "75 macOS voices in 27 languages; premium voices as in-app purchase" },
      pricing: {
        value: "Free download; subscriptions from $49.99/year to $79.99/year",
        source: "https://apps.apple.com/us/app/voice-dream-reader-for-desktop/id972112040?mt=12",
      },
      offline: { value: "Yes, with Mac voices" },
      aiActions: { value: "AI summaries for documents" },
      platforms: { value: "iOS, iPadOS, visionOS" },
    },
  },
]

export const LATEST_CHECK = PRODUCTS.map((p) => p.checked).sort().at(-1)!

export function pick(...slugs: string[]): Product[] {
  return slugs.map((s) => {
    const p = PRODUCTS.find((x) => x.slug === s)
    if (!p) throw new Error(`Unknown product: ${s}`)
    return p
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test lib/compare.test.ts`
Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add lib/compare.ts lib/compare.test.ts
git commit -m "Add competitor facts module for comparison pages"
```

---

### Task 2: Table component, disclaimer, layout

**Files:**
- Create: `components/compare-table.tsx`
- Create: `app/(compare)/layout.tsx`
- Modify: `mdx-components.tsx` (add `h3`)

**Interfaces:**
- Consumes: `CRITERIA`, `LATEST_CHECK`, `Product` from `lib/compare.ts`.
- Produces: `<CompareTable products={Product[]} />`, `<CompareDisclaimer names={string[]} />`, `checkedOn(iso: string): string` ("5 September 2026").

- [ ] **Step 1: Write the component**

```tsx
import { CRITERIA, LATEST_CHECK, type Product } from "@/lib/compare"

export function checkedOn(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// Same eight rows for every product. No image slot on purpose: competitor
// names stay plain text (nominative use only).
export function CompareTable({ products }: { products: Product[] }) {
  for (const p of products)
    if (Number.isNaN(Date.parse(p.checked)))
      throw new Error(`${p.name} has no valid checked date`)
  const latest = products.map((p) => p.checked).sort().at(-1)!
  return (
    <div className="my-8 sm:-mx-[90px]">
      <p className="mb-3 font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
        Facts checked on {checkedOn(latest)}
      </p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-left font-medium text-muted-foreground" />
              {products.map((p) => (
                <th key={p.slug} className="p-3 text-left font-medium text-foreground">
                  <a href={p.url} rel="nofollow noopener" className="hover:underline">
                    {p.name}
                  </a>
                  <div className="mt-0.5 text-xs font-normal text-muted-foreground">
                    {p.vendor}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((c) => (
              <tr key={c.key} className="border-b border-border last:border-0">
                <th className="p-3 text-left align-top font-medium text-muted-foreground">
                  {c.label}
                </th>
                {products.map((p) => {
                  const cell = p.facts[c.key]
                  return (
                    <td key={p.slug} className="p-3 align-top text-foreground">
                      {cell.value}
                      {cell.note && (
                        <div className="mt-1 text-xs text-muted-foreground">{cell.note}</div>
                      )}
                      {cell.source && (
                        <a
                          href={cell.source}
                          rel="nofollow noopener"
                          className="mt-1 block text-xs text-muted-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
                        >
                          source
                        </a>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function CompareDisclaimer({ names }: { names: string[] }) {
  return (
    <p className="mt-12 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
      {names.join(", ")} {names.length > 1 ? "are trademarks" : "is a trademark"} of{" "}
      {names.length > 1 ? "their respective owners" : "its owner"}. Kairo is not
      affiliated with, endorsed by or sponsored by {names.length > 1 ? "them" : "it"}.
      Facts on this page were checked on {checkedOn(LATEST_CHECK)} against the
      sources linked in the table and may have changed since. Spotted an error?
      Write to{" "}
      <a href="mailto:contact@kairoagent.io" className="underline underline-offset-4">
        contact@kairoagent.io
      </a>{" "}
      and it will be corrected.
    </p>
  )
}
```

- [ ] **Step 2: Write the layout**

```tsx
import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"

// Same chrome as (legal). The comparison table breaks out of the 680px
// column on its own (see CompareTable).
export default function CompareLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main>
      <SiteHeader />
      <article className="mx-auto max-w-[680px] px-8 pt-16 pb-32 text-[15px]">
        {children}
      </article>
      <Footer />
    </main>
  )
}
```

- [ ] **Step 3: Add `h3` to `mdx-components.tsx`**

After the `h2` entry add:

```tsx
    h3: (p) => (
      <h3 className="mt-8 mb-2 text-base font-medium text-foreground" {...p} />
    ),
```

The comparison table is rendered by `CompareTable`, so no markdown `table` components are needed.

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/compare-table.tsx 'app/(compare)/layout.tsx' mdx-components.tsx
git commit -m "Add comparison table, disclaimer and compare layout"
```

---

### Task 3: Hub page `/speechify-alternatives`

**Files:**
- Create: `app/(compare)/speechify-alternatives/page.mdx`

**Interfaces:**
- Consumes: `CompareTable`, `CompareDisclaimer`, `pick`, `DownloadButton`.

- [ ] **Step 1: Write the page**

```mdx
import { DownloadButton } from "@/components/download-button"
import { CompareDisclaimer, CompareTable } from "@/components/compare-table"
import { pick } from "@/lib/compare"

export const metadata = {
  title: "Speechify alternatives for Mac (2026)",
  description:
    "Seven ways to read text aloud on a Mac, from the free Spoken Content built into macOS to one-time and subscription apps. Facts checked and sourced.",
  alternates: { canonical: "/speechify-alternatives" },
}

# Speechify alternatives for Mac (2026)

Speechify is a text-to-speech platform: a Mac app, mobile apps, browser extensions and a web library, with a free tier and a Premium subscription at $139 a year. People look for an alternative when their needs are narrower than that. You may want to pay once rather than subscribe, read in any Mac app rather than through one browser or one library, keep your text off a third-party account, or run entirely on voices that live on your machine.

This page lists seven options, Kairo included, with the same eight facts for each. Nothing here is a rating. Where a fact could not be verified on the vendor's site, the cell says "Not documented".

## What to look for

- **Where it reads.** Some tools read the text you select in any Mac app. Others need you to paste, upload or import first.
- **Highlighting.** Word-by-word highlighting lets you re-read a sentence the moment the voice loses you. Sentence-level is enough for long articles.
- **Whose voices.** Apple's voices are free and offline. Cloud voices sound more natural and either come with a subscription or run on your own API key.
- **How you pay.** Free, one-time, or monthly. With bring-your-own-key tools the vendor charges once and the AI provider bills you cents per use.
- **What else it does.** Summaries, translation or rewriting before you listen. Most read-aloud tools do none of this.

<CompareTable
  products={pick(
    "kairo",
    "spoken-content",
    "loudscript",
    "speech-central",
    "elevenreader",
    "naturalreader",
    "voice-dream"
  )}
/>

## The options, one by one

### Kairo

A macOS utility with one job: select text anywhere, press a shortcut, and a floating player reads it with word-by-word highlighting. The free version uses the macOS voices. Kairo Pro is a one-time license that unlocks nine OpenAI voices and three fixed actions, Humanize, Translate and Summarize, on your own OpenAI key. There is no iOS app, no browser extension and no document import. If you read a lot of AI-assistant output on a Mac and want to pay once, this is what it is built for.

### macOS Spoken Content

Already on your Mac, free, offline. Turn it on in System Settings under Accessibility, select text in any app and press Option-Esc. It highlights words or sentences in place and offers a small controller for speed. The voices are Apple's, and there is no player window, transcript or AI. Try this first. If it is enough, you do not need anything below.

### LoudScript

A free Mac app that reads selected text from any app through a Services shortcut into a floating player, with sentence highlighting. Its distinguishing feature is local neural voices (Supertonic, Kokoro, PocketTTS) that need no account and no key. It also reads PDFs and screenshots through OCR. Requires macOS 15.6 or later and does not summarize or translate.

### Speech Central

A document reader sold once on the Mac App Store, with a free version for VoiceOver users. It reads selected text through the macOS Services shortcut into its own library, and supports offline Piper voices plus cloud voices on your own Azure, OpenAI, Google or xAI key. It exists on iOS, Android, Windows and Apple Watch, which none of the other Mac-first tools here do.

### ElevenReader

ElevenLabs' reading app for iOS, Android and the web, with a Chrome extension that imports pages. There is no Mac app and no way to read text selected in another app: content is written, pasted, uploaded or imported. The free plan gives ten hours of audio a month; Ultra removes the cap and adds offline downloads. If voice quality is the only thing that matters and you mostly listen on a phone, this is the one to try.

### NaturalReader

A web app, mobile apps and a Chrome extension, with word and sentence highlighting and voices in more than ninety languages. The standalone desktop app is no longer sold. Plans run from a free tier to Pro at $159 a year and add AI podcasts, recaps and quizzes. Nothing reads text selected in a desktop app outside the browser.

### Voice Dream Reader

A long-running library reader for Mac, iOS, iPadOS and visionOS. You import PDFs, EPUBs and web pages, and it reads them with word highlighting and Apple voices, offline. It does not read text selected in other apps. Pricing is a subscription, from $49.99 a year, with premium voices as in-app purchases. Its strength is long documents, not chat output.

## Which one should you pick

- **You want zero cost and zero setup:** macOS Spoken Content.
- **You want natural voices with no account and no key, for free:** LoudScript.
- **You want one purchase that also works on your phone and Windows PC:** Speech Central.
- **You read long PDFs and books:** Voice Dream Reader, or ElevenReader if you listen on a phone.
- **You read AI output in any Mac app, with word highlighting, and want to Humanize, Translate or Summarize it without a subscription:** Kairo.

Want the detail on one match-up? See [Kairo vs Speechify](/vs/speechify), [Kairo vs NaturalReader](/vs/naturalreader) and [Kairo vs ElevenReader](/vs/elevenreader).

<div className="mt-8">
  <DownloadButton />
</div>

<CompareDisclaimer
  names={[
    "Speechify",
    "LoudScript",
    "Speech Central",
    "ElevenReader",
    "NaturalReader",
    "Voice Dream Reader",
    "macOS",
  ]}
/>
```

- [ ] **Step 2: Check it renders**

Run: `npm run dev` then open `http://localhost:3000/speechify-alternatives`.
Expected: heading, table with seven columns and a "Facts checked on" line, seven sections, the download button, the disclaimer. No console errors.

- [ ] **Step 3: Commit**

```bash
git add 'app/(compare)/speechify-alternatives/page.mdx'
git commit -m "Add Speechify alternatives hub page"
```

---

### Task 4: Three vs pages

**Files:**
- Create: `app/(compare)/vs/speechify/page.mdx`
- Create: `app/(compare)/vs/naturalreader/page.mdx`
- Create: `app/(compare)/vs/elevenreader/page.mdx`

**Interfaces:**
- Consumes: `CompareTable`, `CompareDisclaimer`, `pick`, `DownloadButton`.

- [ ] **Step 1: Write `/vs/speechify`**

```mdx
import { DownloadButton } from "@/components/download-button"
import { CompareDisclaimer, CompareTable } from "@/components/compare-table"
import { pick } from "@/lib/compare"

export const metadata = {
  title: "Kairo vs Speechify",
  description:
    "Both read selected text in any Mac app from a shortcut. One is a subscription platform across devices, the other a one-time Mac license on your own OpenAI key.",
  alternates: { canonical: "/vs/speechify" },
}

# Kairo vs Speechify

**In short:** Speechify is a multi-device reading platform on a subscription, with a Mac app that reads selected text in any app, a document library, its own voices and AI summaries. Kairo is a Mac-only utility that does the selected-text part with a one-time license, then adds Humanize, Translate and Summarize on your own OpenAI key. If you need iOS, Windows or a library, Speechify. If you read on one Mac and want to pay once, Kairo.

<CompareTable products={pick("speechify", "kairo")} />

## Where it reads

Both apps do the same core gesture on a Mac: select text in any app, press a shortcut (Option-A by default in both), and a small player reads it with word highlighting. Speechify goes further by also being a library: you import PDFs, scan a book with Scan and Listen, and continue on your phone. Kairo has no library and no other device. It reads what is on your screen right now and keeps a history of the last fifty readings for replay.

## How you pay

Speechify's free tier gives ten voices, a 1.5x speed cap and five files. Premium is $29 a month or $139 a year, with a guaranteed 150,000 words a month of premium voices. Kairo's free tier is the macOS voices with no cap. Kairo Pro is a one-time license, then OpenAI bills your own key: a cent or two per minute of audio, a fraction of a cent per Humanize, Translate or Summarize. Heavy listeners should do the sum. At an hour of OpenAI audio every day, the API alone runs to roughly $25 a month, which is more than Speechify's annual plan spread over a year. At a few minutes a day it stays in cents, and the license never renews.

## What each cannot do

Speechify has no translate action, and its rewriting is a chat, not a fixed button. Kairo has no iOS, Android or Windows app, no browser extension, no PDF or book import, no AI podcasts, and its Pro features need an OpenAI account and key. Kairo's voices are the nine OpenAI voices; Speechify's Premium catalogue is over a thousand.

## Choose Speechify if

- You listen on a phone or a Windows PC as well as a Mac.
- You want a library of documents and books that syncs across devices.
- You want a large voice catalogue and do not want to manage an API key.
- You want AI podcasts or a chat about the document.

## Choose Kairo if

- You read on one Mac and want to pay once, with no renewal.
- You mostly read AI-assistant output, chat answers and pull requests, not books.
- You want Humanize, Translate or Summarize as one-press actions before listening.
- You already have an OpenAI key and prefer paying cents per use.

See also [Kairo vs NaturalReader](/vs/naturalreader), [Kairo vs ElevenReader](/vs/elevenreader) and the full list of [Speechify alternatives for Mac](/speechify-alternatives).

<div className="mt-8">
  <DownloadButton />
</div>

<CompareDisclaimer names={["Speechify"]} />
```

- [ ] **Step 2: Write `/vs/naturalreader`**

```mdx
import { DownloadButton } from "@/components/download-button"
import { CompareDisclaimer, CompareTable } from "@/components/compare-table"
import { pick } from "@/lib/compare"

export const metadata = {
  title: "Kairo vs NaturalReader",
  description:
    "NaturalReader is a web app, mobile apps and a Chrome extension on a subscription. Kairo is a Mac utility that reads selected text in any app, licensed once.",
  alternates: { canonical: "/vs/naturalreader" },
}

# Kairo vs NaturalReader

**In short:** NaturalReader is a reading service you use in a browser, on a phone or through a Chrome extension, with voices in more than ninety languages and a subscription from $79 a year. Kairo is a native Mac utility that reads text selected in any app from a shortcut, free with the macOS voices, with a one-time license for OpenAI voices and AI actions. They overlap on reading web pages and little else.

<CompareTable products={pick("naturalreader", "kairo")} />

## Where it reads

NaturalReader reads what you bring to it: paste into the web app, upload a document, open the mobile app, or select text on a web page with the Chrome extension. Its standalone desktop app is no longer sold. On a Mac, nothing reads text selected in a desktop app outside the browser. Kairo does exactly that, in any app, including terminals, editors and fullscreen apps, through a floating player. Kairo does not read PDFs or documents you have not opened on screen.

## How you pay

NaturalReader has a free tier and three personal plans: Lite at $13.90 a month or $79 a year, Plus at $20.90 or $119, Pro at $25.90 or $159. Kairo's free tier has no cap on the macOS voices. Kairo Pro is a one-time license, after which OpenAI bills your own key, cents per use. If you listen for hours every day the API cost adds up; if you listen to answers and pull requests, it stays in cents a month.

## What each cannot do

NaturalReader offers AI podcasts, recaps, chat and quizzes but no one-press translate or rewrite of selected text, and no system-wide shortcut on a Mac. Kairo offers no iOS or Android app, no browser extension, no document import, no voice cloning, and its Pro features need an OpenAI key. NaturalReader's voice catalogue spans more than ninety languages; Kairo's OpenAI voices speak the languages OpenAI's text-to-speech supports.

## Choose NaturalReader if

- You read on a phone or tablet as much as on a Mac.
- You want a large multilingual voice catalogue without managing an API key.
- You want AI podcasts or quizzes from your documents.
- You mainly read web pages and uploaded files.

## Choose Kairo if

- You want a shortcut that reads selected text in any Mac app, not only the browser.
- You want to pay once.
- You want Humanize, Translate or Summarize as fixed actions before listening.
- You would rather your text went to your own OpenAI account than to a reading service.

See also [Kairo vs Speechify](/vs/speechify), [Kairo vs ElevenReader](/vs/elevenreader) and the full list of [Speechify alternatives for Mac](/speechify-alternatives).

<div className="mt-8">
  <DownloadButton />
</div>

<CompareDisclaimer names={["NaturalReader"]} />
```

- [ ] **Step 3: Write `/vs/elevenreader`**

```mdx
import { DownloadButton } from "@/components/download-button"
import { CompareDisclaimer, CompareTable } from "@/components/compare-table"
import { pick } from "@/lib/compare"

export const metadata = {
  title: "Kairo vs ElevenReader",
  description:
    "ElevenReader is ElevenLabs' reading app for phone and web with a free 10-hour tier. Kairo is a Mac utility that reads selected text in any app, licensed once.",
  alternates: { canonical: "/vs/elevenreader" },
}

# Kairo vs ElevenReader

**In short:** ElevenReader is a reading app for iOS, Android and the web, built around ElevenLabs voices, with ten free hours a month and an Ultra plan at $99 a year. Kairo is a Mac-only utility that reads text selected in any app from a shortcut, free with the macOS voices, with a one-time license for OpenAI voices and AI actions. They are built for different places: ElevenReader for a phone and a library, Kairo for a Mac and whatever is on screen.

<CompareTable products={pick("elevenreader", "kairo")} />

## Where it reads

ElevenReader has no Mac app. On a Mac you use elevenreader.io in a browser, and content gets there by writing, pasting, uploading a file or importing a page with the Chrome extension. Nothing reads text selected in another app. Kairo runs on the Mac and reads the selection in any app through a floating player with word highlighting. Kairo has no phone app and no library to sync.

## How you pay

ElevenReader's free plan includes ten hours of text-to-audio a month across more than a thousand voices. Ultra is $11 a month or $99 a year and adds unlimited listening, offline downloads and custom voices. Kairo's free tier has no cap on the macOS voices. Kairo Pro is a one-time license, then OpenAI bills your own key, a cent or two per minute of audio. Ten free hours a month is generous: if that covers you and you listen on a phone, ElevenReader costs nothing.

## What each cannot do

ElevenReader has no text actions: no summarize, translate or rewrite. Its highlighting exists but the vendor does not document whether it is per word. Kairo has no iOS or Android app, no browser extension, no document import, no voice cloning, and its Pro features need an OpenAI key. Kairo's voices are the nine OpenAI voices; ElevenReader's catalogue is over a thousand.

## Choose ElevenReader if

- You listen on a phone, and ten hours a month is enough.
- Voice variety matters most and you want to pick from a large catalogue.
- You read books and long articles you can import once and keep.
- You want offline downloads on a phone.

## Choose Kairo if

- You want a shortcut that reads selected text in any Mac app.
- You want to pay once and keep your text on your own OpenAI account.
- You want Humanize, Translate or Summarize as fixed actions before listening.
- You want word-by-word highlighting over the app you are reading in.

See also [Kairo vs Speechify](/vs/speechify), [Kairo vs NaturalReader](/vs/naturalreader) and the full list of [Speechify alternatives for Mac](/speechify-alternatives).

<div className="mt-8">
  <DownloadButton />
</div>

<CompareDisclaimer names={["ElevenReader", "ElevenLabs"]} />
```

- [ ] **Step 4: Check the three pages render**

Open `http://localhost:3000/vs/speechify`, `/vs/naturalreader`, `/vs/elevenreader`.
Expected: two-column table, four prose sections, both "Choose" lists with the competitor first, links to the siblings, download button, disclaimer.

- [ ] **Step 5: Commit**

```bash
git add 'app/(compare)/vs'
git commit -m "Add Kairo vs Speechify, NaturalReader and ElevenReader pages"
```

---

### Task 5: Footer, sitemap, build and visual check

**Files:**
- Modify: `components/footer.tsx:5-27`
- Modify: `app/sitemap.ts`

**Interfaces:**
- Consumes: `LATEST_CHECK` from `lib/compare.ts`.

- [ ] **Step 1: Add the Compare column to the footer**

In `COLUMNS`, after the `Legal` entry, add:

```ts
  {
    title: "Compare",
    links: [
      { l: "Speechify alternatives", href: "/speechify-alternatives" },
      { l: "Kairo vs Speechify", href: "/vs/speechify" },
      { l: "Kairo vs NaturalReader", href: "/vs/naturalreader" },
      { l: "Kairo vs ElevenReader", href: "/vs/elevenreader" },
    ],
  },
```

Change the grid class from `sm:grid-cols-[repeat(2,minmax(0,180px))]` to `sm:grid-cols-[repeat(3,minmax(0,200px))]`.

- [ ] **Step 2: Add the routes to the sitemap**

Replace `app/sitemap.ts` with:

```ts
import type { MetadataRoute } from "next"

import { LATEST_CHECK } from "@/lib/compare"

const COMPARE = [
  "/speechify-alternatives",
  "/vs/speechify",
  "/vs/naturalreader",
  "/vs/elevenreader",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://kairoagent.io"
  return [
    ...["/", "/roadmap", "/changelog"].map((path) => ({ url: `${base}${path}` })),
    ...COMPARE.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(LATEST_CHECK),
    })),
  ]
}
```

- [ ] **Step 3: Test, lint, build**

Run: `node --test lib/compare.test.ts && npm run lint && npm run build`
Expected: tests pass, no lint errors, the build lists `/speechify-alternatives`, `/vs/speechify`, `/vs/naturalreader`, `/vs/elevenreader` as static routes.

- [ ] **Step 4: Visual check on the production build**

Run: `npm run start -- -p 3001` in the background, then with the cached Playwright Chromium screenshot the four pages at 1280 and 390 wide. Check: the table scrolls horizontally on mobile and the body does not; the seven-column hub table is readable at 1280; footer shows three columns.

- [ ] **Step 5: Commit**

```bash
git add components/footer.tsx app/sitemap.ts
git commit -m "Link comparison pages from footer and sitemap"
```
