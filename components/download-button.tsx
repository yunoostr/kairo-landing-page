import { IconBrandAppleFilled } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

// ponytail: release not out yet — disabled everywhere with a "Soon" tooltip.
// Swap back to <a href={RELEASE_URL}> and drop the tooltip when the DMG ships.
export function DownloadButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      disabled
      className={cn(
        "group relative inline-flex h-10 cursor-not-allowed items-center gap-2.5 rounded-xl bg-[linear-gradient(#ffffff,#e4e4e4)] px-4 text-sm font-semibold text-[#0a0a0a] opacity-60 shadow-[inset_0_1px_0_#fff,0_1px_2px_rgba(0,0,0,.5),0_10px_24px_rgba(0,0,0,.35)]",
        className
      )}
    >
      <IconBrandAppleFilled className="size-4 -translate-y-px" />
      Download for Mac
      <Tooltip />
    </button>
  )
}

export function Tooltip({ label = "Soon" }: { label?: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 font-mono text-xs whitespace-nowrap text-background opacity-0 transition-opacity group-hover:opacity-100"
    >
      {label}
    </span>
  )
}
