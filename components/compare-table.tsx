import { CRITERIA, LATEST_CHECK, type Product } from "@/lib/compare"

export function checkedOn(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// Same eight rows for every product. No image slot on purpose: competitor
// names stay plain text (nominative use only).
export function CompareTable({ products }: { products: Product[] }) {
  for (const p of products)
    if (Number.isNaN(Date.parse(p.checked)))
      throw new Error(`${p.name} has no valid checked date`)
  const latest = products
    .map((p) => p.checked)
    .sort()
    .at(-1)!
  return (
    <div className="my-8 sm:-mx-[90px]">
      <p className="mb-3 font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
        Facts checked on {checkedOn(latest)}
      </p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-left font-medium text-muted-foreground" />
              {products.map((p) => (
                <th
                  key={p.slug}
                  className="p-3 text-left font-medium text-foreground"
                >
                  <a
                    href={p.url}
                    rel="nofollow noopener"
                    className="hover:underline"
                  >
                    {p.name}
                  </a>
                  <div className="mt-0.5 text-xs font-normal text-muted-foreground">
                    {p.vendor}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((c) => (
              <tr key={c.key} className="border-b border-border last:border-0">
                <th className="p-3 text-left align-top font-medium text-muted-foreground">
                  {c.label}
                </th>
                {products.map((p) => {
                  const cell = p.facts[c.key]
                  return (
                    <td key={p.slug} className="p-3 align-top text-foreground">
                      {cell.value}
                      {cell.note && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {cell.note}
                        </div>
                      )}
                      {cell.source && (
                        <a
                          href={cell.source}
                          rel="nofollow noopener"
                          className="mt-1 block text-xs text-muted-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
                        >
                          source
                        </a>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function CompareDisclaimer({ names }: { names: string[] }) {
  return (
    <p className="mt-12 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
      {names.join(", ")}{" "}
      {names.length > 1 ? "are trademarks" : "is a trademark"} of{" "}
      {names.length > 1 ? "their respective owners" : "its owner"}. Kairo is not
      affiliated with, endorsed by or sponsored by{" "}
      {names.length > 1 ? "them" : "it"}. Facts on this page were checked on{" "}
      {checkedOn(LATEST_CHECK)} against the sources linked in the table and may
      have changed since. Spotted an error? Write to{" "}
      <a
        href="mailto:contact@kairoagent.io"
        className="underline underline-offset-4"
      >
        contact@kairoagent.io
      </a>{" "}
      and it will be corrected.
    </p>
  )
}
