"use client"

import { IconBrandAppleFilled, IconChevronDown } from "@tabler/icons-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Stable URLs, always the latest release. GitHub redirects to the asset.
const RELEASES =
  "https://github.com/yunoostr/kairo-releases/releases/latest/download"
const BUILDS = [
  { l: "Apple Silicon", sub: "M1 and later", file: "Kairo_aarch64.dmg" },
  { l: "Intel", sub: "Macs before 2020", file: "Kairo_x64.dmg" },
]

// ponytail: browsers don't expose the CPU arch on macOS reliably, so the
// user picks. No auto-detect.
export function DownloadButton({
  className,
  align = "start",
  side = "bottom",
  label = "Download for Mac",
}: {
  className?: string
  align?: "start" | "end"
  side?: "top" | "bottom"
  label?: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group inline-flex h-10 cta cursor-pointer items-center gap-2.5 rounded-xl px-4 text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          className
        )}
      >
        <IconBrandAppleFilled className="size-4 -translate-y-px" />
        {label}
        <IconChevronDown className="-mr-1 -ml-0.5 size-3.5 opacity-55 transition-transform group-aria-expanded:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={6}
        className="min-w-52"
      >
        {BUILDS.map((b) => (
          <DropdownMenuItem
            key={b.file}
            render={<a href={`${RELEASES}/${b.file}`} />}
            className="cursor-pointer flex-col items-start gap-0.5 px-2 py-1.5"
          >
            {b.l}
            <span className="text-xs text-muted-foreground">{b.sub}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
