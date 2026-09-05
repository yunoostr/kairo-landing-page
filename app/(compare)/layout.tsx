import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"

// Same chrome as (legal). The comparison table breaks out of the 680px
// column on its own (see CompareTable).
export default function CompareLayout({
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
