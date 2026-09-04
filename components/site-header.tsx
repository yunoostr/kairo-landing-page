import Image from "next/image"
import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="mx-auto flex h-16 max-w-[1160px] items-center px-8">
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
  )
}
