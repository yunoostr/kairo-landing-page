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
  "https://github.com/nathanrenard3/kairo-releases/releases/latest/download"
const BUILDS = [
  { l: "Apple Silicon", sub: "M1 and later", file: "Kairo_aarch64.dmg" },
  { l: "Intel", sub: "Macs before 2020", file: "Kairo_x64.dmg" },
]

// ponytail: browsers don't expose the CPU arch on macOS reliably, so the
// user picks. No auto-detect.
export function DownloadButton({
  className,
  align = "start",
}: {
  className?: string
  align?: "start" | "end"
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group inline-flex h-10 cursor-pointer items-center gap-2.5 rounded-xl bg-[linear-gradient(#ffffff,#e4e4e4)] px-4 text-sm font-semibold text-[#0a0a0a] shadow-[inset_0_1px_0_#fff,0_1px_2px_rgba(0,0,0,.5),0_10px_24px_rgba(0,0,0,.35)] transition-[filter] outline-none hover:brightness-[1.03] focus-visible:ring-3 focus-visible:ring-ring/50 active:brightness-95",
          className
        )}
      >
        <IconBrandAppleFilled className="size-4 -translate-y-px" />
        Download for Mac
        <IconChevronDown className="-mr-1 -ml-0.5 size-3.5 opacity-55 transition-transform group-aria-expanded:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} sideOffset={6} className="min-w-52">
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
