import Image from "next/image"
import Link from "next/link"

import { ShaderBackground } from "@/components/ui/shader-background"

export function SiteHeader() {
  return (
    <>
      {/* Faint echo of the home hero across the top of every secondary page.
          Absolute to the viewport top since no ancestor is positioned. */}
      <ShaderBackground
        seed={41}
        amplitude={0.14}
        brightness={0.7}
        vignette={0.5}
        speed={0.35}
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <header className="relative mx-auto flex h-16 max-w-[1160px] items-center px-8">
        <Link href="/" aria-label="Kairo">
          <Image
            src="/kairo-lockup-dark.png"
            alt="Kairo"
            width={634}
            height={256}
            priority
            className="h-8 w-auto"
          />
        </Link>
      </header>
    </>
  )
}
