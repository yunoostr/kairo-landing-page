"use client"

import { useEffect, useRef, useState } from "react"
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"

import { DownloadButton } from "@/components/download-button"
import { ShaderBackground } from "@/components/ui/shader-background"
import { cn } from "@/lib/utils"
import { wordEnds } from "@/lib/word-ends"

const VERBS = ["Listen to", "Humanize", "Translate", "Summarize"]

const SUBLINE =
  "Select a passage and Kairo reads it aloud, word by word. Understand it in your language, get the gist in seconds, or make it sound like you, without leaving the app you're in."
const WORDS = SUBLINE.split(" ")
const ENDS = wordEnds(WORDS)

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function Hero() {
  const audio = useRef<HTMLAudioElement>(null)
  const box = useRef<HTMLSpanElement>(null)
  const items = useRef<(HTMLSpanElement | null)[]>([])
  const [verb, setVerb] = useState(0)
  const [selected, setSelected] = useState(0) // words swept by the fake cursor
  const [current, setCurrent] = useState(-1) // word being read
  const [playing, setPlaying] = useState(false)

  // Rolling verb in the headline.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => setVerb((v) => (v + 1) % VERBS.length), 2600)
    return () => clearInterval(id)
  }, [])

  // The highlight box hugs the current verb; width animates via CSS.
  useEffect(() => {
    const fit = () => {
      const w = items.current[verb]?.offsetWidth
      if (box.current && w) box.current.style.width = `${w}px`
    }
    fit()
    document.fonts?.ready.then(fit)
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [verb])

  // Lamp follows the audio.
  useEffect(() => {
    const el = audio.current
    if (!el) return
    const onTime = () => {
      const f = el.currentTime / (el.duration || 1)
      setCurrent(ENDS.findIndex((end) => f < end))
    }
    const onEnd = () => {
      setPlaying(false)
      setCurrent(-1)
    }
    el.addEventListener("timeupdate", onTime)
    el.addEventListener("ended", onEnd)
    return () => {
      el.removeEventListener("timeupdate", onTime)
      el.removeEventListener("ended", onEnd)
    }
  }, [])

  const toggle = async () => {
    const el = audio.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
      return
    }
    setPlaying(true)
    if (el.currentTime === 0) {
      // The user "selects" the passage.
      for (let i = 1; i <= WORDS.length; i++) {
        setSelected(i)
        await wait(22)
      }
      await wait(400)
      setSelected(0)
    }
    await el.play()
  }

  return (
    <section className="relative overflow-hidden">
      <ShaderBackground className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_30%,transparent_95%)]" />
      <audio ref={audio} src="/subline.mp3" preload="auto" />

      <div className="mx-auto flex max-w-[1160px] flex-col items-center px-8 pt-30 pb-40 text-center">
        <h1 className="text-5xl leading-[1.12] font-semibold tracking-[-0.03em] md:text-[64px]">
          <span
            aria-live="polite"
            className="-mx-[0.04em] inline-grid rounded-[0.22em] bg-primary px-[0.14em] py-[0.02em] align-baseline leading-[1.05] text-background shadow-[inset_0_1px_0_rgba(255,255,255,.35)] [clip-path:inset(0_round_0.22em)]"
          >
            {VERBS.map((v, i) => (
              <span
                key={v}
                ref={(el) => {
                  items.current[i] = el
                }}
                aria-hidden={i !== verb}
                style={{ transform: `translateY(${(i - verb) * 100}%)` }}
                className={cn(
                  "col-start-1 row-start-1 justify-self-center whitespace-nowrap transition-[transform,opacity] duration-500 ease-[cubic-bezier(.2,.7,.2,1)]",
                  i === verb ? "opacity-100" : "opacity-0"
                )}
              >
                {v}
              </span>
            ))}
          </span>{" "}
          <span className="whitespace-nowrap">any text</span>
          <br />
          on your Mac
        </h1>

        <p className="mt-7 max-w-[60ch] text-lg leading-relaxed text-muted-foreground">
          {WORDS.map((w, i) => (
            <span key={i}>
              <span
                className={cn(
                  "-mx-[0.08em] rounded-sm px-[0.08em] transition-colors duration-150",
                  i < selected && "bg-white/[0.13] text-foreground",
                  i === current && "bg-primary/75 text-background"
                )}
              >
                {w}
              </span>{" "}
            </span>
          ))}
          <span className="relative inline-block">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Listen to this paragraph"}
              aria-pressed={playing}
              className="ml-1 inline-grid size-6 -translate-y-px place-items-center rounded-full bg-primary align-middle text-primary-foreground transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-95"
            >
              {playing ? (
                <IconPlayerPauseFilled className="size-2.5" />
              ) : (
                <IconPlayerPlayFilled className="ml-px size-2.5" />
              )}
            </button>
            {/* hand-drawn "try it" pointing at the player */}
            <span
              aria-hidden
              className="pointer-events-none absolute top-2.5 left-[calc(100%+2px)] hidden w-max items-end -space-x-1 text-muted-foreground md:flex"
            >
              <svg
                width="44"
                height="32"
                viewBox="0 0 44 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M41 29c-10 2-23-1-31-9-2-2-4-5-5-9" />
                <path d="M1 18 5 10l8 4" />
              </svg>
              <span className="-rotate-6 font-[family-name:var(--font-hand)] text-2xl leading-none">
                try it
              </span>
            </span>
          </span>
        </p>

        <DownloadButton className="mt-9 h-11 px-5 text-[15px]" />
      </div>
    </section>
  )
}
