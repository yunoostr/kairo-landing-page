"use client"

import { memo, useEffect, useRef, useState, useSyncExternalStore } from "react"
import {
  IconPlayerPlayFilled,
  IconRotateClockwise,
} from "@tabler/icons-react"

import {
  ENDS,
  PHASES,
  PLAN,
  PR_BODY,
  PR_SUMMARY,
  SLACK_EN,
  SLACK_FR,
  TICK,
  advance,
  type Phase,
} from "@/components/demo-content"
import { Reveal } from "@/components/reveal"
import { ShaderBackground } from "@/components/ui/shader-background"
import { cn } from "@/lib/utils"
import { wordEnds } from "@/lib/word-ends"

// Which phases play a file, and the words the lamp follows meanwhile.
const AUDIO: Partial<Record<Phase, { src: string; text: string }>> = {
  "claude-read": { src: "/demo-plan.mp3", text: PLAN },
  "slack-listen": { src: "/demo-translate.mp3", text: SLACK_EN },
}

const PILL =
  "rounded-full bg-card shadow-[0_0_0_1px_#000,inset_0_1px_0_rgba(255,255,255,.08),0_1em_2.5em_rgba(0,0,0,.6)]"
const CARD =
  "rounded-[0.8em] bg-card shadow-[0_0_0_1px_#000,inset_0_0_0_1px_rgba(255,255,255,.06),0_1em_2.5em_rgba(0,0,0,.6)]"

const REDUCED = "(prefers-reduced-motion: reduce)"
const subscribe = (cb: () => void) => {
  const m = matchMedia(REDUCED)
  m.addEventListener("change", cb)
  return () => m.removeEventListener("change", cb)
}

// Words revealed one by one: the first `shown` exist, the first `selected`
// are swept, `current` is lit by the lamp. `code` words keep their backticks
// in the source and render as inline code.
const Words = memo(function Words({
  text,
  shown = Infinity,
  selected = 0,
  current = -1,
  caret,
}: {
  text: string
  shown?: number
  selected?: number
  current?: number
  caret?: boolean
}) {
  const words = text.split(" ")
  const n = Math.min(shown, words.length)
  return (
    <>
      {words.slice(0, n).map((w, i) => (
        <span key={i}>
          <span
            className={cn(
              "-mx-[0.08em] rounded-[0.2em] px-[0.08em] transition-colors duration-150",
              w.startsWith("`") &&
                "mx-0 bg-white/[0.06] px-[0.3em] font-mono text-[0.9em] text-foreground",
              i < selected && "bg-white/[0.13] text-foreground",
              i === current && "bg-primary/75 text-background"
            )}
          >
            {w.replaceAll("`", "")}
          </span>{" "}
        </span>
      ))}
      {caret && n < words.length && (
        <span
          aria-hidden
          className="inline-block h-[1em] w-[0.45em] animate-pulse bg-primary align-[-0.15em]"
        />
      )}
    </>
  )
})

function Win({
  title,
  dim,
  className,
  children,
}: {
  title: string
  dim?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        CARD,
        "absolute overflow-hidden transition-opacity duration-500 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95",
        dim && "opacity-60",
        className
      )}
    >
      <div className="flex h-[2.3em] items-center gap-[0.5em] border-b border-border px-[0.8em] text-[0.9em] text-muted-foreground">
        <span className="flex gap-[0.4em]">
          {[0, 1, 2].map((i) => (
            <i key={i} className="block size-[0.75em] rounded-full bg-[#3a3a3a]" />
          ))}
        </span>
        <span className="mx-auto font-mono">{title}</span>
      </div>
      {children}
    </div>
  )
}

function Cap({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid size-[2em] place-items-center rounded-[0.45em] bg-linear-to-b from-[#2b2b2b] to-[#1a1a1a] text-[1.6em] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,.14),inset_0_-0.15em_0_rgba(0,0,0,.5),0_0_0_1px_#000,0_0.6em_1.5em_rgba(0,0,0,.6)]">
      {children}
    </span>
  )
}

// mm:ss for the player pill; "00:00" at rest.
function clock(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
}

function Player({
  playing,
  time,
  children,
}: {
  playing: boolean
  time: number
  children?: React.ReactNode
}) {
  return (
    <div className="absolute top-[6%] right-[4%] flex w-[24%] flex-col gap-[0.5em] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-300">
      <div className={cn(PILL, "flex h-[2.6em] items-center gap-[0.7em] pr-[0.9em] pl-[0.6em]")}>
        <span className="grid size-[1.4em] place-items-center rounded-full bg-primary text-background">
          <IconPlayerPlayFilled className="ml-px size-[0.6em]" />
        </span>
        <span className="font-mono text-[0.85em] text-muted-foreground tabular-nums">
          {clock(time)}
        </span>
        <span className="font-mono text-[0.85em] text-muted-foreground">1×</span>
        <span aria-hidden className="ml-auto flex h-[10px] items-end gap-[2px]">
          {[0, 1, 2].map((i) => (
            <i
              key={i}
              className={cn(
                "block h-[7px] w-[2px] rounded-[1px] bg-primary",
                playing && "motion-safe:animate-[eq_.5s_ease-in-out_infinite_alternate]"
              )}
              style={{ animationDelay: `${i * -170}ms` }}
            />
          ))}
        </span>
      </div>
      {children && (
        <div className={cn(CARD, "px-[0.9em] py-[0.7em] text-[0.9em] leading-[1.5] text-muted-foreground")}>
          {children}
        </div>
      )}
    </div>
  )
}

export function Demo() {
  // One state object so a phase change resets the tick counter in the same render.
  const [s, setS] = useState<{ phase: Phase; n: number }>({ phase: "rest", n: 0 })
  const [current, setCurrent] = useState(-1) // word being read
  const [time, setTime] = useState(0) // player pill clock
  const audio = useRef<Record<string, HTMLAudioElement | null>>({})
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useSyncExternalStore(
    subscribe,
    () => matchMedia(REDUCED).matches,
    () => false
  )
  const go = (phase: Phase) => setS({ phase, n: 0 })
  const click = () => {
    // Unlock both voices on this user gesture so a later programmatic
    // play() is allowed on WebKit, then load preload="metadata" for real.
    for (const el of Object.values(audio.current)) {
      if (!el) continue
      el
        .play()
        .then(() => {
          el.pause()
          el.currentTime = 0
        })
        .catch(() => {})
    }
    go(advance(s.phase, "click"))
    document.getElementById("demo")?.focus()
  }

  // Streaming and sweeping read from one counter that restarts every phase.
  useEffect(() => {
    const ms = TICK[s.phase]
    if (!ms) return
    const id = setInterval(() => setS((x) => ({ ...x, n: x.n + 1 })), ms)
    return () => clearInterval(id)
  }, [s.phase])

  // Stop the run when the demo scrolls out of view so it doesn't keep
  // playing audio off-screen.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio < 0.3) go("rest")
      },
      { threshold: [0.3] }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Timed phases end on a timeout, audio phases on `ended`. A phase whose
  // file never plays (blocked, missing) still ends shortly after, and a
  // rejected/erroring play() waits 2 s before moving on so the pill can
  // show briefly rather than skipping the read beat outright.
  useEffect(() => {
    const phase = s.phase
    const end = ENDS[phase]
    if (end === "click") return
    if (typeof end === "number") {
      const id = setTimeout(() => go(advance(phase, "timer")), end)
      return () => clearTimeout(id)
    }
    const el = audio.current[phase]
    const ends = wordEnds(AUDIO[phase]!.text.split(" "))
    let fired = false
    const onTime = () => {
      if (!el) return
      setCurrent(ends.findIndex((e) => el.currentTime / (el.duration || 1) < e))
      setTime(el.currentTime)
    }
    const done = () => {
      if (fired) return
      fired = true
      setCurrent(-1)
      setTime(0)
      go(advance(phase, "ended"))
    }
    let failId: ReturnType<typeof setTimeout> | undefined
    const fail = () => {
      failId = setTimeout(done, 2000)
    }
    el?.addEventListener("timeupdate", onTime)
    el?.addEventListener("ended", done)
    el?.addEventListener("error", fail)
    el?.play().catch(fail)
    const hardId = setTimeout(done, ((el?.duration || 30) + 3) * 1000)
    return () => {
      fired = true
      clearTimeout(hardId)
      clearTimeout(failId)
      el?.removeEventListener("timeupdate", onTime)
      el?.removeEventListener("ended", done)
      el?.removeEventListener("error", fail)
      if (el) {
        el.pause()
        el.currentTime = 0
      }
    }
  }, [s.phase])

  // With reduced motion the desk is a still of beat 3.
  const p: Phase = reduced ? "slack-listen" : s.phase
  const n = reduced ? Infinity : s.n
  const i = PHASES.indexOf(p)
  const at = (q: Phase) => i >= PHASES.indexOf(q)
  const is = (...q: Phase[]) => q.includes(p)
  const all = Infinity

  const playing = !reduced && is("claude-read", "slack-listen")
  const lit = reduced ? -1 : current

  return (
    <section
      id="demo"
      ref={sectionRef}
      tabIndex={-1}
      className="mx-auto max-w-[1160px] px-8 pb-32 outline-none"
    >
      {Object.entries(AUDIO).map(([phase, a]) => (
        <audio
          key={phase}
          ref={(el) => {
            audio.current[phase] = el
          }}
          src={a.src}
          preload="metadata"
        />
      ))}

      <Reveal>
        <p className="max-w-[34ch] text-2xl leading-[1.25] tracking-[-0.02em] text-pretty md:text-[34px]">
          It floats over whatever you are in.{" "}
          <span className="text-muted-foreground">
            Claude Code, a pull request, Slack. Same shortcut, same pill,
            nothing to switch to.
          </span>
        </p>
      </Reveal>

      <Reveal delay={80} className="relative mt-16 aspect-[16/10] overflow-hidden border border-border bg-[#0d0d0d] @container">
        <div aria-hidden className="absolute inset-0 text-[max(7px,1.2cqw)] leading-[1.5]">
          <ShaderBackground
            seed={23}
            lines={3}
            spread={0.09}
            amplitude={0.12}
            glow={1.4}
            brightness={0.45}
            vignette={0.7}
            speed={0.3}
            className="pointer-events-none absolute inset-x-0 -top-[30%] h-[130%]"
          />

          {at("claude-open") && (
            <Win title="claude — zsh — 120×40" dim={at("pr-open")} className="top-[9%] left-[5%] h-[66%] w-[58%]">
              <div className="p-[1em] font-mono text-muted-foreground">
                <p className="opacity-60">❯ claude</p>
                <p className="opacity-60">⏺ Plan ready. Here is what I will do:</p>
                <p className="mt-[1em]">
                  <Words
                    text={PLAN}
                    shown={is("claude-stream") ? n : at("claude-select") ? all : 0}
                    selected={is("claude-select") ? n : is("claude-shortcut", "claude-read") ? all : 0}
                    current={is("claude-read") ? lit : -1}
                    caret={is("claude-stream")}
                  />
                </p>
                {at("claude-select") && (
                  <p className="mt-[1em] opacity-60">
                    Three files change, one migration, no new dependency. Say
                    &quot;go&quot; and I start with the middleware.
                  </p>
                )}
              </div>
            </Win>
          )}

          {at("pr-open") && (
            <Win title="Pull request #482 · Refactor auth to server sessions" dim={at("slack-open")} className="top-[20%] left-[38%] h-[66%] w-[56%]">
              <div className="p-[1.1em] text-muted-foreground">
                <p className="mb-[0.6em] font-medium text-foreground">
                  Refactor auth to server sessions
                </p>
                <p>
                  <Words
                    key={at("pr-replace") ? "after" : "before"}
                    text={at("pr-replace") ? PR_SUMMARY : PR_BODY}
                    selected={is("pr-open") ? n : is("pr-shortcut", "pr-summarize") ? all : 0}
                  />
                </p>
              </div>
            </Win>
          )}

          {at("slack-open") && (
            <Win title="#standup" className="top-[30%] left-[18%] h-[60%] w-[52%]">
              <div className="grid h-full grid-cols-[30%_1fr]">
                <div className="border-r border-border p-[0.9em] text-[0.9em] leading-[2] text-muted-foreground">
                  <p># announcements</p>
                  <p className="-mx-[0.5em] rounded-[0.4em] bg-secondary px-[0.5em] text-foreground"># standup</p>
                  <p># design</p>
                </div>
                <div className="p-[1em] text-muted-foreground">
                  <p className="mb-[0.4em]">
                    <span className="font-medium text-foreground">Lisa</span>{" "}
                    <span className="text-[0.85em]">10:41</span>
                  </p>
                  <p>
                    <Words text={SLACK_FR} selected={is("slack-open") ? n : at("slack-shortcut") ? all : 0} />
                  </p>
                </div>
              </div>
            </Win>
          )}

          {is("claude-shortcut", "claude-read") && (
            <Player playing={playing} time={time}>
              <Words text={PLAN} current={lit} />
            </Player>
          )}
          {is("slack-listen", "end") && <Player playing={playing} time={time} />}

          {at("pr-shortcut") && (
            <div className="absolute top-[5%] left-1/2 flex w-[40%] -translate-x-1/2 flex-col items-center gap-[0.6em] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-300">
              <div className={cn(PILL, "flex gap-[0.2em] p-[0.25em] text-[0.95em]")}>
                {["Humanize", "Translate", "Summarize"].map((a) => (
                  <span
                    key={a}
                    className={cn(
                      "rounded-full px-[0.8em] py-[0.25em] text-muted-foreground",
                      a === (at("slack-shortcut") ? "Translate" : "Summarize") &&
                        (is("pr-summarize", "pr-replace") || at("slack-shortcut")) &&
                        "bg-secondary text-foreground"
                    )}
                  >
                    {a}
                  </span>
                ))}
                {at("slack-shortcut") && (
                  <span className="rounded-full px-[0.8em] py-[0.25em] font-mono text-[0.85em] text-muted-foreground uppercase">
                    fr → en
                  </span>
                )}
              </div>
              {(is("pr-summarize") || at("slack-translate")) && (
                <div className={cn(CARD, "w-full px-[1em] py-[0.8em] text-foreground")}>
                  <Words
                    key={is("pr-summarize") ? "pr" : "slack"}
                    text={is("pr-summarize") ? PR_SUMMARY : SLACK_EN}
                    shown={is("pr-summarize", "slack-translate") ? n : all}
                    current={is("slack-listen") ? lit : -1}
                    caret={is("pr-summarize", "slack-translate")}
                  />
                </div>
              )}
            </div>
          )}

          {is("claude-shortcut", "pr-shortcut", "slack-shortcut") && (
            <div
              key={p}
              className="absolute bottom-[16%] left-1/2 flex -translate-x-1/2 items-center gap-[0.6em] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-90 motion-safe:duration-300"
            >
              <Cap>⌥</Cap>
              <Cap>{is("claude-shortcut") ? "A" : "T"}</Cap>
            </div>
          )}

          <div className="absolute bottom-[9%] left-1/2 flex -translate-x-1/2 gap-[0.6em] rounded-[1em] border border-white/[0.08] bg-card/70 p-[0.45em] backdrop-blur-md">
            {["❯", "⎇", "#", "K"].map((g) => (
              <span
                key={g}
                className={cn(
                  "grid size-[2.6em] place-items-center rounded-[0.7em] bg-secondary font-mono text-[1.1em] shadow-[inset_0_1px_0_rgba(255,255,255,.1)]",
                  g === "K" && "bg-linear-to-b from-[#2b2b2b] to-[#1a1a1a] font-sans font-semibold"
                )}
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {!reduced && is("rest", "end") && (
          <div
            className={cn(
              "absolute inset-0 grid place-items-center",
              is("end") && "bg-background/40 backdrop-blur-sm"
            )}
          >
            <button
              type="button"
              onClick={click}
              className={cn(
                PILL,
                "flex h-11 items-center gap-2.5 pr-5 pl-4 text-[15px] font-medium transition-transform hover:scale-[1.03] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-[0.98]"
              )}
            >
              {is("end") ? (
                <IconRotateClockwise className="size-4" />
              ) : (
                <IconPlayerPlayFilled className="size-3.5" />
              )}
              {is("end") ? "Replay" : "Play demo"}
            </button>
          </div>
        )}
      </Reveal>
    </section>
  )
}
