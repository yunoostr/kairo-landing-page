import { DownloadButton } from "@/components/download-button"
import { Reveal } from "@/components/reveal"
import { ShaderBackground } from "@/components/ui/shader-background"

// Last thing before the footer: the shortcut, one line, one button.
export function ClosingCta() {
  return (
    <section className="mx-auto max-w-[1160px] px-8 pb-32">
      <Reveal className="relative overflow-hidden border border-border bg-card">
        {/* The hero ribbons, dimmer and pushed up behind the keycaps so the
            headline stays on dark ground. */}
        <ShaderBackground
          seed={61}
          lines={4}
          spread={0.07}
          amplitude={0.13}
          glow={1.3}
          brightness={0.6}
          vignette={0.6}
          speed={0.35}
          className="pointer-events-none absolute inset-x-0 -top-[40%] h-[140%]"
        />
        <div className="relative flex flex-col items-center gap-9 px-8 pt-21 pb-22 text-center">
          <div className="group flex items-center gap-2.5" aria-hidden>
            <Keycap sub="option">⌥</Keycap>
            <span className="text-xl text-muted-foreground">+</span>
            <Keycap className="transition-transform duration-400 ease-out group-hover:-translate-y-px group-hover:-rotate-6 motion-reduce:transition-none">
              A
            </Keycap>
          </div>
          <h2 className="max-w-[15ch] text-[34px] leading-[1.08] font-semibold tracking-[-0.035em] text-balance md:text-[42px]">
            One shortcut away{" "}
            <span className="text-muted-foreground">
              from never reading a spec again.
            </span>
          </h2>
          <DownloadButton className="h-11 px-5 text-[15px]" />
        </div>
      </Reveal>
    </section>
  )
}

// The site's Kbd chip at keyboard scale, drawn in CSS.
function Keycap({
  sub,
  className,
  children,
}: {
  sub?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={`relative grid size-21 origin-[30%_20%] place-items-center rounded-[17px] bg-linear-to-b from-[#2b2b2b] to-[#1a1a1a] text-4xl font-semibold tracking-[-0.02em] shadow-[inset_0_1px_0_rgba(255,255,255,.14),inset_0_-3px_0_rgba(0,0,0,.5),0_0_0_1px_#000,0_20px_40px_rgba(0,0,0,.6)] ${className ?? ""}`}
    >
      {sub && (
        <span className="absolute top-2.5 left-3 text-[11px] font-medium tracking-[0.04em] text-muted-foreground">
          {sub}
        </span>
      )}
      {children}
    </span>
  )
}
