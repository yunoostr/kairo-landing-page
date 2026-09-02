import Image from "next/image"

import { DownloadButton } from "@/components/download-button"
import { Bento } from "@/components/bento"
import { Hero } from "@/components/hero"
import { Pricing } from "@/components/pricing"
import { Transform } from "@/components/transform"

export default function Home() {
  return (
    <main className="overflow-clip">
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
        <DownloadButton />
      </header>
      <Hero />
      <Bento />
      <Transform />
      <Pricing />
    </main>
  )
}
