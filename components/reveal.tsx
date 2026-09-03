"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

// Fades its block up once, the first time it scrolls into view.
// `delay` (ms) staggers siblings. Sets data-shown so CSS can chain on it.
export function Reveal({
  delay = 0,
  className,
  children,
}: {
  delay?: number
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        setShown(true)
        io.disconnect()
      },
      { rootMargin: "0px 0px -10% 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-shown={shown || undefined}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(
        shown
          ? "animate-in duration-700 ease-out fill-mode-both fade-in slide-in-from-bottom-4"
          : "opacity-0",
        "motion-reduce:animate-none motion-reduce:opacity-100",
        className
      )}
    >
      {children}
    </div>
  )
}
