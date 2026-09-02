"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"

import { Kbd } from "@/components/ui/kbd"

import {
  ACTIONS,
  RESULTS,
  SOURCE,
  plainText,
  spokenWords,
  tokenize,
  type Action,
  type Block,
  type Token,
} from "@/components/transform-content"
import { cn } from "@/lib/utils"
import { wordEnds } from "@/lib/word-ends"

const SOURCE_WORDS = spokenWords(SOURCE).length

// Renders blocks word by word so the result can stream in and light up.
function Doc({
  blocks,
  tokens,
  shown = Infinity,
  current = -1,
  dim,
}: {
  blocks: Block[]
  tokens: Token[]
  shown?: number
  current?: number
  dim?: boolean
}) {
  const last = tokens[Math.min(shown, tokens.length) - 1]?.block ?? -1
  let li = 0
  return (
    <div
      className={cn(
        "space-y-2.5 text-[15px] leading-[1.65]",
        dim ? "text-muted-foreground" : "text-foreground"
      )}
    >
      {blocks.map((b, i) => {
        const own = tokens.filter((t) => t.block === i)
        const visible = own.filter((_, j) => tokens.indexOf(own[j]) < shown)
        if (!visible.length) return null
        if (b.kind === "pre") {
          return (
            <pre
              key={i}
              className="rounded-lg border border-border bg-white/[0.04] px-3.5 py-3 font-mono text-[13px] leading-normal break-words whitespace-pre-wrap text-foreground"
            >
              {b.text}
            </pre>
          )
        }
        const n = b.kind === "li" ? ++li : 0
        return (
          <p
            key={i}
            className={cn(
              b.kind === "h" && "pt-1 font-semibold text-foreground",
              b.kind === "li" && "relative pl-6"
            )}
          >
            {n > 0 && (
              <span className="absolute left-0 tabular-nums">{n}.</span>
            )}
            {visible.map((t, j) => (
              <span key={j}>
                {j > 0 && !t.glue && " "}
                <span
                  className={cn(
                    "-mx-[0.08em] rounded-sm px-[0.08em] transition-colors duration-150",
                    t.code &&
                      "mx-0 rounded bg-white/[0.06] px-1 py-0.5 font-mono text-[0.9em] text-foreground",
                    t.bold && "font-medium text-foreground",
                    t.spoken === current && "bg-primary/75 text-background"
                  )}
                >
                  {t.text}
                </span>
              </span>
            ))}
            {i === last && shown < tokens.length && (
              <span
                aria-hidden
                className="ml-0.5 inline-block h-[1em] w-[7px] animate-pulse bg-primary align-[-2px]"
              />
            )}
          </p>
        )
      })}
    </div>
  )
}

export function Transform() {
  const audio = useRef<HTMLAudioElement>(null)
  const [action, setAction] = useState<Action>("humanize")
  const [shown, setShown] = useState(Infinity) // tokens revealed so far
  const [current, setCurrent] = useState(-1) // word being read
  const [playing, setPlaying] = useState(false)
  const [replaced, setReplaced] = useState<Action | null>(null)
  const [copied, setCopied] = useState(false)

  const result = RESULTS[action]
  const tokens = useMemo(() => tokenize(result), [result])
  const ends = useMemo(() => wordEnds(spokenWords(result)), [result])
  const streaming = shown < tokens.length
  const source = replaced ? RESULTS[replaced] : SOURCE
  const sourceTokens = useMemo(() => tokenize(source), [source])

  // Fake streaming: one token per tick.
  useEffect(() => {
    if (!streaming) return
    const id = setInterval(() => setShown((s) => s + 1), 28)
    return () => clearInterval(id)
  }, [streaming])

  // Lamp follows the audio.
  useEffect(() => {
    const el = audio.current
    if (!el) return
    const onTime = () => {
      const f = el.currentTime / (el.duration || 1)
      setCurrent(ends.findIndex((end) => f < end))
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
  }, [ends])

  const stop = () => {
    audio.current?.pause()
    setPlaying(false)
    setCurrent(-1)
  }

  const pick = (a: Action) => {
    stop()
    if (audio.current) audio.current.currentTime = 0
    setAction(a)
    setShown(0)
  }

  const listen = async () => {
    if (playing) return stop()
    setPlaying(true)
    await audio.current?.play()
  }

  const copy = async () => {
    await navigator.clipboard.writeText(plainText(result))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section className="mx-auto max-w-[1160px] px-8 pt-8 pb-32">
      <audio ref={audio} src={`/transform-${action}.mp3`} preload="auto" />

      <p className="max-w-[34ch] text-2xl leading-[1.25] tracking-[-0.02em] text-pretty md:text-[34px]">
        Every AI answer, said the way a colleague would.{" "}
        <span className="text-muted-foreground">
          Select it, press{" "}
          <Kbd className="h-[1.55em] min-w-[1.3em] -translate-y-[0.08em] rounded-md px-[0.3em] align-middle text-[0.62em]">
            ⌥T
          </Kbd>
          , pick an action. The result streams in, then goes back where the text
          came from.
        </span>
      </p>

      <div className="mt-16 grid gap-px border border-border bg-border md:h-[560px] md:grid-cols-2">
        {/* Before */}
        <div className="grid h-[440px] min-h-0 grid-rows-[auto_1fr_auto] gap-4 bg-background px-7 pt-6 pb-7 md:h-auto">
          <div className="flex min-h-9 items-center justify-between">
            <div className="flex items-center gap-2.5 font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
              <span className="size-2 rounded-full bg-secondary" />
              Selected in Claude Code
            </div>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {spokenWords(source).length} words
            </span>
          </div>
          <div className="min-h-0 [scrollbar-width:thin] overflow-y-auto pr-3">
            <Doc blocks={source} tokens={sourceTokens} dim={!replaced} />
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3.5 font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
            <span>{replaced ? "Replaced" : "Before"}</span>
            {replaced ? (
              <button
                onClick={() => setReplaced(null)}
                className="tracking-[0.12em] text-foreground uppercase hover:underline"
              >
                Reset
              </button>
            ) : (
              <span className="normal-case">markdown - 1 code block</span>
            )}
          </div>
        </div>

        {/* After */}
        <div className="grid h-[480px] min-h-0 grid-rows-[auto_1fr_auto] gap-4 bg-card px-7 pt-6 pb-7 md:h-auto">
          <div className="flex items-center justify-between gap-4">
            <div
              role="tablist"
              className="inline-flex items-center gap-0.5 rounded-full bg-background p-1 shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_0_0_1px_rgba(255,255,255,.06)]"
            >
              {ACTIONS.map((a) => (
                <button
                  key={a.key}
                  role="tab"
                  aria-selected={a.key === action}
                  onClick={() => pick(a.key)}
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-selected:bg-secondary aria-selected:text-foreground"
                >
                  {a.name}
                </button>
              ))}
            </div>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {streaming ? (
                "Streaming…"
              ) : (
                <>
                  <span className="text-foreground">{SOURCE_WORDS}</span>
                  {" → "}
                  <span className="text-foreground">{ends.length}</span> words
                </>
              )}
            </span>
          </div>
          <div className="min-h-0 [scrollbar-width:thin] overflow-y-auto pr-3">
            <Doc
              blocks={result}
              tokens={tokens}
              shown={shown}
              current={current}
            />
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3.5">
            <div className="flex items-center gap-1.5">
              <button
                onClick={listen}
                disabled={streaming}
                aria-pressed={playing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary py-1.5 pr-3 pl-2.5 text-[13px] font-medium text-background transition-opacity disabled:opacity-50"
              >
                {playing ? (
                  <IconPlayerPauseFilled className="size-3.5" />
                ) : (
                  <IconPlayerPlayFilled className="size-3.5" />
                )}
                {playing ? "Pause" : "Listen"}
              </button>
              <button
                onClick={() => setReplaced(action)}
                disabled={streaming || replaced === action}
                className="rounded-lg bg-secondary px-3 py-1.5 text-[13px] font-medium transition-opacity disabled:opacity-50"
              >
                {replaced === action ? "Replaced" : "Replace"}
              </button>
              <button
                onClick={copy}
                disabled={streaming}
                className="w-[68px] rounded-lg bg-secondary px-3 py-1.5 text-[13px] font-medium transition-opacity disabled:opacity-50"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <span className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
              After
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
