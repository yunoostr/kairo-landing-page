# Desk demo under the hero

A scripted macOS desktop, rendered in the site's own palette, where three
windows open in cascade and Kairo floats over each of them. Sits right after
the hero. Sells value proposition n°1, "works everywhere", which no section
shows today: the hero shows reading, Transform shows ⌥T, nobody sees the
pill hovering over Claude Code.

Inspiration: the SuperWhisper homepage demo (flat desktop, dock, windows
opening one after another, blur + Replay at the end). Nothing is copied:
the desktop is achromatic, the apps are recognized by their shape, and the
only bright objects are Kairo's.

## Decisions taken during brainstorm

| Question          | Decision                                                                 |
| ----------------- | ------------------------------------------------------------------------ |
| Story             | Three apps in sequence: Claude Code → GitHub PR → Slack                  |
| Playback          | Click to start, plays the real TTS voice, ends blurred with Replay       |
| Visual direction  | "A · La salle de lecture": desktop in site palette, no app colors       |
| Beat 3 language   | Slack message in French, translated to English, read aloud in English   |
| Apps              | Claude Code, GitHub, Slack (what the target reader opens every day)     |
| Hero player       | Unchanged; the hero keeps its own subline player                         |

## Placement and frame

- New section `components/demo.tsx`, rendered in `app/page.tsx` right
  after `<Hero />`, same `max-w-[1160px] px-8` column as the rest.
- The desktop is a 16:10 box with a hairline `border-border`, background
  `#0d0d0d`, `overflow-hidden`. Wallpaper: `ShaderBackground` with dimmer
  params than the closing CTA (fewer lines, lower brightness) so the
  ribbons read as haze behind the windows.
- Every window position and size is a percentage of the frame. Text sizes
  inside the frame use `cqw` (the frame is a `@container`), so the whole
  desktop scales down on narrow viewports with no mobile-specific layout.
- Wrapped in `Reveal` like every other section.

## Objects on screen

All achromatic, all from the DESIGN.md tokens.

- **Windows**: `bg-card` (#171717), `rounded-[10px]`, ring `0 0 0 1px #000`
  plus an inner `rgba(255,255,255,.06)` line, large soft shadow. Title bar
  28px with three grey dots (`#3a3a3a`) and a mono title. Three of them:
  - `claude — zsh — 120×40`: mono body, dimmed prompt lines, the plan
    paragraph.
  - `Pull request #482 · Refactor auth to server sessions`: sans body with
    a PR description.
  - `#standup`: a thin channel list on the left, a message from a colleague
    on the right.
- **Dock**: bottom center, `bg-card/70` with `backdrop-blur`, four 34px
  tiles in `bg-secondary`: `❯`, `⎇`, `#`, and a `K` keycap-styled tile.
- **Kairo player**: top right. A pill (`rounded-full`, `bg-card`, the nav
  pill's material) with play button, elapsed time, speed `1×`, and three
  EQ bars that bounce while audio plays (reuse the hero's `eq` keyframes).
  Below it, a transcript card (`rounded-xl`, `bg-card`) whose current word
  is lit `bg-primary/75 text-background`, the site's word lamp.
- **Actions pill**: top center, `rounded-full bg-card p-1`, three chips
  Humanize / Translate / Summarize; the chosen one gets `bg-secondary`.
  Below it the result card streams the output token by token with the
  same pulsing caret as Transform.
- **Keycaps**: `⌥` `A` and `⌥` `T`, bottom center, styled from `Kbd` at
  keyboard scale (same recipe as `Keycap` in `closing-cta.tsx`, smaller).
  They pop in for ~600 ms at the moment of the shortcut, then fade.
- **Selection**: the swept text gets `bg-white/[0.13] text-foreground`,
  word by word at ~22 ms per word, as in the hero.
- **Play demo** (rest state): one pill in the center of the empty desktop,
  `bg-card`, play glyph + "Play demo". Same material as the player pill.
- **Replay** (end state): the whole frame gets `blur-sm` and a dark veil,
  with a centered pill "Replay". Same pill as Play demo.

## Choreography

The component holds a declarative list of phases. Each phase says what is
visible and how it ends: either after a fixed duration, or on the `ended`
event of an audio element. One chained `setTimeout` advances phases, like
`step()` in `hero.tsx`. Everything visible derives from the current phase
index, so the render is a pure function of `(phase, selected, shown,
current)`.

| #   | Phase            | What happens                                                                                   | Ends by       |
| --- | ---------------- | ---------------------------------------------------------------------------------------------- | ------------- |
| 0   | rest             | Empty desktop, dock, "Play demo" pill centered.                                                | click         |
| 1   | claude-open      | Claude Code window scales in from 96% + fade. Prompt lines already there.                      | 500 ms        |
| 2   | claude-stream    | The plan paragraph streams in, one token per 28 ms (Transform's cadence).                      | duration      |
| 3   | claude-select    | Selection sweeps the plan, 22 ms per word.                                                     | duration      |
| 4   | claude-shortcut  | Keycaps ⌥A pop. Player pill + transcript slide in top right (translate-y 8px + fade, 300 ms).   | 700 ms        |
| 5   | claude-read      | `demo-plan.mp3` plays. Lamp follows the audio in the transcript and in the window.             | audio `ended` |
| 6   | pr-open          | PR window opens in front, offset right. Selection sweeps the description.                      | 500 + sweep   |
| 7   | pr-shortcut      | Keycaps ⌥T pop. Actions pill slides in top center.                                             | 700 ms        |
| 8   | pr-summarize     | "Summarize" chip lights. Result card streams the summary.                                      | duration      |
| 9   | pr-replace       | The PR description is replaced by the summary in place; the result card fades.                 | 900 ms        |
| 10  | slack-open       | Slack window opens in front, offset left. Selection sweeps the French message.                 | 500 + sweep   |
| 11  | slack-shortcut   | Keycaps ⌥T pop. Actions pill in, "Translate" chip lights, `FR → EN` tag.                        | 700 ms        |
| 12  | slack-translate  | Result card streams the English translation.                                                   | duration      |
| 13  | slack-listen     | Player pill appears, `demo-translate.mp3` plays. Lamp follows in the result card.              | audio `ended` |
| 14  | end              | Frame blurs, "Replay" pill. Click → phase 1 with all state reset.                              | click         |

Windows never close: each new one opens in front of the previous ones,
which stay dimmed at `opacity-60`. Total runtime is about 36 s depending on
the two MP3s.

Streaming and sweeping use the same counters as Transform and the hero
(`shown` tokens, `selected` words), so no new text mechanics are written.

## Content

`components/demo-content.ts` exports plain strings, split into words with
`wordEnds` for the lamp:

- `PLAN`: the Claude Code plan, about 45 spoken words. Names one file in
  backticks, kept verbatim as Kairo's prompts do.
- `PR_BODY` and `PR_SUMMARY`: a long PR description and its three-line
  summary (what was done, what changed, what is left to decide).
- `SLACK_FR` and `SLACK_EN`: a colleague's message in French and its
  faithful English translation.

Texts are invented but plausible for the target reader; no lorem.

## Audio

Two MP3s in `public/`, generated by hand with the same pipeline as the
existing ones (gpt-4o-mini-tts, voice `ash`):

- `demo-plan.mp3`: `PLAN`, English.
- `demo-translate.mp3`: `SLACK_EN`, English.

The lamp position is `currentTime / duration` mapped through `wordEnds`,
exactly the hero's `onTime` handler. One `<audio>` element whose `src`
switches per phase, `preload="auto"` so the first click has no gap.

## Accessibility and fallbacks

- `prefers-reduced-motion: reduce`: no scheduler runs. The frame renders
  phase 13's layout statically (all three windows, actions pill with
  Translate lit, player pill), no Play button. Nothing moves, nothing
  plays.
- The Play / Replay button has `aria-label`. The desktop is
  `aria-hidden="true"`: it is a picture, the copy around it carries the
  meaning.
- Clicking Replay while audio plays stops the audio first.
- If an audio element errors or never fires `ended` (blocked autoplay,
  missing file), the phase also ends on a fallback timer of 12 s so the
  demo never stalls.
- The section unmounting clears the pending timeout and pauses audio.

## Files

| File                              | Role                                                                 |
| --------------------------------- | -------------------------------------------------------------------- |
| `components/demo.tsx`             | Section, phases, scheduler, windows, pills. `"use client"`.          |
| `components/demo-content.ts`      | The five texts and a pure `advance(phase, event)` helper.            |
| `components/demo-content.test.ts` | `node --test`, checks `advance` and word counts.                     |
| `public/demo-plan.mp3`            | Beat 1 voice (to be generated).                                      |
| `public/demo-translate.mp3`       | Beat 3 voice (to be generated).                                      |
| `app/page.tsx`                    | Adds `<Demo />` after `<Hero />`.                                    |

Reused as is: `ShaderBackground`, `Reveal`, `Kbd`, `wordEnds`, the `eq`
keyframes, the `cta`/pill materials in `globals.css`.

## Testing

- `advance(phase, event)` is a pure function; `demo-content.test.ts` checks
  that `click` at rest goes to 1, `ended` at 5 goes to 6, `click` at 14
  goes to 1, and that unrelated events do not move the phase.
- Visual check on a prod build (`next build && next start -p 3001`) with
  Playwright, per the project memory: rest frame, mid-read frame, end
  frame, and the reduced-motion static frame.
- `npm run typecheck` and `npm run lint` clean.

## Out of scope

Looping playback, a scrubber, mobile-specific choreography, more than three
apps, any color in the desktop.
