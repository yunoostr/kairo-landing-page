import { IconThumbUp } from "@tabler/icons-react"

export const metadata = { title: "Roadmap - Kairo" }

const REPO = "https://github.com/nathanrenard3/kairo-releases"

type Issue = {
  id: number
  number: number
  title: string
  body: string | null
  html_url: string
  state: "open" | "closed"
  closed_at: string | null
  labels: { name: string }[]
  pull_request?: unknown
  reactions: { "+1": number }
}

type Status = "planned" | "progress" | "shipped"

// Open issue = planned, open + `in progress` label = in progress, closed = shipped.
function statusOf(i: Issue): Status {
  if (i.state === "closed") return "shipped"
  return i.labels.some((l) => l.name === "in progress") ? "progress" : "planned"
}

// Anonymous quota is 60 req/h; the hourly cache keeps us far under it.
async function getIssues(): Promise<Issue[] | null> {
  const res = await fetch(
    `https://api.github.com/repos/nathanrenard3/kairo-releases/issues?state=all&per_page=100`,
    {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    }
  )
  if (!res.ok) return null
  const all: Issue[] = await res.json()
  return all.filter((i) => !i.pull_request)
}

const fmt = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

// ponytail: first paragraph of the issue body, raw. Markdown rendering when someone writes some.
const summary = (body: string | null) => body?.trim().split(/\n\s*\n/)[0] ?? ""

const COLUMNS: { status: Status; title: string; dot: string }[] = [
  { status: "planned", title: "Planned", dot: "border-[1.5px] border-muted-foreground" },
  { status: "progress", title: "In progress", dot: "bg-yellow-400" },
  { status: "shipped", title: "Shipped", dot: "bg-success" },
]

export default async function Roadmap() {
  const issues = await getIssues()

  return (
    <>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">
        Roadmap
      </h1>
      <p className="mb-14 font-mono text-xs text-muted-foreground">
        What Kairo is building next, what it&apos;s on right now, and what already shipped. Vote for the one you&apos;re waiting on.
      </p>

      {issues === null ? (
        <p className="leading-relaxed text-muted-foreground">
          Couldn&apos;t load the roadmap right now.{" "}
          <a
            href={`${REPO}/issues`}
            className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            Read it on GitHub
          </a>
          .
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((c) => {
            const list = issues
              .filter((i) => statusOf(i) === c.status)
              .sort((a, b) => b.reactions["+1"] - a.reactions["+1"])
            const shipped = c.status === "shipped"
            return (
              <div key={c.status}>
                <div className="flex items-center gap-2 px-1 pb-3 text-sm font-medium">
                  <span className={`size-2 shrink-0 rounded-full ${c.dot}`} />
                  {c.title}
                  <span className="ml-auto font-mono text-xs text-muted-foreground tabular-nums">
                    {list.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {list.length === 0 && (
                    <p className="px-1 text-sm text-muted-foreground">Nothing yet.</p>
                  )}
                  {list.map((i) => (
                    <div
                      key={i.id}
                      className={`flex flex-col gap-1.5 rounded-xl px-5 py-4 ${
                        shipped ? "border border-border" : "bg-card"
                      }`}
                    >
                      <p
                        className={`text-[15px] font-medium leading-snug ${
                          shipped ? "text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        <a href={i.html_url} className="hover:underline decoration-border underline-offset-4">
                          {i.title}
                        </a>
                      </p>
                      {summary(i.body) && (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {summary(i.body)}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-center justify-between gap-3 font-mono text-xs text-muted-foreground tabular-nums">
                        <span className="opacity-60">
                          {shipped && i.closed_at ? fmt.format(new Date(i.closed_at)) : ""}
                        </span>
                        <span className="flex items-center gap-1.5" title={`${i.reactions["+1"]} thumbs up on #${i.number}`}>
                          <IconThumbUp className="size-3" />
                          {i.reactions["+1"]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="mt-14 border-t border-border pt-6 text-[13px] leading-relaxed text-muted-foreground">
        Missing something?{" "}
        <a
          href={`${REPO}/issues/new`}
          className="underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          Open an issue
        </a>{" "}
        on Kairo.
      </p>
    </>
  )
}
