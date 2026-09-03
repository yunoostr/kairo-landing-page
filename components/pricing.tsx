import { IconCheck, IconMinus } from "@tabler/icons-react"

import { DownloadButton } from "@/components/download-button"
import { Reveal } from "@/components/reveal"
import { Kbd } from "@/components/ui/kbd"
import { ShaderBackground } from "@/components/ui/shader-background"
import { cn } from "@/lib/utils"

type Feat = { b: string; rest?: React.ReactNode }

const FREE: Feat[] = [
  {
    b: "Read any selection aloud",
    rest: (
      <>
        with the macOS voice, from <Kbd>⌥A</Kbd> in every app
      </>
    ),
  },
  { b: "Word-by-word transcript,", rest: "pause, resume, 0.75× to 2×" },
  { b: "Listening history", rest: "of your last 50 readings" },
  { b: "Remappable shortcuts" },
]
const FREE_LOCKED = ["OpenAI voices", "Humanize - Translate - Summarize"]

const PRO: Feat[] = [
  { b: "Everything in Free" },
  { b: "Nine OpenAI voices", rest: "that sound like a person, not a Mac" },
  {
    b: "Humanize, Translate, Summarize",
    rest: (
      <>
        from <Kbd>⌥T</Kbd>, chained, replaced in place
      </>
    ),
  },
  { b: "Activates on 3 Macs.", rest: "Free a slot from Settings any time" },
  { b: "Every future update", rest: "included" },
]

function Feature({ b, rest, locked }: Feat & { locked?: boolean }) {
  const Icon = locked ? IconMinus : IconCheck
  return (
    <li
      className={cn(
        "flex items-start gap-3 text-[15px] leading-[1.6] text-muted-foreground",
        locked && "opacity-45"
      )}
    >
      <Icon
        className={cn("mt-1 size-4 shrink-0", !locked && "text-primary")}
        stroke={1.5}
      />
      <span>
        {locked ? b : <b className="font-medium text-foreground">{b}</b>}
        {rest && <> {rest}</>}
      </span>
    </li>
  )
}

export function Pricing() {
  return (
    <section id="pricing" className="relative">
      {/* Bleeds ~70% past the section so the next sections start on the tinted ground. */}
      <ShaderBackground
        seed={23}
        lines={8}
        spread={0.028}
        amplitude={0.09}
        glow={0.8}
        vignette={0.4}
        speed={0.35}
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[170%] [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]"
      />
      <div className="mx-auto max-w-[1160px] px-8 pt-8 pb-32">
        <Reveal>
          <p className="max-w-[34ch] text-2xl leading-[1.25] tracking-[-0.02em] text-pretty md:text-[34px]">
            Free to listen. Pay once, never again.{" "}
            <span className="text-muted-foreground">
              Kairo Pro is a lifetime license. OpenAI bills you cents per use on
              your own key, and Kairo never charges again.
            </span>
          </p>
        </Reveal>

        <div className="mt-16 grid gap-px border border-border bg-border md:grid-cols-12">
          {/* Free */}
          <Reveal className="grid grid-rows-[auto_1fr_auto] gap-4.5 bg-background px-8 pt-7 pb-8 md:col-span-5">
            <div className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
              Free
            </div>
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-[56px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                  0<span className="ml-0.5 text-[28px] font-medium">€</span>
                </span>
                <span className="text-sm text-muted-foreground">forever</span>
              </div>
              <ul className="mt-7 grid gap-2.5">
                {FREE.map((f) => (
                  <Feature key={f.b} {...f} />
                ))}
                {FREE_LOCKED.map((f) => (
                  <Feature key={f} b={f} locked />
                ))}
              </ul>
            </div>
            <div>
              <DownloadButton />
            </div>
          </Reveal>

          {/* Pro */}
          <Reveal
            delay={80}
            className="relative grid grid-rows-[auto_1fr_auto] gap-4.5 bg-card px-8 pt-7 pb-8 md:col-span-7"
          >
            <div className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
              Pro - lifetime
            </div>
            {/* hand-drawn note pointing at the Pro cell */}
            <span
              aria-hidden
              className="pointer-events-none absolute top-6 right-8 hidden w-max items-start gap-1 text-muted-foreground md:flex"
            >
              <span className="-rotate-6 font-[family-name:var(--font-hand)] text-2xl leading-none">
                the one to get
              </span>
              <svg
                width="44"
                height="32"
                viewBox="0 0 44 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-1 -scale-x-100"
              >
                <path d="M41 29c-10 2-23-1-31-9-2-2-4-5-5-9" />
                <path d="M1 18 5 10l8 4" />
              </svg>
            </span>
            <div>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-[56px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                  19<span className="ml-0.5 text-[28px] font-medium">€</span>
                </span>
                <span className="text-xl text-muted-foreground line-through decoration-white/35">
                  29 €
                </span>
                <span className="text-sm text-muted-foreground">once</span>
              </div>
              <ul className="mt-7 grid gap-2.5">
                {PRO.map((f) => (
                  <Feature key={f.b} {...f} />
                ))}
              </ul>
            </div>
            <div>
              <a
                href="#" // TODO: Polar checkout URL
                className="inline-flex h-10 items-center rounded-xl bg-[linear-gradient(#ffffff,#e4e4e4)] px-4 text-sm font-semibold text-[#0a0a0a] shadow-[inset_0_1px_0_#fff,0_1px_2px_rgba(0,0,0,.5),0_10px_24px_rgba(0,0,0,.35)] transition-[transform,filter] hover:brightness-[.97] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:translate-y-px"
              >
                Get Pro
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
