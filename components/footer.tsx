import Image from "next/image"

import { DownloadButton } from "@/components/download-button"

// TODO: real URLs (GitHub Releases, changelog, support, Polar legal pages)
const COLUMNS: { title: string; links: { l: string; sub?: string }[] }[] = [
  {
    title: "Product",
    links: [
      { l: "Download", sub: "Signed & notarized DMG" },
      { l: "Kairo Pro" },
      { l: "Changelog" },
      { l: "Roadmap" },
    ],
  },
  {
    title: "Help",
    links: [
      { l: "Setup guide", sub: "Accessibility permission, API key" },
      { l: "FAQ" },
      { l: "Email support" },
      { l: "Manage license" },
    ],
  },
  {
    title: "Legal",
    links: [
      { l: "Privacy" },
      { l: "Terms of sale" },
      { l: "Refunds" },
      { l: "Imprint" },
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
                className="h-6 w-auto"
              />
            </a>
            <p className="mt-3.5 max-w-[34ch] text-sm leading-[1.6] text-muted-foreground">
              Reads any selected text aloud and transforms it with AI, from one
              shortcut, in every macOS app.
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
                    <a href="#" className="hover:text-muted-foreground">
                      {k.l}
                      {k.sub && (
                        <span className="block text-xs text-muted-foreground">
                          {k.sub}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-6 border-t border-border pt-5 text-[13px] text-muted-foreground">
          <span>© 2026 Kairo. Sold by Polar as merchant of record.</span>
          <span className="font-mono text-xs">
            macOS 13 Ventura or later · Apple silicon & Intel
          </span>
        </div>
      </div>
    </footer>
  )
}
