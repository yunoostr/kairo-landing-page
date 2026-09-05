# Honest comparison pages

Four SEO pages that position Kairo against the read-aloud tools a Mac user
would consider instead: one "Speechify alternatives" hub and three
"Kairo vs X" pages. Every claim on them is a verifiable fact with a source
and a check date, and every page says when the competitor is the better
choice. The honesty is the product: it is what makes the pages rank, and it
is what keeps them safe under French and EU comparative-advertising law
(art. L122-1 Code de la consommation, directive 2006/114/EC), which allows
naming a competitor as long as the comparison is objective, on essential
and verifiable characteristics, not misleading and not denigrating.

## Decisions taken during brainstorm

| Question              | Decision                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Scope                 | Read-aloud / text-to-speech tools only. AI writing assistants (Wordtune, Grammarly, Raycast AI) are out.           |
| Goal                  | SEO: capture "[X] alternative" and "[X] vs" queries. Not a sales-enablement or positioning page.                   |
| Honesty level         | Each page has a "Choose X if" section and lists what Kairo lacks (iOS, PDF import, browser extension).             |
| Page set (v1)         | Hub `/speechify-alternatives` + `/vs/speechify`, `/vs/naturalreader`, `/vs/elevenreader`. Covers ~95 % of volume. |
| ElevenReader          | Normal vs page with the standard precautions (nominative use, no logo, sourced, disclaimer).                       |
| Architecture          | MDX pages for prose + one shared data module + one table component. No dynamic route.                             |
| Kairo's price         | Not shown. "One-time license, price on the checkout page" with the Polar link, consistent with PRODUCT.md.         |
| Hub table             | 7 columns: Kairo, macOS Spoken Content, LoudScript, Speech Central, ElevenReader, NaturalReader, Voice Dream.      |
| Footer                | A third "Compare" column with the 4 links.                                                                        |
| Testimonials, images  | None. No switcher quotes exist; no competitor screenshots or logos, ever.                                          |

## Why these competitors

Search volume (Google US, monthly, DataForSEO, August 2026) is almost
entirely on Speechify. The tools that are functionally closest to Kairo
(macOS Spoken Content, Speech Central, LoudScript, WordWand) have no search
volume of their own, so they appear in the hub table but get no page.

| Query                                          | Volume / month |
| ---------------------------------------------- | -------------- |
| speechify alternative(s)                       | 590            |
| speechify free alternative (all variants)      | ~1 000         |
| alternative to speechify                       | 170            |
| speechify vs natural reader (both orders)      | 230            |
| elevenlabs / elevenreader vs speechify         | 120 (+450 %/y) |
| text to speech mac app, read aloud mac         | 160            |
| naturalreader alternative                      | 40             |
| voice dream vs speechify                       | 20             |

## Data model

`lib/compare.ts` is the single source of truth. One `Product` per tool,
Kairo included, all with the same eight criteria so the table is symmetric
and no row is shaped to flatter Kairo.

```ts
type Cell = { value: string; note?: string; source?: string }

type Product = {
  slug: string          // "speechify"
  name: string          // "Speechify"
  url: string           // vendor homepage
  vendor: string        // "Speechify Inc., USA"
  checked: string       // ISO date of last verification, e.g. "2026-09-05"
  pricingUrl?: string   // the vendor's own pricing page, linked from the price cell
  facts: Record<Criterion, Cell>
}

type Criterion =
  | "macApp"        // Native Mac app?
  | "anyApp"        // Reads text selected in any macOS app from a shortcut?
  | "highlight"     // Word / sentence / none
  | "voices"        // System / own AI voices / bring your own key
  | "pricing"       // Model + amount + currency, as of `checked`
  | "offline"       // Works without network?
  | "aiActions"     // Summarize / translate / rewrite
  | "platforms"     // Beyond macOS
```

Rules:

- A fact that could not be verified is written `Not documented`, never
  `No`. The note explains what was looked for.
- Every `pricing` cell has a `source` (the vendor's pricing page or App
  Store listing). The table links it.
- Kairo is described with the same detachment: macOS only, no iOS, no PDF
  or document import, no browser extension, OpenAI key required for Pro,
  OpenAI usage billed to the user.
- `checked` is the only maintenance discipline. Re-verify prices, change
  the date, and the "Facts checked on" line and sitemap `lastModified`
  follow. Reminder: quarterly.

Facts to seed the module are in the appendix of this spec. Values still
marked "unverified" there stay `Not documented` on the site until checked.

## Legal safeguards, applied mechanically

1. **Nominative use only.** Competitor names in plain text. No logos,
   screenshots, brand colours or icons. The table component has no image
   slot.
2. **Verifiable facts only.** The table shows objective criteria. No row
   for voice quality, ease of use, "best", speed or reliability. Those are
   opinions and the point where comparative advertising becomes
   actionable.
3. **Dated and sourced.** "Facts checked on {date}" above every table.
   Price cells link to the vendor's pricing page. The table component
   throws at build time on a product without `checked`.
4. **No denigration.** "Why people look for an alternative" is written as
   user needs ("you want to pay once", "you want it in every app, not one
   browser"), never as competitor faults, and never as paraphrased user
   complaints.
5. **Reciprocity.** "Choose X if" comes before "Choose Kairo if" on every
   vs page, with real cases where the competitor wins.
6. **Disclaimer** at the bottom of every page, one paragraph: trademarks
   belong to their owners, no affiliation or endorsement, facts checked on
   the stated date and may have changed since, contact address for
   corrections (the one used in the legal pages).
7. **Kairo's price is never written**, only "one-time license" and a link
   to the checkout.

A competitor asking for a correction gets it in one commit. That, plus the
paper trail of sources, is the practical defence.

## Pages

### Shared chrome

`app/(compare)/layout.tsx`: same `SiteHeader` and `Footer` as the legal
pages, 680 px prose column. The table alone breaks out to 860 px on desktop
(`-mx` trick inside the column) and scrolls horizontally on mobile inside
its own `overflow-x-auto` wrapper. MDX components get `table`, `th`, `td`
and `h3` added to `mdx-components.tsx` (the file's own comment invites it).

### `components/compare-table.tsx`

Server component. Props: `products: Product[]`. Renders the eight criteria
as rows, products as columns, the criterion label in the first column. Each
cell shows `value`, the `note` underneath in muted text, and a "source"
link when present. Above the table: "Facts checked on {latest checked
date}". If any product lacks `checked`, throw.

### Hub `/speechify-alternatives`

Title: "Speechify alternatives for Mac (2026)". Meta description of about
150 characters naming the free option. Target length 900 to 1 200 words.

1. **Intro, three sentences.** What Speechify is, why someone looks
   elsewhere, phrased as needs: pay once, read in every app rather than one
   browser or one library, keep text off a third-party account.
2. **What to look for.** Five bullets, one per key criterion, one line
   each. This frames the comparison on facts and legitimises the grid.
3. **Table**, seven columns. Kairo first, macOS Spoken Content second:
   putting Apple's free option right after Kairo is the strongest honesty
   signal available.
4. **One paragraph per alternative**, 60 to 90 words, neutral: what it is,
   who it suits, what it does not do. Kairo gets the same length and its
   own gaps.
5. **Which one should you pick.** Five lines "If you want … → X". Kairo is
   the answer on two: reading AI output in any app with word-by-word
   highlighting, and Humanize / Translate / Summarize without a
   subscription.
6. `DownloadButton`, then the disclaimer.

### Vs pages `/vs/speechify`, `/vs/naturalreader`, `/vs/elevenreader`

Title: "Kairo vs Speechify". Target length 600 to 800 words.

1. **TL;DR**, two sentences on the fundamental difference (e.g. Speechify
   is a multi-device reading platform on a subscription; Kairo is a macOS
   shortcut with a one-time license and your own OpenAI key).
2. **Two-column table**, same eight criteria, sourced.
3. **Three paragraphs**: where it reads (any app vs browser or library),
   how you pay (subscription vs license plus per-use OpenAI cost, with the
   honest example from the existing FAQ: a cent or two per minute of
   audio), and what each cannot do.
4. **Choose X if** then **Choose Kairo if**, three to four bullets each.
5. Links to the hub and the two sibling vs pages, `DownloadButton`,
   disclaimer.

## SEO and navigation

- `export const metadata` per MDX page: `title`, `description`,
  `alternates.canonical`. The root template `%s · Kairo` applies.
- `app/sitemap.ts`: the four routes added, `lastModified` set from the
  newest `checked` date in `lib/compare.ts`.
- `components/footer.tsx`: third column `Compare` with the four links;
  grid becomes three columns on desktop.
- Internal links: hub → each vs page; each vs page → hub and siblings.
- No FAQ JSON-LD, no Product schema. The global SoftwareApplication JSON-LD
  already covers Kairo.

## Testing

- `lib/compare.test.ts`, run with `node --test` like the existing tests:
  every product has all eight criteria, a `checked` date that parses, and
  a `source` on its `pricing` cell; no `value` contains "best", "better",
  "worse", "slow" or "bad" (the denigration guard).
- `next build` emits the four routes as static pages.
- Visual check of the four pages on `next start -p 3001` with the cached
  Playwright Chromium (see project memory: dev-mode back navigation does
  not hydrate).

## Files

| File                                             | Change                                   |
| ------------------------------------------------ | ---------------------------------------- |
| `lib/compare.ts`                                 | New: types, `PRODUCTS`, `KAIRO`          |
| `lib/compare.test.ts`                            | New                                      |
| `components/compare-table.tsx`                   | New                                      |
| `mdx-components.tsx`                             | Add `h3`, `table`, `th`, `td`            |
| `app/(compare)/layout.tsx`                       | New, same chrome as `(legal)`            |
| `app/(compare)/speechify-alternatives/page.mdx`  | New                                      |
| `app/(compare)/vs/speechify/page.mdx`            | New                                      |
| `app/(compare)/vs/naturalreader/page.mdx`        | New                                      |
| `app/(compare)/vs/elevenreader/page.mdx`         | New                                      |
| `app/sitemap.ts`                                 | Add routes with `lastModified`           |
| `components/footer.tsx`                          | Add `Compare` column                     |

Route note: `(compare)` is a route group, so the public URLs are the short
`/speechify-alternatives` and `/vs/speechify`. The group exists only to
share the layout.

## Appendix: facts gathered on 2026-09-05

Source: web research on 2026-09-05 (116 sources) plus a fact-check pass on
Speechify, NaturalReader and ElevenReader. Anything marked _unverified_
stays `Not documented` on the site.

| Product                | Mac app                         | Any-app selection shortcut                        | Highlight                    | Voices                                                        | Pricing (as seen)                                                                     | Offline               | AI actions                              | Other platforms                    | Vendor                         |
| ---------------------- | ------------------------------- | ------------------------------------------------- | ---------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------- | --------------------------------------- | ---------------------------------- | ------------------------------ |
| Kairo                  | Yes, native                     | Yes, global shortcut, floating player             | Word                         | macOS voices free; 9 OpenAI voices with own key (Pro)         | Free; Pro one-time license                                                            | Free tier yes; Pro no | Humanize, Translate, Summarize (Pro)    | None                               | Nathan Renard, France          |
| macOS Spoken Content   | Built in                        | Yes, Option-Esc default, customizable             | Word and sentence, in place  | Apple voices, downloadable                                    | Free                                                                                  | Yes                   | None                                    | iOS equivalent                     | Apple, USA                     |
| LoudScript             | Yes, macOS 15.6+                | Yes, Services menu or Option-Cmd-R, floating player | Sentence                   | Apple voices + local Supertonic / Kokoro / PocketTTS          | Free                                                                                  | Yes                   | Optional AI formatting via own provider | None                               | Indie (Hoye Lam), _unverified_ |
| Speech Central         | Yes, macOS 14+                  | Via macOS Services shortcut                        | Synchronized, granularity _unverified_ | Apple, Piper offline, cloud via own Azure / OpenAI / Google / xAI keys | $9.99 one-time (Mac App Store)                                             | Yes                   | None                                    | iOS, Android, Windows, Watch       | Labsii, Serbia                 |
| ElevenReader           | No, web + Chrome extension      | No, content is imported                            | "Text highlighting", granularity _unverified_ | ElevenLabs voices, 1 000+, 32 languages          | Free 10 h/month; Ultra $11/mo or $99/yr                                               | Ultra downloads only  | None                                    | iOS, Android, web                  | Eleven Labs Inc., New York, USA |
| NaturalReader          | Legacy desktop app, new sales discontinued (MSA §3.5) | Legacy app only via Miniboard; extension reads web pages | Word and sentence            | Own voices, 90+ languages                                     | Free limited; Lite $13.90/mo or $79/yr; Plus $20.90/mo or $119/yr; Pro $25.90/mo or $159/yr | No                    | Podcast, recap, chat, quizzes           | iOS, Android, web, Chrome          | NaturalSoft Ltd., Richmond BC, Canada |
| Voice Dream Reader     | Yes, macOS 11+ (App Store)      | No, library import                                 | Word                         | 75 macOS voices, premium via IAP                              | Free download; $49.99 to $79.99/yr subscriptions                                      | Yes with Mac voices   | AI summaries (v2.0.2)                   | iOS, iPadOS, visionOS              | Voice Dream LLC, USA           |
| Speechify              | Yes, native, direct download (macOS 13+ per third party, _unverified_) | Yes, Option-A default, mini player, customizable | Word ("active text highlighting") | 10 free voices; 1 000+ own voices (Premium)           | Free (10 voices, 1.5x cap, 5 files); Premium $29/mo or $139/yr, 150 000 words/month guaranteed | Yes, on-device voices | AI summaries, chat, podcasts (Premium) | iOS, Android, Windows, Chrome, Edge, web | Speechify Inc., Miami, USA    |

Trademark notes: ElevenLabs ToS §5(c) says the name and logos may not be
used without written permission; Speechify ToS §5.2 prohibits "misuse" of
its marks. Nominative use in a factual comparison is lawful in the EU and
US regardless, and no logo is used. Speechify and ElevenLabs both publish
their own "vs" and "alternatives" pages naming competitors and printing
their prices, which makes a complaint about ours hard to sustain.
NaturalReader publishes none. Speechify's own reviews: 4.7 on Trustpilot
(6 926 reviews), F rating on BBB (90 complaints). None of this goes on the
pages: complaint themes are not verifiable product facts.

Key sources: speechify.com/pricing, speechify.com/usage-limits,
help.speechify.com article 15097404 (play selected text on Mac),
naturalreaders.com help article 8854700 (plans), elevenreader.io/pricing,
help.elevenlabs.io article 38319697008657 (desktop availability).
