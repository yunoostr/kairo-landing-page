import { IconPlus } from "@tabler/icons-react"

import { Kbd } from "@/components/ui/kbd"

type QA = { q: string; a: React.ReactNode }

const GROUPS: { title: string; items: QA[] }[] = [
  {
    title: "What you actually pay",
    items: [
      {
        q: "What does it cost me in OpenAI usage?",
        a: "Cents. A cent or two per minute of audio, a fraction of a cent per Humanize, Translate or Summarize. The macOS voice is free.",
      },
      {
        q: "Do I need Pro to read aloud?",
        a: "No. Reading with the macOS voice, transcript, speed and history are free forever. Pro is the OpenAI part.",
      },
      {
        q: "Can I get a refund?",
        // TODO: confirm the refund window with Polar
        a: "Within 14 days, no questions. Polar issues it and Pro locks again.",
      },
    ],
  },
  {
    title: "What leaves your Mac",
    items: [
      {
        q: "Where does my key live?",
        a: "In a file only your user can read, on your Mac. No backend, no telemetry.",
      },
      {
        q: "Who does Kairo talk to?",
        a: "Two servers, ever: OpenAI with your key, and Polar to check your license at most every 14 days.",
      },
      {
        q: "What happens offline?",
        a: "Kairo keeps working with its last known license state. Pro only locks on a real revocation or refund.",
      },
    ],
  },
  {
    title: "Getting it running",
    items: [
      {
        q: "Why the Accessibility permission?",
        a: (
          <>
            To read your selection with a simulated <Kbd>⌘C</Kbd>. Your
            clipboard is restored right after; the app walks you to the setting.
          </>
        ),
      },
      {
        q: "Why not the Mac App Store?",
        a: "The sandbox breaks global shortcuts. Kairo is a DMG signed and notarized by Apple, so it opens without warnings.",
      },
      {
        q: "New Mac?",
        a: "One license, three Macs. Free a slot from Settings on an old one.",
      },
    ],
  },
]

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-[1160px] px-8 pt-8 pb-32">
      <p className="max-w-[34ch] text-2xl leading-[1.25] tracking-[-0.02em] text-pretty md:text-[34px]">
        Three things people check before buying.{" "}
        <span className="text-muted-foreground">
          What it costs to run, where your key goes, and what it takes to set
          up.
        </span>
      </p>

      <div className="mt-14 grid gap-px border border-border bg-border md:grid-cols-3">
        {GROUPS.map((g) => (
          <div key={g.title} className="bg-background px-8 pt-7 pb-2">
            <div className="mb-5 font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
              {g.title}
            </div>
            {g.items.map((i) => (
              <details key={i.q} className="group border-t border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-4 text-[15px] font-medium group-open:text-foreground hover:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                  {i.q}
                  <IconPlus
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45 motion-reduce:transition-none"
                    stroke={1.5}
                  />
                </summary>
                <p className="pb-4.5 text-sm leading-[1.6] text-muted-foreground">
                  {i.a}
                </p>
              </details>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
