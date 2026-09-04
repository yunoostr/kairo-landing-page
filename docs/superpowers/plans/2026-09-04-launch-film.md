# Launch Film Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A 60 s and a 30 s Remotion film of Kairo, music-ready, rendered to MP4 from `video/`.

**Architecture:** `video/` is a self-contained Remotion project that aliases `@/*` to the repo root so it reuses the landing's content files, tokens, shader and iso primitives. Every animation reads `useCurrentFrame()`; durations go through `lib/beat.ts` (120 BPM). One `Camera` component applies the only global transform; six scene components are stacked in `Sequence`s by `Root.tsx`.

**Tech Stack:** Remotion 4.0.520 (`remotion`, `@remotion/cli`, `@remotion/tailwind-v4`, `@remotion/fonts`), React 19, Tailwind v4 via the root `app/globals.css`, `node --test` for unit tests.

**Spec:** `docs/superpowers/specs/2026-09-04-launch-film-design.md`

## Global Constraints

- 1920×1080, 30 fps. `Launch60` = 1800 frames, `Launch30` = 900 frames.
- `BPM = 120`: 1 beat = 15 frames, 1 bar = 60 frames. Every event lands on `beat(n)` or `beat(n) + ms(x)`.
- Palette: only the landing tokens (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `bg-primary` silver). No other color.
- Type: Geist Variable only. Display 200 px / 600 / −0.04 em. Title 64 px / 600 / −0.03 em. Body 28 px / 400. Mono 20 px uppercase tracking 0.12 em.
- Motion vocabulary only: Rise, Slide, Lamp, Camera. No CSS `transition` or `animation` inside `video/` (non-deterministic in Remotion). No blur, no bounce beyond the hook overshoot.
- Easings: arrivals `bezier(.2,.7,.2,1)`, camera `bezier(.7,0,.2,1)`.
- The landing (`next build`, `npm run typecheck`, `npm run lint` at the root) must stay green after every task.
- Commit after every task, message in the imperative, no prefix, trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

## File structure

```
video/
  package.json                 own deps and scripts (studio, render, stills, test)
  remotion.config.ts           entry point, Tailwind, "@" alias, angle GL
  tsconfig.json                extends ../tsconfig.json, paths "@/*" -> "../*"
  public/
    geist-latin-wght-normal.woff2   copied from @fontsource-variable/geist
    kairo-lockup-dark.png           copied from ../public
  src/
    index.ts                   registerRoot
    Root.tsx                   Launch60 / Launch30 compositions, font loading
    style.css                  imports ../../app/globals.css + @source for ../lib
    lib/beat.ts                FPS, BPM, beat(), bar(), ms()
    lib/beat.test.ts
    lib/ease.ts                EASE.out, EASE.camera
    ui/Camera.tsx              keyframed push / pull, the only global transform
    ui/Text.tsx                Rise, Slide (word arrivals)
    ui/Words.tsx               word list with sweep + lamp
    ui/Window.tsx              app window chrome
    ui/Pill.tsx                player pill
    ui/Keycaps.tsx             ⌥ A chips
    ui/Haze.tsx                ShaderBackground driven by frame, bottom of frame
    ui/Stream.tsx              transform-content blocks streamed word by word
    bento/cells.ts             the five cells: span, label, title, text, poi()
    bento/figures.tsx          five iso figures driven by a local frame
    bento/Grid.tsx             the grid, active cell, assembly
    scenes/Hook.tsx
    scenes/Wall.tsx
    scenes/Listen.tsx
    scenes/Bento.tsx
    scenes/Breathe.tsx
    scenes/Outro.tsx
lib/iso.tsx                    NEW at the root: iso primitives moved out of components/bento.tsx
components/bento.tsx           MODIFIED: imports from lib/iso
components/ui/shader-background.tsx  MODIFIED: optional `time` prop
tsconfig.json, eslint.config.mjs     MODIFIED: exclude video/
```

---

### Task 1: Scaffold `video/` and render one black frame

**Files:**
- Create: `video/package.json`, `video/remotion.config.ts`, `video/tsconfig.json`, `video/src/index.ts`, `video/src/Root.tsx`, `video/src/style.css`, `video/.gitignore`
- Copy: `node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2` → `video/public/`, `public/kairo-lockup-dark.png` → `video/public/`
- Modify: `tsconfig.json` (root, `exclude`), `eslint.config.mjs` (root, `globalIgnores`)

**Interfaces:**
- Produces: compositions `Launch60` and `Launch30` registered in `video/src/Root.tsx`; `video/src/style.css` as the one stylesheet.

- [ ] **Step 1: package.json**

```json
{
  "name": "kairo-launch-film",
  "private": true,
  "type": "module",
  "scripts": {
    "studio": "remotion studio",
    "render": "remotion render Launch60 out/launch-60.mp4 && remotion render Launch30 out/launch-30.mp4",
    "stills": "for f in 0 90 180 270 360 500 660 700 900 1100 1380 1500 1620 1799; do remotion still Launch60 --frame=$f out/stills/60-$f.png; done; for f in 0 180 300 420 600 720 899; do remotion still Launch30 --frame=$f out/stills/30-$f.png; done",
    "test": "node --test src/lib/*.test.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@remotion/cli": "4.0.520",
    "@remotion/fonts": "4.0.520",
    "@remotion/tailwind-v4": "4.0.520",
    "@tabler/icons-react": "^3.46.0",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "remotion": "4.0.520"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: remotion.config.ts**

```ts
import path from "node:path"
import { Config } from "@remotion/cli/config"
import { enableTailwind } from "@remotion/tailwind-v4"

Config.setEntryPoint("src/index.ts")
Config.setVideoImageFormat("jpeg")
Config.setChromiumOpenGlRenderer("angle") // the shader haze needs WebGL
Config.overrideWebpackConfig((config) => {
  const c = enableTailwind(config)
  return {
    ...c,
    resolve: {
      ...c.resolve,
      alias: { ...c.resolve?.alias, "@": path.resolve(import.meta.dirname, "..") },
    },
  }
})
```

- [ ] **Step 3: tsconfig.json**

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "noEmit": true,
    "plugins": [],
    "paths": { "@/*": ["../*"] },
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "remotion.config.ts"],
  "exclude": ["node_modules", "src/**/*.test.ts"]
}
```

- [ ] **Step 4: style.css, index.ts, Root.tsx**

`video/src/style.css`:

```css
@import "../../app/globals.css";
@source "../../lib";
@source "../../components/ui";
```

`video/src/index.ts`:

```ts
import { registerRoot } from "remotion"
import { Root } from "./Root"

registerRoot(Root)
```

`video/src/Root.tsx`:

```tsx
import { loadFont } from "@remotion/fonts"
import { AbsoluteFill, Composition, staticFile } from "remotion"
import "./style.css"

loadFont({
  family: "Geist Variable",
  url: staticFile("geist-latin-wght-normal.woff2"),
  weight: "100 900",
})

const Black = () => <AbsoluteFill className="bg-background" />

export function Root() {
  return (
    <>
      <Composition id="Launch60" component={Black} durationInFrames={1800} fps={30} width={1920} height={1080} />
      <Composition id="Launch30" component={Black} durationInFrames={900} fps={30} width={1920} height={1080} />
    </>
  )
}
```

`video/.gitignore`:

```
node_modules
out
```

- [ ] **Step 5: copy assets, exclude from the landing**

```bash
mkdir -p video/public
cp node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2 video/public/
cp public/kairo-lockup-dark.png video/public/
```

Root `tsconfig.json`: `"exclude": ["**/*.test.ts", "node_modules", "video"]`.
Root `eslint.config.mjs`: add `"video/**"` to the `globalIgnores([...])` list.

- [ ] **Step 6: install and render a still**

```bash
cd video && npm install && npx remotion still Launch60 --frame=0 out/black.png
```

Expected: `out/black.png` exists, 1920×1080, solid `#0a0a0a`. If the Tailwind class does not apply (transparent/white frame), check that `enableTailwind` ran and that `style.css` is imported from `Root.tsx`.

- [ ] **Step 7: landing still green**

```bash
npm run typecheck && npm run lint
```

Expected: both pass; `video/` is ignored.

- [ ] **Step 8: Commit**

```bash
git add video tsconfig.json eslint.config.mjs
git commit -m "Scaffold the Remotion launch film project"
```

---

### Task 2: `lib/beat.ts` and `lib/ease.ts`

**Files:**
- Create: `video/src/lib/beat.ts`, `video/src/lib/ease.ts`
- Test: `video/src/lib/beat.test.ts`

**Interfaces:**
- Produces: `FPS = 30`, `BPM = 120`, `beat(n, bpm?) → frames`, `bar(n, bpm?) → frames`, `ms(n) → frames`, `EASE.out`, `EASE.camera`.

- [ ] **Step 1: failing test**

```ts
// Run: node --test src/lib/beat.test.ts
import assert from "node:assert/strict"
import { test } from "node:test"

import { BPM, FPS, bar, beat, ms } from "./beat.ts"

test("120 BPM at 30 fps", () => {
  assert.equal(FPS, 30)
  assert.equal(BPM, 120)
  assert.equal(beat(1), 15)
  assert.equal(beat(12), 180)
  assert.equal(bar(1), 60)
  assert.equal(bar(30), 1800)
})

test("other tempos round to whole frames", () => {
  assert.equal(beat(1, 100), 18)
  assert.equal(bar(1, 100), 72)
})

test("ms rounds to whole frames", () => {
  assert.equal(ms(500), 15)
  assert.equal(ms(260), 8)
  assert.equal(ms(80), 2)
})
```

- [ ] **Step 2: run, expect failure** — `cd video && npm test` → "Cannot find module ./beat.ts".

- [ ] **Step 3: implement**

`video/src/lib/beat.ts`:

```ts
// Every duration in the film goes through here. Change BPM once when the
// track is chosen; scenes are written in beats and bars, not seconds.
export const FPS = 30
export const BPM = 120

export const beat = (n: number, bpm = BPM) => Math.round((n * 60 * FPS) / bpm)
export const bar = (n: number, bpm = BPM) => beat(n * 4, bpm)
export const ms = (n: number) => Math.round((n / 1000) * FPS)
```

`video/src/lib/ease.ts`:

```ts
import { Easing } from "remotion"

export const EASE = {
  out: Easing.bezier(0.2, 0.7, 0.2, 1), // arrivals
  camera: Easing.bezier(0.7, 0, 0.2, 1), // push / pull
  overshoot: Easing.out(Easing.back(1.4)), // hook words only
}
```

- [ ] **Step 4: run, expect pass** — `npm test` → 3 passing.

- [ ] **Step 5: Commit**

```bash
git add video/src/lib
git commit -m "Add beat and easing helpers for the launch film"
```

---

### Task 3: Move the iso primitives to `lib/iso.tsx`

**Files:**
- Create: `lib/iso.tsx`
- Modify: `components/bento.tsx:1-100` (delete the primitives, import them)

**Interfaces:**
- Produces: `type P3`, `iso(p)`, `Line({ a, b, className, style })`, `Poly({ pts, className, style })`, `Box({ x, y, z, w, d, h, className, style })`, `Ring({ cx, cy, z, r, style })`, `HI`, `DASH`. `style` is forwarded to every `<line>`/`<polygon>` so the video can drive `strokeDashoffset` and `opacity` by frame.

- [ ] **Step 1: create `lib/iso.tsx`** with the code currently at the top of `components/bento.tsx` (`P3`, `iso`, `stroke`, `HI`, `DASH`, `Line`, `Poly`, `Box`, `Ring`), exported, plus an optional `style?: React.CSSProperties` on `Line`, `Poly`, `Box`, `Ring` that is spread onto the SVG elements (`Box` passes it to its `Line`s and to its top `Poly`; `Ring` passes it to `Poly`). Keep `pathLength={1}` on solid lines and the `draw` class exactly as today.

- [ ] **Step 2: update `components/bento.tsx`**: delete the moved code, add `import { Box, DASH, HI, Line, Poly, Ring } from "@/lib/iso"`. `FIGS` and `CELLS` stay where they are.

- [ ] **Step 3: verify the landing is unchanged**

```bash
npm run typecheck && npm run lint && npm run build
```

Expected: all green. Open `http://localhost:3000/#features` (the user's dev server): the five figures draw in on reveal exactly as before.

- [ ] **Step 4: Commit**

```bash
git add lib/iso.tsx components/bento.tsx
git commit -m "Move the isometric primitives to lib/iso for reuse"
```

---

### Task 4: `time` prop on `ShaderBackground`

**Files:**
- Modify: `components/ui/shader-background.tsx`

**Interfaces:**
- Produces: `ShaderBackgroundProps.time?: number`. When set, the canvas draws that instant (seconds, ribbons at full amplitude) and redraws only when `time` changes. No rAF loop, no entrance animation.

- [ ] **Step 1: implement**

In the effect, keep the GL setup as is. Extract the body of `render` that draws one frame into `const draw = (t: number, rise: number) => { resize(); …the two passes… }`, and keep `render(now)` calling `draw(elapsed * speed, rise)` then scheduling rAF. Store `draw` on a ref: `drawRef.current = draw`. If `time !== undefined`: skip `canvas.style.animation`, skip the rAF loop and the ResizeObserver start (still call `resize()` once with the measured box), and `draw(time, 1)` once. Add a second effect:

```ts
useEffect(() => {
  if (time !== undefined) drawRef.current?.(time, 1)
}, [time])
```

Add `time` to the props type with the doc comment `/** Seconds. When set, renders that instant and never animates; for Remotion. */`. The first effect's dependency list must not include `time` (it recreates the GL context), so read it through a ref: `const timeRef = useRef(time); timeRef.current = time` and use `timeRef.current` inside the setup effect.

- [ ] **Step 2: verify**

```bash
npm run typecheck && npm run lint
```

Landing behavior unchanged (`time` is never passed there).

- [ ] **Step 3: Commit**

```bash
git add components/ui/shader-background.tsx
git commit -m "Let ShaderBackground render a fixed instant"
```

---

### Task 5: UI primitives (Camera, Text, Words, Window, Pill, Keycaps, Haze)

**Files:**
- Create: `video/src/ui/Camera.tsx`, `video/src/ui/Text.tsx`, `video/src/ui/Words.tsx`, `video/src/ui/Window.tsx`, `video/src/ui/Pill.tsx`, `video/src/ui/Keycaps.tsx`, `video/src/ui/Haze.tsx`

**Interfaces:**
- `Camera({ keys: Key[], easing?, children })` with `type Key = { frame: number; x?: number; y?: number; scale?: number }`. `x`, `y` are the point of interest in 0..1 frame coordinates (default 0.5) that ends up at the center; `scale` default 1. Keys sorted by frame; one key = static.
- `Rise({ text, start, stagger?, className, glow? })`: words slide up 0.35 em and fade in, `stagger` frames apart (default `ms(70)`), over `ms(350)`. `glow` marks words whose class gets the silver text-shadow.
- `Slide({ text, enter, exit?, from: "left" | "right", className })`: one word/phrase slides 1.2 em from `from` over `ms(260)` with overshoot, exits the opposite way over `ms(200)` from `exit`.
- `Words({ text, shown?, selected?, current?, className? })`: same semantics as the landing's `Words` (see `components/demo.tsx:52-100`), minus transitions and caret.
- `Window({ title, className?, style?, children })`: the desk-demo chrome.
- `Pill({ seconds, speed, className?, style? })`: play button, mono `mm:ss`, speed label, three static bars.
- `Keycaps({ keys: string[], className?, style? })`: chips rendered like `Cap` in `components/demo.tsx`.
- `Haze({ opacity?, seed? })`: `ShaderBackground` at `time = frame / FPS`, absolutely positioned bottom 60 % of the frame, masked to transparent at the top, default `opacity = 0.4`.

- [ ] **Step 1: Camera**

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion"
import { EASE } from "../lib/ease"

export type Key = { frame: number; x?: number; y?: number; scale?: number }

export function Camera({
  keys,
  easing = EASE.camera,
  children,
}: {
  keys: Key[]
  easing?: (t: number) => number
  children: React.ReactNode
}) {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()
  const at = (k: "x" | "y" | "scale", d: number) => {
    if (keys.length === 1) return keys[0][k] ?? d
    return interpolate(
      frame,
      keys.map((key) => key.frame),
      keys.map((key) => key[k] ?? d),
      { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    )
  }
  const x = at("x", 0.5)
  const y = at("y", 0.5)
  const s = at("scale", 1)
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${x * 100}% ${y * 100}%`,
        transform: `translate(${(0.5 - x) * width}px, ${(0.5 - y) * height}px) scale(${s})`,
      }}
    >
      {children}
    </AbsoluteFill>
  )
}
```

- [ ] **Step 2: Text (Rise, Slide)**

```tsx
import { interpolate, useCurrentFrame } from "remotion"
import { ms } from "../lib/beat"
import { EASE } from "../lib/ease"
import { cn } from "@/lib/utils"

export const GLOW = "[text-shadow:0_0_22px_rgba(197,197,197,.45)]"

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const

export function Rise({
  text,
  start,
  stagger = ms(70),
  className,
  glow = [],
}: {
  text: string
  start: number
  stagger?: number
  className?: string
  glow?: number[] // word indexes that get the silver glow
}) {
  const frame = useCurrentFrame()
  return (
    <span className={className}>
      {text.split(" ").map((w, i) => {
        const t = interpolate(frame, [start + i * stagger, start + i * stagger + ms(350)], [0, 1], { easing: EASE.out, ...clamp })
        return (
          <span key={i}>
            <span
              className={cn("inline-block", glow.includes(i) && GLOW)}
              style={{ opacity: t, transform: `translateY(${(1 - t) * 0.35}em)` }}
            >
              {w}
            </span>{" "}
          </span>
        )
      })}
    </span>
  )
}

export function Slide({
  text,
  enter,
  exit,
  from,
  className,
}: {
  text: string
  enter: number
  exit?: number
  from: "left" | "right"
  className?: string
}) {
  const frame = useCurrentFrame()
  const dir = from === "left" ? -1 : 1
  const tin = interpolate(frame, [enter, enter + ms(260)], [0, 1], { easing: EASE.overshoot, ...clamp })
  const tout = exit === undefined ? 0 : interpolate(frame, [exit, exit + ms(200)], [0, 1], { easing: EASE.out, ...clamp })
  if (frame < enter || tout >= 1) return null
  const x = dir * 1.2 * (1 - tin) - dir * 1.2 * tout
  return (
    <span
      className={cn("inline-block", className)}
      style={{ opacity: Math.min(tin * 2, 1) * (1 - tout), transform: `translateX(${x}em)` }}
    >
      {text}
    </span>
  )
}
```

- [ ] **Step 3: Words** — port of `components/demo.tsx` `Words`: same class logic for `` `code` `` words, `i < selected` (white 13 %), `i === current` (silver lamp `bg-primary/75 text-background`), no `transition-colors`, no `light`, no `caret`. Add `className` on the wrapping `<span>`.

- [ ] **Step 4: Window, Pill, Keycaps**

`Window.tsx`: the `CARD` constant and `Win` markup from `components/demo.tsx` without `absolute`, `transition-opacity`, `animate-in`. Props `title`, `className`, `style`, `children`. The title bar uses `text-[0.9em]`, so the caller sets the window's `fontSize` in px.

`Pill.tsx`:

```tsx
import { IconPlayerPauseFilled } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

export const PILL =
  "rounded-full bg-card shadow-[0_0_0_1px_#000,inset_0_1px_0_rgba(255,255,255,.08),0_1em_2.5em_rgba(0,0,0,.6)]"

const clock = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`

export function Pill({ seconds, speed, className, style }: { seconds: number; speed: string; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn(PILL, "flex h-[2.1em] items-center gap-[0.6em] pr-[0.9em] pl-[0.5em]", className)} style={style}>
      <span className="grid size-[1.4em] place-items-center rounded-full bg-primary text-background">
        <IconPlayerPauseFilled className="size-[0.6em]" />
      </span>
      <span className="font-mono text-[0.85em] text-muted-foreground tabular-nums">{clock(seconds)}</span>
      <span className="font-mono text-[0.85em] text-muted-foreground">{speed}</span>
      <span aria-hidden className="ml-[0.4em] flex h-[0.6em] items-end gap-[2px]">
        {[5, 8, 4].map((h, i) => (
          <i key={i} className="block w-[2px] rounded-[1px] bg-primary" style={{ height: `${h}px` }} />
        ))}
      </span>
    </div>
  )
}
```

`Keycaps.tsx`: `Cap` markup from `components/demo.tsx` in a `flex gap-[0.5em]` row, props `keys`, `className`, `style`.

- [ ] **Step 5: Haze**

```tsx
import { useCurrentFrame } from "remotion"
import { ShaderBackground } from "@/components/ui/shader-background"
import { FPS } from "../lib/beat"

export function Haze({ opacity = 0.4, seed = 7 }: { opacity?: number; seed?: number }) {
  const frame = useCurrentFrame()
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] [mask-image:linear-gradient(to_bottom,transparent,black_70%)]"
      style={{ opacity }}
    >
      <ShaderBackground className="absolute inset-0" time={frame / FPS} seed={seed} lines={4} amplitude={0.12} brightness={0.9} grain={0} />
    </div>
  )
}
```

- [ ] **Step 6: smoke composition**

Temporarily point `Launch60` at a `Smoke` component: `<AbsoluteFill className="bg-background"><Haze /><Camera keys={[{frame:0,scale:1},{frame:60,scale:2,x:.3,y:.6}]}><Window title="claude" className="absolute left-[300px] top-[200px] w-[1200px]" style={{fontSize:28}}><div className="p-8"><Words text="Select the text, hit one shortcut." selected={3} current={3} /></div></Window><Pill seconds={4} speed="1.25×" className="absolute left-[800px] top-[80px]" style={{fontSize:28}}/><Keycaps keys={["⌥","A"]} className="absolute left-[880px] top-[500px]" style={{fontSize:40}}/></Camera><h1 className="absolute left-[160px] bottom-[120px] text-[64px] font-semibold tracking-[-0.03em]"><Rise text="Listen instead." start={10} glow={[0,1]} /></h1></AbsoluteFill>`.

```bash
cd video && npx remotion still Launch60 --frame=45 out/smoke.png
```

Expected: silver ribbons at the bottom, the window zoomed toward (0.3, 0.6), lamp on "shortcut.", pill and keycaps rendered in the card style, "Listen instead." glowing. If the haze area is black, the GL renderer failed: replace `ShaderBackground` in `Haze` with `<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(197,197,197,.14),rgba(197,197,197,.05)_35%,transparent_65%)]" />` and note it in the commit.

- [ ] **Step 7: typecheck, remove the smoke composition, commit**

```bash
cd video && npm run typecheck
git add video/src/ui
git commit -m "Add frame-driven UI primitives for the launch film"
```

---

### Task 6: Hook scene

**Files:**
- Create: `video/src/scenes/Hook.tsx`
- Modify: `video/src/Root.tsx` (wire the scene into a temporary `Launch60` = `<Hook />`)

**Interfaces:**
- Produces: `Hook()` component, duration `beat(12)` = 180 frames, black at its last frame.

- [ ] **Step 1: implement**

```tsx
import { AbsoluteFill } from "remotion"
import { beat, ms } from "../lib/beat"
import { Camera } from "../ui/Camera"
import { Haze } from "../ui/Haze"
import { GLOW, Rise, Slide } from "../ui/Text"

export const HOOK = beat(12)
const WORDS = ["Your", "agent", "writes", "faster"]
const DISPLAY = "text-[200px] leading-none font-semibold tracking-[-0.04em]"

export function Hook() {
  return (
    <AbsoluteFill className="bg-background">
      <Haze />
      <Camera keys={[{ frame: beat(6), scale: 1, x: 0.5, y: 0.5 }, { frame: beat(12), scale: 2.4, x: 0.5, y: 0.6 }]}>
        <div className={`absolute inset-0 grid place-items-center ${DISPLAY}`}>
          {WORDS.map((w, i) => (
            <div key={w} className="col-start-1 row-start-1">
              <Slide text={w} enter={beat(i)} exit={i < 3 ? beat(i + 1) : beat(6)} from={i % 2 ? "right" : "left"} />
            </div>
          ))}
          <div className="col-start-1 row-start-1 text-center text-[96px] leading-[1.1] tracking-[-0.03em]">
            <div className="text-muted-foreground">
              <Rise text="than you can" start={beat(6)} stagger={ms(60)} />
            </div>
            <div>
              <Rise text="read." start={beat(6) + ms(180)} className={GLOW} />
            </div>
          </div>
        </div>
      </Camera>
    </AbsoluteFill>
  )
}
```

- [ ] **Step 2: stills**

```bash
cd video && for f in 8 30 75 100 150 179; do npx remotion still Launch60 --frame=$f out/hook-$f.png; done
```

Expected: 8 = "Your" sliding from the left with overshoot; 30 = "agent"; 75 = "faster" holding; 100 = "than you can / read." landed; 150 = "read." large, centered, glowing; 179 = still pushing, no clipping artifacts.

- [ ] **Step 3: Commit**

```bash
git add video/src/scenes/Hook.tsx video/src/Root.tsx
git commit -m "Add the hook scene"
```

---

### Task 7: Wall scene and `Stream`

**Files:**
- Create: `video/src/ui/Stream.tsx`, `video/src/scenes/Wall.tsx`

**Interfaces:**
- `Stream({ blocks, shown })`: renders `Block[]` from `@/components/transform-content` (`p`, `h`, `li`, `pre`) with the first `shown` words visible across blocks; `pre` counts as one word and renders in mono. Returns the words with `text-foreground` for `h`/labels and mono chips for inline code.
- `Wall()`, duration `beat(12)` = 180 frames. Exports `WALL`.

- [ ] **Step 1: Stream**

```tsx
import type { Block } from "@/components/transform-content"
import { Words } from "./Words"

const count = (b: Block) => (b.kind === "pre" ? 1 : ((b.label ? b.label + " " : "") + b.text).split(" ").length)

export function Stream({ blocks, shown }: { blocks: Block[]; shown: number }) {
  let offset = 0
  return (
    <div className="flex flex-col gap-[1em]">
      {blocks.map((b, i) => {
        const n = count(b)
        const local = Math.max(0, Math.min(n, shown - offset))
        offset += n
        if (local === 0) return null
        if (b.kind === "pre")
          return <pre key={i} className="rounded-[0.4em] bg-white/[0.06] p-[0.8em] font-mono text-[0.9em] whitespace-pre-wrap text-foreground">{b.text}</pre>
        const text = (b.label ? b.label + " " : "") + b.text
        return (
          <div key={i} className={b.kind === "h" ? "font-medium text-foreground" : b.kind === "li" ? "pl-[1.2em] before:content-['–'] before:-ml-[1.2em] before:mr-[0.5em]" : ""}>
            <Words text={text} shown={local} />
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Wall**

```tsx
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion"
import { SOURCE, plainText } from "@/components/transform-content"
import { beat } from "../lib/beat"
import { Camera } from "../ui/Camera"
import { Stream } from "../ui/Stream"
import { Window } from "../ui/Window"

export const WALL = beat(12)
const TOTAL = plainText(SOURCE).split(/\s+/).length

export function Wall() {
  const frame = useCurrentFrame()
  // Accelerating stream: slow first words, then faster than anyone reads.
  const shown = Math.floor(interpolate(frame, [0, beat(10)], [0, TOTAL], { easing: Easing.in(Easing.quad), extrapolateRight: "clamp" }))
  return (
    <AbsoluteFill className="bg-background">
      <Camera keys={[{ frame: 0, scale: 0.7, y: 0.45 }, { frame: WALL, scale: 1.15, y: 0.5 }]} easing={Easing.linear}>
        <Window title="claude" className="absolute left-[260px] top-[120px] w-[1400px]" style={{ fontSize: 30 }}>
          <div className="p-[1.4em] font-mono text-[0.95em] leading-[1.6] text-muted-foreground">
            <Stream blocks={SOURCE} shown={shown} />
          </div>
        </Window>
      </Camera>
      <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-b from-transparent to-background" />
      <div className="absolute left-[80px] bottom-[64px] font-mono text-[20px] tracking-[0.12em] text-muted-foreground uppercase tabular-nums">
        {shown} words · 00:{String(Math.floor(frame / 30)).padStart(2, "0")}
      </div>
    </AbsoluteFill>
  )
}
```

- [ ] **Step 3: stills** — wire `Launch60` to `<Wall />`, render frames 20, 90, 150, 179. Expected: the window grows from small to spilling out of the frame, text streams in accelerating, the bottom fade hides the spill, the counter ticks.

- [ ] **Step 4: Commit**

```bash
git add video/src/ui/Stream.tsx video/src/scenes/Wall.tsx video/src/Root.tsx
git commit -m "Add the wall scene"
```

---

### Task 8: Listen scene

**Files:**
- Create: `video/src/scenes/Listen.tsx`

**Interfaces:**
- `Listen({ duration })`: `duration` in frames (`beat(20)` = 300 in the master, `beat(16)` = 240 in the cut). Timeline inside, in local frames: sweep `beat(1)`–`beat(3)`, keycaps `beat(4)`, pill and lamp start `beat(6)`, lamp ends `duration - beat(2)`, title at `beat(10)`.

- [ ] **Step 1: implement**

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion"
import { PLAN } from "@/components/demo-content"
import { wordEnds } from "@/lib/word-ends"
import { beat, ms } from "../lib/beat"
import { EASE } from "../lib/ease"
import { Camera } from "../ui/Camera"
import { Haze } from "../ui/Haze"
import { Keycaps } from "../ui/Keycaps"
import { Pill } from "../ui/Pill"
import { Rise } from "../ui/Text"
import { Words } from "../ui/Words"
import { Window } from "../ui/Window"

const WORDS = PLAN.split(" ")
const ENDS = wordEnds(WORDS)
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const

export function Listen({ duration }: { duration: number }) {
  const frame = useCurrentFrame()
  const sweepStart = beat(1)
  const keysAt = beat(4)
  const lampStart = beat(6)
  const lampEnd = duration - beat(2)

  const selected = Math.floor(interpolate(frame, [sweepStart, sweepStart + WORDS.length * ms(22)], [0, WORDS.length], clamp))
  const lampT = interpolate(frame, [lampStart, lampEnd], [0, 1], clamp)
  const current = frame >= lampStart && frame < lampEnd ? ENDS.findIndex((end) => lampT < end) : -1
  const keyIn = interpolate(frame, [keysAt, keysAt + ms(150)], [0, 1], { easing: EASE.out, ...clamp })
  const keyOut = interpolate(frame, [keysAt + ms(700), keysAt + ms(700) + 8], [1, 0], clamp)
  const pillIn = interpolate(frame, [lampStart, lampStart + ms(300)], [0, 1], { easing: EASE.out, ...clamp })

  return (
    <AbsoluteFill className="bg-background">
      <Haze opacity={0.3} />
      <Camera keys={[{ frame: 0, scale: 1.3, y: 0.45 }, { frame: ms(800), scale: 1 }, { frame: duration, scale: 1.12, y: 0.42 }]}>
        <Window title="claude" className="absolute left-[360px] top-[250px] w-[1200px]" style={{ fontSize: 30 }}>
          <div className="p-[1.4em] leading-[1.6] text-muted-foreground">
            <Words text={PLAN} selected={frame < lampStart ? selected : 0} current={current} />
          </div>
        </Window>
        <Pill seconds={Math.max(0, (frame - lampStart) / 30)} speed="1.25×" className="absolute left-[1180px] top-[150px]" style={{ fontSize: 30, opacity: pillIn, transform: `translateY(${(1 - pillIn) * -20}px)` }} />
        <Keycaps keys={["⌥", "A"]} className="absolute left-[880px] top-[480px]" style={{ fontSize: 40, opacity: Math.min(keyIn, keyOut), transform: `scale(${1.2 - 0.2 * keyIn})` }} />
      </Camera>
      <h1 className="absolute left-[160px] bottom-[120px] text-[64px] leading-none font-semibold tracking-[-0.03em]">
        <Rise text="Listen instead." start={beat(10)} stagger={beat(0.5)} glow={[0, 1]} />
      </h1>
    </AbsoluteFill>
  )
}
```

- [ ] **Step 2: stills** — wire `Launch60` to `<Listen duration={300} />`, render 10, 35, 65, 100, 200, 299. Expected: pull-back settling; selection sweeping; keycaps over the window; pill in and lamp on an early word; lamp mid-text with title glowing; last frame lamp gone, slight push.

- [ ] **Step 3: Commit**

```bash
git add video/src/scenes/Listen.tsx video/src/Root.tsx
git commit -m "Add the listen scene"
```

---

### Task 9: Bento cells, figures, grid, and scene

**Files:**
- Create: `video/src/bento/cells.ts`, `video/src/bento/figures.tsx`, `video/src/bento/Grid.tsx`, `video/src/scenes/Bento.tsx`

**Interfaces:**
- `CELLS: { fig, col, span, row, label, title, text }[]` in the landing's order (everywhere 7, fast 5, words 4, chain 4, key 4), `GRID = { left: 160, top: 130, width: 1600, height: 820 }`, `poi(i) → { x, y }` normalized cell center.
- `Figure({ fig, t, idle })`: renders one figure; `t` is the local frame since the cell became active (draws over `ms(800)`, accent last), `idle` keeps the float/sweep looping.
- `Grid({ active, assembleFrom?, all? })`: renders the five cells at `GRID`; `active` index gets full opacity and the inset ring, others 0.38 (`all` = every cell full and idling); `assembleFrom` = frame at which cells start appearing, one per `ms(300)`.
- `Bento({ cut })`: master duration `beat(48)` = 720; cut duration `beat(20)` = 300 (5 × 60, no camera). Exports `BENTO`, `BENTO_CUT`, `VISIT` (135 frames), `ASSEMBLE` (30 frames).

- [ ] **Step 1: cells.ts**

```ts
export const GRID = { left: 160, top: 130, width: 1600, height: 820 }

export const CELLS = [
  { fig: "everywhere", col: 0, span: 7, row: 0, label: "Any app", title: "Works everywhere", text: "One global shortcut in any macOS app, fullscreen included. The player and the actions float over the app you're in." },
  { fig: "fast", col: 7, span: 5, row: 0, label: "Streaming", title: "Starts on the first bytes", text: "The voice starts as soon as OpenAI sends the first bytes back, not when the file is done." },
  { fig: "words", col: 0, span: 4, row: 1, label: "Read · ⌥A", title: "Word by word", text: "A transcript follows the voice and lights up each word as it's read." },
  { fig: "chain", col: 4, span: 4, row: 1, label: "Transform · ⌥T", title: "Three actions, chained", text: "Humanize, Translate, Summarize. Chain them, compare, paste the result over the original." },
  { fig: "key", col: 8, span: 4, row: 1, label: "Pro · One-time", title: "Pay once, bring your own key", text: "No subscription. OpenAI bills you cents per use on your own key." },
] as const

export type Fig = (typeof CELLS)[number]["fig"]

export const poi = (i: number) => {
  const c = CELLS[i]
  return {
    x: (GRID.left + ((c.col + c.span / 2) * GRID.width) / 12) / 1920,
    y: (GRID.top + (c.row + 0.5) * (GRID.height / 2)) / 1080,
  }
}
```

- [ ] **Step 2: figures.tsx** — five figures with the same geometry as `FIGS` in `components/bento.tsx`, using `Box`, `Line`, `Poly`, `Ring`, `HI`, `DASH` from `@/lib/iso`, inside the same `<svg viewBox="-150 -90 300 180" …>`. Drive everything with `t` (frames) and `idle`:
  - helper `draw(t, from, len) = clamp((t - from) / len, 0, 1)`; solid lines get `style={{ strokeDasharray: 1, strokeDashoffset: 1 - draw(...) }}`, accent (`HI`) lines start `ms(350)` later, faces and dashed lines get `style={{ opacity: draw(t, ms(700), ms(500)) }}`.
  - `everywhere`: the three planes draw in sequence (`ms(250)` apart); the floating box draws last and, when `idle`, translates by `Math.sin(t / 12) * 4` on y.
  - `fast`: bar `i` height = `h * draw(t, i * 2, ms(400))`; when `idle`, bars 0-1 pulse `±10 %` with `Math.sin(t / 8 + i)`.
  - `words`: plate then lines draw; the mark translates x from `-24` to `+40` on `draw(t, ms(800), ms(1200))`, looping when `idle`.
  - `chain`: box `i` scales in (`transform: scale`) at `i * 6` frames over `ms(300)` around its center; dashed connectors fade after; third box silver.
  - `key`: draws over `ms(800)`; `idle` = no motion. The scene shows the `19 €` counter next to it (in `Grid`, not here).
  Wrap `<svg>` in a `<g>` where needed for transforms, with `transform-box: fill-box; transform-origin: center` on scaled groups.

- [ ] **Step 3: Grid.tsx**

```tsx
import { interpolate, useCurrentFrame } from "remotion"
import { cn } from "@/lib/utils"
import { ms } from "../lib/beat"
import { EASE } from "../lib/ease"
import { Rise } from "../ui/Text"
import { CELLS, GRID } from "./cells"
import { Figure } from "./figures"

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const

export function Grid({ active, activeSince = 0, assembleFrom, all }: { active: number; activeSince?: number; assembleFrom?: number; all?: boolean }) {
  const frame = useCurrentFrame()
  // Cells appear in visiting order once assembly starts: the "words" cell first, then its neighbours.
  const order = [2, 0, 1, 3, 4]
  return (
    <div className="absolute grid grid-cols-12 grid-rows-2 gap-px bg-border" style={{ left: GRID.left, top: GRID.top, width: GRID.width, height: GRID.height }}>
      {CELLS.map((c, i) => {
        const on = all || i === active
        const t = assembleFrom === undefined ? 1 : interpolate(frame, [assembleFrom + order.indexOf(i) * ms(300), assembleFrom + order.indexOf(i) * ms(300) + ms(300)], [0, 1], { easing: EASE.out, ...clamp })
        const local = on ? frame - activeSince : 0
        return (
          <div
            key={c.fig}
            className={cn("relative grid grid-rows-[auto_1fr_auto] gap-[18px] bg-background px-[32px] pt-[28px] pb-[32px]", i === active && !all && "shadow-[inset_0_0_0_1px_rgba(197,197,197,.35)]")}
            style={{ gridColumn: `${c.col + 1} / span ${c.span}`, gridRow: c.row + 1, opacity: t * (on ? 1 : 0.38), transform: `scale(${0.96 + 0.04 * t})` }}
          >
            <div className="font-mono text-[20px] tracking-[0.12em] text-muted-foreground uppercase">{on ? <Rise text={c.label} start={activeSince} /> : c.label}</div>
            <div className="grid place-items-center">
              <Figure fig={c.fig} t={all ? 9999 : local} idle={all || frame - activeSince > ms(1200)} />
              {c.fig === "key" && on && <span className="mt-2 font-mono text-[24px] text-foreground tabular-nums">{Math.round(interpolate(local, [ms(800), ms(800) + 15], [0, 19], clamp))} €</span>}
            </div>
            <div>
              <div className="text-[28px] font-medium">{on ? <Rise text={c.title} start={activeSince + ms(80)} /> : c.title}</div>
              <p className="mt-1.5 max-w-[42ch] text-[24px] leading-[1.5] text-muted-foreground">{on ? <Rise text={c.text} start={activeSince + ms(160)} stagger={ms(20)} /> : c.text}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Bento.tsx**

```tsx
import { AbsoluteFill, useCurrentFrame } from "remotion"
import { beat, ms } from "../lib/beat"
import { Camera, type Key } from "../ui/Camera"
import { Grid } from "../bento/Grid"
import { poi } from "../bento/cells"

export const ASSEMBLE = beat(2)
export const VISIT = beat(9) // 4.5 s per cell
export const BENTO = beat(48)
export const VISIT_CUT = beat(4)
export const BENTO_CUT = 5 * VISIT_CUT
const ORDER = [0, 1, 2, 3, 4]

export function Bento({ cut }: { cut: boolean }) {
  const frame = useCurrentFrame()
  const visit = cut ? VISIT_CUT : VISIT
  const start = cut ? 0 : ASSEMBLE
  const i = Math.min(4, Math.max(0, Math.floor((frame - start) / visit)))
  const active = ORDER[i]
  const since = start + i * visit
  const keys: Key[] = cut
    ? [{ frame: 0, scale: 1 }]
    : [
        { frame: 0, scale: 1 },
        { frame: ASSEMBLE, scale: 1 },
        ...ORDER.flatMap((c, k) => [
          { frame: start + k * visit, scale: 1.6, ...poi(c) },
          { frame: start + (k + 1) * visit - ms(600), scale: 1.6, ...poi(c) },
        ]),
      ]
  return (
    <AbsoluteFill className="bg-background">
      <Camera keys={keys}>
        <Grid active={frame < start ? -1 : active} activeSince={since} assembleFrom={cut ? undefined : 0} />
      </Camera>
    </AbsoluteFill>
  )
}
```

Note: consecutive keys `{k: end - ms(600)}` → `{k+1: start}` make the 600 ms move; the pair `{start}`, `{end - ms(600)}` holds. The final hold runs to `BENTO` because `extrapolateRight` clamps.

- [ ] **Step 5: stills** — wire `Launch60` to `<Bento cut={false} />`, render 10, 25, 60, 200, 400, 560, 700; and `Launch30` to `<Bento cut />`, render 30, 150, 290. Expected: cells assembling; camera on "Works everywhere" with planes drawing; each later still on a different cell, others dimmed; the key cell shows `19 €`; cut stills at full grid size with the active ring moving.

- [ ] **Step 6: Commit**

```bash
git add video/src/bento video/src/scenes/Bento.tsx video/src/Root.tsx
git commit -m "Add the bento scene with frame-driven figures"
```

---

### Task 10: Breathe and Outro scenes

**Files:**
- Create: `video/src/scenes/Breathe.tsx`, `video/src/scenes/Outro.tsx`

**Interfaces:**
- `Breathe()`, duration `beat(16)` = 240. Exports `BREATHE`.
- `Outro()`, duration `beat(12)` = 180. Exports `OUTRO`.

- [ ] **Step 1: Breathe**

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion"
import { beat, ms } from "../lib/beat"
import { Camera } from "../ui/Camera"
import { Slide } from "../ui/Text"
import { Grid } from "../bento/Grid"
import { poi } from "../bento/cells"
import { cn } from "@/lib/utils"

export const BREATHE = beat(16)
const LINES = ["One shortcut.", "Any app.", "Your key."]
const AT = [beat(3), beat(3) + ms(900), beat(3) + ms(1800)]

export function Breathe() {
  const frame = useCurrentFrame()
  const fade = interpolate(frame, [BREATHE - 15, BREATHE], [1, 0], { extrapolateLeft: "clamp" })
  return (
    <AbsoluteFill className="bg-background">
      <Camera keys={[{ frame: 0, scale: 1.6, ...poi(4) }, { frame: beat(2), scale: 0.78, y: 0.42 }, { frame: BREATHE, scale: 0.76, y: 0.42 }]}>
        <div style={{ opacity: fade }}>
          <Grid active={-1} all />
        </div>
      </Camera>
      <div className="absolute inset-x-0 bottom-[90px] flex justify-center gap-[0.35em] text-[64px] leading-none font-semibold tracking-[-0.03em]" style={{ opacity: fade }}>
        {LINES.map((l, i) => (
          <Slide key={l} text={l} enter={AT[i]} from={i % 2 ? "right" : "left"} className={cn(i < 2 && frame >= AT[i + 1] ? "text-muted-foreground" : "text-foreground")} />
        ))}
      </div>
    </AbsoluteFill>
  )
}
```

- [ ] **Step 2: Outro**

```tsx
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion"
import { beat, ms } from "../lib/beat"
import { Haze } from "../ui/Haze"
import { Rise } from "../ui/Text"

export const OUTRO = beat(12)
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const

export function Outro() {
  const frame = useCurrentFrame()
  const logo = interpolate(frame, [0, ms(500)], [0, 1], clamp)
  const haze = interpolate(frame, [beat(8), beat(12)], [0.4, 0], clamp)
  return (
    <AbsoluteFill className="bg-background">
      <Haze opacity={haze} seed={3} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[28px]">
        <Img src={staticFile("kairo-lockup-dark.png")} style={{ height: 96, opacity: logo }} />
        <div className="text-[32px] text-muted-foreground">
          <Rise text="Free on macOS · Pro 19 € lifetime" start={beat(2)} stagger={ms(40)} glow={[]} />
        </div>
        <div className="font-mono text-[22px] tracking-[0.12em] text-muted-foreground uppercase">
          <Rise text="kairoagent.io" start={beat(3)} />
        </div>
      </div>
    </AbsoluteFill>
  )
}
```

Make "Free on macOS" read as snow: wrap the first three words of the price line in `text-foreground` by rendering two `Rise`s side by side (`Free on macOS` snow at `beat(2)`, `· Pro 19 € lifetime` muted at `beat(2) + ms(120)`).

- [ ] **Step 3: stills** — `Launch60` = `<Breathe />`: frames 10, 40, 100, 150, 235; `<Outro />`: frames 10, 60, 120, 179. Expected: pull-out to the whole grid, three lines landing left/right/left with the older ones muted, grid fading at the end; lockup fading in, price and URL rising, haze gone on the last frame.

- [ ] **Step 4: Commit**

```bash
git add video/src/scenes/Breathe.tsx video/src/scenes/Outro.tsx video/src/Root.tsx
git commit -m "Add the breathe and outro scenes"
```

---

### Task 11: Compositions, cut, stills and render

**Files:**
- Modify: `video/src/Root.tsx`

**Interfaces:**
- `Film({ cut })` stacks the scenes; `Launch60` = `cut: false`, `Launch30` = `cut: true`.

- [ ] **Step 1: Root**

```tsx
import { loadFont } from "@remotion/fonts"
import { AbsoluteFill, Composition, Sequence, staticFile } from "remotion"
import { beat } from "./lib/beat"
import { Hook, HOOK } from "./scenes/Hook"
import { Wall, WALL } from "./scenes/Wall"
import { Listen } from "./scenes/Listen"
import { Bento, BENTO, BENTO_CUT } from "./scenes/Bento"
import { Breathe, BREATHE } from "./scenes/Breathe"
import { Outro, OUTRO } from "./scenes/Outro"
import "./style.css"

loadFont({ family: "Geist Variable", url: staticFile("geist-latin-wght-normal.woff2"), weight: "100 900" })

// Scene list per cut; `from` is derived so a scene's duration is declared once.
function scenes(cut: boolean) {
  const list = cut
    ? [
        { key: "hook", d: HOOK, el: <Hook /> },
        { key: "listen", d: beat(16), el: <Listen duration={beat(16)} /> },
        { key: "bento", d: BENTO_CUT, el: <Bento cut /> },
        { key: "outro", d: OUTRO, el: <Outro /> },
      ]
    : [
        { key: "hook", d: HOOK, el: <Hook /> },
        { key: "wall", d: WALL, el: <Wall /> },
        { key: "listen", d: beat(20), el: <Listen duration={beat(20)} /> },
        { key: "bento", d: BENTO, el: <Bento cut={false} /> },
        { key: "breathe", d: BREATHE, el: <Breathe /> },
        { key: "outro", d: OUTRO, el: <Outro /> },
      ]
  let from = 0
  return list.map((s) => ({ ...s, from: (from += s.d) - s.d }))
}

export const total = (cut: boolean) => scenes(cut).reduce((n, s) => n + s.d, 0)

function Film({ cut }: { cut: boolean }) {
  return (
    <AbsoluteFill className="bg-background font-sans text-foreground antialiased">
      {scenes(cut).map((s) => (
        <Sequence key={s.key} name={s.key} from={s.from} durationInFrames={s.d}>
          {s.el}
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}

export function Root() {
  return (
    <>
      <Composition id="Launch60" component={Film} defaultProps={{ cut: false }} durationInFrames={total(false)} fps={30} width={1920} height={1080} />
      <Composition id="Launch30" component={Film} defaultProps={{ cut: true }} durationInFrames={total(true)} fps={30} width={1920} height={1080} />
    </>
  )
}
```

- [ ] **Step 2: durations add up** — add to `beat.test.ts`? No: `Root` imports React and CSS. Instead check in the Studio: `Launch60` shows 1800 frames, `Launch30` shows 900. If not, a scene constant is off; fix the constant, not the total.

- [ ] **Step 3: stills and render**

```bash
cd video && npm run stills && npm run render
```

Expected: `out/stills/*.png` at every scene boundary (no black frame except hook end and outro end, no clipped text), `out/launch-60.mp4` (60 s) and `out/launch-30.mp4` (30 s) play in QuickTime.

- [ ] **Step 4: landing still green**

```bash
npm run typecheck && npm run lint && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add video/src/Root.tsx
git commit -m "Wire the launch film compositions and the 30 s cut"
```

---

## Self-review

- **Spec coverage.** Hook (T6), wall (T7), listen (T8), bento with assembly, camera visits, five figures, `19 €` (T9), breathe (T10), outro (T10), 30 s cut (T9, T11), beat helpers (T2), type sizes (in each scene), haze rules (T5, used only in hook, listen, outro), no cross-fades (only the breathe→outro fade), iso refactor (T3), shader `time` (T4), stills and render scripts (T1, T11), landing excluded from `video/` (T1). Gap: the spec's "window shrinks into the Word by word cell" is replaced by cells assembling from that cell outward (noted in T9). Music track: not in scope until a file exists; `<Audio>` is one line to add in `Film`.
- **Placeholders.** None; T5 Step 3 and T9 Step 2 describe ports of code that lives in the repo, with the exact source lines.
- **Type consistency.** `Camera` `Key` used in T6–T10 matches T5. `Listen({ duration })` in T8 and T11. `Bento({ cut })`, `BENTO`, `BENTO_CUT` in T9 and T11. `Grid({ active, activeSince, assembleFrom, all })` in T9 and T10. `Rise`/`Slide` props consistent across T5–T10.
