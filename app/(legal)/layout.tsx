import Image from "next/image"
import Link from "next/link"

import { Footer } from "@/components/footer"

export default function LegalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main>
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
      <article className="mx-auto max-w-[680px] px-8 pt-16 pb-32 text-[15px]">
        {children}
      </article>
      <Footer />
    </main>
  )
}
