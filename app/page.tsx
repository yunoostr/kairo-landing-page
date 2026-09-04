import Image from "next/image"
import { IconArrowRight } from "@tabler/icons-react"

import { DownloadButton } from "@/components/download-button"
import { Bento } from "@/components/bento"
import { ClosingCta } from "@/components/closing-cta"
import { Dock } from "@/components/dock"
import { Demo } from "@/components/demo"
import { Faq } from "@/components/faq"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { Pricing } from "@/components/pricing"
import { Transform } from "@/components/transform"
import { ShaderBackground } from "@/components/ui/shader-background"

const NAV = [
  ["Features", "#features"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
]

export default function Home() {
  return (
    <main className="overflow-clip">
      <div className="relative overflow-hidden">
        <ShaderBackground className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_30%,transparent_95%)]" />
        {/* Launch offer strip. Delete once the first 50 Pro licenses are sold. */}
        <div className="relative z-10 flex min-h-9 items-center justify-center gap-3.5 border-b border-border bg-card/70 px-4 py-1.5 text-center text-[13px] leading-snug text-muted-foreground backdrop-blur-sm">
          <span>
            <b className="font-medium text-foreground">Launch price.</b>{" "}
            <span className="hidden sm:inline">
              Kairo Pro is 19 € instead of 29 € for the first 50 customers.
            </span>
            <span className="sm:hidden">Pro at 19 € for the first 50.</span>
          </span>
          <a
            href="#pricing"
            className="inline-flex items-center gap-1 font-medium whitespace-nowrap text-primary transition-colors hover:text-foreground hover:underline hover:underline-offset-3"
          >
            Get Pro
            <IconArrowRight size={14} stroke={2} aria-hidden />
          </a>
        </div>
        <header
          id="top"
          className="relative z-10 mx-auto flex h-16 max-w-[1160px] items-center justify-between px-8"
        >
          <a href="#" aria-label="Kairo">
            <Image
              src="/kairo-lockup-dark.png"
              alt="Kairo"
              width={634}
              height={256}
              priority
              className="h-8 w-auto"
            />
          </a>
          <nav className="hidden gap-7 text-sm text-muted-foreground md:flex">
            {NAV.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>
          <DownloadButton align="end" />
        </header>
        <Hero />
      </div>
      <Demo />
      <Dock links={NAV} />
      <Bento />
      <Transform />
      <Pricing />
      <Faq />
      <ClosingCta />
      <Footer />
    </main>
  )
}
