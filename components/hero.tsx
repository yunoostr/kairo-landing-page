"use client"

import { useEffect, useRef, useState } from "react"
import { IconPlayerPlayFilled } from "@tabler/icons-react"

import { DownloadButton } from "@/components/download-button"
import { ShaderBackground } from "@/components/ui/shader-background"
import { cn } from "@/lib/utils"
import { wordEnds } from "@/lib/word-ends"

// Words marked with * keep their glow once read.
const HEADLINE =
  "Every text on your Mac, *read *aloud. Then *made *human, *translated, or *summarized."
const HEAD_WORDS = HEADLINE.split(" ").map((w) => ({
  text: w.replace(/^\*/, ""),
  key: w.startsWith("*"),
}))

const SUBLINE =
  "Select a passage and Kairo reads it aloud, word by word. Understand it in your language, get the gist in seconds, or make it sound like you, without leaving the app you're in."
const WORDS = SUBLINE.split(" ")
const ENDS = wordEnds(WORDS)

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function Hero() {
  const audio = useRef<HTMLAudioElement>(null)
  const [read, setRead] = useState(-1) // headline words lit by the lamp so far
  const [selected, setSelected] = useState(0) // words swept by the fake cursor
  const [current, setCurrent] = useState(-1) // word being read
  const [playing, setPlaying] = useState(false)

  // The headline reads itself once, one word at a time.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let id: ReturnType<typeof setTimeout>
    const step = (i: number) => {
      setRead(i)
      if (i < HEAD_WORDS.length - 1) id = setTimeout(() => step(i + 1), 180)
    }
    id = setTimeout(() => step(0), 600)
    return () => clearTimeout(id)
  }, [])

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

      <div className="mx-auto max-w-[1160px] px-8 pt-28 pb-42">
        <h1 className="max-w-[19ch] text-5xl leading-[1.12] font-semibold tracking-[-0.03em] text-muted-foreground md:text-[60px]">
          {HEAD_WORDS.map((w, i) => (
            <span key={i}>
              <span
                className={cn(
                  "transition-[color,text-shadow] duration-400 motion-reduce:text-foreground",
                  i <= read && "text-foreground",
                  (i === read || (w.key && i <= read)) &&
                    "[text-shadow:0_0_22px_rgba(197,197,197,.45)]",
                  w.key &&
                    "motion-reduce:[text-shadow:0_0_22px_rgba(197,197,197,.45)]"
                )}
              >
                {w.text}
              </span>{" "}
            </span>
          ))}
        </h1>

        <p className="mt-7 max-w-[58ch] text-lg leading-relaxed text-muted-foreground">
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
                // Bars bounce while the audio plays; the click still pauses.
                <span aria-hidden className="flex h-2.5 items-end gap-px">
                  {[0, 1, 2].map((i) => (
                    <i
                      key={i}
                      className="block h-[7px] w-[2px] rounded-[1px] bg-current motion-safe:animate-[eq_.5s_ease-in-out_infinite_alternate]"
                      style={{ animationDelay: `${i * -170}ms` }}
                    />
                  ))}
                </span>
              ) : (
                <IconPlayerPlayFilled className="ml-px size-2.5" />
              )}
            </button>
            {/* hand-drawn "try it" under the player, arrow pointing up at it */}
            <span
              aria-hidden
              className="pointer-events-none absolute top-[calc(100%-2px)] left-[22px] hidden w-max items-end -space-x-1 text-muted-foreground md:flex"
            >
              <svg
                width="40"
                height="30"
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

        <DownloadButton className="mt-13 h-11 px-5 text-[15px]" />
      </div>
    </section>
  )
}
