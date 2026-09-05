import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconMinus,
  IconUser,
} from "@tabler/icons-react"

import { CRITERIA, type Product } from "@/lib/compare"

export function checkedOn(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// Date, author, reading time under the page title.
export function Byline({ date, minutes }: { date: string; minutes: number }) {
  const items = [
    [IconCalendar, checkedOn(date)],
    [IconUser, "Nathan Renard"],
    [IconClock, `${minutes} min read`],
  ] as const
  return (
    <div className="mt-3.5 flex flex-wrap items-center gap-x-5.5 gap-y-2 text-[13px] text-muted-foreground">
      {items.map(([Icon, text]) => (
        <span
          key={text}
          className="inline-flex items-center gap-2 whitespace-nowrap"
        >
          <Icon className="size-4" />
          {text}
        </span>
      ))}
    </div>
  )
}

function Value({ v }: { v: string }) {
  if (v === "Yes") return <IconCheck className="size-4 text-primary" />
  if (v === "No" || v === "None")
    return <IconMinus className="size-4 text-muted-foreground/60" />
  return <>{v}</>
}

// One short value per cell, no notes, no links. Sources collapse to one line
// under the table. No image slot on purpose: competitor names stay plain text.
export function CompareTable({ products }: { products: Product[] }) {
  for (const p of products)
    if (Number.isNaN(Date.parse(p.checked)))
      throw new Error(`${p.name} has no valid checked date`)
  const latest = products
    .map((p) => p.checked)
    .sort()
    .at(-1)!
  const hosts = [
    ...new Set(
      products
        .filter((p) => p.slug !== "kairo")
        .flatMap((p) => Object.values(p.facts))
        .flatMap((c) =>
          c.source ? [new URL(c.source).hostname.replace(/^www\./, "")] : []
        )
    ),
  ]
  const cols = {
    gridTemplateColumns: `repeat(${products.length + 1}, minmax(0, 1fr))`,
  }
  return (
    <div className="my-10">
      <div className="grid gap-4 border-b border-border pb-3" style={cols}>
        <div />
        {products.map((p) => (
          <div key={p.slug} className="text-sm font-medium text-foreground">
            {p.name}
          </div>
        ))}
      </div>
      {CRITERIA.map((c) => (
        <div
          key={c.key}
          className="grid items-center gap-4 border-b border-border py-3.5 text-sm"
          style={cols}
        >
          <div className="text-muted-foreground">{c.label}</div>
          {products.map((p) => (
            <div key={p.slug} className="flex items-center text-foreground">
              <Value v={p.facts[c.key].value} />
            </div>
          ))}
        </div>
      ))}
      <p className="mt-4 font-mono text-xs text-muted-foreground">
        Sources: {hosts.join(", ")}, checked {checkedOn(latest)}
      </p>
    </div>
  )
}
