```markdown
# Kairo — Product Requirements

Business context for anyone (human or agent) touching this codebase. For
_how_ it is built, read `ARCHITECTURE.md`; this file is about _what_ and
_why_.

## One sentence

Kairo is a macOS utility that reads any selected text aloud and transforms
it with AI from a global shortcut, without leaving the app you are in.

## Who it is for

The target user is a **software developer who consumes a lot of AI-assistant
output** (Claude Code, ChatGPT, Copilot, PR descriptions, long chat
answers). That text is long, padded, formatted for a screen, and read many
times a day. Kairo lets them:

- listen to it instead of reading it (hands free, eyes on the code),
- shrink it or make it speakable before listening,
- translate it to their working language,
- paste the cleaned-up version back in place.

Everything in the product is tuned for that reader: prompts keep code names
verbatim, describe code blocks in one sentence, strip AI phrasing and
markdown, and produce prose that sounds right both on screen and through a
voice.

## Problem

- Reading AI output is slow and tiring; native macOS speech is robotic and
  has no word tracking.
- Existing "read aloud" or "AI writing" tools live inside one app (browser
  extension, editor plugin) or need a paste-into-a-web-page round trip.
- AI writing assistants are subscriptions with their own inference bill,
  which a developer who already has an OpenAI account does not want.

## Value proposition

1. **Works everywhere.** One global shortcut in any macOS app, including
   fullscreen apps. Floating panels hover over the source app without
   stealing focus.
2. **Fast.** Audio starts on the first bytes back from OpenAI; the
   selection is captured in tens of milliseconds.
3. **Pay once, bring your own key.** No subscription. OpenAI bills the user
   cents per use on their own key; Kairo never charges again.

## Core workflows

### Read selected text (free)

1. Select text anywhere, press the Read shortcut (default ⌥A).
2. A floating player appears top-right with a transcript, word-by-word
   highlighting, pause/resume, speed (0.75× to 2×, five presets) and close.
3. The reading is appended to the listening history (last 50) shown on the
   Home page, replayable from there.

Voice: the macOS voice by default, picked from the detected language of the
text. With Kairo Pro, one of nine OpenAI voices.

### Transform selected text (Pro)

1. Select text, press the Transform shortcut (default ⌥T).
2. A floating pill appears top-center with three fixed actions: **Humanize**
   (say it as a colleague would, same length or shorter), **Translate**
   (faithful, structure and code kept, target picked per run among FR / EN
   / ES / DE / IT), **Summarize** (what was done, what changed, what is left
   to decide).
3. The result streams into a card. From there: **Listen** (opens the
   player), **Replace** (pastes over the selection in the source app),
   **Copy**, or **Then** (chain another action on the result; a breadcrumb
   lets the user go back to any step, with a Before/After toggle).

No free-form prompt: the action set is deliberately fixed. A default output
language for Humanize and Summarize is set in Settings (`auto` keeps the
text's language).

### Configure

Main window (800×600, dark only, no light mode) with four pages:

- **Home** — greeting, shortcut hint, listening history.
- **Text to Speech** — voice picker with previews.
- **Shortcuts** — remap Read, Transform, Pause/Resume, Speed and Close;
  validation refuses a Read combo without a modifier or duplicates.
- **Settings** — Kairo Pro license, OpenAI API key, output language.

## Business model

| Tier                        | What it includes                                                | Price                                                                        |
| --------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Free download               | Reading with the macOS voice, shortcuts, history, speed control | 0                                                                            |
| Kairo Pro, lifetime license | Plugging in an OpenAI key: nine OpenAI voices + AI actions      | One-time, launch 19 € for the first 50 customers then 29 €. Updates forever. |

The product is viable as a one-time payment because Kairo has **no
inference cost**: the user's own OpenAI key (BYOK) pays for every request.
Fixed models, not user-selectable: `gpt-4o-mini` for text, `gpt-4o-mini-tts`
for speech.

### Licensing rules

- Sold and delivered by **Polar** (Merchant of Record, VAT, invoices,
  license key by email). No backend of our own.
- One license activates on up to **3 Macs**. "Remove" in Settings frees the
  slot.
- Silent revalidation at startup, at most every 14 days. Offline or Polar
  down → keep local state (**fail-open**). Revoked / refunded → features
  lock again, key kept so Settings can show which one.
- No heavy DRM by design: optimize for honest customers.
- **The app never displays a price.** Buttons say "Buy Kairo Pro"; the
  checkout page announces the price, so an old build never contradicts the
  dashboard.

### Feature gating

The free/paid boundary is exactly the OpenAI boundary. Without a valid
license, OpenAI voices and AI actions are locked with a calm hint ("… are
part of Kairo Pro · See what Pro unlocks") that opens the paywall dialog.
The paywall only opens on a click, never on its own. Without an API key, the
same features report "Add your OpenAI API key in Settings" at the point of
use. **Never a silent fallback** to the macOS voice.

## Distribution

- macOS only. Signed and notarized DMG on GitHub Releases, linked from a
  static landing page outside this repo. Apple Developer Program is the
  only fixed cost.
- Mac App Store excluded (30 % cut, sandbox breaks global shortcuts).
- Requires the Accessibility permission (selection is captured via a
  simulated Cmd+C with clipboard restore); the app guides the user to
  System Settings.

## Product principles

- **Invisible until summoned.** No accent color, no onboarding screens, no
  panels that open by themselves. Every surface is glanced at, then
  forgotten.
- **Errors are explicit and calm.** No red fields; an alert says what
  happened and the one thing to do next. Nothing fails silently.
- **Rust is thin.** Business logic lives in TypeScript; native code only
  for OS access (windows, clipboard, audio, files) and for the OpenAI audio
  stream.
- **Honest user first.** Fail-open licensing, no telemetry, credentials
  stored as owner-only files on the user's machine, the only network peers
  are OpenAI and Polar.

## Out of scope (for now)

Windows/Linux, custom prompts, other AI providers or model selection,
usage/cost display, Keychain storage, auto-updates (planned later via the
Tauri updater), Mac App Store.

```

