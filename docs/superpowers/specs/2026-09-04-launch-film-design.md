# Launch film

A 60-second motion-design film for the Kairo launch, built with Remotion in
this repo. Kinetic typography, a camera that never stops, and the product
shown as a bento grid assembled from the landing page's own UI. Music only:
the on-screen text carries the whole message, so the film works muted.

Storyboard mock (six frames in the site palette, timings, motion notes):
<https://claude.ai/code/artifact/fd3fe9a9-4321-4325-94a4-696b218a1754>

## Decisions taken during brainstorm

| Question   | Decision                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------- |
| Targets    | Product Hunt first, then X / LinkedIn (30 s cut), YouTube with the same master               |
| Format     | 1920×1080, 30 fps, 60 s master. No square or vertical cut for now                            |
| Sound      | Music + text only. No voice-over, no diegetic Kairo voice                                    |
| Product    | UI rebuilt in React from the landing components. No screen recordings                        |
| Structure  | "Problem, then bento": hook → wall → listen → bento → breathe → outro                         |
| Hook       | Kinetic: one huge word per beat with side slides, then a camera push into "read."            |
| Camera     | Push-ins and pull-outs everywhere; the outro is the only static shot                         |
| Where      | `video/` folder in this repo with its own `package.json`, aliasing `@/*` to the repo root    |

## Storyboard (60 s master)

Times are in seconds, then in beats at 120 BPM (1 beat = 500 ms = 15
frames). Every event lands on a beat or a half beat.

### S1 Hook, 0–6 s (beats 0–12)

- Black canvas, the shader haze at the bottom at 40 % opacity.
- Beats 0–3: one word per beat, alone, at Display size: **Your · agent ·
  writes · faster**. Slides alternate left and right, 1.2 em, 260 ms,
  ease-out with a small overshoot. Each word exits the opposite way as the
  next arrives; "faster" holds through beat 5.
- Beat 6: "than you can" (muted) over "read." (snow, keyword glow) lands as
  a block. Beats 6–12: the camera pushes into "read." to 2.4×, pivot on the
  word. Cut to black on beat 12.

### S2 The wall, 6–12 s (beats 12–24)

- A Ghostty-style window (the desk demo's chrome) opens centered, at 0.7×.
- `SOURCE` from `transform-content.ts` streams in at 28 ms per word,
  accelerating to 8 ms. The camera pushes linearly to 1.15× over the
  scene, so the window ends up spilling out of the frame. The bottom 30 %
  fades to black.
- Overlay bottom-left, mono uppercase, muted: `1 200 WORDS · 00:04`, the
  counter ticking.
- Hard cut on beat 24.

### S3 Listen, 12–22 s (beats 24–44)

- The camera pulls back (800 ms) to the same window at a sane size, text
  `PLAN` from `demo-content.ts`.
- Beats 25–27: selection sweep, 22 ms per word, white 13 %.
- Beat 28: keycaps **⌥ A** drop center, scale 1.2 → 1, 40 ms stagger, hold
  700 ms, fade.
- Beat 30: the player pill slides down from the top, 300 ms ease-out from
  −20 px, showing `00:00 · 1.25×`.
- Beats 30–44: the silver lamp moves word by word at 1.25× reading pace,
  the pill timer ticks. Meanwhile the title **Listen instead.** writes
  itself bottom-left, word by word, keyword glow. The camera pushes slowly
  to 1.15× over the whole scene.

### S4 Bento, 22–46 s (beats 44–92)

- Beats 44–46: the window shrinks into the "Word by word" cell; the four
  other cells assemble around it, one every 300 ms, 1 px hairline gaps on
  `border` color. Same 12-column layout as `components/bento.tsx`.
- Then the camera visits each cell, two bars (4 s) per cell, with a 600 ms
  ease-in-out move on the beat. The active cell is at full opacity with a
  faint silver inset ring; the rest dims to 38 %. Inside a cell: label,
  then title, then line, 80 ms apart, and the figure plays.
  1. **Any app** · Works everywhere · three iso planes stack, the pill
     floats above.
  2. **Streaming** · Starts on the first bytes · bars rise left to right,
     the first two silver.
  3. **Read · ⌥A** · Word by word · the mark sweeps across the lines.
  4. **Transform · ⌥T** · Three actions, chained · chips Humanize /
     Translate / Summarize light one after another, the breadcrumb
     `Original › Translate FR › Summarize` builds.
  5. **Pro · One-time** · Pay once, bring your own key · the iso key draws
     itself, `19 €` ticks in mono.

### S5 Breathe, 46–54 s (beats 92–108)

- The camera pulls out (1 s) to the whole grid, slightly smaller than the
  frame, every figure idling, all cells at full opacity. The grid keeps
  drifting back 2 % over the scene.
- Three lines under the grid, one every 900 ms, sliding in like the hook
  words: **One shortcut.** **Any app.** **Your key.** The newest line is
  snow, the previous ones turn muted.

### S6 Outro, 54–60 s (beats 108–120)

- The grid fades. Lockup centered (`public/kairo-lockup-dark.png`),
  fade only, 500 ms. Then `Free on macOS · Pro 19 € lifetime`, then
  `kairoagent.io` in mono. The haze fades last: the final frame is black
  with the URL.
- The only static shot of the film.

### 30 s cut

Same scenes, `cut` prop on the root composition:

- Hook 0–6, Listen 6–14 (lamp pace 1.5×, title arrives on beat 14),
  Bento 14–24 (no camera path, each cell shown 2 s in a straight
  sequence, grid at full size), Outro 24–30.
- The wall and breathe are skipped.

## Rhythm and type

- **Tempo.** `BPM = 120` in `lib/beat.ts`. All durations in the project
  are expressed in beats or bars and converted to frames there. Changing
  the track changes one constant and one offset.
- **Density.** Hook and wall: one event per beat or half beat. Listen: one
  event every two bars. Bento: one cell per two bars, three or four
  micro-events inside. Breathe slows further.
- **Type, 1080p equivalents, Geist Variable only:**
  - Display 200 px, 600, tracking −0.04 em: hook words, "read.".
  - Title 64 px, 600, −0.03 em: "Listen instead.", the breathe lines,
    the active cell title.
  - Body 28 px, 400: window text, cell text. Muted; snow when selected or
    read.
  - Mono 20 px, uppercase, tracking 0.12 em: labels, overlays. Always
    muted.
- **Snow vs muted.** Snow is reserved for what just arrived or what
  matters. A line with one snow word reads at a glance.
- **Background.** `#0a0a0a`. `ShaderBackground` at the bottom of the frame
  during hook, listen and outro, 40 % opacity max. Never during the wall
  or the bento.
- **Transitions.** No cross-fades between scenes: a hard cut on a strong
  beat, or the camera carrying its move from one scene into the next
  (wall → listen, listen → bento, bento → breathe). The outro fade is the
  only fade.
- **Motion vocabulary, nothing else:** Rise (slide-up 0.35 em + fade,
  70 ms stagger), Slide (hook words, sideways 1.2 em), Lamp (silver 75 %,
  6 px radius, stepped per word), Camera (push / pull, max 2.4×,
  `cubic-bezier(.7,0,.2,1)`). No blur, no bounce, no color.

## Architecture

### Location and tooling

- `video/` at the repo root: `package.json` (remotion, @remotion/cli,
  @remotion/tailwind-v4, react, react-dom), `remotion.config.ts`,
  `tsconfig.json` extending the root one with `paths: { "@/*": ["../*"] }`.
- Remotion's Tailwind v4 plugin loads `app/globals.css`, so the video uses
  the same tokens and classes as the landing.
- Geist is loaded through `@remotion/fonts` `loadFont` from the fontsource
  files, awaited with `delayRender`, so every frame has the font.
- The root `tsconfig.json` and `eslint.config.mjs` exclude `video/**`.
  `next build` never sees it.

### Reused from the landing as-is

- `components/demo-content.ts`, `components/transform-content.ts`,
  `lib/word-ends.ts`: texts and word boundaries.
- `components/ui/shader-background.tsx`.
- `public/kairo-icon-dark.svg`, `public/kairo-lockup-dark.png`.

### One refactor on the landing

The isometric primitives at the top of `components/bento.tsx` (`iso`,
`Line`, `Poly`, `Box`, `Ring`, the `P3` type) move to `lib/iso.tsx`.
`bento.tsx` imports them; behavior and output unchanged. The video imports
the same file and declares its own five figures, with stroke drawing and
floating driven by the frame instead of the `draw` / `float` / `bar` /
`stage` CSS animations.

### Rewritten frame-driven, in `video/src/ui/`

Same markup and classes as the landing, the only change is the source of
time (`useCurrentFrame` instead of `setTimeout` and CSS animations):

- `Window`: the desk demo's chrome (title bar, dots, app name).
- `Pill`: the player pill with play, mono timer, speed, close.
- `Keycaps`: `⌥ A` / `⌥ T` chips.
- `Words`: a text split into words with `shown`, `selected`, `current`
  props, rendering the sweep and the lamp. Inline `code` kept.
- `Cell`: a bento cell with label, figure slot, title, line, and an
  `active` prop.
- `Camera`: takes keyframes `{ frame, x, y, scale }[]`, interpolates with
  the film's easing, applies one `transform` to its children. Scenes
  declare their camera path; nothing else applies a global transform.

### Scenes and compositions

- `video/src/lib/beat.ts`: `BPM`, `FPS`, `beat(n)`, `bar(n)` in frames,
  the two easings (`out` for arrivals, `camera` for moves).
- `video/src/scenes/{Hook,Wall,Listen,Bento,Breathe,Outro}.tsx`, each a
  `Sequence` whose length is declared in bars.
- `video/src/Root.tsx`: `Launch60` (1800 frames) and `Launch30` (900
  frames), same scenes, `cut: boolean` prop.
- `video/public/`: the music track once chosen, `<Audio>` with a volume
  ramp on the outro. The film is timed at 120 BPM; if the track differs,
  `BPM` and a global offset change.

### Verification

- Remotion Studio (`npm run studio` in `video/`) to iterate.
- `beat.test.ts`: beat/bar to frame conversions at 120 and 100 BPM.
- `npm run stills`: renders a PNG at every scene boundary of both
  compositions into `video/out/stills/`, for a one-glance check.
- `npm run render`: `Launch60` and `Launch30` to `video/out/*.mp4`, H.264.

## Out of scope for now

Square and vertical cuts, subtitles, voice-over, the landing embedding the
film. Added when the 16:9 master is not enough.
