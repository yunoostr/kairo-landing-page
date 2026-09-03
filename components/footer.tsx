import Image from "next/image"

import { DownloadButton } from "@/components/download-button"

// TODO: real URLs (support)
// ponytail: `off` = page not written yet, rendered greyed & non-clickable
const COLUMNS: {
  title: string
  links: { l: string; href?: string; off?: true }[]
}[] = [
  {
    title: "Product",
    links: [
      { l: "Pricing", href: "/#pricing" },
      { l: "Changelog", href: "/changelog" },
      { l: "Roadmap", off: true },
    ],
  },
  {
    title: "Help",
    links: [{ l: "FAQ", href: "/#faq" }],
  },
  {
    title: "Legal",
    links: [
      { l: "Terms of Service", href: "/terms" },
      { l: "Refund Policy", href: "/refunds" },
      { l: "Privacy Policy", href: "/privacy" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1160px] px-8 pt-14 pb-10">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <a href="#" aria-label="Kairo">
              <Image
                src="/kairo-lockup-dark.png"
                alt="Kairo"
                width={634}
                height={256}
                className="h-7 w-auto"
              />
            </a>
            <p className="mt-3.5 max-w-[34ch] text-sm leading-[1.6] text-muted-foreground">
              Reads what your AI agent writes aloud, then shortens, translates
              or humanizes it, from one shortcut in every macOS app.
            </p>
            <DownloadButton className="mt-5.5" />
          </div>
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
        <div className="mt-12 border-t border-border pt-5 text-[13px] text-muted-foreground">
          © 2026 Kairo.
        </div>
      </div>
    </footer>
  )
}
