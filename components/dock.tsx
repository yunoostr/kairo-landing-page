"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

import { DownloadButton } from "@/components/download-button"
import { cn } from "@/lib/utils"

// Floating bottom bar that takes over once the hero header (#top) scrolls
// away. Links point at section ids; the one in view gets the silver dot.
export function Dock({
  links,
  download = true,
}: {
  links: string[][]
  download?: boolean
}) {
  const [shown, setShown] = useState(false)
  const [active, setActive] = useState("")

  useEffect(() => {
    const top = document.getElementById("top")
    if (!top) return
    const io = new IntersectionObserver(([e]) =>
      setShown(!e.isIntersecting && e.boundingClientRect.top < 0)
    )
    io.observe(top)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    // A section is "current" while it crosses the middle band of the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: "-40% 0px -55% 0px" }
    )
    for (const [, href] of links) {
      const el = document.getElementById(href.slice(1))
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [links])

  return (
    <div
      inert={!shown}
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center transition-transform duration-400 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none",
        // Slides up from below the viewport edge, no fade.
        !shown && "translate-y-[calc(100%+1.5rem)]"
      )}
    >
      <div className="pointer-events-auto flex h-12 items-center gap-1 rounded-xl border border-border bg-card pr-2 pl-2.5 shadow-[0_10px_30px_rgba(0,0,0,.55),0_0_0_1px_rgba(0,0,0,.6)]">
        <a href="#" aria-label="Kairo" className="mr-1">
          <Image src="/kairo-icon-dark.svg" alt="" width={26} height={26} />
        </a>
        <nav className="flex items-center gap-0.5 text-[13px] font-medium text-muted-foreground">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className={cn(
                "relative rounded-md px-2.5 py-1.5 transition-colors hover:text-foreground",
                active === href.slice(1) &&
                  "text-foreground after:absolute after:-bottom-0.5 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-primary after:shadow-[0_0_10px_rgba(197,197,197,.9)]"
              )}
            >
              {label}
            </a>
          ))}
        </nav>
        {download && (
          <DownloadButton
            align="end"
            side="top"
            label="Download"
            className="ml-1.5 h-8 gap-2 px-3 text-[13px]"
          />
        )}
      </div>
    </div>
  )
}
