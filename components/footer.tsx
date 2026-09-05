import { IconBrandX } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

// ponytail: `off` = page not written yet, rendered greyed & non-clickable
const COLUMNS: {
  title: string
  links: { l: string; href?: string; off?: true }[]
}[] = [
  {
    title: "Product",
    links: [
      { l: "Pricing", href: "/#pricing" },
      { l: "FAQ", href: "/#faq" },
      { l: "Changelog", href: "/changelog" },
      { l: "Roadmap", href: "/roadmap" },
    ],
  },
  {
    title: "Legal",
    links: [
      { l: "Terms of Service", href: "/terms" },
      { l: "Refund Policy", href: "/refunds" },
      { l: "Privacy Policy", href: "/privacy" },
    ],
  },
  {
    title: "Compare",
    links: [
      { l: "Kairo vs Speechify", href: "/vs/speechify" },
      { l: "Kairo vs NaturalReader", href: "/vs/naturalreader" },
      { l: "Kairo vs ElevenReader", href: "/vs/elevenreader" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1160px] px-8 pt-10 pb-9">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4.5">
            <Link href="/" aria-label="Kairo">
              <Image
                src="/kairo-lockup-dark.png"
                alt="Kairo"
                width={634}
                height={256}
                className="h-6.5 w-auto"
              />
            </Link>
            <span className="text-[13px] text-muted-foreground">© 2026</span>
          </div>
          <a
            href="https://x.com/kairoaiagent"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Kairo on X"
            className="inline-flex size-9 items-center justify-center rounded-[10px] border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-foreground"
          >
            <IconBrandX className="size-[18px]" />
          </a>
        </div>
        <div className="mt-11 grid grid-cols-2 gap-10 sm:grid-cols-[repeat(3,minmax(0,200px))]">
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <div className="mb-3.5 font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
                {c.title}
              </div>
              <ul className="grid gap-2.5 text-sm">
                {c.links.map((k) => (
                  <li key={k.l}>
                    {k.off ? (
                      <span aria-disabled className="text-muted-foreground/60">
                        {k.l}
                      </span>
                    ) : (
                      <a
                        href={k.href ?? "#"}
                        className="hover:text-muted-foreground"
                      >
                        {k.l}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
