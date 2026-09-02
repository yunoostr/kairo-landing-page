import Image from "next/image"

import { DownloadButton } from "@/components/download-button"
import { Hero } from "@/components/hero"

export default function Home() {
  return (
    <main>
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
    </main>
  )
}
