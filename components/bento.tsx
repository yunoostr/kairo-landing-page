import { Reveal } from "@/components/reveal"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"

// ---------- tiny isometric line renderer: 3D points → SVG ----------
type P3 = [number, number, number]
const iso = ([x, y, z]: P3) => [(x - y) * 0.866, (x + y) * 0.5 - z] as const
const stroke = { vectorEffect: "non-scaling-stroke" } as const
const HI = "stroke-primary"
const DASH = "stroke-white/15 [stroke-dasharray:3_3]"

const Line = ({ a, b, className }: { a: P3; b: P3; className?: string }) => {
  const [x1, y1] = iso(a)
  const [x2, y2] = iso(b)
  // Solid lines get a normalized length so CSS can draw them in (see globals.css).
  const dash = className === DASH
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      pathLength={dash ? undefined : 1}
      className={cn(!dash && "draw", className)}
      {...stroke}
    />
  )
}
const Poly = ({ pts, className }: { pts: P3[]; className?: string }) => (
  <polygon
    points={pts.map((p) => iso(p).join(",")).join(" ")}
    className={className}
    {...stroke}
  />
)
const Box = ({
  x,
  y,
  z,
  w,
  d,
  h,
  className,
}: {
  x: number
  y: number
  z: number
  w: number
  d: number
  h: number
  className?: string
}) => {
  const p: P3[] = [
    [x, y, z],
    [x + w, y, z],
    [x + w, y + d, z],
    [x, y + d, z],
    [x, y, z + h],
    [x + w, y, z + h],
    [x + w, y + d, z + h],
    [x, y + d, z + h],
  ]
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ]
  return (
    <>
      <Poly pts={[p[4], p[5], p[6], p[7]]} className="fill-white/[0.03]" />
      {edges.map(([a, b]) => (
        <Line key={`${a}${b}`} a={p[a]} b={p[b]} className={className} />
      ))}
    </>
  )
}
const Ring = ({
  cx,
  cy,
  z,
  r,
}: {
  cx: number
  cy: number
  z: number
  r: number
}) => (
  <Poly
    pts={Array.from({ length: 28 }, (_, i) => [
      cx + r * Math.cos((i / 28) * 2 * Math.PI),
      cy + r * Math.sin((i / 28) * 2 * Math.PI),
      z,
    ])}
  />
)

const FIGS = {
  everywhere: (
    <>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          x={i * 8 - 60}
          y={i * 8 - 40}
          z={i * 22}
          w={120}
          d={80}
          h={3}
        />
      ))}
      <g className="float">
        <Box x={-20} y={-10} z={96} w={56} d={18} h={8} className={HI} />
      </g>
      <Line a={[-20, -10, 96]} b={[-20, -10, 50]} className={DASH} />
      <Line a={[36, 8, 96]} b={[36, 8, 50]} className={DASH} />
    </>
  ),
  fast: (
    <>
      {[10, 22, 34, 18, 40, 26, 12, 30, 16, 24].map((h, i) => (
        <g key={i} className="bar" style={{ "--k": i } as React.CSSProperties}>
          <Box
            x={i * 14 - 70}
            y={-4}
            z={0}
            w={8}
            d={8}
            h={h}
            className={i < 2 ? HI : undefined}
          />
        </g>
      ))}
    </>
  ),
  words: (
    <>
      <Box x={-55} y={-40} z={0} w={110} d={80} h={3} />
      {[86, 60, 92, 70, 40].map((len, i) => (
        <Line
          key={i}
          a={[-45, -28 + i * 12, 3]}
          b={[-55 + len, -28 + i * 12, 3]}
        />
      ))}
      <Poly
        pts={[
          [-21, -10, 3.5],
          [3, -10, 3.5],
          [3, -4, 3.5],
          [-21, -4, 3.5],
        ]}
        className="mark fill-primary stroke-none"
      />
    </>
  ),
  chain: (
    <>
      {(
        [
          [-70, -10],
          [-13, -13],
          [44, -16],
        ] as const
      ).map(([x, y], i) => (
        <g key={i} className={i === 2 ? "last" : undefined}>
          <Box
            x={x}
            y={y}
            z={0}
            w={26}
            d={26}
            h={26}
            className={i === 2 ? HI : undefined}
          />
          {i < 2 && (
            <Line
              a={[x + 26, y + 13, 13]}
              b={[x + 31, y + 10, 13]}
              className={DASH}
            />
          )}
        </g>
      ))}
    </>
  ),
  key: (
    <g className="key">
      <Box x={-70} y={-20} z={0} w={40} d={40} h={4} />
      <Ring cx={-50} cy={0} z={4} r={9} />
      <Box x={-30} y={-6} z={0} w={100} d={12} h={4} />
      <Box x={40} y={6} z={0} w={8} d={10} h={4} />
      <Box x={58} y={6} z={0} w={8} d={7} h={4} />
    </g>
  ),
}

const CELLS: {
  fig: keyof typeof FIGS
  span: string
  label: React.ReactNode
  title: string
  text: string
}[] = [
  {
    fig: "everywhere",
    span: "md:col-span-7",
    label: "Any app",
    title: "Works everywhere",
    text: "One global shortcut in any macOS app, fullscreen included. The player and the actions float over the app you're in and never steal focus.",
  },
  {
    fig: "fast",
    span: "md:col-span-5",
    label: "Streaming",
    title: "Starts on the first bytes",
    text: "The selection is captured in tens of milliseconds. The voice starts as soon as OpenAI sends the first bytes back, not when the file is done.",
  },
  {
    fig: "words",
    span: "md:col-span-4",
    label: (
      <>
        Read - <Kbd>⌥A</Kbd>
      </>
    ),
    title: "Word by word",
    text: "A transcript follows the voice and lights up each word as it's read. Pause, resume, 0.75× to 2×.",
  },
  {
    fig: "chain",
    span: "md:col-span-4",
    label: (
      <>
        Transform - <Kbd>⌥T</Kbd>
      </>
    ),
    title: "Three actions, chained",
    text: "Humanize, Translate, Summarize. Chain them, step back to any stage, compare before and after, paste the result over the original.",
  },
  {
    fig: "key",
    span: "md:col-span-4",
    label: "Pro - One-time",
    title: "Pay once, bring your own key",
    text: "No subscription. Kairo Pro is a lifetime license. OpenAI bills you cents per use on your own key, and Kairo never charges again.",
  },
]

export function Bento() {
  return (
    <section className="mx-auto max-w-[1160px] px-8 pt-24 pb-32">
      <Reveal>
        <p className="max-w-[34ch] text-2xl leading-[1.25] tracking-[-0.02em] text-pretty md:text-[34px]">
          Built for developers who read AI output all day.{" "}
          <span className="text-muted-foreground">
            Kairo lives in the menu bar, works in every app, and runs on the
            OpenAI key you already pay for.
          </span>
        </p>
      </Reveal>

      <div className="mt-18 grid gap-px bg-border md:grid-cols-12">
        {CELLS.map((c, i) => (
          <Reveal
            key={c.fig}
            delay={i * 80}
            className={cn(
              "group grid grid-rows-[auto_1fr_auto] gap-4.5 bg-background px-8 pt-7 pb-8",
              c.span
            )}
          >
            <div className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
              {c.label}
            </div>
            <div className="grid min-h-[190px] place-items-center">
              <svg
                viewBox="-150 -90 300 180"
                data-fig={c.fig}
                aria-hidden
                fill="none"
                stroke="rgba(255,255,255,.28)"
                strokeWidth={1}
                strokeLinejoin="round"
                strokeLinecap="round"
                className="h-auto w-full max-w-[300px] overflow-visible"
              >
                {FIGS[c.fig]}
              </svg>
            </div>
            <div>
              <div className="text-[15px] font-medium">{c.title}</div>
              <p className="mt-1.5 max-w-[42ch] text-[15px] leading-[1.6] text-muted-foreground">
                {c.text}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
