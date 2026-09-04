import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"

// Same chrome as (legal), but the board needs the full 1160px column.
export default function RoadmapLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main>
      <SiteHeader />
      <article className="mx-auto max-w-[1160px] px-8 pt-16 pb-32 text-[15px]">
        {children}
      </article>
      <Footer />
    </main>
  )
}
