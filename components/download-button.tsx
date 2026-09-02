import { IconBrandAppleFilled } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

export function DownloadButton({ className }: { className?: string }) {
  return (
    <a
      href="#"
      className={cn(
        "inline-flex h-10 items-center gap-2.5 rounded-xl bg-[linear-gradient(#ffffff,#e4e4e4)] px-4 text-sm font-semibold text-[#0a0a0a] shadow-[inset_0_1px_0_#fff,0_1px_2px_rgba(0,0,0,.5),0_10px_24px_rgba(0,0,0,.35)] transition-[transform,filter] hover:brightness-[.97] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:translate-y-px",
        className
      )}
    >
      <IconBrandAppleFilled className="size-4 -translate-y-px" />
      Download for Mac
    </a>
  )
}
