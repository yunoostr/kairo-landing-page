# Kairo — Style Reference

&gt; A quiet reading room in the dark

**Theme:** dark (only — no light mode)

Kairo is a macOS utility that reads selected text aloud and transforms it with AI, so its interface has two very different lives: a fixed 800×600 settings window, and a family of small floating panels that hover over _other people's apps_. Both share one voice — a strictly achromatic dark palette built on the shadcn neutral scale. The canvas is near-black (#0a0a0a), content lifts to graphite cards (#171717), and interactive fills step once more to #262626. There is no brand accent color: the "primary" is a light silver (#c5c5c5) that reads as _emphasis_, not _color_, so the app never competes with the document underneath it. The only chroma in the system is semantic — one green dot for "connected", one soft red for errors — and it is never decorative. Typography is Geist Variable everywhere, small (14px is the workhorse) and calm (500 for labels, 600 only for the page title and keycaps). The main window is flat and borderless; the floating windows are the opposite: fully rounded pills and 14px cards that cast their own CSS shadow because the native window around them is transparent. Every surface is designed to be glanced at, then forgotten.

## Stack

| Layer           | Library                                                                     | Notes                                                                                                                                                        |
| --------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Components      | **shadcn/ui** — style `base-nova`, base color `neutral` (`components.json`) | Copied into `src/components/ui/`; edit them there. Built on **Base UI** (`@base-ui/react`), not Radix — use the `render` prop for composition, not `asChild` |
| Extra registry  | **AI Elements** (`@ai-elements`)                                            | `src/components/ai-elements/voice-selector.tsx` comes from `https://ai-sdk.dev/elements`; add via `pnpm dlx shadcn add @ai-elements/&lt;name&gt;`                  |
| Icons           | **Tabler Icons** (`@tabler/icons-react`)                                    | Stroke icons, `size-4` (16px) by default, `currentColor`. Declared as `iconLibrary` in `components.json`, so `shadcn add` pulls Tabler variants              |
| Styling         | **Tailwind v4** + `tw-animate-css`                                          | Tokens live in `src/index.css` (`@theme inline`), no `tailwind.config`. Conditional classes go through `cn()` (`clsx` + `tailwind-merge`)                    |
| Variants        | `class-variance-authority`                                                  | `buttonVariants`, `alertVariants`, `itemVariants`                                                                                                            |
| Command palette | `cmdk`                                                                      | Underlies `Command` and the voice selector search                                                                                                            |
| Loaders         | `@dot-loaders/react`                                                        | The `star-two` loader in the actions result card                                                                                                             |
| Font            | `@fontsource-variable/geist`                                                | Self-hosted Geist Variable                                                                                                                                   |

Rule from `CONVENTIONS.md`: reach for a shadcn/ui component before writing custom UI, and never add a new dependency for what a few lines can do.

## Tokens — Colors

All colors are defined in `src/index.css` as shadcn semantic variables (oklch). Hex values below are the sRGB equivalents.

| Name            | Value                                           | Token                                                 | Role                                                                                                                  |
| --------------- | ----------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Ink Canvas      | `#0a0a0a` · `oklch(0.145 0 0)`                  | `--background`                                        | Main window page background; the "Before / After" toggle track inside floating cards                                  |
| Graphite Card   | `#171717` · `oklch(0.205 0 0)`                  | `--card` `--popover` `--sidebar`                      | Sidebar, settings cards, every floating panel (player pill, actions pill, result card, transcript)                    |
| Slate Fill      | `#262626` · `oklch(0.269 0 0)`                  | `--secondary` `--muted` `--accent` `--sidebar-accent` | Active sidebar item, hover rows, `kbd` keycaps, secondary buttons, breadcrumb chip                                    |
| Silver Primary  | `#c5c5c5`                                       | `--primary` `--ring` `--sidebar-primary`              | Default (filled) button, focus ring, current-word highlight at 75% opacity, permission-helper arrow                   |
| Ash Muted Text  | `#a1a1a1` · `oklch(0.708 0 0)`                  | `--muted-foreground`                                  | Descriptions, helper lines, timestamps, inactive nav items, breadcrumb labels                                         |
| Snow Text       | `#fafafa` · `oklch(0.985 0 0)`                  | `--foreground` `--card-foreground`                    | Primary text, icons, active nav item                                                                                  |
| Hairline Border | `rgba(255,255,255,0.10)` · `oklch(1 0 0 / 10%)` | `--border` `--sidebar-border`                         | Sidebar right edge, card footer dividers, the connected-key row outline                                               |
| Input Border    | `rgba(255,255,255,0.15)` · `oklch(1 0 0 / 15%)` | `--input`                                             | Input and outline-button strokes; outline button fill at 30%                                                          |
| Signal Green    | `#00d492` · `oklch(0.765 0.177 163.223)`        | `--success`                                           | Only for "connected / granted" state: the 8px dot next to the masked API key, the check icon in the permission helper |
| Soft Red        | `#ff6467` · `oklch(0.704 0.191 22.216)`         | `--destructive`                                       | Error text under forms, retryable errors, the "Remove key" ghost button label                                         |

Chart tokens (`--chart-1…5`) exist from the shadcn preset but are a grayscale ramp (#d4d4d4 → #262626) and are unused.

## Tokens — Typography

### Geist Variable — the only typeface. Loaded via `@fontsource-variable/geist`; `--font-sans` and `--font-heading` both resolve to it. Kairo uses one family at three weights and lets size and color do the hierarchy · `--font-sans`

- **Substitute:** Inter
- **Weights:** 400, 500, 600
- **Sizes:** 12px, 14px, 16px, 30px
- **Line height:** 1.00 (`leading-5` chips) – 1.625 (`leading-relaxed` transcript and results)
- **Letter spacing:** −0.025em on the 30px page title (`tracking-tight`), 0 elsewhere
- **Role:** Everything — nav, labels, body, buttons, inputs, floating panels. 14px/500 is the default label voice; 14px/400 muted is the default description voice. 600 is reserved for the page `h1` and `kbd` keycaps.

### System Mono — numeric and code-like values · `font-mono` (Tailwind default stack: ui-monospace, SFMono-Regular, Menlo…)

- **Substitute:** Geist Mono, JetBrains Mono
- **Weights:** 400, 500 (inherits)
- **Sizes:** 12px, 14px
- **Role:** Elapsed time `00:46` and speed `1.25×` in the player (always with `tabular-nums`), the masked API key `sk-…`, the speed preset buttons, the chain breadcrumb, language codes (`FR`, `EN`) in uppercase.

### Type Scale

| Role       | Size | Line Height | Weight    | Token / class                                                                              |
| ---------- | ---- | ----------- | --------- | ------------------------------------------------------------------------------------------ |
| caption    | 12px | 1.33        | 400 / 500 | `text-xs` — timestamps, day-group headers, notices, breadcrumb                             |
| body       | 14px | 1.43        | 400       | `text-sm` — descriptions, history rows, result text (`leading-relaxed` = 1.625 in results) |
| label      | 14px | 1.43        | 500       | `text-sm font-medium` — card titles (`h2`), nav items, buttons, item titles                |
| keycap     | 14px | 1.43        | 600       | `text-sm font-semibold` — `kbd` chips                                                      |
| transcript | 16px | 1.625       | 400       | `text-base leading-relaxed` — the read-along transcript panel                              |
| page-title | 30px | 1.2         | 600       | `text-3xl font-semibold tracking-tight` — one per page                                     |

There is no heading between 14px and 30px. Section titles inside cards are 14px/500 — the card itself provides the hierarchy.

## Tokens — Spacing &amp; Shapes

**Base unit:** 4px (Tailwind default scale)

**Density:** compact — this is a utility, not a marketing page

### Spacing Scale

| Name | Value | Token                | Where                                                                           |
| ---- | ----- | -------------------- | ------------------------------------------------------------------------------- |
| 1    | 4px   | `gap-1` `p-1`        | Nav list gap, keycap gap, actions-pill chip gap                                 |
| 1.5  | 6px   | `p-1.5` `gap-1.5`    | Actions pill inner padding, keycap vertical padding                             |
| 2    | 8px   | `gap-2` `p-2`        | Floating-window outer padding and stack gap, form button gap                    |
| 2.5  | 10px  | `px-2.5` `py-2.5`    | Keycap horizontal padding, history-row vertical padding, default button padding |
| 3    | 12px  | `p-3` `px-3` `gap-3` | Sidebar padding, nav-item horizontal padding, pill padding, card element gap    |
| 4    | 16px  | `py-4` `p-4` `gap-4` | Card vertical padding, result-card padding, row gap                             |
| 5    | 20px  | `px-5`               | Card horizontal padding                                                         |
| 6    | 24px  | `gap-6`              | Gap between sections on a page                                                  |
| 8    | 32px  | `px-8`               | Page horizontal padding                                                         |
| 10   | 40px  | `py-10` `pt-10`      | Page vertical padding; sidebar top clearance for macOS traffic lights           |

### Border Radius

`--radius: 0.625rem` (10px). The shadcn scale derives from it.

| Element                                                                | Value  | Class          |
| ---------------------------------------------------------------------- | ------ | -------------- |
| word highlight                                                         | 6px    | `rounded-sm`   |
| keycaps, breadcrumb chips, small buttons                               | 8px    | `rounded-md`   |
| buttons, inputs, nav items, history rows, alerts                       | 10px   | `rounded-lg`   |
| cards (settings sections, floating result card, transcript)            | 14px   | `rounded-xl`   |
| permission helper                                                      | 18px   | `rounded-2xl`  |
| player bar, actions pill, chip buttons, floating notices, icon buttons | 9999px | `rounded-full` |

Rule of thumb: **10px in the main window, pill in the floating windows.** The same `Button` component is used in both — floating usages add `className="rounded-full"`.

### Layout

- **Main window:** 800×600, not resizable, overlay title bar with hidden title; the whole non-interactive surface is a drag region
- **Sidebar width:** 176px (`w-44`), 12px padding, 40px top padding
- **Content column max-width:** 672px (`max-w-2xl`), centered, 32px horizontal / 40px vertical page padding
- **Section gap:** 24px
- **Card padding:** 20px horizontal / 16px vertical
- **Player window:** 380×260, transparent, no decorations, no native shadow
- **Actions window:** 520×400, transparent, no decorations, no native shadow
- **Floating content padding:** 8px outer, 8px stack gap

## Components

### Sidebar Nav Item

**Role:** Primary navigation between the four pages (Home, Text to Speech, Shortcuts, Settings)

Full-width button, 10px radius, 12px horizontal / 8px vertical padding, 14px Geist weight 500, 16px Tabler icon with 10px gap. Inactive: `text-muted-foreground`, hover `bg-sidebar-accent/50` + `text-foreground`. Active: `bg-sidebar-accent` (#262626) with full foreground, marked `aria-current="page"`. No indicator bar, no icon color change — the fill is the whole state.

### Page Header

**Role:** One per page, anchors the content column

`h1` at 30px weight 600 `tracking-tight`, followed by a 14px muted description with 4px top margin. Never a divider under it; the 24px gap to the first card is the separation.

### Settings Card

**Role:** Groups one setting or one shortcut

`section` with `bg-card` (#171717), 14px radius, 20px/16px padding, no border, no shadow. Inside: `h2` at 14px/500, description at 14px/400 muted with 2px top margin, then the control with 12px top margin (`mt-3`). Controls stretch full width (`w-full`, 36px tall `h-9`, 14px radius) when they are the card's only input.

### Keycap Chip (`kbd`)

**Role:** Displays a shortcut part (⌥, A, Esc)

`bg-secondary` (#262626), 8px radius, 10px horizontal / 6px vertical padding, 14px Geist weight 600. Parts sit in a flex row with 4px gap. Clicking the chip group on the Shortcuts page enters recording mode, replacing the chips with "Press shortcut…" in muted 14px.

### History Row

**Role:** A past reading, replayable

Full-width button, 10px radius, 12px/10px padding, 16px gap, hover `bg-accent`. Text truncates at 14px; a 12px muted timestamp on the right swaps for a filled 16px play icon on hover (`group-hover`). Rows are grouped under 12px/500 muted day labels ("Today", "Yesterday") with 4px gap between rows.

### Button — default

**Role:** The single primary action in a context (Save, Listen, Pause)

`bg-primary` (#c5c5c5) with dark text `text-primary-foreground` (#171717), hover 80% opacity, 32px tall (`h-8`), 10px horizontal padding, 14px weight 500, 10px radius (pill in floating windows). Focus: 3px `ring-ring/50` silver ring. Active state nudges down 1px. Disabled at 50% opacity.

### Button — outline

**Role:** Secondary choice, unselected option in a segmented group

Transparent-ish fill `bg-input/30`, 1px `border-input` stroke, hover `bg-input/50`. Same metrics as default. Used for "Cancel", "Replace key", unselected speed presets, and the voice-selector trigger.

### Button — ghost

**Role:** Tertiary and icon-only actions

No fill, no border; hover `bg-muted/50`. Icon sizes: `icon` 32px, `icon-xs` 24px with a 12px glyph. In floating windows always `rounded-full`. Used for −/+ speed steppers, Close (×), Copy, breadcrumb segments.

### Speed Segmented Group

**Role:** Pick one of 0.75 / 1 / 1.25 / 1.5 / 2×

Five equal-width buttons (`flex-1`) with 8px gap; the selected one is `default` (silver fill), the others `outline`. Labels in mono with `tabular-nums`, `aria-pressed` on the active one.

### Player Bar

**Role:** Floating transport control shown top-center of the cursor's screen while reading

Horizontal pill: `bg-card`, `rounded-full`, 12px horizontal / 8px vertical padding, 12px gap, `shadow-lg`. Contents left to right: 32px filled pill play/pause button (spinner while loading, replay icon when finished), mono `00:46` at 14px, a −/+ stepper around a mono 12px `1.25×` with a 44px min-width, and a 24px ghost close button. Errors replace the bar with a `rounded-full bg-card px-4 py-2` 14px message; notices appear below as a 12px muted pill.

### Transcript Panel

**Role:** Read-along text under the player

`bg-card/95`, 14px radius, 12px padding, 16px text at `leading-relaxed`, max height 112px (`max-h-28`), scrolls to keep the current word centered. The current word gets `bg-primary/75` on a 6px radius — silver, not a color, so the highlight reads as a lamp moving across the text.

### Actions Pill

**Role:** Floating AI action chooser (Humanize · Translate · Summarize)

`bg-card rounded-full p-1.5 shadow-lg` holding `size="sm"` (28px) `rounded-full` chip buttons with a 14px Tabler icon and label, 4px gap, plus a 24px ghost close button. The active action is `default` (silver), the rest `ghost`. Tooltips (300ms delay) explain each action beneath.

### Result Card

**Role:** Streams and holds the transformed text

`bg-card rounded-xl p-4 shadow-lg`, vertical stack with 12px gap: a mono 12px breadcrumb of the chain (`Original › Translate FR › Summarize`, current step as a 20px-tall `bg-secondary` chip, future steps at 50% opacity), the result at 14px `leading-relaxed` capped at 176px with auto-scroll and a floating "jump to newest" button, then a footer separated by a hairline `border-t` with 12px top padding: **Listen** (default pill), **Replace** and **Then ▾** (secondary pills), **Copy** (ghost pill, right-aligned). A "Before / After" toggle sits in a `bg-background rounded-full p-0.5` track when done.

### Alert

**Role:** Guidance that isn't a failure (missing API key)

10px radius, hairline border, 10px/8px padding, 14px text, icon in a 2-column grid. Rendered on `bg-muted/40` inside the result card so it reads as a calm note rather than red error text. Contains an underlined "Open Settings" text button.

### Input

**Role:** Text entry (API key)

32px tall (`h-8`, bumped to `h-9 rounded-xl` in settings cards), 1px `border-input`, `bg-input/30`, 10px horizontal padding, 14px text, muted placeholder, 3px silver focus ring, red border + ring on `aria-invalid`. Secret fields use `font-mono` and `type="password"`.

### Permission Helper

**Role:** Tiny always-on-top hint next to System Settings' Accessibility list

Full-height card: `bg-card rounded-2xl px-4 py-3 shadow-xl`, 14px/500 title with 12px muted subtitle, a 20px silver arrow icon pointing down, 24px ghost close. Once granted, the arrow becomes a 20px `text-success` check.

### Tooltip

**Role:** One-line hint under floating chips

Inverted: `bg-foreground` (#fafafa) with dark text, 8px radius, 12px text, small rotated-square arrow. The only light-on-dark surface in the app; used sparingly and only in the actions window.

## Do's and Don'ts

### Do

- Keep the whole palette achromatic — background #0a0a0a, cards #171717, fills #262626, text #fafafa / #a1a1a1, and silver #c5c5c5 for the one emphasized action
- Use `bg-card` with `rounded-xl` and `px-5 py-4` for every settings section; no border, no shadow, no header divider
- Use `font-medium` (500) for labels and titles, `font-semibold` (600) only for the page `h1` and `kbd` keycaps
- Write descriptions at 14px in `text-muted-foreground` directly under a 14px/500 title with `mt-0.5`
- Make floating windows pill-shaped (`rounded-full`) or 14px cards, and give them `shadow-lg` — the native window has no shadow, the content must cast its own
- Use `font-mono tabular-nums` for anything that ticks or is a code: elapsed time, speed, masked key, language code
- Reach for shadcn/ui primitives (`Button`, `Input`, `Select`, `DropdownMenu`, `Tooltip`, `Alert`, `Item`) and Tabler icons at `size-4` before writing custom UI
- Reserve `--success` for a confirmed state and `--destructive` for an error the user can act on

### Don't

- Do not introduce an accent color — no blue, purple, or orange buttons; if something needs to stand out, use the silver `default` button variant
- Do not use `--success` or `--destructive` decoratively (icons, badges, backgrounds) — they are state signals only
- Do not add borders or shadows to cards in the main window; the graphite-on-ink step is the elevation
- Do not use `font-bold` (700) anywhere, or `text-xl`/`text-2xl` intermediate headings — the scale is 12 / 14 / 16 / 30
- Do not use sharp or 10px corners on floating controls; anything in the player or actions windows is `rounded-full` or `rounded-xl`
- Do not use pure white `#ffffff` for text — `--foreground` is #fafafa
- Do not build a light theme or theme toggle; `.dark` variant exists in CSS but the app is dark-only by design
- Do not add page-level scrollbars in floating windows (`html.transparent-window` hides overflow); inner panels scroll on their own

## Surfaces

| Level | Name           | Value         | Purpose                                                                     |
| ----- | -------------- | ------------- | --------------------------------------------------------------------------- |
| 0     | Ink Canvas     | `#0a0a0a`     | Main window background; toggle tracks inside floating cards                 |
| 1     | Graphite Card  | `#171717`     | Sidebar, settings cards, popovers, every floating panel                     |
| 2     | Slate Fill     | `#262626`     | Active nav, hover rows, keycaps, secondary buttons, chips                   |
| 3     | Silver Primary | `#c5c5c5`     | Filled primary button, word highlight (75%), focus ring                     |
| —     | Transparent    | `transparent` | Floating window `html`/`body` — the desktop shows through around the panels |

## Elevation

Two regimes. In the **main window** there are no shadows at all: the sidebar is separated by a 10%-white hairline, and cards lift from the canvas by one value step (#0a0a0a → #171717). Hover and active states step once more to #262626. In the **floating windows** the native macOS window is transparent with `shadow(false)`, so each panel draws its own `shadow-lg` (Tailwind: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`); the permission helper uses `shadow-xl`. The transcript panel is `bg-card/95` so a hint of the document beneath shows through. Tooltips invert to `bg-foreground` and are the only "brighter than the card" surface.

## Imagery

None. Kairo has no photography, no illustration, no empty-state artwork. The brand mark is a geometric black-and-white glyph (`public/kairo-glyph.svg`, an interlocking K built from 45° cuts on a 256 grid) and a horizontal lockup (`kairo-lockup-dark.png`, rendered at 28px tall in the sidebar). Iconography is Tabler (`@tabler/icons-react`), stroke style, 16px by default (`size-4`), 14px in hints, 20px in the permission helper, always `currentColor`. The only pictorial elements are five 20×14px inline SVG flags (FR, EN, ES, DE, IT) in the language selector, clipped to a 3px radius with a 10% foreground ring — the one place real color appears, and it is data, not decoration. Loading is a `@dot-loaders/react` "star-two" dot loader in muted text, or Tabler's spinning `IconLoader2`.

## Layout

**Main window** — a fixed 800×600 macOS window with an overlay title bar and hidden title; the traffic lights float over the sidebar, which pads 40px at the top to clear them. Left: a 176px sidebar (`bg-sidebar`, right hairline) with the lockup and four nav items. Right: a scrollable `main` with 32px/40px padding holding a centered 672px column: page header, then a vertical stack of cards at 24px gap. No router, no breadcrumbs, no footer. The entire non-interactive surface is a window drag region.

**Floating windows** — three transparent, non-activating, always-on-top panels positioned top-center of the cursor's screen: the **player** (380×260: pill bar, optional notice pill, transcript card stacked right-aligned at 8px gap), the **actions** window (520×400: actions pill, then a full-width result card stacked centered at 8px gap), and the **permission** helper (a single full-height rounded card). They overlay other apps, including fullscreen ones, and never take focus.

## Agent Prompt Guide

**Quick Color Reference**

- Background (canvas): #0a0a0a `bg-background`
- Card surface: #171717 `bg-card` / `bg-sidebar`
- Interactive fill: #262626 `bg-secondary` / `bg-muted` / `bg-accent`
- Primary text: #fafafa `text-foreground`
- Muted text: #a1a1a1 `text-muted-foreground`
- Border: rgba(255,255,255,0.10) `border-border`; inputs 0.15 `border-input`
- Primary action: #c5c5c5 `bg-primary` with `text-primary-foreground` (#171717)
- Success (state only): #00d492 `text-success` / `bg-success`
- Error (state only): #ff6467 `text-destructive`

**Example Component Prompts**

1. Create a settings card: `&lt;section className="rounded-xl bg-card px-5 py-4"&gt;` with an `h2` at `text-sm font-medium`, a description `p` at `mt-0.5 text-sm text-muted-foreground`, and the control below at `mt-3 w-full h-9 rounded-xl`. No border, no shadow.

2. Create a sidebar nav item: `&lt;button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium"&gt;` with a Tabler icon at `size-4`. Inactive: `text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground`. Active: `bg-sidebar-accent` and `aria-current="page"`.

3. Create a keycap chip: `&lt;kbd className="rounded-md bg-secondary px-2.5 py-1.5 text-sm font-semibold"&gt;⌥&lt;/kbd&gt;`, siblings in a `flex gap-1` row.

4. Create a floating pill bar: `&lt;div className="flex items-center gap-3 rounded-full bg-card px-3 py-2 text-card-foreground shadow-lg"&gt;` containing `&lt;Button size="icon" className="rounded-full"&gt;` for the primary control, `font-mono text-sm tabular-nums` readouts, and `&lt;Button size="icon-xs" variant="ghost" className="rounded-full"&gt;` for secondary controls.

5. Create a floating result card: `&lt;div className="flex w-full flex-col gap-3 rounded-xl bg-card p-4 text-card-foreground shadow-lg"&gt;`; body text `text-sm leading-relaxed whitespace-pre-wrap max-h-44 overflow-y-auto`; footer `flex items-center gap-2 border-t border-border pt-3` with `size="sm" className="rounded-full"` buttons — one `default`, the rest `secondary`, the last `ghost ml-auto`.

6. Create an inline form: `&lt;form className="mt-3 flex gap-2"&gt;` with `&lt;Input className="h-9 rounded-xl font-mono" type="password" placeholder="sk-…" /&gt;`, a `&lt;Button type="submit"&gt;Save&lt;/Button&gt;` and an optional `&lt;Button variant="outline"&gt;Cancel&lt;/Button&gt;`; errors as `&lt;p role="alert" className="mt-2 text-sm text-destructive"&gt;`.

7. Create a connected-state row: `&lt;div className="flex items-center gap-3 rounded-xl border px-3 py-2.5"&gt;` with `&lt;span className="size-2 rounded-full bg-success" /&gt;`, a `font-mono text-sm` value, a `text-sm text-muted-foreground` status word, a flex spacer, and `size="sm"` outline/ghost buttons on the right.

## Typography Philosophy

One family, three weights, four sizes. Geist Variable was chosen for its neutral, slightly technical geometry: it looks at home next to a monospaced timer and inside a 28px pill. Hierarchy is carried almost entirely by _color_ (foreground vs. muted) and _weight_ (500 vs. 400) at the same 14px size, which keeps cards short and lets the floating panels stay small enough to sit over someone else's document without covering it. The single large moment is the 30px page title at 600 with tight tracking — the only place the app raises its voice, once per page. Everything numeric is monospaced with tabular figures so the player readouts never jitter as they tick. The result is a voice that is present, precise, and easy to ignore — which for a tool that lives on top of your other windows is the highest compliment.

## Similar Brands

- **Raycast** — Same dark, achromatic macOS-utility aesthetic: graphite panels, pill-shaped floating controls, Tabler-like stroke icons, monospaced values
- **Linear** — Neutral dark canvas with value-step elevation instead of shadows, 14px-first typography, and restraint about accent color
- **Speechify (desktop)** — The functional reference: sidebar + cards settings window and a floating read-along mini-player with a moving word highlight
- **Vercel / Geist** — Shares the typeface and the black-white-gray discipline; #0a0a0a and #fafafa are Geist's own poles
- **shadcn/ui neutral preset** — Kairo is literally built on it (`base-nova` style, `neutral` base color); the token names and radius scale are shadcn's

## Quick Start

### CSS Custom Properties

The live source is `src/index.css`. Hex equivalents are given for design tools; the app itself uses the oklch values shown in comments.

```css
:root {
  /* Colors */
  --background: #0a0a0a; /* oklch(0.145 0 0) */
  --foreground: #fafafa; /* oklch(0.985 0 0) */
  --card: #171717; /* oklch(0.205 0 0) */
  --card-foreground: #fafafa;
  --popover: #171717;
  --popover-foreground: #fafafa;
  --primary: #c5c5c5;
  --primary-foreground: #171717;
  --secondary: #262626; /* oklch(0.269 0 0) */
  --secondary-foreground: #fafafa;
  --muted: #262626;
  --muted-foreground: #a1a1a1; /* oklch(0.708 0 0) */
  --accent: #262626;
  --accent-foreground: #fafafa;
  --destructive: #ff6467; /* oklch(0.704 0.191 22.216) */
  --success: #00d492; /* oklch(0.765 0.177 163.223) */
  --border: rgb(255 255 255 / 10%);
  --input: rgb(255 255 255 / 15%);
  --ring: #c5c5c5;
  --sidebar: #171717;
  --sidebar-foreground: #fafafa;
  --sidebar-primary: #c5c5c5;
  --sidebar-primary-foreground: #171717;
  --sidebar-accent: #262626;
  --sidebar-accent-foreground: #fafafa;
  --sidebar-border: rgb(255 255 255 / 10%);
  --sidebar-ring: #737373;

  /* Typography — Font Families */
  --font-sans:
    "Geist Variable", ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-heading: var(--font-sans);
  --font-mono:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;

  /* Typography — Scale */
  --text-caption: 12px;
  --leading-caption: 1.3333;
  --text-body: 14px;
  --leading-body: 1.4286;
  --leading-body-relaxed: 1.625;
  --text-transcript: 16px;
  --leading-transcript: 1.625;
  --text-page-title: 30px;
  --leading-page-title: 1.2;
  --tracking-page-title: -0.025em;

  /* Typography — Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  /* Spacing */
  --spacing-unit: 4px;
  --spacing-1: 4px;
  --spacing-1-5: 6px;
  --spacing-2: 8px;
  --spacing-2-5: 10px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;

  /* Layout */
  --window-width: 800px;
  --window-height: 600px;
  --sidebar-width: 176px;
  --content-max-width: 672px;
  --page-padding-x: 32px;
  --page-padding-y: 40px;
  --section-gap: 24px;
  --card-padding-x: 20px;
  --card-padding-y: 16px;
  --player-window-width: 380px;
  --actions-window-width: 520px;

  /* Border Radius */
  --radius: 0.625rem; /* 10px */
  --radius-sm: calc(var(--radius) * 0.6); /* 6px */
  --radius-md: calc(var(--radius) * 0.8); /* 8px */
  --radius-lg: var(--radius); /* 10px */
  --radius-xl: calc(var(--radius) * 1.4); /* 14px */
  --radius-2xl: calc(var(--radius) * 1.8); /* 18px */
  --radius-full: 9999px;

  /* Named Radii */
  --radius-highlight: var(--radius-sm);
  --radius-keycap: var(--radius-md);
  --radius-buttons: var(--radius-lg);
  --radius-inputs: var(--radius-lg);
  --radius-cards: var(--radius-xl);
  --radius-floating-card: var(--radius-xl);
  --radius-floating-pill: var(--radius-full);

  /* Shadows (floating windows only) */
  --shadow-floating:
    0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-floating-strong:
    0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Surfaces */
  --surface-canvas: #0a0a0a;
  --surface-card: #171717;
  --surface-fill: #262626;
  --surface-primary: #c5c5c5;
}
```

### Tailwind v4

This is what `src/index.css` already declares (the `@theme inline` block maps the semantic variables onto Tailwind color utilities). Add new tokens here, not in a config file.

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/geist";

@custom-variant dark (&amp;:is(.dark *));

@theme inline {
  /* Typography */
  --font-sans: "Geist Variable", sans-serif;
  --font-heading: var(--font-sans);

  /* Colors — mapped from the :root semantic variables */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-success: var(--success);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* Border Radius — derived from --radius: 0.625rem */
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: #c5c5c5;
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --success: oklch(0.765 0.177 163.223);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: #c5c5c5;
  --radius: 0.625rem;
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: #c5c5c5;
  --sidebar-primary-foreground: oklch(0.205 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

/* Floating windows draw their own card on a transparent window. */
html.transparent-window,
html.transparent-window body {
  background: transparent;
  overflow: hidden;
}
```
