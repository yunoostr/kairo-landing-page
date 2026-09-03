import Image from "next/image"

import { DownloadButton } from "@/components/download-button"
import { Bento } from "@/components/bento"
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
        <header className="relative z-10 mx-auto flex h-16 max-w-[1160px] items-center justify-between px-8">
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
      <Bento />
      <Transform />
      <Pricing />
      <Faq />
      <Footer />
    </main>
  )
}
