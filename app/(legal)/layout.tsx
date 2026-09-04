import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"

export default function LegalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main>
      <SiteHeader />
      <article className="mx-auto max-w-[680px] px-8 pt-16 pb-32 text-[15px]">
        {children}
      </article>
      <Footer />
    </main>
  )
}
